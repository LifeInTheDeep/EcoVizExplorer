FROM node:20 as build-stage
WORKDIR app
COPY ./ /app/
RUN yarn

ARG VITE_APP_DATABASE_ID
ENV VITE_APP_DATABASE_ID=$VITE_APP_DATABASE_ID

ARG VITE_APP_BACKEND_URL
ENV VITE_APP_BACKEND_URL=$VITE_APP_BACKEND_URL

RUN yarn build

FROM nginx
# Copy the NPM build
COPY --from=build-stage /app/dist/ /usr/share/nginx/www

# Copy the nginx configuration file. This sets up the behavior of nginx, most
# importantly, it ensure nginx listens on port 8080. Google App Engine expects
# the runtime to respond to HTTP requests at port 8080.
COPY nginx.conf /etc/nginx/nginx.conf

# Create a simple file to handle heath checks. Health checking can be disabled
# in app.yaml, but is highly recommended. Google App Engine will send an HTTP
# request to /_ah/health and any 2xx or 404 response is considered healthy.
# Because 404 responses are considered healthy, this could actually be left
# out as nginx will return 404 if the file isn't found. However, it is better
# to be explicit.
RUN mkdir -p /usr/share/nginx/www/_ah && \
    echo "healthy" > /usr/share/nginx/www/_ah/health

# Finally, all static assets.
RUN chmod -R a+r /usr/share/nginx/www