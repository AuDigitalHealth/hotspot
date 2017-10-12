import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import intersection from 'lodash.intersection'

import { extractCodesFromJsonExpansion } from './fhir/json.js'
import { extractCodesFromXMLExpansion } from './fhir/xml.js'
import { codeSystemSearchPath, lookupPath } from './fhir/restApi.js'

import './css/tables.css'
import './css/ValueSetExpansion.css'

// Expands a ValueSet with a given URL, and provides a human-friendly rendering
// of the expansion.
class ValueSetExpansion extends Component {
  static propTypes = {
    expansion: PropTypes.oneOfType([
      PropTypes.object, // parsed JSON document fragment
      PropTypes.instanceOf(Node), // parsed XML document fragment
    ]).isRequired,
    onError: PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.state = {
      codes: [],
    }
    this.extractCodes = this.extractCodes.bind(this)
    this.handleError = this.handleError.bind(this)
  }

  extractCodes(expansion) {
    const extractCodesImpl =
      expansion instanceof Node
        ? extractCodesFromXMLExpansion
        : extractCodesFromJsonExpansion
    extractCodesImpl(expansion)
      .then(codes => this.setState(() => ({ codes })))
      .catch(error => this.handleError(error))
  }

  handleError(error) {
    if (this.props.onError) {
      this.props.onError(error)
    }
  }

  componentWillMount() {
    this.extractCodes(this.props.expansion)
  }

  componentWillReceiveProps(nextProps) {
    this.extractCodes(this.props.expansion)
  }

  render() {
    const { codes } = this.state
    if (!codes) return <div className='value-set-expansion' />
    let columns = []

    for (const code of codes) {
      columns = [ ...columns, ...Object.keys(code) ]
    }
    // Whitelist code attributes and get them in the preferred order.
    columns = intersection(
      [ 'system', 'code', 'display', 'abstract', 'inactive', 'version' ],
      columns
    )
    const headers = (
      <tr>{columns.map((column, i) => <th key={i}>{column}</th>)}</tr>
    )
    const codeRows = this.renderCodeRows(codes, columns)

    return (
      <div className='value-set-expansion'>
        <table className='table'>
          <thead>{headers}</thead>
          <tbody>{codeRows}</tbody>
        </table>
      </div>
    )
  }

  renderCodeRows(codes, columns) {
    return codes.map((code, i) => (
      <tr key={i}>
        {code.system ? (
          <td>
            <Link to={codeSystemSearchPath(code.system)}>{code.system}</Link>
          </td>
        ) : (
          this.renderEmptyCellOrNull(columns, 'system')
        )}
        {code.code ? (
          <td>
            {code.code && code.system && code.version ? (
              <Link to={lookupPath(code.system, code.code, code.version)}>
                {code.code}
              </Link>
            ) : code.code && code.system ? (
              <Link to={lookupPath(code.system, code.code)}>{code.code}</Link>
            ) : (
              code.code
            )}
          </td>
        ) : (
          this.renderEmptyCellOrNull(columns, 'code')
        )}
        {code.display ? (
          <td>{code.display}</td>
        ) : (
          this.renderEmptyCellOrNull(columns, 'display')
        )}
        {code.abstract ? (
          <td>{code.abstract.toString()}</td>
        ) : (
          this.renderEmptyCellOrNull(columns, 'abstract')
        )}
        {code.inactive ? (
          <td>{code.inactive.toString()}</td>
        ) : (
          this.renderEmptyCellOrNull(columns, 'inactive')
        )}
        {code.version ? (
          <td>{code.version}</td>
        ) : (
          this.renderEmptyCellOrNull(columns, 'version')
        )}
      </tr>
    ))
  }

  renderEmptyCellOrNull(columns, column) {
    return columns.includes(column) ? <td /> : null
  }
}

export default ValueSetExpansion
