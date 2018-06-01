const express = require('express'),
  path = require('path'),
  url = require('url'),
  proxy = require('http-proxy-middleware'),
  uuid = require('uuid/v4'),
  compression = require('compression'),
  bunyan = require('bunyan')

const {
    HOTSPOT_PROXY_TARGET: fhirServer,
    HOTSPOT_WEB_ROOT: webRoot,
    HOTSPOT_VERSION: version,
  } = process.env,
  app = express(),
  logger = bunyan.createLogger({ name: 'hotspot', appVersion: version })

// Returns true if a request contains information that indicates that it would
// prefer a HTML response.
const reqIsForHtml = req => {
  if (req.headers.accept && req.headers.accept.match(/text\/html/)) return true
  else {
    // Support the `_format` query parameter, as defined by FHIR.
    const parsedUrl = url.parse(req.url),
      format = new url.URLSearchParams(parsedUrl.search).get('_format')
    return format === 'html' || format === 'text/html' ? true : false
  }
}

// Middleware that serves up Hotspot when client signals that they want HTML.
const serveHtml = (req, res, next) => {
  // Serve up index.html if the request is asking for HTML OR if proxying is disabled.
  if (reqIsForHtml(req) || !fhirServer) {
    res.sendFile(path.resolve(webRoot, 'index.html'), {
      headers: { 'Cache-Control': 'no-cache' },
      etag: false,
    })
  } else next()
}

// Middleware that logs all requests and responses.
const logRequest = (req, res, next) => {
  const id = req.headers['X-CID'] || uuid(),
    startTime = process.hrtime()
  res.setHeader('X-CID', id)
  // Include request ID in all log messages.
  req.log = logger.child({
    requestId: id,
  })
  req.log.info(
    {
      event: 'REQ_RECV',
      method: req.method,
      path: req.url,
      headers: req.headers,
    },
    'Request received',
  )
  next()
  res.on('finish', () => {
    const diffHr = process.hrtime(startTime),
      diff = ((diffHr[0] * 1e9 + diffHr[1]) / 1e6).toFixed(0)
    req.log.info(
      {
        event: 'RES_FINISHED',
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        timeMs: diff,
        headers: res.getHeaders(),
      },
      'Response returned',
    )
  })
}

// Error handler.
const errorHandler = (error, req, res, next) => {
  req.log.error({
    error,
    errorStackTrace: error.stack,
  })
  res.status(500).end()
}

// Log all requests and responses.
app.use(logRequest)

// Compress all compressible responses.
app.use(compression())

// Serve up files from the static directory, e.g. JavaScript, CSS and image
// files.
app.use(
  '/static',
  express.static(path.resolve(webRoot, 'static'), {
    index: false,
    redirect: false,
    setHeaders: res => res.setHeader('Cache-Control', 'max-age=31536000'),
  }),
)

// Serve up files from outside the static directory, except `index.html``.
app.use(
  '/',
  express.static(path.resolve(webRoot), {
    index: false,
    redirect: false,
    setHeaders: res => res.setHeader('Cache-Control', 'no-cache'),
  }),
)

// Serve up Hotspot if the client is asking for a HTML representation.
app.use(serveHtml)

// Proxy back to the FHIR server in all other cases. Only enable proxying if the
// `HOTSPOT_PROXY_TARGET` environment variable is set.
if (fhirServer) {
  app.use(
    proxy({
      target: fhirServer,
      prependPath: false,
      preserveHeaderKeyCase: true,
      onError: (error, req, res) => {
        req.log.error(
          {
            error,
            errorStackTrace: error.stack,
          },
          'Error occurred upon proxy',
        )
        res.status(502).end()
      },
    }),
  )
}

// Catch and handle errors.
app.use(errorHandler)

// Remove the `X-Powered-By: express` header.
app.disable('x-powered-by')

// Start the server on port 80.
app.listen(80, null, null, () =>
  logger.info({ event: 'APP_STARTED' }, 'Hotspot proxy started on port 80'),
)
