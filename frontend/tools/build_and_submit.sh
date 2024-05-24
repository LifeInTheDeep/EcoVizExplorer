ENV=${1:?"Must set environment as first arg"}
echo $ENV
BASE_GAR_DIRECTORY=us-west1-docker.pkg.dev/lifeinthedeep
IMAGE=${BASE_GAR_DIRECTORY}/ecoviz-explorer/ecoviz-explorer-frontend-${ENV}
SERVICE=ecoviz-explorer-frontend-${ENV}

source ../.remote.env

echo """
steps:
- name: 'gcr.io/cloud-builders/docker'
  args: ['build', '-t', '$IMAGE', 
    "--build-arg",
    "VITE_APP_BACKEND_URL=${VITE_APP_BACKEND_URL}",
    "--build-arg",
    "VITE_APP_DATABASE_ID=${VITE_APP_DATABASE_ID}",
    '.']
  dir: '.'
- name: 'gcr.io/cloud-builders/docker'
  args: ['push', '$IMAGE']
- name: 'gcr.io/cloud-builders/gcloud'
  args: ['run', 'deploy', 
    '$SERVICE', 
    '--image', '$IMAGE', 
    '--allow-unauthenticated', 
    '--region', 'us-west1', 
    '--cpu', '4',
    '--memory', '16G',
    '--timeout', '3600'
    ]
""" > /tmp/cloudbuild.yaml

gcloud builds submit \
    --config /tmp/cloudbuild.yaml \
    --project lifeinthedeep

# Test
# TODO, implement a proper test that fails
