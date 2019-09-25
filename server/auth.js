const auth = require('basic-auth')

module.exports = function (req, res, next) {
  const credentials = auth(req)

  if (credentials && (!process.env.USERNAME || !process.env.PASSWORD)) {
    // No user/pass set in environmental variables, so proceed
    return next()
  }
  else if (!credentials || credentials.name !== process.env.USERNAME || credentials.pass !== process.env.PASSWORD) {
    res.statusCode = 401
    res.setHeader('WWW-Authenticate', 'Basic realm="nhs-111"')
    res.end('Access denied')
  }

  next()
}
