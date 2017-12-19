const auth = require('basic-auth')

module.exports = function (req, res, next) {
  const credentials = auth(req)
  if (!credentials || credentials.name !== 'user' || credentials.pass !== 'pass') {
    res.statusCode = 401
    res.setHeader('WWW-Authenticate', 'Basic realm="nhs-111"')
    res.end('Access denied')
  }

  next()
}
