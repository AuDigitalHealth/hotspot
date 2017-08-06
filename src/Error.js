import React, { Component } from 'react'
import PropTypes from 'prop-types'

import './css/Error.css'

// Renders a Error or OpOutcomeError object.
class Error extends Component {
  static propTypes = {
    error: PropTypes.shape({
      issue: PropTypes.shape({
        severity: PropTypes.string,
        details: PropTypes.shape({
          display: PropTypes.string,
        }),
        diagnostics: PropTypes.string,
        code: PropTypes.string,
        location: PropTypes.string,
        expression: PropTypes.string,
      }),
      message: PropTypes.string,
    }),
  }

  render() {
    const { error } = this.props

    if (error.issue) {
      return (
        <div className='error'>
          <strong>Error</strong>
          {error.issue.details && error.issue.details.display
            ? <p className='details'>
                {error.issue.details.display}
              </p>
            : undefined}
          {error.issue.diagnostics
            ? <p className='diagnostics'>
                {error.issue.diagnostics}
              </p>
            : undefined}
          {error.issue.severity
            ? <p className='severity'>
                <strong>Severity:</strong> {error.issue.severity}
              </p>
            : undefined}
          {error.issue.code
            ? <p className='code'>
                <strong>Error code:</strong> {error.issue.code}
              </p>
            : undefined}
          {error.issue.location
            ? <p className='location'>
                <strong>Location:</strong> {error.issue.location}
              </p>
            : undefined}
          {error.issue.expression
            ? <p className='expression'>
                <strong>Expression:</strong> {error.issue.expression}
              </p>
            : undefined}
        </div>
      )
    } else if (error.message) {
      return (
        <div className='error'>
          <strong>Error</strong>
          <p className='message'>
            {error.message}
          </p>
        </div>
      )
    } else {
      return <div className='error' />
    }
  }
}

export default Error
