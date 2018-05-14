#!/bin/bash
set -e

# Build a configuration file from environment variables.
/buildConfig.sh >/var/www/html/config.json

/usr/local/bin/node /proxy.js
