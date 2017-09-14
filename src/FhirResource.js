import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import Narrative from './Narrative.js'
import ValueSetExpansion from './ValueSetExpansion.js'
import Bundle from './Bundle.js'
import Raw from './Raw.js'
import {
  extractJsonMetadata,
  extractRawJsonMetadata,
  rawFromJsonResource,
} from './fhir/json.js'
import {
  extractXmlMetadata,
  extractRawXmlMetadata,
  rawFromXmlResource,
} from './fhir/xml.js'
import { valueSetExpansionPath } from './fhir/restApi.js'

import './css/FhirResource.css'
import './css/InlineFhirResource.css'

// A component that presents a human-friendly representation of an XML or JSON
// FHIR resource, including Narrative and Raw tabs.
class FhirResource extends Component {
  static propTypes = {
    fhirServer: PropTypes.string.isRequired,
    fhirVersion: PropTypes.string.isRequired,
    narrativeStyles: PropTypes.string,
    resource: PropTypes.oneOfType([
      PropTypes.object, // parsed JSON document fragment
      PropTypes.instanceOf(Node), // parsed XML document fragment
      PropTypes.string, // unparsed string
    ]),
    format: PropTypes.oneOf([ 'json', 'xml' ]),
    raw: PropTypes.string, // supplied if resource is not raw string and raw tab is required
    fullUrl: PropTypes.string,
    className: PropTypes.string,
    noTabSelectedAtLoad: PropTypes.bool,
    onLoad: PropTypes.func,
  }

  static defaultProps = {
    className: 'fhir-resource',
    noTabSelectedAtLoad: false,
  }

  constructor(props) {
    super(props)
    this.handleError = this.handleError.bind(this)
  }

  updateResource(props) {
    const { resource, format } = props
    const emptyMetadata = {
      title: undefined,
      url: undefined,
      version: undefined,
      publisher: undefined,
      resourceStatus: undefined,
      oid: undefined,
      resourceType: undefined,
      narrative: undefined,
      valueSetUri: undefined,
      expansion: undefined,
    }
    return this.setState(
      () => ({ status: 'loading' }),
      () => {
        // Do nothing if resource has not been passed down yet.
        if (!(resource && format)) return
        return this.extractMetadata(props)
          .then(metadata => {
            if (this.props.onLoad) this.props.onLoad(metadata)
            return metadata
          })
          .then(metadata => this.updateActiveTab(metadata))
          .then(metadata =>
            this.setState({ ...emptyMetadata, ...metadata, status: 'loaded' })
          )
          .catch(error => this.handleError(error))
      }
    )
  }

  async extractMetadata(props) {
    if (props.resource instanceof Node) {
      return extractXmlMetadata(props.resource)
    } else if (typeof props.resource === 'object') {
      return extractJsonMetadata(props.resource)
    } else if (typeof props.resource === 'string') {
      return props.format === 'json'
        ? extractRawJsonMetadata(props.resource)
        : extractRawXmlMetadata(props.resource)
    } else {
      throw new Error('Unexpected type encountered in resource prop.')
    }
  }

  async updateActiveTab(metadata) {
    // Skip setting of active tab if not already explicitly selected, if the
    // `noTabSelectedAtLoad` option is set.
    if (this.props.noTabSelectedAtLoad && !this.props.activeTab) return metadata
    return {
      ...metadata,
      activeTab: metadata.narrative
        ? 'narrative'
        : metadata.expansion ? 'expansion' : metadata.bundle ? 'bundle' : 'raw',
    }
  }

  setActiveTab(tabName) {
    this.setState(
      () =>
        this.props.noTabSelectedAtLoad && this.state.activeTab === tabName
          ? { activeTab: undefined }
          : { activeTab: tabName }
    )
  }

  handleError(error) {
    if (this.props.onError) this.props.onError(error)
  }

  componentWillMount() {
    this.updateResource(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.updateResource(nextProps)
  }

  render() {
    const { className } = this.props
    const { status } = this.state
    return status === 'loaded'
      ? <div className={className}>
          {this.renderMetadata()}
          {this.renderTabs()}
          {this.renderTabContent()}
        </div>
      : <div className={className} />
  }

  renderMetadata() {
    const { title, url, version, publisher, resourceStatus, oid } = this.state
    return (
      <div className='metadata'>
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
          {publisher
            ? <div>
                <dt className='publisher'>Publisher</dt>
                <dd>
                  {publisher}
                </dd>
              </div>
            : null}
          {resourceStatus
            ? <div>
                <dt className='status'>Status</dt>
                <dd>
                  {resourceStatus}
                </dd>
              </div>
            : null}
          {oid
            ? <div>
                <dt className='oid'>OID</dt>
                <dd>
                  {oid}
                </dd>
              </div>
            : null}
        </dl>
      </div>
    )
  }

  renderTabs() {
    const { fhirServer, fhirVersion, format, fullUrl } = this.props
    const { narrative, expansion, bundle, valueSetUri, activeTab } = this.state
    const valueSetPath = valueSetExpansionPath(valueSetUri, fhirVersion)
    return (
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
          {bundle
            ? <li
              onClick={() => this.setActiveTab('bundle')}
              className={activeTab === 'bundle' ? 'active' : ''}
              >
                Bundle
              </li>
            : null}
          <li
            onClick={() => this.setActiveTab('raw')}
            className={activeTab === 'raw' ? 'active' : ''}
          >
            {format ? format.toUpperCase() : undefined}
          </li>
          {fullUrl
            ? <Link to={fullUrl.replace(fhirServer, '')}>Full Resource</Link>
            : null}
          {valueSetUri && !expansion
            ? <Link to={valueSetPath} className='link'>
                Expansion
              </Link>
            : null}
        </ol>
      </nav>
    )
  }

  renderTabContent() {
    const {
      fhirServer,
      fhirVersion,
      narrativeStyles,
      resource,
      format,
    } = this.props
    const { narrative, activeTab, expansion, bundle } = this.state
    // If the resource is provided raw, use that as our raw value. Otherwise,
    // use the raw prop. If there is no raw prop, generate a raw value by
    // serializing the object.
    const raw =
      typeof resource === 'string'
        ? resource
        : this.props.raw
          ? this.props.raw
          : resource instanceof Node
            ? rawFromXmlResource(resource)
            : rawFromJsonResource(resource)
    return (
      <div className='tab-content-wrapper'>
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
        {bundle
          ? <section
            className={
                activeTab === 'bundle'
                  ? 'tab-content'
                  : 'tab-content tab-content-hidden'
              }
            >
              <Bundle
                fhirServer={fhirServer}
                fhirVersion={fhirVersion}
                bundle={bundle}
                format={format}
                raw={raw}
                onError={this.handleError}
              />
            </section>
          : null}
        {raw
          ? <section
            className={
                activeTab === 'raw'
                  ? 'tab-content'
                  : 'tab-content tab-content-hidden'
              }
            >
              <Raw content={raw} format={format} onError={this.handleError} />
            </section>
          : null}
      </div>
    )
  }
}

export default FhirResource
