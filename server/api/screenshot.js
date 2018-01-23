import { Router } from 'express'
const fs = require('fs')
const btoa = require('btoa')
const mkdirp = require('mkdirp')
// const pool = require('puppeteer-pool')({
//   puppeteerArgs: { args: [ '--no-sandbox' ] }
// })
const PromisePool = require('es6-promise-pool')
const POOL_LIMIT = 5
const puppeteer = require('puppeteer')

const glob = require('glob')
const archiver = require('archiver')
const shortid = require('shortid')
const scheduler = require('node-schedule')

const queue = []

let Browser

const screenshot = async (name, url, postcode, id, auth) => {
  console.log('about to open a page')
  const page = await Browser.newPage()
  console.log('awaited a page')
  if (auth) page.setExtraHTTPHeaders({'Authorization': 'Basic ' + btoa(auth.username + ':' + auth.password)})

  await page.setViewport({ width: 700, height: 600 })
  const status = await page.goto(`${url}&postcode=${postcode}`)
  if (!status.ok) {
    throw new Error('cannot open ' + url)
  }

  page.evaluate(function () {
    $('body').css('background-color', '#fff') // eslint-disable-line
    $('details').attr('open', 'true') // eslint-disable-line
  })

  mkdirp(`./static/screenshots/${id}/${postcode}`) // Make sure folders exist, so no errors
  await page.screenshot({ path: `./static/screenshots/${id}/${postcode}/${name}.jpg`, fullPage: true })

  console.log(`File created at [./static/screenshots/${id}/${postcode}/${name}.jpg]`)

  await page.close()
}
// ).catch((e) => {
//     fs.readFile(`./storage/metadata/${id}.json`, 'utf8', (err, data) => {
//       if (err) console.log(`Cannot write to /storage/metadata/${id}.json`)
//       var obj = JSON.parse(data)
//       if (!obj.errors) obj.errors = {}
//       if (!obj.errors[postcode]) obj.errors[postcode] = []
//       obj.errors[postcode].push(name)
//       fs.writeFile(`./storage/metadata/${id}.json`, JSON.stringify(obj), 'utf8')
//     })
// }

const promiseProducer = () => {
  const item = queue.pop()
  return item ? screenshot(item.value, item.val, item.postcode, item.id, item.auth) : null
}

function screenshotByPostcode (postcode, urls, id, auth) {
  Object.keys(urls).forEach((value, index) => {
    let val = urls[value]
    queue.push({
      value: value,
      val: val,
      postcode: postcode,
      id: id,
      auth: auth
    })
  })
}

const router = Router()

router.get('/screenshots/metadata', function (req, res, next) {
  glob(`./storage/metadata/*.json`, {}, function (er, files) {
    res.json(files.map((value, index) => {
      let split = value.split('/')
      return split[split.length - 1].split('.')[0]
    }))
  })
})

router.get('/screenshots/:id', function (req, res, next) {
  glob(`./static/screenshots/${req.params.id}/*/*.jpg`, {}, function (er, files) {
    let obj = {}
    files.forEach((value, index) => {
      let path = value.split('/')
      let filename = path[path.length - 1]
      let postcode = path[path.length - 2]
      if (!obj[postcode]) obj[postcode] = []
      obj[postcode].push(filename)
    })
    res.json(obj)
  })
})

router.get('/screenshots/:id/metadata', function (req, res, next) {
  fs.readFile(`./storage/metadata/${req.params.id}.json`, 'utf8', (err, data) => {
    if (err) return res.sendStatus(500)
    return res.json(JSON.parse(data))
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
    console.log('Archive wrote %d bytes', archive.pointer())
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
  const urls = req.body.urls
  if (!postcodes || !urls) return res.sendStatus(400)
  const data = req.body
  data.id = shortid.generate()
  data.date = new Date()

  res.json({
    id: data.id
  })

  mkdirp(`./static/screenshots/${data.id}`)
  mkdirp(`./storage/metadata/`)
  fs.writeFile(`./storage/metadata/${data.id}.json`, JSON.stringify(data), 'utf8')

  console.log(req.body)

  let schedule = new Date(req.body.schedule)
  if (req.body.schedule && schedule > new Date()) {
    scheduler.scheduleJob(schedule, screenshots)
  } else {
    screenshots()
  }

  function screenshots () {
    postcodes.forEach((value, index) => {
      screenshotByPostcode(value, urls, data.id, data.auth)
    })

    puppeteer.launch({ args: [ '--no-sandbox' ] }).then(async browser => {
      Browser = browser
      const pool = new PromisePool(promiseProducer, POOL_LIMIT)
      await pool.start()

      await Browser.close()
    })
  }
})

export default router
