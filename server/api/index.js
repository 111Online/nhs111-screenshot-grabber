import { Router } from 'express'
const fs = require('fs')
const btoa = require('btoa')
const mkdirp = require('mkdirp')
const PromisePool = require('es6-promise-pool')
const POOL_LIMIT = 5
const puppeteer = require('puppeteer')

const glob = require('glob')
const archiver = require('archiver')
const shortid = require('shortid')
const scheduler = require('node-schedule')
const database = require('../database').default

const queue = []

const baseurl = 'https://providersite.staging.111.service.nhs.uk'

const urls = {
  'Dx02': baseurl + '/question/direct/PW755MaleAdult/22/Headache/?answers=2,2,2,4,2,3,2,0',
  'Dx03': baseurl + '/question/direct/PW1685MaleAdult/24/SexualConcerns/?answers=2,3,2,2,2,3,3,0,0,2',
  'Dx05': baseurl + '/question/direct/PW755MaleAdult/24/Headache/?answers=2,2,2,4,0,2,3,2,2,0,0,0',
  'Dx06': baseurl + '/question/direct/PW1620MaleAdult/40/Skin,Rash/?answers=2,2,2,4,2,0',
  'Dx07': baseurl + '/question/direct/PW519MaleAdult/40/Abdominalpain/?answers=6,2,1,2,3,4,2,3,2,3,2,2,3,2,2,0',
  'Dx08': baseurl + '/question/direct/PW755MaleAdult/33/Headache/?answers=2,2,2,4,2,3,2,2,2,2,1,0,3',
  'Dx11': baseurl + '/question/direct/PW1564MaleAdult/34/Genitalproblems/?answers=2,2,2,0',
  'Dx118': baseurl + '/question/direct/PW1515FemaleAdult/22/DentalBleeding/?answers=2,0,0,3,0',
  'Dx12': baseurl + '/question/direct/PW1620MaleAdult/40/Skin,Rash/?answers=2,2,2,4,2,2,2,2,0',
  'Dx13': baseurl + '/question/direct/PW755MaleAdult/40/Headache/?answers=2,2,2,4,2,3,2,2,2,2,3,2,0,0,0,2,0',
  'Dx14': baseurl + '/question/direct/PW519MaleAdult/40/AbdominalPain/?answers=6,2,2,4,2,3,2,3,2,2,3,2,2,3,3,2,2',
  'Dx15': baseurl + '/question/direct/PW755MaleAdult/40/Headache/?answers=2,2,2,4,2,3,2,2,2,2,3,0,2,3,2,2',
  'Dx17': baseurl + '/question/direct/PW620FemaleAdult/19/Dentalinjury/?answers=2,4,0,0,0,2,0,0,2,0',
  'Dx18': baseurl + '/question/direct/PW1610FemaleAdult/23/Dentalproblems/?answers=1,3,0,0,2,2',
  'Dx19': baseurl + '/question/direct/PW1610MaleAdult/25/Dentalproblems/?answers=1,2,0,0,0,0,2,2',
  'Dx20': baseurl + '/question/direct/PW1610FemaleAdult/23/Dentalproblems/?answers=2,3,1,2,0,2,0',
  'Dx21': baseurl + '/question/direct/PW1610FemaleAdult/23/Dentalproblems/?answers=1,3,0,2,0,4',
  'Dx22': baseurl + '/question/direct/PW870MaleAdult/35/ToothachewithoutDentalInjury/?answers=2,2,2,2,3,2,2,2,1,2',
  'Dx28': baseurl + '/question/direct/PW1134MaleAdult/20/Eye,RedorIrritable/?answers=2,2,1,2,2,2,2,2,2,3,0',
  'Dx30': baseurl + '/question/direct/PW752FemaleAdult/16/Headache/?answers=2,0,2,2,2,4,2,3,2,2,2,2,2',
  'Dx31': baseurl + '/question/direct/PW1620MaleAdult/33/Skin,Rash/?answers=2,2,2,3,2,2,2,2,2,0,2,2,3,0,2',
  'Dx50': baseurl + '/question/direct/PW1775FemaleAdult/30/Hiccups/?answers=0,2,3,1,2,2,3,2,0,1,0,2,6,3,2',
  'Dx60': baseurl + '/question/direct/PW1146FemaleChild/6/Eye,Sticky,Watery/?answers=2,0,3,2,1,3,2,3,2,2,3,2,2,2,2',
  'Dx89': baseurl + '/question/direct/PW1034MaleChild/6/Swallowedanobject/?answers=0,2,2,4,2,4,2,2,2,2,2,2,2',
  'Dx92': baseurl + '/question/direct/PW1751FemaleAdult/16/MentalHealthProblems/?answers=0,4,2,4,2,0,3',
  'Dx94': baseurl + '/question/direct/PW1684FemaleAdult/22/SexualorMenstrualConcerns/?answers=0'
}

let Browser

const screenshot = async (opts, page) => {
  if (opts.auth && opts.auth.username && opts.auth.password) page.setExtraHTTPHeaders({'Authorization': 'Basic ' + btoa(opts.auth.username + ':' + opts.auth.password)})
  await page.setViewport({ width: 700, height: 600 })
  const status = await page.goto(opts.url)
  if (!status.ok) {
    if (page && !page.isClosed()) await page.close()
    throw new Error('cannot open ' + opts.url)
  }

  page.evaluate((opts) => {
    $('body').css('background-color', '#fff') // eslint-disable-line
    $('.global-header__inner').append(`<p style="float: right; font-weight: 600;">${opts.name}</p>`) // eslint-disable-line
    $('details').attr('open', 'true') // eslint-disable-line
  }, opts)

  mkdirp(`./static/screenshots/${opts.id}/${opts.postcode}`) // Make sure folders exist, so no errors
  await page.screenshot({ path: `./static/screenshots/${opts.id}/${opts.postcode}/${opts.name}.jpg`, fullPage: true })

  console.log(`[${opts.id}] File created at [./static/screenshots/${opts.id}/${opts.postcode}/${opts.name}.jpg]`)

  if (page && !page.isClosed()) await page.close()
}

const promiseProducer = () => {
  const item = queue.pop()
  if (!item) return null
  return Browser.newPage().then((page) => {
    return screenshot(item, page)
      .catch(async (e) => {
        if (page && !page.isClosed()) await page.close()
        database.getMetadata(item.id).then((data) => {
          Object.assign(data, JSON.parse(data.data))
          delete data['data']
          if (!data.errors) data.errors = {}
          if (!data.errors[item.postcode]) data.errors[item.postcode] = []
          data.errors[item.postcode].push(item.name)
          database.insertMetadata(data)
          console.log(`[${item.id}] Could not screenshot ${item.postcode} - ${item.name}`)
        })
      })
  })
}

const router = Router()

router.get('/screenshots/metadata', function (req, res, next) {
  database.getMetadata().then((data) => {
    if (data) res.json(data.map((val) => ({ id: val.id, date: val.date, name: val.name, schedule: val.schedule })))
  })
})

router.get('/screenshots/:id', function (req, res, next) {
  glob(`./static/screenshots/${req.params.id}/*/*.jpg`, {}, function (er, files) {
    let obj = {}
    obj.screenshots = {}
    obj.success_count = 0
    obj.error_count = 0
    obj.errors = {}

    files.forEach((value, index) => {
      let path = value.split('/')
      let filename = path[path.length - 1]
      let postcode = path[path.length - 2]
      if (!obj.screenshots[postcode]) obj.screenshots[postcode] = []
      obj.screenshots[postcode].push(filename)
      obj.success_count += 1
    })

    database.getMetadata(req.params.id).then((data) => {
      // Temp fix, if data isn't in database yet
      if (data) {
        Object.assign(data, JSON.parse(data.data))
        delete data['data']
        if (data.errors) {
          obj.errors = data.errors
          let count = 0
          Object.keys(data.errors).forEach((key) => {
            count += data.errors[key].length
          })
          obj.error_count = count
        } else {
          obj.error_count = 0
        }
        obj.total_count = data.dxcodes.length * data.postcodes.length
        obj.remaining = obj.total_count - obj.error_count - obj.success_count
        res.json(obj)
      } else {
        obj.total_count = 1
        obj.remaining = 1
        res.json(obj)
      }
    })
  })
})

router.get('/screenshots/:id/metadata', function (req, res, next) {
  database.getMetadata(req.params.id).then((data) => {
    if (!data) return res.sendStatus(500)

    // There is a chunk of data stored in a column in the database called data
    // The column contains JSON, this then parses the JSON and adds it to the main
    // object returned from database. It then removed data.data.
    Object.assign(data, JSON.parse(data.data))
    delete data['data']
    return res.json(data)
  })
})

router.get('/screenshots/:id/zip', function (req, res, next) {
  const archive = archiver('zip')
  archive.on('error', function (err) {
    res.status(500).send({
      error: err.message
    })
  })

  // on stream closed we can end the request
  archive.on('end', function () {
    console.log(`[${req.params.id}] Archive wrote ${archive.pointer()} bytes`)
  })

  // set the archive name
  res.attachment(`nhs-111-screenshots-${req.params.id}.zip`)

  // output the zip file to the response
  archive.pipe(res)

  archive.directory(`./static/screenshots/${req.params.id}/`, false)

  archive.finalize()
})

/**
 * This POST expects the following:
 * postcodes - an array of postcodes
 * urls - an object where the key is the title (a dx code for example) and value is url
 */
router.post('/screenshot', function (req, res, next) {
  const postcodes = req.body.postcodes
  const dxcodes = req.body.dxcodes
  if (!postcodes || !dxcodes) return res.sendStatus(400)
  const data = req.body
  data.id = shortid.generate()
  data.date = new Date()
  data.urls = {}
  data.schedule = new Date(req.body.schedule)

  dxcodes.forEach((dxcode, i) => {
    data.urls[dxcode] = urls[dxcode]
  })

  res.json({
    id: data.id
  })

  mkdirp(`./static/screenshots/${data.id}`)
  database.insertMetadata(data)

  if (req.body.schedule && data.schedule > new Date()) {
    scheduler.scheduleJob(data.schedule, () => {
      screenshots(postcodes, dxcodes, data)
    })
  } else {
    screenshots(postcodes, dxcodes, data)
  }
})

function screenshots (postcodes, dxcodes, opts) {
  postcodes.forEach((postcode, index) => {
    dxcodes.forEach((dxcode, i) => {
      queue.push({
        name: dxcode,
        url: `${urls[dxcode]}&postcode=${postcode.replace(' ', '')}&Dos=${opts.dos}`,
        postcode: postcode,
        id: opts.id,
        auth: opts.auth,
        dos: opts.dos
      })
    })
  })

  if (!Browser) {
    puppeteer.launch({ args: [ '--no-sandbox' ] }).then(async browser => {
      Browser = browser
      const pool = new PromisePool(promiseProducer, POOL_LIMIT)
      await pool.start()

      await Browser.close()
    })
  } else {
    const pool = new PromisePool(promiseProducer, POOL_LIMIT)
    pool.start()
  }
}

export default router
