import React, { Component } from 'react'
import PropTypes from 'prop-types'
import sanitize from 'sanitize-html'
import http from 'axios'
import omitBy from 'lodash.omitby'

import { translateHref } from './fhir/restApi.js'

import './css/Narrative.css'

// Renders the XHTML narrative content from a FHIR resource, optionally
// applying a custom stylesheet.
class Narrative extends Component {
  static propTypes = {
    content: PropTypes.string.isRequired,
    fhirServer: PropTypes.string.isRequired,
    stylesPath: PropTypes.string,
    onError: PropTypes.func,
  }

  constructor(props) {
    super(props)
    const state = {}
    if (props.content) {
      try {
        state.sanitizedContent = this.sanitizeContent(props.content)
      } catch (error) {
        if (props.onError) {
          props.onError(error)
        }
      }
    }
    this.state = state
  }

  async getStyles() {
    try {
      const response = await http.get(this.props.stylesPath)
      const contentType = response.headers['content-type']
      // Check that the Content-Type of the stylesheet response is `text/css`.
      if (!contentType.match(/text\/css/)) {
        throw Error(
          `Narrative stylesheet had unexpected format: "${contentType}"`,
        )
      }
      const styles = response.data
      this.setState(() => ({ styles }))
    } catch (error) {
      throw Error(`Narrative stylesheet not found: "${error.toString()}"`)
    }
  }

  sanitizeContent(content) {
    const { fhirServer } = this.props
    const allowedTags = require('./config/allowedTags.json')
    const sanitizedContent = sanitize(content, {
      // Allow only our set of whitelisted tags.
      allowedTags,
      // Allow all attributes (except for event-related, see later filter).
      allowedAttributes: false,
      // Allow data URLs.
      allowedSchemes: ['http', 'https', 'ftp', 'mailto', 'data'],
      transformTags: {
        // Filter out event-related attributes.
        '*': (tagName, attribs) => ({
          tagName,
          attribs: omitBy(attribs, (_, key) => key.match(/^on.+/)),
        }),
        // Translate any relative hrefs within anchors.
        a: (tagName, attribs) => ({
          tagName,
          attribs: {
            ...attribs,
            href: translateHref(attribs.href, fhirServer),
          },
        }),
      },
    })
    return sanitizedContent
  }

  componentDidMount() {
    if (this.props.stylesPath) {
      this.getStyles().catch(error => {
        if (this.props.onError) {
          this.props.onError(error)
        }
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.content) {
      try {
        this.setState(() => ({
          sanitizedContent: this.sanitizeContent(nextProps.content),
        }))
      } catch (error) {
        nextProps.onError(error)
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.content !== nextProps.content ||
      this.state.sanitizedContent !== nextState.sanitizedContent ||
      this.state.styles !== nextState.styles
    )
  }

  render() {
    const { sanitizedContent, styles } = this.state

    // Narrative styles are added to a "scoped" style tag inside the narrative
    // div. This means that these styles are only applied to content within
    // this element.
    const styleTag = styles ? <style scoped>{styles}</style> : null

    const narrative = sanitizedContent ? (
      <div
        className="narrative-content"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    ) : (
      <p>This FHIR resource does not have narrative content.</p>
    )

    return (
      <div className="narrative">
        {styleTag}
        {narrative}
      </div>
    )
  }
}

export default Narrative
