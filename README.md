## Hotspot

A human-friendly HTML landing page for users resolving URLs within their browser that point to resources on a FHIR server.

This is a pure client-side app that is configured to point to a FHIR endpoint.

#### Features

* Rendering of raw JSON and XML resources, including pretty-printing and syntax highlighting.
* Rendering of narratives within resources, including proper whitelisting of HTML content as per the FHIR spec.
* Support for smart translation of link hrefs within narratives, to ensure appropriate behaviour when following absolute and relative links.
* Support for a custom stylesheet that can be used to override styles within narratives.
* Rendering of ValueSet expansions, including the implicit ValueSet within each CodeSystem.
* Rendering of Bundle resources as an expandable list, with links off to full resources and expansions where available.
* Proper handling of OperationOutcome resources, including rendering of error information contained within OperationOutcome response bodies.

It can be configured with a custom stylesheet to be applied to narratives within FHIR resources.

Install local development dependencies:

* Node.js (https://nodejs.org/)
* Yarn (https://yarnpkg.com/en/docs/install)

Run it up locally:

```
yarn
yarn start
```

Edit `public/config.json` to customise.

Build for production:

```
yarn build
```

#### Configuration

`fhirServer`: The FHIR endpoint used for retrieving requested FHIR resources.
The path component of the URL is appended to this value upon each request, e.g.
if your `fhirServer` was http://ontoserver.csiro.au/stu3-latest, then a request
with the path `/CodeSystem/some-code-system` would retrieve the resource from
http://ontoserver.csiro.au/stu3-latest/CodeSystem/some-code-system.

`narrativeStyles`: A URL to a custom stylesheet to override styles within
narrative content.

#### Roadmap

* Pagination of ValueSet expansions and Bundle entries.
* Rendering of Parameters resources.
