import React, { Component } from 'react'

import Narrative from './Narrative.js'
import Raw from './Raw.js'

import './css/FhirResource.css'

// A component that presents a human-friendly representation of an XML or JSON
// FHIR resource, including Narrative and Raw tabs.
class FhirResource extends Component {
  constructor(props) {
    super(props)
    this.state = {
      status: 'loading',
      activeTab: 'narrative',
    }

    this.handleError = this.handleError.bind(this)
  }

  async getResource() {
    const { fhirServer, path, query } = this.props

    try {
      const response = await fetch(fhirServer + path + query)
      if (!response.ok) { this.handleUnsuccessfulResponse(response) }
      const responseText = await response.text()
      const format = FhirResource.sniffFormat(response.headers.get('Content-Type'))
      this.setState(() => ({ raw: responseText, format }))
      const metadata = await FhirResource.extractMetadata(responseText, format)
      this.setState(() => metadata, () => this.setState({ status: 'loaded' }))
    } catch (error) {
      this.handleError(new Error(`There was a problem reaching the FHIR server: "${error.message}"`))
    }
  }

  setActiveTab(tabName) {
    this.setState(() => ({ activeTab: tabName }))
  }

  handleError(error) {
    console.error(error)
    this.setState(() => ({ error, status: 'error' }))
  }

  handleUnsuccessfulResponse(response) {
    if (response.status === 404) {
      throw Error(`The resource you requested was not found: "${this.props.path}"`)
    } else {
      throw Error(response.statusText)
    }
  }

  componentDidMount() {
    this.setState(
      () => ({ status: 'loading' }),
      () => this.getResource()
    )
  }

  componentDidUpdate(prevProps, prevState) {
    const { title, version } = this.state

    if (title !== prevState.title || version !== prevState.version) {
      document.title = version
        ? `${title} (${version})`
        : title
    }
  }

  render() {
    const { narrativeStyles } = this.props
    const { status, format, narrative, raw, activeTab, error } = this.state
    let { title, url, version } = this.state

    title = title ? <h2 className='title'>{title}</h2> : null
    url = url ? <h3 className='url'><a href={url}>{url}</a></h3> : null
    version = version ? <h3 className='version'>{version}</h3> : null

    switch (status) {
      case 'loading':
        return <div className='fhir-resource'>
            <p className='loading'>Loading...</p>
          </div>
      case 'loaded':
        return <div className='fhir-resource'>
            {title}
            {url}
            {version}
            <nav>
              <ol>
                <li onClick={() => this.setActiveTab('narrative')}
                  className={activeTab === 'narrative' ? 'active' : ''}>
                  Narrative
                </li>
                <li onClick={() => this.setActiveTab('raw')}
                  className={activeTab === 'raw' ? 'active' : ''}>
                  {format ? format.toUpperCase() : undefined}
                </li>
              </ol>
            </nav>
            <section className={activeTab === 'narrative' ? 'tab-content' : 'tab-content tab-content-hidden'}>
              <Narrative content={narrative} stylesPath={narrativeStyles} onError={this.handleError} />
            </section>
            <section className={activeTab === 'raw' ? 'tab-content' : 'tab-content tab-content-hidden'}>
              <Raw content={raw} format={format} onError={this.handleError} />
            </section>
          </div>
      case 'error':
        return <div className='fhir-resource'>
          <p className='error'><strong>Error</strong>&nbsp;&nbsp;&nbsp;{error.message}</p>
          </div>
      default:
        console.error(`Invalid status encountered: ${status}`)
    }
  }

  static sniffFormat(contentType) {
    // Sniff JSON if the Content-Type header matches:
    // - application/json
    // - application/fhir+json (FHIR STU3)
    // - application/json+fhir (FHIR DSTU2)
    if (contentType.match(/(application\/json|application\/fhir\+json|application\/json\+fhir)/)) {
      return 'json'
    // Sniff XML if the Content-Type header matches:
    // - text/xml
    // - application/xml
    // - application/fhir+xml (FHIR STU3)
    // - application/json+xml (FHIR DSTU2)
    } else if (contentType.match(/(text\/xml|application\/xml|application\/fhir\+xml|application\/xml\+fhir)/)) {
      return 'xml'
    } else {
      return null
    }
  }

  static extractMetadata(raw, format) {
    return new Promise((resolve, reject) => {
      if (format === 'json') {
        FhirResource.extractJSONMetadata(raw, resolve, reject)
      } else if (format === 'xml') {
        FhirResource.extractXMLMetadata(raw, resolve, reject)
      } else {
        reject(new Error('Unsupported content type.'))
      }
    })
  }

  static extractJSONMetadata(raw, resolve, reject) {
    try {
      const parsed = JSON.parse(raw)
      const metadata = {}
      // Prefer name over title, as it is supposed to be the more human-readable.
      if (parsed.name) { metadata.title = parsed.name }
      if (parsed.title) { metadata.title = parsed.title }
      if (parsed.url) { metadata.url = parsed.url }
      if (parsed.version) { metadata.version = parsed.version }
      if (parsed.text && parsed.text.div) { metadata.narrative = parsed.text.div }
      resolve(metadata)
    } catch (error) { reject(new Error(`There was a problem parsing the JSON FHIR resource: "${error.message}"`)) }
  }

  static extractXMLMetadata(raw, resolve, reject) {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(raw, 'application/xml')
      const metadata = {}
      // Prefer name over title, as it is supposed to be the more human-readable.
      const name = doc.querySelector('name')
      const title = doc.querySelector('title')
      metadata.title = title
        ? title.getAttribute('value') : name
          ? name.getAttribute('value') : undefined
      const url = doc.querySelector('url')
      metadata.url = url ? url.getAttribute('value') : undefined
      const version = doc.querySelector('version')
      metadata.version = version ? version.getAttribute('value') : undefined
      const narrative = doc.querySelector('text div')
      // Serialize the narrative XML back out to a plain string.
      if (narrative) {
        const serializer = new XMLSerializer()
        metadata.narrative = serializer.serializeToString(narrative)
      }
      resolve(metadata)
    } catch (error) { reject(new Error(`There was a problem parsing the XML FHIR resource: "${error.message}"`)) }
  }
}

export default FhirResource
