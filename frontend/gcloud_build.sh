BASE_GAR_DIRECTORY=us-west1-docker.pkg.dev/lifeinthedeep
IMAGE=${BASE_GAR_DIRECTORY}/ecoviz-explorer/ecoviz-explorer-frontend-staging
SERVICE=ecoviz-explorer-frontend-staging

echo """
steps:
- name: "gcr.io/cloud-builders/docker"
  id: 'build-image'
  args: [
        "build",
        "-t",
        "$IMAGE",
        "--build-arg",
        "VITE_APP_BACKEND_URL=https://ecoviz-explorer-backend-staging-hgjqrwwvnq-uw.a.run.app",
        "--build-arg",
        "VITE_APP_PROJECT_DATABASE_ID=44b3bd31c0394a1f91b600175f1a1021",
        "--build-arg",
        "VITE_APP_USE_CASE_DATABASE_ID=274ba349a9b84845bcab0497673fc5ab",
        "."
      ]
- name: 'gcr.io/cloud-builders/docker'
  id: 'push-image'
  args: ['push', '$IMAGE']
  waitFor: ['build-image']
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
  waitFor: ['push-image']
""" > /tmp/cloudbuild.yaml

gcloud builds submit --config /tmp/cloudbuild.yaml --project lifeinthedeep
