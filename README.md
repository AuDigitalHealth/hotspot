## Hotspot

A human-friendly HTML landing page for users resolving URLs within their browser
that point to resources on a FHIR server.

This is a pure client-side app that is configured to point to a FHIR endpoint.

#### Features

* Rendering of raw JSON and XML resources, including pretty-printing and syntax
  highlighting.
* Rendering of narratives within resources, including proper whitelisting of
  HTML content as per the FHIR spec.
* Support for basic CSS classes for narratives defined in the FHIR spec:
  http://hl7.org/fhir/STU3/narrative.html#css
* Support for smart translation of link hrefs within narratives, to ensure
  appropriate behaviour when following absolute and relative links.
* Support for a custom stylesheet that can be used to override styles within
  narratives.
* Rendering of ValueSet expansions, including the implicit ValueSet within each
  CodeSystem.
* Rendering of Bundle resources as an expandable list, with links off to full
  resources and expansions where available.
* Proper handling of OperationOutcome resources, including rendering of error
  information contained within OperationOutcome response bodies.

It can be configured with a custom stylesheet to be applied to narratives within
FHIR resources.

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

* `HOTSPOT_FHIR_SERVER`: The FHIR endpoint used for retrieving requested FHIR
  resources. The path component of the URL is appended to this value upon each
  request, e.g. if your `HOTSPOT_FHIR_SERVER` was
  http://ontoserver.csiro.au/stu3-latest, then a request with the path
  `/CodeSystem/some-code-system` would retrieve the resource from
  http://ontoserver.csiro.au/stu3-latest/CodeSystem/some-code-system. Defaults
  to `https://ontoserver.csiro.au/stu3-latest`.
* `HOTSPOT_PROXY_TARGET`: The FHIR endpoint used for proxying requests from the
  Docker container to the FHIR server. This may be different to
  `HOTSPOT_FHIR_SERVER` if the FHIR server is referred to by a different
  hostname when viewed from your Hotspot Docker container.
* `HOTSPOT_FHIR_VERSION`: The version of FHIR (x.y.z) assumed to be in use by
  the FHIR server. Defaults to `3.0.1`.
* `HOTSPOT_PATH_PREFIX`: A prefix to append to all routes within the Hotspot
  application (eg. `/someprefix/fhir/CodeSystem`). Defaults to `''`. Note that
  this does not affect requests from Hotspot to the FHIR server, these requests
  are controlled solely by the `HOTSPOT_FHIR_SERVER` variable.
* `HOTSPOT_NARRATIVE_STYLES`: A URL to a custom stylesheet to override styles
  within narrative content.
* `HOTSPOT_PATH_ROUTES`: Provides a means of specifying custom path routing
  rules (see [Path Routing](#path-routing)).

##### Example Docker Compose file

```yaml
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
      HOTSPOT_PATH_ROUTES: "[{ 'matchPattern': '.*', 'removeParams': [ '_format' ] }]"
```

##### Example Docker Compose file, incorporating FHIR server (Ontoserver)

This expands upon the
[official Ontoserver Docker Compose example](http://ontoserver.csiro.au/docs).

```yaml
version: '2'
volumes:
  onto:
    driver: local
  pgdata:
    driver: local
services:
  db:
    image: postgres
    volumes:
      - pgdata:/var/lib/postgresql/data
  ontoserver:
    image: aehrc/ontoserver:ctsa-5.1
    container_name: ontoserver
    depends_on:
      - db
    expose:
      - "8080"
    environment:
      - authentication.oauth.endpoint.client_id.0=NCTS_ACCESS_CODE
      - authentication.oauth.endpoint.client_secret.0=NCTS_CLIENT_SECRET
      - JAVA_OPTS=-Xmx4G        # Minimum
#      - JAVA_OPTS=-Xmx8G      # Preferred
    volumes:
      - onto:/var/onto
  hotspot:
    image: hotspot
    ports:
      - '8080:80'
    depends_on:
      - ontoserver
    environment:
      - HOTSPOT_FHIR_SERVER=http://somedomain.com/fhir
      - HOTSPOT_PROXY_TARGET=http://ontoserver:8080/fhir
      - HOTSPOT_PATH_PREFIX=/fhir
      - HOTSPOT_NARRATIVE_STYLES=/agency-narrative.css
```

##### Path Routing

Path routing rules can be used to disallow requests that would otherwise render
Hotspot to be non-performant.

For example, when receiving a request at `<FHIR_ENDPOINT>/CodeSystem` you may
want to redirect the client to a URL that limits the amount of data that would
otherwise be returned (-->
`<FHIR_ENDPOINT>/CodeSystem?_elements=id,name,status`).

Another common example would be to strip the `_format` parameter (eg.
`<FHIR_ENDPOINT>/metadata?_format=xml` --> `<FHIR_ENDPOINT>/metadata`). When
provided with a location, with a pathname that matches a rule in the pathRoute
config, the corresponding rule is applied to the redirect URL.

**NOTE:** `matchPattern` supports regular expressions.

**Actions that can be applied to a match include:**

* **addSuffix**: Append a suffix to the provided pathname (NOTE: it will add a
  slash between the existing path and suffix).
* **removeParams**: If the provided query string contains a parameter listed in
  'removeParams', it will be removed from the redirect query string.
* **addParams**: If the provided query string does not contain the params
  defined in "addParams", they will be added to the redirect query string.

A message can also be associated with each rule, which will be displayed on the
page when the rule has been applied. An example of this is a message which
informs the user that some of the information has been trimmed from the
response.

**To log re-route message:**

* **id**: An key to uniquely identify each routing rule.
* **message**: An informational message to be reported, after the client is
  re-routed.

##### Default configuration

```
{
  "fhirServer": "https://api.healthterminologies.gov.au/integration/v2/fhir",
  "fhirVersion": "3.0.1",
  "narrativeStyles": "/hotspot/agency-narrative.css",
  "pathPrefix": "/integration/v2/fhir",
  "pathRoutes": [
    {
      "id": "00",
      "message":
        "The '_format' parameter has been removed from the provided URL. It is not supported via the browser representation of this terminology server.",
      "matchPattern": ".*",
      "removeParams": ["_format"]
    },
    {
      "id": "01",
      "matchPattern": "/integration/v2/fhir[/]*$",
      "addSuffix": "metadata"
    },
    {
      "id": "02",
      "message":
        "Please be aware that you are viewing a subset of this bundle. The 'concept' attribute has been deliberately excluded from this view. The full content of each resource can be viewed, via the 'Full Resource' button.",
      "matchPattern": "/CodeSystem[/]*$",
      "addParams": {
        "_elements": [
          "resourceType",
          "id",
          "meta",
          "implicitRules",
          "language",
          "text",
          "contained",
          "extension",
          "modifierExtension",
          "url",
          "identifier",
          "version",
          "name",
          "title",
          "status",
          "experimental",
          "date",
          "publisher",
          "contact",
          "description",
          "useContext",
          "jurisdiction",
          "purpose",
          "copyright",
          "caseSensitive",
          "valueSet",
          "hierarchyMeaning",
          "compositional",
          "versionNeeded",
          "content",
          "count",
          "filter",
          "property"
        ],
        "_count": 100
      }
    },
    {
      "id": "03",
      "message":
        "Please be aware that you are viewing a subset of this bundle. The 'compose' attribute has been deliberately excluded from this view. The full content of each resource can be viewed, via the 'Full Resource' button.",
      "matchPattern": "/ValueSet[/]*$",
      "addParams": {
        "_elements": [
          "resourceType",
          "id",
          "meta",
          "implicitRules",
          "language",
          "text",
          "contained",
          "extension",
          "modifierExtension",
          "url",
          "identifier",
          "version",
          "name",
          "title",
          "status",
          "experimental",
          "date",
          "publisher",
          "contact",
          "description",
          "useContext",
          "jurisdiction",
          "immutable",
          "purpose",
          "copyright",
          "extensible",
          "expansion"
        ],
        "_count": 100
      }
    },
    {
      "id": "04",
      "message":
        "Please be aware that you are viewing a subset of this bundle. The 'group' attribute has been deliberately excluded from this view. The full content of each resource can be viewed, via the 'Full Resource' button.",
      "matchPattern": "/ConceptMap[/]*$",
      "addParams": {
        "_elements": [
          "resourceType",
          "id",
          "meta",
          "implicitRules",
          "language",
          "text",
          "contained",
          "extension",
          "modifierExtension",
          "url",
          "identifier",
          "version",
          "name",
          "title",
          "status",
          "experimental",
          "date",
          "publisher",
          "contact",
          "description",
          "useContext",
          "jurisdiction",
          "purpose",
          "copyright",
          "source",
          "target"
        ],
        "_count": 100
      }
    }
  ]
}
```

#### Roadmap

* Pagination of ValueSet expansions and Bundle entries.
* Rendering of Parameters resources.
* Support for Image References (http://hl7.org/fhir/STU3/narrative.html#id).
