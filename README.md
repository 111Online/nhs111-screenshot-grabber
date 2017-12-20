# nhs111-screenshot-grabber

> A tool to automate screenshots

## Build Setup

``` bash
# install dependencies
$ npm install # Or yarn install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm start
```

For detailed explanation on how things work, checkout the [Nuxt.js docs](https://github.com/nuxt/nuxt.js).

## Backpack

We use [backpack](https://github.com/palmerhq/backpack) to watch and build the application, so you can use the latest ES6 features (module syntax, async/await, etc.).




## CentOS 7

We use CentOS 7 for the server. This has some issues running chrome due to the way the sandbox works. Note if .local-chromium doesn't exist, then go to `node_modules/puppeteer-pool` and run `npm install`.

Note that to get it working on the server you must do the following:

``` bash

$ cd node_modules/puppeteer-pool/node_modules/puppeteer/.local-chromium/

$ sudo chown root:root chrome_sandbox && sudo chmod 4755 chrome_sandbox export CHROME_DEVEL_SANDBOX="$PWD/chrome_sandbox"

$ sudo chmod 644 locales/*