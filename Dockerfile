FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN mkdir -p public/uploads public/uploads/profiles

EXPOSE 8000

CMD ["node", "index.js"]
