import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Narrative from './Narrative.js'
import Raw from './Raw.js'

import './css/FhirResource.css'

// A component that presents a human-friendly representation of an XML or JSON
// FHIR resource, including Narrative and Raw tabs.
class FhirResource extends Component {
  static propTypes = {
    path: PropTypes.string.isRequired,
    query: PropTypes.string.isRequired,
    fhirServer: PropTypes.string.isRequired,
    narrativeStyles: PropTypes.string,
    requestMode: PropTypes.string,
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
    return this.setState(
      () => ({ status: 'loading' }),
      () =>
        this.getResource(props)
          .then(resource => this.extractMetadata(resource))
          .then(resource => this.updatePageTitle(resource))
          .then(resource => this.updateActiveTab(resource))
          .then(resource => this.setState({ ...resource, status: 'loaded' }))
          .catch(error => this.handleError(error))
    )
  }

  async getResource(props) {
    const { fhirServer, path, query, requestMode } = props
    const response = await fetch(fhirServer + path + query, {
      mode: requestMode || 'cors',
      redirect: 'follow',
    })
    if (!response.ok) {
      this.handleUnsuccessfulResponse(response)
    }
    const responseText = await response.text()
    const format = FhirResource.sniffFormat(
      response.headers.get('Content-Type')
    )
    return { raw: responseText, format }
  }

  async extractMetadata(resource) {
    if (resource.format === 'json') {
      const metadata = await FhirResource.extractJSONMetadata(resource.raw)
      return { ...resource, ...metadata }
    } else if (resource.format === 'xml') {
      const metadata = await FhirResource.extractXMLMetadata(resource.raw)
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
      activeTab:
        this.state.activeTab === 'narrative' && !resource.narrative
          ? 'raw'
          : this.state.activeTab,
    }
  }

  setActiveTab(tabName) {
    this.setState(() => ({ activeTab: tabName }))
  }

  handleError(error) {
    this.setState(() => ({ error, status: 'error' }))
  }

  handleUnsuccessfulResponse(response) {
    if (response.status === 404) {
      throw new Error(
        `The resource you requested was not found: "${this.props.path}"`
      )
    } else {
      throw new Error(response.statusText)
    }
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
    const { title, url, version } = this.state

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
                      <a href={url}>
                        {url}
                      </a>
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
                <li
                  onClick={() => this.setActiveTab('raw')}
                  className={activeTab === 'raw' ? 'active' : ''}
                >
                  {format ? format.toUpperCase() : undefined}
                </li>
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
            <p className='error'>
              <strong>Error</strong>&nbsp;&nbsp;&nbsp;{error.message}
            </p>
          </div>
        )
      default:
        console.error(`Invalid status encountered: ${status}`)
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

  static async extractJSONMetadata(raw) {
    try {
      const parsed = JSON.parse(raw)
      const metadata = {}
      // Prefer title over name over resource type.
      if (parsed.resourceType) {
        metadata.title = parsed.resourceType
      }
      if (parsed.name) {
        metadata.title = parsed.name
      }
      if (parsed.title) {
        metadata.title = parsed.title
      }
      if (parsed.url) {
        metadata.url = parsed.url
      }
      if (parsed.version) {
        metadata.version = parsed.version
      }
      if (parsed.text && parsed.text.div) {
        metadata.narrative = parsed.text.div
      }
      return metadata
    } catch (error) {
      throw new Error(
        `There was a problem parsing the JSON FHIR resource: "${error.message}"`
      )
    }
  }

  static async extractXMLMetadata(raw) {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(raw, 'application/xml')
      const metadata = {}
      // Prefer title over name over resource type.
      const resource = doc.querySelector(':root')
      const name = doc.querySelector(':root > name')
      const title = doc.querySelector(':root > title')
      metadata.title = title
        ? title.getAttribute('value')
        : name
          ? name.getAttribute('value')
          : resource ? resource.nodeName : undefined
      const url = doc.querySelector(':root > url')
      metadata.url = url ? url.getAttribute('value') : undefined
      const version = doc.querySelector(':root > version')
      metadata.version = version ? version.getAttribute('value') : undefined
      const narrative = doc.querySelector(':root > text div')
      // Serialize the narrative XML back out to a plain string.
      if (narrative) {
        const serializer = new XMLSerializer()
        metadata.narrative = serializer.serializeToString(narrative)
      }
      return metadata
    } catch (error) {
      throw new Error(
        `There was a problem parsing the XML FHIR resource: "${error.message}"`
      )
    }
  }
}

export default FhirResource
