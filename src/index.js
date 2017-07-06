import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

import './css/base.css'
import './css/index.css'

fetch('/config.json')
  .then(response => response.text())
  .then(rawConfig => {
    try {
      const config = JSON.parse(rawConfig)
      console.log('config', config)
      ReactDOM.render(
        <App config={config} />,
        document.getElementById('root')
      )
      registerServiceWorker()
    } catch (error) { console.error(error) }
  })
