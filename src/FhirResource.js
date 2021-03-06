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
    format: PropTypes.oneOf(['json', 'xml']),
    raw: PropTypes.string, // supplied if resource is not raw string and raw tab is required
    fullUrl: PropTypes.string,
    className: PropTypes.string,
    noTabSelectedAtLoad: PropTypes.bool,
    onLoad: PropTypes.func,
    onError: PropTypes.func,
    pathPrefix: PropTypes.string,
  }

  static defaultProps = {
    className: 'fhir-resource',
    noTabSelectedAtLoad: false,
  }

  constructor(props) {
    super(props)
    this.handleError = this.handleError.bind(this)
    this.state = { renderedComponent: {} }
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
            this.setState({ ...emptyMetadata, ...metadata, status: 'loaded' }),
          )
          .catch(error => this.handleError(error))
      },
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
    if (this.props.noTabSelectedAtLoad && !this.state.activeTab) return metadata
    return {
      ...metadata,
      activeTab: metadata.narrative
        ? 'narrative'
        : metadata.expansion ? 'expansion' : metadata.bundle ? 'bundle' : 'raw',
    }
  }

  setActiveTab(tabName, resource) {
    if (resource && !this.isComponentRendered(tabName, resource)) {
      const { renderedComponent } = this.state
      const renderedEntry = {
        [tabName +
        ':' +
        resource.id +
        ':' +
        (resource.version ? resource.version : '')]: true,
      }
      this.setState(() => ({
        renderedComponent: { ...renderedComponent, ...renderedEntry },
      }))
    }
    this.setState(
      () =>
        this.props.noTabSelectedAtLoad && this.state.activeTab === tabName
          ? { activeTab: undefined }
          : { activeTab: tabName },
    )
  }

  isComponentRendered(tabName, resource) {
    const { renderedComponent } = this.state
    return (
      renderedComponent[
        tabName +
          ':' +
          resource.id +
          ':' +
          (resource.version ? resource.version : '')
      ] === true
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

  getUrlProtocol(fullUrl) {
    return new RegExp('(http://|https://|/|)([a-zA-Z0-9\\.-]+)').exec(
      fullUrl,
    )[1]
  }

  getUrlHost(fullUrl) {
    return new RegExp('(http://|https://|/|)([a-zA-Z0-9\\.-]+)').exec(
      fullUrl,
    )[2]
  }

  isCorrectFhirServer(fullUrl) {
    const urlHost = this.getUrlHost(fullUrl)
    const fhirHost = this.getUrlHost(this.props.fhirServer)
    return urlHost === fhirHost
  }

  toCorrectProtocol(fullUrl) {
    const urlHost = this.getUrlHost(fullUrl)
    const urlProtocol = this.getUrlProtocol(fullUrl)
    const fhirProtocol = this.getUrlProtocol(this.props.fhirServer)
    if (urlProtocol !== fhirProtocol) {
      return fullUrl.replace(urlProtocol + urlHost, fhirProtocol + urlHost)
    }
    return fullUrl
  }

  render() {
    const { className } = this.props
    const { status } = this.state
    return status === 'loaded' ? (
      <div className={className}>
        {this.renderMetadata()}
        {this.renderTabs()}
        {this.renderTabContent()}
      </div>
    ) : (
      <div className={className} />
    )
  }

  renderMetadata() {
    const { title, url, version, publisher, resourceStatus, oid } = this.state
    return (
      <div className="metadata">
        {title ? <h2 className="title">{title}</h2> : null}
        <dl className="metadata">
          {url ? (
            <div>
              <dt className="url">URI</dt>
              <dd>{url}</dd>
            </div>
          ) : null}
          {version ? (
            <div>
              <dt className="version">Version</dt>
              <dd>{version}</dd>
            </div>
          ) : null}
          {publisher ? (
            <div>
              <dt className="publisher">Publisher</dt>
              <dd>{publisher}</dd>
            </div>
          ) : null}
          {resourceStatus ? (
            <div>
              <dt className="status">Status</dt>
              <dd>{resourceStatus}</dd>
            </div>
          ) : null}
          {oid ? (
            <div>
              <dt className="oid">OID</dt>
              <dd>{oid}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    )
  }

  renderTabs() {
    const {
      fhirServer,
      fhirVersion,
      format,
      resource,
      fullUrl,
      pathPrefix,
    } = this.props
    const { narrative, expansion, bundle, valueSetUri, activeTab } = this.state
    const valueSetPath = valueSetExpansionPath(valueSetUri, fhirVersion, {
      pathPrefix,
    })
    return (
      <nav>
        <ol>
          {narrative ? (
            <li
              onClick={() => this.setActiveTab('narrative', resource)}
              className={activeTab === 'narrative' ? 'active' : ''}
            >
              Narrative
            </li>
          ) : null}
          {expansion ? (
            <li
              onClick={() => this.setActiveTab('expansion', resource)}
              className={activeTab === 'expansion' ? 'active' : ''}
            >
              Expansion
            </li>
          ) : null}
          {bundle ? (
            <li
              onClick={() => this.setActiveTab('bundle', resource)}
              className={activeTab === 'bundle' ? 'active' : ''}
            >
              Bundle
            </li>
          ) : null}
          <li
            onClick={() => this.setActiveTab('raw', resource)}
            className={activeTab === 'raw' ? 'active' : ''}
          >
            {format ? format.toUpperCase() : undefined}
          </li>
          {fullUrl && this.isCorrectFhirServer(fullUrl) ? (
            <Link
              to={this.toCorrectProtocol(fullUrl).replace(
                fhirServer,
                pathPrefix,
              )}
            >
              Full Resource
            </Link>
          ) : null}
          {valueSetUri && !expansion ? (
            <Link to={valueSetPath} className="link">
              Expansion
            </Link>
          ) : null}
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
      pathPrefix,
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
      <div className="tab-content-wrapper">
        {narrative ? (
          <section
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
        ) : null}
        {expansion ? (
          <section
            className={
              activeTab === 'expansion'
                ? 'tab-content'
                : 'tab-content tab-content-hidden'
            }
          >
            <ValueSetExpansion
              expansion={expansion}
              onError={this.handleError}
              pathPrefix={pathPrefix}
            />
          </section>
        ) : null}
        {bundle ? (
          <section
            className={
              activeTab === 'bundle'
                ? 'tab-content'
                : 'tab-content tab-content-hidden'
            }
          >
            <Bundle
              fhirServer={fhirServer}
              fhirVersion={fhirVersion}
              narrativeStyles={narrativeStyles}
              bundle={bundle}
              format={format}
              raw={raw}
              onError={this.handleError}
              pathPrefix={pathPrefix}
            />
          </section>
        ) : null}
        {raw &&
        (activeTab === 'raw' || this.isComponentRendered('raw', resource)) ? (
          <section
            className={
              activeTab === 'raw'
                ? 'tab-content'
                : 'tab-content tab-content-hidden'
            }
          >
            <Raw content={raw} format={format} onError={this.handleError} />
          </section>
        ) : null}
      </div>
    )
  }
}

export default FhirResource
