import React, { Component } from 'react'
import PropTypes from 'prop-types'
import http from 'axios'

import FhirResource from './FhirResource.js'
import ErrorMessage from './ErrorMessage.js'
import { sniffFormat } from './fhir/restApi.js'
import { opOutcomeFromJsonResponse } from './fhir/json.js'
import { opOutcomeFromXmlResponse } from './fhir/xml.js'

// A component that retrieves a FHIR resource from a URL, and renders it.
class RemoteFhirResource extends Component {
  static propTypes = {
    path: PropTypes.string.isRequired,
    query: PropTypes.string.isRequired,
    fhirServer: PropTypes.string.isRequired,
    fhirVersion: PropTypes.string.isRequired,
    narrativeStyles: PropTypes.string,
    pathPrefix: PropTypes.string,
    onLoad: PropTypes.func,
    onError: PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.state = {}
    this.handleLoad = this.handleLoad.bind(this)
    this.handleError = this.handleError.bind(this)
  }

  updateResource(props) {
    return this.setState(
      () => ({ status: 'loading' }),
      () =>
        this.getResource(props)
          .then(resource => this.setState({ ...resource, status: 'loaded' }))
          .catch(error => this.handleError(error)),
    )
  }

  async getResource(props) {
    try {
      const { fhirServer, path, query } = props
      const response = await http.get(fhirServer + path + query, {
        headers: {
          Accept: 'application/fhir+json, application/fhir+xml;q=0.9',
        },
      })
      const format = sniffFormat(response.headers['content-type'])
      return {
        resource: response.data,
        raw: response.request.responseText,
        format,
      }
    } catch (error) {
      if (error.response) this.handleUnsuccessfulResponse(error.response)
      else throw error
    }
  }

  handleUnsuccessfulResponse(response) {
    let format
    try {
      format = sniffFormat(response.headers['content-type'])
    } catch (error) {} // eslint-disable-line no-empty
    if (format === 'json') {
      const opOutcome = opOutcomeFromJsonResponse(response)
      if (opOutcome) throw opOutcome
    } else if (format === 'xml') {
      const opOutcome = opOutcomeFromXmlResponse(response)
      if (opOutcome) throw opOutcome
    }
    if (response.status === 404) {
      throw new Error(
        `The resource you requested was not found: "${this.props.path}"`,
      )
    } else {
      throw new Error(response.statusText || response.status)
    }
  }

  handleLoad(metadata) {
    if (this.props.onLoad) {
      this.props.onLoad(metadata)
    }
  }

  handleError(error) {
    if (this.props.onError) {
      this.props.onError(error)
    } else {
      this.setState(() => ({ error, status: 'error' }))
    }
  }

  componentWillMount() {
    this.updateResource(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.updateResource(nextProps)
  }

  componentDidCatch(error) {
    this.setState(() => ({ error }))
    throw error
  }

  render() {
    const { fhirServer, fhirVersion, narrativeStyles, pathPrefix } = this.props
    const { resource, format, raw, status, error } = this.state

    switch (status) {
      case 'loading':
        return (
          <div className="remote-fhir-resource">
            <p className="loading">Loading...</p>
          </div>
        )
      case 'loaded':
        return (
          <div className="remote-fhir-resource">
            <FhirResource
              fhirServer={fhirServer}
              fhirVersion={fhirVersion}
              narrativeStyles={narrativeStyles}
              pathPrefix={pathPrefix}
              resource={resource}
              format={format}
              raw={raw}
              onLoad={this.handleLoad}
              onError={this.handleError}
            />
          </div>
        )
      case 'error':
        return <ErrorMessage error={error} />
      default:
        return <div className="remote-fhir-resource" />
    }
  }
}

export default RemoteFhirResource
