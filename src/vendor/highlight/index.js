var hljs = require('./highlight')

hljs.registerLanguage('json', require('./languages/json'))
hljs.registerLanguage('xml', require('./languages/xml'))

module.exports = hljs
