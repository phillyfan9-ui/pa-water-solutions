# PA Water Solutions: production image. No npm dependencies today; the install step keeps working if some are added.
FROM node:20-slim
ENV NODE_ENV=production PORT=8080 DATA_DIR=/data
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force
COPY . .
# Writable data lives on the Fly volume mounted at /data (seeded on first boot by paths.js).
# Fly mounts volumes owned by root, so start as root, hand /data to the unprivileged `node` user, then drop privileges.
RUN mkdir -p /data
EXPOSE 8080
CMD ["sh", "-c", "chown -R node:node /data && exec setpriv --reuid=node --regid=node --init-groups node server.js"]
