import {
  matchesPath,
  addPathSuffix,
  containsParam,
  addParam,
  removeParam,
  getParam,
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
    let routeIds = []
    for (var i in routeConfig) {
      const {
        id,
        message,
        matchPattern,
        addSuffix,
        addParams,
        removeParams,
      } = routeConfig[i]
      if (matchesPath(finalLocation.pathname, matchPattern)) {
        if (addSuffix) {
          finalLocation.pathname = addPathSuffix(
            finalLocation.pathname,
            addSuffix,
          )
          if (id && message && routeIds.indexOf(id) < 0) {
            routeIds.push(id)
          }
        }
        if (removeParams) {
          let removed = false
          for (var k in removeParams) {
            const remParam = removeParams[k]
            if (containsParam(finalLocation.search, remParam)) {
              finalLocation.search = removeParam(finalLocation.search, remParam)
              removed = true
            }
          }
          if (removed && id && message && routeIds.indexOf(id) < 0) {
            routeIds.push(id)
          }
        }
        if (addParams) {
          let added = false
          for (var j in addParams) {
            const param = j
            if (!containsParam(finalLocation.search, param)) {
              finalLocation.search = addParam(
                finalLocation.search,
                param,
                addParams[param],
              )
              added = true
            }
          }
          if (added && id && message && routeIds.indexOf(id) < 0) {
            routeIds.push(id)
          }
        }
      }
    }
    if (routeIds.length > 0) {
      finalLocation.search = addParam(finalLocation.search, '_rIds', routeIds)
    }
    return finalLocation
  }
  return location
}

export const getMessageById = (routeConfig, routeId) => {
  for (var i in routeConfig) {
    if (routeConfig[i].id && routeConfig[i].id === routeId) {
      return routeConfig[i].message
    }
  }
  return null
}

export const getRouteMessages = (location, routeConfig) => {
  if (containsParam(location.search, '_rIds')) {
    const msgIds = getParam(location.search, '_rIds').split(',')
    let messages = []
    if (msgIds) {
      for (var j in msgIds) {
        const msg = getMessageById(routeConfig, msgIds[j])
        if (msg) {
          messages.push(msg)
        }
      }
    }
    return messages
  }
  return null
}

export const resetRouteMessages = location => {
  if (containsParam(location.search, '_rIds')) {
    const updatedSearch = removeParam(location.search, '_rIds')
    const title = document.getElementsByTagName('title')
      ? document.getElementsByTagName('title')[0].innerHTML
      : 'FHIR Resource'
    window.history.replaceState({}, title, location.pathname + updatedSearch)
  }
}
