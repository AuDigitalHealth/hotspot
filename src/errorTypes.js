export class OpOutcomeError extends Error {
  constructor(issue) {
    const message =
      issue.details && issue.details.display
        ? issue.details.display
        : issue.diagnostics
    super(message)
    Error.captureStackTrace(this, OpOutcomeError)
    this.issue = issue
  }
}
