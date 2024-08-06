const axios = require("axios");
const { BookingRepository } = require("../repositories");
const db = require("../models");
const { ServerConfig, Queue } = require("../config");
const serverConfig = require("../config/server-config");
const AppError = require("../utils/error/app-error");
const { StatusCodes } = require("http-status-codes");
const bookingRepository = new BookingRepository();
const { enums } = require("../utils/common");
const { BOOKED, CANCELLED } = enums.BOOKING_STATUS;

async function createBooking(data) {
  const transaction = await db.sequelize.transaction();
  try {
    const flight = await axios.get(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`
    );
    const flightData = flight.data.data;
    if (data.noOfSeats > flightData.totalSeats) {
      throw new AppError("Not enough seats available", StatusCodes.BAD_REQUEST);
    }
    const totalBillingAmount = data.noOfSeats * flightData.price;
    const bookingPayload = { ...data, totalCost: totalBillingAmount };
    const booking = await bookingRepository.createBooking(
      bookingPayload,
      transaction
    );

    await axios.patch(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`,
      {
        seats: data.noOfSeats,
      }
    );
    await transaction.commit();
    return booking;
  } catch (error) {
    await transaction.rollback();
    console.error("Transaction rolled back due to:", error.message);
    if (!error.statusCode) {
      error.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    }
    throw error;
  }
}

async function makePayment(data) {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetails = await bookingRepository.getBooking(
      data.bookingId,
      transaction
    );
    if (bookingDetails.status == CANCELLED) {
      throw new AppError("The booking has expired", StatusCodes.BAD_REQUEST);
    }
    console.log(bookingDetails);
    const bookingTime = new Date(bookingDetails.createdAt);
    const currentTime = new Date();
    if (currentTime - bookingTime > 300000) {
      // await bookingRepository.update(data.bookingId, {status: CANCELLED}, transaction);
      await cancelBooking(data.bookingId);
      throw new AppError("The booking has expired", StatusCodes.BAD_REQUEST);
    }
    if (bookingDetails.totalCost != data.totalCost) {
      throw new AppError(
        "The amount of the payment doesnt match",
        StatusCodes.BAD_REQUEST
      );
    }
    if (bookingDetails.userId != data.userId) {
      throw new AppError(
        "The user corresponding to the booking doesnt match",
        StatusCodes.BAD_REQUEST
      );
    }
    // we assume here that payment is successful
    await bookingRepository.update(
      data.bookingId,
      { status: BOOKED },
      transaction
    );
    
    Queue.sendData({
      recipientEmail:"abdealidahodwala163@gmail.com",
      subject:"Flight Booked",
      text:`Booking Successfully done for Id ${data.bookingId}`,
    })
    
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function cancelBooking(bookingId) {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetails = await bookingRepository.get(bookingId, transaction);
    console.log(bookingDetails);
    if (bookingDetails.status == CANCELLED) {
      await transaction.commit();
      return true;
    }
    await axios.patch(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`,
      {
        seats: bookingDetails.noOfSeats,
        dec: 0,
      }
    );
    await bookingRepository.update(
      bookingId,
      { status: CANCELLED },
      transaction
    );
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function cancelOldBookings() {
  try {
    console.log("Inside service");
    const time = new Date(Date.now() - 1000 * 300); // time 5 mins ago
    const response = await bookingRepository.cancelOldBookings(time);

    return response;
  } catch (error) {
    console.log(error);
  }
}
module.exports = { createBooking, cancelOldBookings, makePayment };
