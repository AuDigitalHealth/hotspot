#!/bin/bash
set -e

# Available configuration variables.
declare -A vars=( \
  [fhirServer]=HOTSPOT_FHIR_SERVER \
  [fhirVersion]=HOTSPOT_FHIR_VERSION \
  [narrativeStyles]=HOTSPOT_NARRATIVE_STYLES \
  [pathRoutes]=HOTSPOT_PATH_ROUTES \
  [pathPrefix]=HOTSPOT_PATH_PREFIX \
  [version]=HOTSPOT_VERSION \
)

# Work out which of the available variables have been set.
declare -A varsSet
for var in "${!vars[@]}"; do
  value=${vars[$var]}
  if [[ -v $value ]]; then
    varsSet[$var]=${!value}
  fi
done

keys=(${!varsSet[@]})
lastIndex=$(( ${#varsSet[@]} - 1 ))

# Iterate over the set variables and echo out the corresponding JSON.
echo "{"
for (( i=0 ; i < "${#varsSet[@]}" ; i++ )); do
  key=(${keys[$i]})
  value=(${varsSet[$key]})
  # All config variables are quoted except `pathRoutes`.
  if [[ "$key" == "pathRoutes" ]]; then
    kvPair="  \"$key\": $value"
  else
    kvPair="  \"$key\": \"$value\""
  fi
  # If this is the last variable, don't print out a comma at the end of the
  # line.
  if [[ ! $i -eq $lastIndex ]]; then kvPair+=","; fi
  echo "$kvPair"
done
echo "}"
