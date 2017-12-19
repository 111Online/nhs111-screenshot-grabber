const authMiddleware = require('./server/auth')
module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'NHS 111 Screenshot Grabber',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'NHS 111 Screenshot Grabber' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }
    ]
  },
  serverMiddleware: [
    {path: '/metadata', handler: authMiddleware}
  ],
  /*
  ** Global CSS
  */
  css: ['~/assets/css/nhs-111.css'],
  /*
  ** Add axios globally
  */
  build: {
    vendor: ['axios'],
    /*
    ** Run ESLINT on save
    */
    extend (config, ctx) {
      if (ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
