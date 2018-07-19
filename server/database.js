import sqlite from 'sqlite'

const dbPromise = Promise.resolve()
  .then(() => sqlite.open('storage/metadata/metadata.db', { Promise }))
  .then(db => db.migrate({ migrationsPath: 'server/migrations/' }))

const getMetadata = async function (id) {
  const db = await dbPromise
  if (id) return db.get(`SELECT * FROM Metadata WHERE id = '${id}'`)
  else return db.all('SELECT * FROM Metadata')
}

const insertMetadata = async function (data) {
  const db = await dbPromise
  db.run('INSERT OR REPLACE INTO Metadata (id, name, schedule, dos, data, date) VALUES (?, ?, ?, ?, ?, ?);', [ data.id, data.name, data.schedule || '', data.dos, JSON.stringify({ urls: data.urls, dxcodes: data.dxcodes, postcodes: data.postcodes, errors: data.errors }), data.date.toString() ])
}

export default { getMetadata, insertMetadata }
