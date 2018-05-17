#!/bin/bash
set -e

docker login -u $DOCKER_USER -p $DOCKER_PASSWORD
docker push $DOCKER_IMAGE
docker logout
