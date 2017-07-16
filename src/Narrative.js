import React, { Component } from 'react'
import PropTypes from 'prop-types'
import sanitize from 'sanitize-html'
import _ from 'lodash'

// Renders the XHTML narrative content from a FHIR resource, optionally
// applying a custom stylesheet.
class Narrative extends Component {
  constructor(props) {
    super(props)
    const state = {}
    if (this.props.content) {
      try {
        state.sanitizedContent = this.sanitizeContent(props.content)
      } catch (error) {
        this.props.onError(error)
      }
    }
    this.state = state
  }

  async getStyles() {
    try {
      const response = await fetch(this.props.stylesPath)
      if (!response.ok) {
        this.handleUnsuccessfulResponse(response)
      }
      const contentType = response.headers.get('Content-Type')
      // Check that the Content-Type of the stylesheet response is `text/css`.
      if (!contentType.match(/text\/css/)) {
        throw Error(
          `Narrative stylesheet had unexpected format: "${contentType}"`
        )
      }
      const styles = await response.text()
      this.setState(() => ({ styles }))
    } catch (error) {
      this.props.onError(error)
    }
  }

  handleUnsuccessfulResponse(response) {
    if (response.status === 404) {
      throw Error(`Narrative stylesheet not found: "${this.props.stylesPath}"`)
    } else {
      throw Error(response.statusText)
    }
  }

  sanitizeContent(content) {
    const allowedTags = require('./config/allowedTags.json')
    const sanitizedContent = sanitize(content, {
      // Allow only our set of whitelisted tags.
      allowedTags,
      // Allow all attributes (except for event-related, see later filter).
      allowedAttributes: false,
      // Allow data URLs.
      allowedSchemes: [ 'http', 'https', 'ftp', 'mailto', 'data' ],
      transformTags: {
        // Filter out event-related attributes.
        '*': (tagName, attribs) => ({
          tagName,
          attribs: _.omit(attribs, (_, key) => {
            key.match(/^on.+/)
          }),
        }),
        // Translate any relative hrefs within anchors.
        a: (tagName, attribs) => ({
          tagName,
          attribs: { ...attribs, href: this.translateHref(attribs.href) },
        }),
      },
    })
    return sanitizedContent
  }

  translateHref(href) {
    if (!href) {
      return ''
    }
    const absolutePattern = /^([a-z]+:){0,1}\/\//
    const rootRelativePattern = /^\//
    const fragmentPattern = /^#/
    if (href.match(absolutePattern)) {
      return href
    } else if (href.match(rootRelativePattern)) {
      const fhirServerUrl = new URL(this.props.fhirServer)
      return fhirServerUrl.protocol + fhirServerUrl.hostname + href
    } else if (href.match(fragmentPattern)) {
      return href
    } else {
      return this.props.fhirServer + '/' + href
    }
  }

  componentDidMount() {
    if (this.props.stylesPath) {
      this.getStyles()
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

  render() {
    const { sanitizedContent, styles } = this.state

    // Narrative styles are added to a "scoped" style tag inside the narrative
    // div. This means that these styles are only applied to content within
    // this element.
    const styleTag = styles
      ? <style scoped>
          {styles}
        </style>
      : null

    const narrative = sanitizedContent
      ? <div
        className='narrative-content'
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      : <p>This FHIR resource does not have narrative content.</p>

    return (
      <div className='narrative'>
        {styleTag}
        {narrative}
      </div>
    )
  }
}

Narrative.propTypes = {
  content: PropTypes.string.isRequired,
  fhirServer: PropTypes.string.isRequired,
  stylesPath: PropTypes.string,
  onError: PropTypes.func,
}

export default Narrative
