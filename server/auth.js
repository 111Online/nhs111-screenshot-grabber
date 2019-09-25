const auth = require('basic-auth')

module.exports = function (req, res, next) {
  const credentials = auth(req)
  if (credentials && (!process.env.AUTH_USER || !process.env.AUTH_PASS)) {
    // No user/pass set in environmental variables, so proceed
    return next()
  }
  else if (!credentials || credentials.name !== process.env.AUTH_USER || credentials.pass !== process.env.AUTH_PASS) {
    res.statusCode = 401
    res.setHeader('WWW-Authenticate', 'Basic realm="nhs-111"')
    res.end('Access denied')
  }

  next()
}
