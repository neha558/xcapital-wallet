FROM node:latest
WORKDIR /app
COPY . .
RUN apt update
RUN npm install
RUN npm run migrate
EXPOSE 3000
CMD ["npm", "start", "prod"]
