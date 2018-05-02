import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Highlight from './vendor/highlight'
import beautify from 'vkbeautify'

import './vendor/highlight/css/docco.css'
import './css/Raw.css'

// Renders the raw content of an XML or JSON FHIR resource, pretty-printed and
// with syntax highlighting.
class Raw extends Component {
  static propTypes = {
    content: PropTypes.string.isRequired,
    format: PropTypes.oneOf(['json', 'xml']).isRequired,
    onError: PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.state = {}
    if (props.content && props.format) {
      try {
        this.state = {
          ...this.state,
          prettyContent: Raw.prettifyContent(props.content, props.format),
        }
      } catch (error) {
        if (props.onError) {
          props.onError(error)
        }
      }
    }
    this.highlightCode = this.highlightCode.bind(this)
  }

  componentDidMount() {
    this.highlightCode()
  }

  componentDidUpdate(_, prevState) {
    const { highlightedLines: prevHighlightedLines } = prevState,
      { highlightedLines } = this.state
    if (
      prevHighlightedLines &&
      prevHighlightedLines.length !== highlightedLines.length
    )
      this.highlightCode()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.content && nextProps.format) {
      try {
        this.setState(() => ({
          prettyContent: Raw.prettifyContent(
            nextProps.content,
            nextProps.format,
          ),
        }))
      } catch (error) {
        if (this.props.onError) {
          this.props.onError(error)
        }
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.content !== nextProps.content ||
      this.props.format !== nextProps.format ||
      this.state.highlightedLines !== nextState.highlightedLines ||
      this.state.prettyContent !== nextState.prettyContent
    )
  }

  highlightCode() {
    const { format } = this.props,
      { prettyContent } = this.state,
      highlightedLines = Highlight.highlight(
        format,
        prettyContent,
        true,
      ).value.split('\n')
    this.setState(() => ({ highlightedLines }))
  }

  render() {
    return <div className="raw">{this.renderLines()}</div>
  }

  renderLines() {
    const { highlightedLines } = this.state
    return highlightedLines
      ? highlightedLines
          .slice(0, 10)
          .map((line, i) => (
            <span
              className="raw-line"
              key={i}
              dangerouslySetInnerHTML={{ __html: line }}
            />
          ))
      : null
  }

  static prettifyContent(content, format) {
    if (format === 'json') {
      return Raw.prettifyJSONContent(content)
    } else if (format === 'xml') {
      return Raw.prettifyXMLContent(content)
    } else {
      throw new Error('Unsupported content type.')
    }
  }

  static prettifyJSONContent(content) {
    return JSON.stringify(JSON.parse(content), null, 2)
  }

  static prettifyXMLContent(content) {
    return beautify.xml(content, 4)
  }
}

export default Raw
