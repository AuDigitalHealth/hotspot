import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import http from 'axios'

import './css/base.css'
import './css/index.css'

const configUrl = document
  .querySelector('meta[name="config"]')
  .getAttribute('value')
http
  .get(configUrl)
  .then(response => {
    const config = response.data
    ReactDOM.render(<App {...config} />, document.getElementById('root'))
  })
  .catch(error => console.error(error)) // eslint-disable-line no-console
