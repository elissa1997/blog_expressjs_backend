FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

ARG DATABASE_URL="mysql://user:pass@127.0.0.1:3306/placeholder"
ENV DATABASE_URL=${DATABASE_URL}
RUN npx prisma generate

EXPOSE 3000

CMD ["node", "src/app.js"]
