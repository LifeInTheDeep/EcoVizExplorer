ENV=${1:?"Must set environment as first arg"}
echo $ENV
BASE_GAR_DIRECTORY=us-west1-docker.pkg.dev/lifeinthedeep
IMAGE=${BASE_GAR_DIRECTORY}/ecoviz-explorer/ecoviz-explorer-backend-${ENV}
SERVICE=ecoviz-explorer-backend-${ENV}

source ../.remote.env

echo """
steps:
- name: 'gcr.io/cloud-builders/docker'
  args: ['build', '-t', '$IMAGE', '.']
  dir: '.'
- name: 'gcr.io/cloud-builders/docker'
  args: ['push', '$IMAGE']
- name: 'gcr.io/cloud-builders/gcloud'
  args: ['run', 'deploy', 
    '$SERVICE', 
    '--image', '$IMAGE', 
    '--allow-unauthenticated', 
    '--region', 'us-west1', 
    '--set-env-vars', 'NOTION_API_KEY=${NOTION_API_KEY}',
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
