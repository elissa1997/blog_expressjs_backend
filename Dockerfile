FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

RUN DATABASE_URL="mysql://user:pass@127.0.0.1:3306/placeholder" npx prisma generate

EXPOSE 3000

CMD ["node", "src/app.js"]
