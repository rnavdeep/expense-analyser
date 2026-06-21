# Step 1: Build the frontend
FROM node:18 AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Serve the frontend
FROM nginx:alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Provide as a template so the nginx entrypoint runs envsubst and resolves
# ${BACKEND_API_URL} at container start (output lands in conf.d/default.conf,
# which the stock nginx.conf already includes).
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
