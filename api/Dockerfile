FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY api/package*.json ./
RUN npm install --omit=dev
COPY api/src ./src
COPY api/migrations ./migrations
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=4s --start-period=8s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:3000/health || exit 1
CMD ["npm", "start"]
