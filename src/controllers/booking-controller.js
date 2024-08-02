const { StatusCodes } = require("http-status-codes");
const { BookingService } = require("../services");
const { successResponse, errorResponse } = require("../utils/common");
const AppError = require("../utils/error/app-error");

const inMemDb = {};

async function createBooking(req, res) {
  try {
    console.log(req.body);
    const response = await BookingService.createBooking({
      flightId: req.body.flightId,
      userId: req.body.userId,
      noOfSeats: req.body.noOfSeats,
    });
    successResponse.data = response;
    return res.status(StatusCodes.CREATED).json(successResponse);
    // return res.send('success')
  } catch (error) {
    errorResponse.message = error.message;
    return res.status(error.statusCode).json(errorResponse);
    // return res.send('error')
  }
}

async function makePayment(req, res) {
  try {
    const idempotencyKey = req.headers["x-idempotency-key"];
    if (!idempotencyKey) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "idempotency key missing" });
    }
    if (inMemDb[idempotencyKey]) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Cannot retry on a successful payment" });
    }

    const response = await BookingService.makePayment({
      totalCost: req.body.totalCost,
      userId: req.body.userId,
      bookingId: req.body.bookingId,
    });
    inMemDb[idempotencyKey] = idempotencyKey;
    
    successResponse.data = response;
    return res.status(StatusCodes.OK).json(successResponse);
  } catch (error) {
    console.log("controller error", error);

    errorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}

module.exports = { createBooking, makePayment };
