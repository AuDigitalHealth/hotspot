import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import http from 'axios'

import Narrative from './Narrative.js'
import ValueSetExpansion from './ValueSetExpansion.js'
import Raw from './Raw.js'
import Error from './Error.js'
import {
  extractJSONMetadata,
  opOutcomeFromJsonResponse,
} from './fhir/jsonParsing.js'
import {
  extractXMLMetadata,
  opOutcomeFromXmlResponse,
} from './fhir/xmlParsing.js'

import './css/FhirResource.css'

// A component that presents a human-friendly representation of an XML or JSON
// FHIR resource, including Narrative and Raw tabs.
class FhirResource extends Component {
  static propTypes = {
    path: PropTypes.string.isRequired,
    query: PropTypes.string.isRequired,
    fhirServer: PropTypes.string.isRequired,
    narrativeStyles: PropTypes.string,
  }

  constructor(props) {
    super(props)
    this.state = {
      status: 'loading',
      activeTab: 'narrative',
    }
    this.handleError = this.handleError.bind(this)
  }

  updateResource(props) {
    const emptyMetadata = {
      title: undefined,
      url: undefined,
      version: undefined,
      resourceType: undefined,
      narrative: undefined,
      valueSetUri: undefined,
      expansion: undefined,
    }

    return this.setState(
      () => ({ status: 'loading' }),
      () =>
        this.getResource(props)
          .then(resource => this.extractMetadata(resource))
          .then(resource => this.updatePageTitle(resource))
          .then(resource => this.updateActiveTab(resource))
          .then(resource =>
            this.setState({ ...emptyMetadata, ...resource, status: 'loaded' })
          )
          .catch(error => this.handleError(error))
    )
  }

  async getResource(props) {
    try {
      const { fhirServer, path, query } = props
      const response = await http.get(fhirServer + path + query)
      const format = FhirResource.sniffFormat(response.headers['content-type'])
      const parsed = format === 'json' ? { parsed: response.data } : {}
      return { raw: response.request.responseText, format, ...parsed }
    } catch (error) {
      if (error.response) this.handleUnsuccessfulResponse(error.response)
      else throw error
    }
  }

  async extractMetadata(resource) {
    if (resource.format === 'json') {
      const metadata = await extractJSONMetadata(resource.parsed)
      return { ...resource, ...metadata }
    } else if (resource.format === 'xml') {
      const metadata = await extractXMLMetadata(resource.raw)
      return { ...resource, ...metadata }
    } else {
      throw new Error('Unsupported content type.')
    }
  }

  async updatePageTitle(resource) {
    const { title, version } = resource
    document.title = version ? `${title} (${version})` : title
    return resource
  }

  async updateActiveTab(resource) {
    return {
      ...resource,
      activeTab: resource.narrative
        ? 'narrative'
        : resource.expansion ? 'expansion' : 'raw',
    }
  }

  setActiveTab(tabName) {
    this.setState(() => ({ activeTab: tabName }))
  }

  handleError(error) {
    this.setState(() => ({ error, status: 'error' }))
  }

  handleUnsuccessfulResponse(response) {
    const format = FhirResource.sniffFormat(response.headers['content-type'])
    if (format === 'json') {
      const opOutcome = opOutcomeFromJsonResponse(response)
      if (opOutcome) throw opOutcome
    } else if (format === 'xml') {
      const opOutcome = opOutcomeFromXmlResponse(response)
      if (opOutcome) throw opOutcome
    }
    if (response.status === 404) {
      throw new Error(
        `The resource you requested was not found: "${this.props.path}"`
      )
    } else {
      throw new Error(response.statusText || response.status)
    }
  }

  valueSetExpansionPath(valueSetUri) {
    if (!valueSetUri) {
      return null
    }
    const fhirMajorVersion = parseInt(this.props.fhirVersion.split('.')[0], 10)
    const uriParam = fhirMajorVersion >= 3 ? 'url' : 'identifier'
    const escapedUri = encodeURIComponent(valueSetUri)
    return `/ValueSet/$expand?${uriParam}=${escapedUri}`
  }

  componentWillMount() {
    this.updateResource(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.updateResource(nextProps)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.path !== nextProps.path ||
      this.props.query !== nextProps.query ||
      this.state.status !== nextState.status ||
      this.state.format !== nextState.format ||
      this.state.narrative !== nextState.narrative ||
      this.state.raw !== nextState.raw ||
      this.state.activeTab !== nextState.activeTab ||
      this.state.title !== nextState.title ||
      this.state.url !== nextState.url ||
      this.state.version !== nextState.version ||
      this.state.error !== nextState.error
    )
  }

  render() {
    const { fhirServer, narrativeStyles } = this.props
    const { status, format, narrative, raw, activeTab, error } = this.state
    const { title, url, version, valueSetUri, expansion } = this.state
    const valueSetExpansionPath = this.valueSetExpansionPath(valueSetUri)

    switch (status) {
      case 'loading':
        return (
          <div className='fhir-resource'>
            <p className='loading'>Loading...</p>
          </div>
        )
      case 'loaded':
        return (
          <div className='fhir-resource'>
            {title
              ? <h2 className='title'>
                  {title}
                </h2>
              : null}
            <dl className='metadata'>
              {url
                ? <div>
                    <dt className='url'>URI</dt>
                    <dd>
                      {url}
                    </dd>
                  </div>
                : null}
              {version
                ? <div>
                    <dt className='version'>Version</dt>
                    <dd>
                      {version}
                    </dd>
                  </div>
                : null}
            </dl>
            <nav>
              <ol>
                {narrative
                  ? <li
                    onClick={() => this.setActiveTab('narrative')}
                    className={activeTab === 'narrative' ? 'active' : ''}
                    >
                      Narrative
                    </li>
                  : null}
                {expansion
                  ? <li
                    onClick={() => this.setActiveTab('expansion')}
                    className={activeTab === 'expansion' ? 'active' : ''}
                    >
                      Expansion
                    </li>
                  : null}
                <li
                  onClick={() => this.setActiveTab('raw')}
                  className={activeTab === 'raw' ? 'active' : ''}
                >
                  {format ? format.toUpperCase() : undefined}
                </li>
                {valueSetUri && !expansion
                  ? <Link to={valueSetExpansionPath} className='link'>
                      Expansion
                    </Link>
                  : null}
              </ol>
            </nav>
            {narrative
              ? <section
                className={
                    activeTab === 'narrative'
                      ? 'tab-content'
                      : 'tab-content tab-content-hidden'
                  }
                >
                  <Narrative
                    content={narrative}
                    stylesPath={narrativeStyles}
                    fhirServer={fhirServer}
                    onError={this.handleError}
                  />
                </section>
              : null}
            {expansion
              ? <section
                className={
                    activeTab === 'expansion'
                      ? 'tab-content'
                      : 'tab-content tab-content-hidden'
                  }
                >
                  <ValueSetExpansion
                    expansion={expansion}
                    onError={this.handleError}
                  />
                </section>
              : null}
            <section
              className={
                activeTab === 'raw'
                  ? 'tab-content'
                  : 'tab-content tab-content-hidden'
              }
            >
              <Raw content={raw} format={format} onError={this.handleError} />
            </section>
          </div>
        )
      case 'error':
        return (
          <div className='fhir-resource'>
            <Error error={error} />
          </div>
        )
      default:
        throw new Error(`Invalid status encountered: ${status}`)
    }
  }

  static sniffFormat(contentType) {
    // Sniff JSON if the Content-Type header matches:
    // - application/json
    // - application/fhir+json (FHIR STU3)
    // - application/json+fhir (FHIR DSTU2)
    if (
      contentType.match(
        /(application\/json|application\/fhir\+json|application\/json\+fhir)/
      )
    ) {
      return 'json'
      // Sniff XML if the Content-Type header matches:
      // - text/xml
      // - application/xml
      // - application/fhir+xml (FHIR STU3)
      // - application/json+xml (FHIR DSTU2)
    } else if (
      contentType.match(
        /(text\/xml|application\/xml|application\/fhir\+xml|application\/xml\+fhir)/
      )
    ) {
      return 'xml'
    } else {
      return null
    }
  }
}

export default FhirResource
