const express = require('express'),
  path = require('path'),
  proxy = require('http-proxy-middleware')

const {
    HOTSPOT_PROXY_TARGET: fhirServer,
    HOTSPOT_WEB_ROOT: webRoot,
  } = process.env,
  app = express()

// Returns true if a request contains information that indicates that it would
// prefer a HTML response.
const reqIsForHtml = req => {
  return req.headers.accept.match(/text\/html/)
}

// Middleware that serves up Hotspot when client signals that they want HTML.
const serveHtml = (req, res, next) => {
  if (reqIsForHtml(req)) {
    res.setHeader('Cache-Control', 'no-cache')
    res.sendFile(path.resolve(webRoot, 'index.html'))
  } else next()
}

// Set the Cache-Control header for static files that have a hash in their filename and will not ever change.
const setHeaders = (res, path) => {
  res.setHeader('Cache-Control', 'no-cache')
  if (path.match(/\/static\//))
    res.setHeader('Cache-Control', 'max-age=31536000')
}

// Serve up files from the static directory, e.g. JavaScript, CSS and image
// files.
app.use('/', express.static(path.resolve(webRoot), { setHeaders }))

// Serve up Hotspot if the client is asking for a HTML representation.
app.use(serveHtml)

// Proxy back to the FHIR server in all other cases.
app.use(proxy({ target: fhirServer, prependPath: false }))

app.listen(80)
