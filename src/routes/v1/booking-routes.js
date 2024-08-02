const { BookingController } = require("../../controllers");
const express = require('express');
const { BookingMiddleware } = require("../../middlewares");
const router = express.Router();



//for creating route
router.post('/',BookingMiddleware.validateFlightId,BookingController.createBooking)

//for payments
router.post(
    '/payments',
    BookingController.makePayment
);

module.exports = router;