import React, { Component } from 'react'

// Renders the XHTML narrative content from a FHIR resource, optionally
// applying a custom stylesheet.
class Narrative extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  async getStyles() {
    try {
      const response = await fetch(this.props.stylesPath)
      if (!response.ok) { this.handleUnsuccessfulResponse(response) }
      const contentType = response.headers.get('Content-Type')
      // Check that the Content-Type of the stylesheet response is `text/css`.
      if (!contentType.match(/text\/css/)) {
        throw Error(`Narrative stylesheet had unexpected format: "${contentType}"`)
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

  componentDidMount() {
    if (this.props.stylesPath) { this.getStyles() }
  }

  render() {
    const { content } = this.props
    const { styles } = this.state

    // Narrative styles are added to a "scoped" style tag inside the narrative
    // div. This means that these styles are only applied to content within
    // this element.
    const styleTag = styles
      ? <style scoped>{styles}</style>
      : null

    const narrative = content
      ? <div dangerouslySetInnerHTML={{ __html: content }} />
      : <p>This FHIR resource does not have narrative content.</p>

    return <div className='narrative'>
        {styleTag}
        {narrative}
      </div>
  }
}

export default Narrative
