import React, { Component } from 'react'
import PropTypes from 'prop-types'
import InfoMessage from './InfoMessage.js'
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom'

import RemoteFhirResource from './RemoteFhirResource.js'
import {
  processPathRoutes,
  getRouteMessages,
  resetRouteMessages,
} from './pathRoutes.js'

import { removeParam } from './fhir/common.js'

import agencyLogo from './img/agency.svg'
import csiroLogo from './img/csiro.svg'
import './css/App.css'

class App extends Component {
  // TODO: Add or refactor use of routePaths
  static propTypes = {
    config: PropTypes.shape({
      pathPrefix: PropTypes.string,
    }),
  }

  static defaultProps = {
    config: {
      fhirServer: 'https://ontoserver.csiro.au/stu3-latest',
      fhirVersion: '3.0.1',
      pathPrefix: '',
    },
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  processPathRoutes(location, render) {
    if (!location.pathname) {
      return
    }
    const { config: { pathRoutes } } = this.props
    const finalLocation = processPathRoutes(location, pathRoutes)
    return location.pathname !== finalLocation.pathname ||
      location.search !== finalLocation.search ? (
      <Redirect to={finalLocation.pathname + finalLocation.search} />
    ) : (
      render
    )
  }

  showRouteMessage(location) {
    const { config: { pathRoutes } } = this.props
    const messages = getRouteMessages(location, pathRoutes)
    resetRouteMessages(location)
    if (messages && messages.length > 0) {
      if (messages.length === 1) {
        return <InfoMessage message={messages[0]} />
      } else {
        return <InfoMessage messages={messages} />
      }
    }
    return null
  }

  handleLoad(metadata) {
    // Update the document title with the title and version of the loaded FHIR
    // resource.
    const { title, version } = metadata
    document.title = version ? `${title} (${version})` : title
  }

  render() {
    const { config } = this.props

    return (
      <div className="app">
        <header>
          <a href="https://www.digitalhealth.gov.au/">
            <img
              src={agencyLogo}
              className="agency"
              alt="Australian Digital Health Agency"
              height={70}
            />
          </a>
          <a href="https://www.csiro.au/">
            <img src={csiroLogo} className="csiro" alt="CSIRO" />
          </a>
          <h1>
            <a href="https://www.healthterminologies.gov.au/">
              National Clinical Terminology Service
            </a>
          </h1>
        </header>
        <main>
          <Router>
            <div>
              <Route
                render={({ location }) => this.showRouteMessage(location)}
              />
              <Switch>
                <Route
                  path={`${config.pathPrefix}/:path`}
                  render={({ location }) =>
                    this.processPathRoutes(
                      location,
                      <RemoteFhirResource
                        path={location.pathname.replace(config.pathPrefix, '')}
                        query={removeParam(location.search, '_rIds')}
                        onLoad={this.handleLoad}
                        {...config}
                      />,
                    )
                  }
                />
                <Route
                  render={({ location }) =>
                    this.processPathRoutes(
                      location,
                      <div className="fhir-resource">
                        <p>
                          Please provide a path to a valid FHIR resource within
                          the URL.
                        </p>
                      </div>,
                    )
                  }
                />
              </Switch>
            </div>
          </Router>
        </main>
      </div>
    )
  }
}

export default App
