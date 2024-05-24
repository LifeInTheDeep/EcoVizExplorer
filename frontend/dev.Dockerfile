FROM node:20 as build-stage
WORKDIR /app
COPY ./package.json /app/package.json
RUN yarn
COPY ./ /app/
EXPOSE 3000

ARG VITE_APP_BACKEND_URL
ENV VITE_APP_BACKEND_URL=$VITE_APP_BACKEND_URL

ARG VITE_APP_DATABASE_ID
ENV VITE_APP_DATABASE_ID=$VITE_APP_DATABASE_ID

ENTRYPOINT [ "yarn", "run", "dev", "--host" ]