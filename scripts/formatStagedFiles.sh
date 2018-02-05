#!/bin/bash

STAGED=$(git diff --name-only --cached | egrep '^(.*).(js|json|css)$')

yarn prettier --write $STAGED
git add $STAGED
