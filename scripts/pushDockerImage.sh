#!/bin/bash
set -e
if [[ -v DOCKER_USER && -v DOCKER_PASSWORD ]]; then
  docker login -u $DOCKER_USER -p $DOCKER_PASSWORD
fi
docker push $DOCKER_IMAGE
if [[ -v DOCKER_USER && -v DOCKER_PASSWORD ]]; then
  docker logout
fi
