FROM node

WORKDIR /developer/flights_booking_service

COPY . .

RUN npm ci

CMD [ "npm","run","dev" ]