const express = require('express');

const { InfoController } = require('../../controllers');

const router = express.Router();
const BookingRoutes = require('./booking-routes');

router.get('/info', InfoController.info);
router.use('/bookings',BookingRoutes)

module.exports = router;