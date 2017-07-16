import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

import './css/base.css'
import './css/index.css'

fetch('/config.json').then(response => response.text()).then(rawConfig => {
  try {
    const config = JSON.parse(rawConfig)
    if (typeof config.fhirServer !== 'string') {
      console.error('Missing fhirServer value in config.')
    }
    ReactDOM.render(<App config={config} />, document.getElementById('root'))
    registerServiceWorker()
  } catch (error) {
    console.error(error)
  }
})
