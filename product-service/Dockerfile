FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm ci --only=production
COPY src ./src
EXPOSE 5000
USER node
CMD ["node", "src/index.js"]
