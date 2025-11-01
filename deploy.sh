#!/bin/bash
npm run build
swa deploy ./dist \
  --deployment-token $AZURE_SWA_TOKEN \
  --env production