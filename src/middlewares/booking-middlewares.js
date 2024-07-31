const { StatusCodes } = require("http-status-codes");
const { errorResponse } = require("../utils/common");
const AppError = require("../utils/error/app-error");

const validateFlightId = (req, res, next) => {
  if (!req.body.flightId) {
    errorResponse.message = "Something broke while Creating Booking";
    errorResponse.error = new AppError(
      "flightId is required",
      StatusCodes.BAD_REQUEST
    );
    return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
  }
  if (!req.body.userId) {
    errorResponse.message = "Something broke while Creating Booking";
    errorResponse.error = new AppError(
      "userId is required",
      StatusCodes.BAD_REQUEST
    );
    return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
  }
  if (!req.body.noOfSeats) {
    errorResponse.message = "Something broke while Creating Booking";
    errorResponse.error = new AppError(
      "noOfSeats is required",
      StatusCodes.BAD_REQUEST
    );
    return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
  }
  next();
};

module.exports = {validateFlightId}
