import {
  matchesPath,
  addPathSuffix,
  containsParam,
  addParam,
  removeParam,
} from './fhir/common.js'

// When provided with a location, with a pathname that matches a rule in the pathRoute config, the
// corresponding rule is applied to the location object that is subsequently returned. The intent
// is that the client is rerouted with the returned location.
// Actions that can be applied to a match include:
//  - addSuffix: Append a suffix to the provided pathname (NOTE: it will add a slash between the existing path and suffix)
//  - removeParams: If the provided location.search contains a parameter listed in 'removeParams', it will be removed from the returned location.search
//  - addParams: If the provided location.search does not contain the params defined in "addParams", they will be added to the returned location.search
export const processPathRoutes = (location, routeConfig) => {
  if (routeConfig) {
    let finalLocation = {
      pathname: location.pathname,
      search: location.search,
    }
    for (var i in routeConfig) {
      const { matchPattern, addSuffix, addParams, removeParams } = routeConfig[
        i
      ]
      if (matchesPath(finalLocation.pathname, matchPattern)) {
        if (addSuffix) {
          finalLocation.pathname = addPathSuffix(
            finalLocation.pathname,
            addSuffix,
          )
        }
        if (removeParams) {
          for (var k in removeParams) {
            const remParam = removeParams[k]
            if (containsParam(finalLocation.search, remParam)) {
              finalLocation.search = removeParam(finalLocation.search, remParam)
            }
          }
        }
        if (addParams) {
          for (var j in addParams) {
            const param = j
            if (!containsParam(finalLocation.search, param, addParams[param])) {
              finalLocation.search = addParam(
                finalLocation.search,
                param,
                addParams[param],
              )
            }
          }
        }
      }
    }
    return finalLocation
  }
  return location
}
