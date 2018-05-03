# How to contribute

Thanks for your interest in contributing to Hotspot.

You can find out a bit more about Hotspot by reading the [README](README.md)
file within this repository.

Hotspot relies upon a FHIR terminology server as a backend, like Ontoserver. You
can read more about Ontoserver at the
[Ontoserver web site](https://ontoserver.csiro.au).

## Reporting issues

Issues can be used to:

* Report a defect
* Request a new feature or enhancement
* Ask a question

New issues will be automatically populated with a template that highlights the
information that needs to be submitted with an issue that describes a defect. If
the issue is not related to a defect, please just delete the template and
replace it with a detailed description of the problem you are trying to solve.

## Creating a pull request

New pull requests within the Hotspot repository are pre-populated with a
checklist that describes the Definition of Done that we assess all new changes
against. It is ok to submit a pull request that has not yet addressed all of
these items, but be aware that the change will not be merged until it meets the
Definition of Done.

Please communicate with us (preferably through creation of an issue) before
embarking on any significant work within a pull request. This will prevent
situations where people are working at cross-purposes.

### Coding conventions

Hotspot uses both [ESLint](https://eslint.org/) and
[Prettier](https://prettier.io/) to enforce coding conventions. The `.eslintrc`
and `.prettierrc` files are the respective homes of the configuration for these
tools.

A Git pre-commit hook has been set up to automatically run these tools to
prevent changes being committed with outstanding errors.

### Testing

Hotspot has a suite of tests and associated test fixtures within the `test`
folder.

Tests are run automatically within CircleCI, and also within a Git pre-commit
hook. Commits should not be pushed to the main repository with failing tests.

Changes made to the Hotspot repository should be accompanied by the appropriate
additions or updates to the test suite, to maintain or improve coverage of the
code base.

## Code of conduct

Before making a contribution, please read the
[code of conduct](CODE_OF_CONDUCT.md).
