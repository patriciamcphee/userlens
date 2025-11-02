#!/bin/bash
yarn build
swa deploy \
  --app-location . \
  --output-location dist \
  --api-location api \
  --deployment-token $AZURE_SWA_TOKEN \
  --env production