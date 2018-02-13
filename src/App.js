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

import defaultConfig from './config/defaultConfig.json'
import agencyLogo from './img/agency.svg'
import csiroLogo from './img/csiro.svg'
import './css/App.css'

class App extends Component {
  static propTypes = {
    fhirServer: PropTypes.string,
    fhirVersion: PropTypes.string,
    narrativeStyles: PropTypes.string,
    pathPrefix: PropTypes.string,
    pathRoutes: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        message: PropTypes.string,
        matchPattern: PropTypes.string,
        addParams: PropTypes.shape({
          _elements: PropTypes.arrayOf(PropTypes.string),
          _count: PropTypes.number,
        }),
        removeParams: PropTypes.arrayOf(PropTypes.string),
      }),
    ),
  }
  static defaultProps = defaultConfig

  constructor(props) {
    super(props)
    this.state = {}
  }

  processPathRoutes(location, render) {
    if (!location.pathname) {
      return
    }
    const { pathRoutes } = this.props
    const finalLocation = processPathRoutes(location, pathRoutes)
    return location.pathname !== finalLocation.pathname ||
      location.search !== finalLocation.search ? (
      <Redirect to={finalLocation.pathname + finalLocation.search} />
    ) : (
      render
    )
  }

  showRouteMessage(location) {
    const { pathRoutes } = this.props
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
    const { fhirServer, fhirVersion, narrativeStyles, pathPrefix } = this.props

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
                  path={`${pathPrefix}/:path`}
                  render={({ location }) =>
                    this.processPathRoutes(
                      location,
                      <RemoteFhirResource
                        path={location.pathname.replace(pathPrefix, '')}
                        query={removeParam(location.search, '_rIds')}
                        fhirServer={fhirServer}
                        fhirVersion={fhirVersion}
                        narrativeStyles={narrativeStyles}
                        pathPrefix={pathPrefix}
                        onLoad={this.handleLoad}
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
