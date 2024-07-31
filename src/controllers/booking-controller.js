const { StatusCodes } = require("http-status-codes");
const { BookingService } = require("../services");
const { successResponse, errorResponse } = require("../utils/common");
const AppError = require("../utils/error/app-error");

async function createBooking(req,res){
    try {
        console.log(req.body);
      const response = await BookingService.createBooking({
        flightId:req.body.flightId,
        userId:req.body.userId,
        noOfSeats:req.body.noOfSeats,
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
module.exports = {createBooking}