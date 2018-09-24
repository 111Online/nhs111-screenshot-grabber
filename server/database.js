import sqlite from 'sqlite'
const fs = require('fs')

const dbpath = 'storage/metadata/metadata.db'

const dbPromise = Promise.resolve()
  .then(() => new Promise(function (resolve, reject) {
    // Make sure database exists before trying to open it
    fs.writeFile(dbpath, '', { flag: 'a+' }, function (err) {
      if (err) reject(err)
      else resolve()
    })
  }))
  .then(() => sqlite.open(dbpath, { Promise }))
  .then(db => db.migrate({ migrationsPath: 'server/migrations/' }))

const getMetadata = async function (id) {
  const db = await dbPromise
  if (id) return db.get(`SELECT Scheduler.cancelled, Metadata.id, datetime(Scheduler.start_time, 'unixepoch', 'localtime') as start_time, datetime(Metadata.simulate, 'unixepoch', 'localtime') as simulate, datetime(Scheduler.finish_time, 'unixepoch', 'localtime') as finish_time, datetime(Metadata.date, 'unixepoch', 'localtime') as date, Metadata.name, datetime(Scheduler.scheduled_time, 'unixepoch', 'localtime') as schedule, Metadata.data FROM Metadata LEFT JOIN Scheduler ON Metadata.id = Scheduler.metadata_id WHERE Metadata.id = ?`, [id])
  else return db.all(`SELECT Scheduler.cancelled, Metadata.id, datetime(Metadata.simulate, 'unixepoch', 'localtime') as simulate, datetime(Scheduler.start_time, 'unixepoch', 'localtime') as start_time, datetime(Scheduler.finish_time, 'unixepoch', 'localtime') as finish_time, datetime(Metadata.date, 'unixepoch', 'localtime') as date, Metadata.name, datetime(Scheduler.scheduled_time, 'unixepoch', 'localtime')  as schedule FROM Metadata LEFT JOIN Scheduler ON Metadata.id = Scheduler.metadata_id`)
}

const getScheduled = async function (id) {
  const db = await dbPromise
  if (id) return db.get(`SELECT * FROM Scheduler WHERE metadata_id = '${id}' INNER JOIN Metadata ON Metadata.id = Scheduler.metadata_id`)
  else return db.all(`SELECT * FROM Scheduler INNER JOIN Metadata ON Metadata.id = Scheduler.metadata_id WHERE start_time IS NULL AND cancelled IS 0 AND scheduled_time < strftime('%s', 'now')`)
}

const getAllScheduled = async function () {
  const db = await dbPromise
  return db.all(`SELECT * FROM Scheduler INNER JOIN Metadata ON Metadata.id = Scheduler.metadata_id WHERE start_time IS NULL AND cancelled IS 0`)
}

const insertScheduler = async function (metadataID, scheduledTime, startTime) {
  const db = await dbPromise
  db.run('INSERT INTO Scheduler (metadata_id, scheduled_time, start_time) VALUES (?, ?, ?);', [ metadataID, date(scheduledTime), date(startTime) ])
}

const startScreenshots = async function (id, startTime) {
  const db = await dbPromise
  db.run(`UPDATE Scheduler SET start_time = ? WHERE metadata_id = ?;`, [ date(startTime), id ])
}

const finishedScreenshots = async function (id, finishTime) {
  const db = await dbPromise
  db.run(`UPDATE Scheduler SET finish_time = ? WHERE metadata_id = ?;`, [ date(finishTime), id ])
}

const cancelSchedule = async function (id) {
  const db = await dbPromise
  db.run(`UPDATE Scheduler SET cancelled = 1 WHERE metadata_id = ?;`, [ id ])
}

const insertMetadata = async function (data, startTime) {
  const db = await dbPromise
  db.get('INSERT OR REPLACE INTO Metadata (id, name, dos, data, simulate, date) VALUES (?, ?, ?, ?, ?, ?);', [ data.id, data.name, data.dos, JSON.stringify({ urls: data.urls, dxcodes: data.dxcodes, postcodes: data.postcodes, errors: data.errors, auth: data.auth }), date(data.simulate), date(data.date) ])
  insertScheduler(data.id, data.schedule, startTime)
}

const date = function (date) {
  date = new Date(date)
  if (isNaN(date.valueOf())) return null
  // JavaScript date counts milliseconds from epoch but sqlite requires seconds since epoch
  return Math.round(date.getTime() / 1000)
}

export default { getMetadata, insertMetadata, getScheduled, startScreenshots, finishedScreenshots, cancelSchedule, getAllScheduled }
