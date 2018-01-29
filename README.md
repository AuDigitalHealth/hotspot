## Hotspot

A human-friendly HTML landing page for users resolving URLs within their browser that point to resources on a FHIR server.

This is a pure client-side app that is configured to point to a FHIR endpoint.

#### Features

* Rendering of raw JSON and XML resources, including pretty-printing and syntax highlighting.
* Rendering of narratives within resources, including proper whitelisting of HTML content as per the FHIR spec.
* Support for basic CSS classes for narratives defined in the FHIR spec: http://hl7.org/fhir/STU3/narrative.html#css
* Support for smart translation of link hrefs within narratives, to ensure appropriate behaviour when following absolute and relative links.
* Support for a custom stylesheet that can be used to override styles within narratives.
* Rendering of ValueSet expansions, including the implicit ValueSet within each CodeSystem.
* Rendering of Bundle resources as an expandable list, with links off to full resources and expansions where available.
* Proper handling of OperationOutcome resources, including rendering of error information contained within OperationOutcome response bodies.

It can be configured with a custom stylesheet to be applied to narratives within FHIR resources.

#### Common tasks

##### Install local development dependencies

* Node.js (https://nodejs.org/)
* Yarn (https://yarnpkg.com/en/docs/install)

##### Run it up locally

```
yarn
yarn start
```

Edit `public/config.json` to customise.

##### Build for production

```
yarn build
```

##### Build the Docker image

Requires the `DOCKER_IMAGE` environment variable to be set.

```
yarn dockerize
```

#### Configuration

The Docker image can be configured using the following environment variables:

* `HOTSPOT_FHIR_SERVER`: The FHIR endpoint used for retrieving requested FHIR resources.
  The path component of the URL is appended to this value upon each request, e.g.
  if your `HOTSPOT_FHIR_SERVER` was http://ontoserver.csiro.au/stu3-latest, then a request
  with the path `/CodeSystem/some-code-system` would retrieve the resource from
  http://ontoserver.csiro.au/stu3-latest/CodeSystem/some-code-system.
* `HOTSPOT_FHIR_VERSION`: The version of FHIR (x.y.z) assumed to be in use by the FHIR server.
* `HOTSPOT_NARRATIVE_STYLES`: A URL to a custom stylesheet to override styles within
  narrative content.

##### Example Docker Compose file

```
version: "3"

services:
  polecat:
    image: hotspot
    ports:
      - "80:80"
    environment:
      HOTSPOT_FHIR_SERVER: https://ontoserver.csiro.au/stu3-latest
      HOTSPOT_FHIR_VERSION: 3.0.1
      HOTSPOT_NARRATIVE_STYLES: /agency-narrative.css
```

#### Roadmap

* Pagination of ValueSet expansions and Bundle entries.
* Rendering of Parameters resources.
* Support for Image References (http://hl7.org/fhir/STU3/narrative.html#id).
