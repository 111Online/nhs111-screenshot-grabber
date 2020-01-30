# Screenshot Grabber

> A tool to automate checking of DOS results pages on 111 online by screenshotting each result page for a given set of DX codes across a given list of postcodes.

## Running locally

The first time you run the project you will need to ensure you have Node.js and NPM installed (check using `node --version` and `npm --version`).
With those installed you will want to install the dependencies.

```bash
$ npm install
```

Most of the time you will want to run the project in dev mode, this way every update you make will automatically refresh the site running at localhost:3000. When running locally it's important to have environmental variables for the BASE URL (this will be the site you want to screenshot, probably the provider site) as well as `AUTH_USER` and `AUTH_PASS` for the site authentication (these can be empty for dev).

```bash
$ BASE_URL=[provider site url] AUTH_USER=[username] AUTH_PASS=[pass] npm run dev
```

You can also run a build which will not hot reload like the dev build does. This is how it will run once deployed.

```bash
$ BASE_URL=[provider site url] AUTH_USER=[username] AUTH_PASS=[pass] npm run build
```

If you wish you can export the environmental variables via other ways, which would simplify the commands to `npm run dev` or `npm run build`. But the screenshot functionality will not work without the `BASE_URL` as it won't know where to look.

For detailed explanation on how things work, checkout the [Nuxt.js docs](https://github.com/nuxt/nuxt.js).

## Codebase Structure

The codebase for the Screenshot Grabber is very similar to the standard Nuxt.js (v1 - not upgraded to v2 yet) structure except that we have a server that runs alongside (in the server folder) that gives the clientside access via proxy to an api for the screenshotting functionality and database.

- assets/ - This folder is for assets such as the CSS (taken directly from 111) and logo.
- components/ - This folder is for reusable components, currently just the header and footer.
- layouts/ - If you were to have different layouts (such as public and private views) the layouts would go here. Currently everything uses `default.vue`
- pages/ - **This folder is special**. It includes all of the pages on the website but the filenames and file structure are used to dymanically create routes. So the index file would be the root of that folder (such as `/metadata/index.vue` is `/metadata/`), a named file would be a static path (such as `/metadata/a-name.vue` would be `/metadata/a-name`) and the `_` prefix is a dynamic path (such as `/metadata/_id.vue` could be `/metadata/eue43u3` or `/metadata/yyhiuhi3` and they would be created using the same file).
- plugins/ - This folder contains plugins, which are essentially code that can be shared. Currently it is just used to create a singleton for axios to always use the base_url without it being set up every time.
- server/ - The server folder has the api and database code, all code not in this folder runs on (or is generated for) the clientside whereas this is where server code is stored. The server is configured alongside nuxt (this is unique for this project) and so both run on the same port. The API routes are all prefixed with `/api/`.
