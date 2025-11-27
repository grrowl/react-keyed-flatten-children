#!/bin/bash

# Array of React versions to test
REACT_VERSIONS=(18 19)

# First do an npm ci to get base dependencies
npm ci

# Loop through React versions
for version in "${REACT_VERSIONS[@]}"; do
    echo "Testing React version ^$version"
    npm install --no-save react@^$version react-dom@^$version react-is@^$version
    npm test
done
