## Hotspot

A human-friendly HTML landing page for users resolving URLs within their browser that point to resources on a FHIR server.

This is a pure client-side app that is configured to point to a FHIR endpoint.

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
