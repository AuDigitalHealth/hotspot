#!/bin/bash

STAGED=$(git diff --name-only --cached --diff-filter=AM | egrep '^(.*).(js|json|css)$')

yarn prettier --write $STAGED
git add $STAGED
