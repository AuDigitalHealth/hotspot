#!/bin/bash

docker build -t $DOCKER_IMAGE --build-arg version=$(git rev-parse HEAD) .
