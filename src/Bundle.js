import React, { Component } from 'react'
import PropTypes from 'prop-types'

import FhirResource from './FhirResource.js'
import { extractEntriesFromJsonBundle } from './fhir/json.js'
import { extractEntriesFromXmlBundle } from './fhir/xml.js'

import './css/Bundle.css'

// Provides a human-friendly rendering of a FHIR Bundle resource.
class Bundle extends Component {
  static propTypes = {
    fhirServer: PropTypes.string.isRequired,
    fhirVersion: PropTypes.string.isRequired,
    bundle: PropTypes.oneOfType([
      PropTypes.object, // parsed JSON document fragment
      PropTypes.instanceOf(Element), // parsed XML document fragment
    ]).isRequired,
    onError: PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.state = {
      entries: [],
    }
    this.extractEntries = this.extractEntries.bind(this)
    this.handleError = this.handleError.bind(this)
  }

  extractEntries(bundle) {
    const extractEntriesImpl =
      bundle instanceof Element
        ? extractEntriesFromXmlBundle
        : extractEntriesFromJsonBundle
    extractEntriesImpl(bundle)
      .then(entries => this.setState(() => ({ entries })))
      .catch(error => this.handleError(error))
  }

  handleError(error) {
    if (this.props.onError) {
      this.props.onError(error)
    }
  }

  componentWillMount() {
    this.extractEntries(this.props.bundle)
  }

  componentWillReceiveProps(nextProps) {
    this.extractEntries(nextProps.bundle)
  }

  render() {
    const { fhirServer, fhirVersion } = this.props
    const { entries } = this.state
    if (!entries) return <div className='bundle' />

    return (
      <div className='bundle'>
        {entries.map((entry, i) =>
          <div key={i} className='entry'>
            <FhirResource
              fhirServer={fhirServer}
              fhirVersion={fhirVersion}
              resource={entry.resource}
              fullUrl={entry.fullUrl}
              format='json'
              className='fhir-resource fhir-resource-inline'
              noTabSelectedAtLoad
              onError={this.handleError}
            />
          </div>
        )}
      </div>
    )
  }
}

export default Bundle
