const { StatusCodes } = require("http-status-codes");
const { Bookings } = require("../models");
const CrudRepository = require("./crud-repository");
const AppError = require("../utils/error/app-error");
const { Op } = require("sequelize");
const { enums } = require("../utils/common");
const { CANCELLED, BOOKED } = enums.BOOKING_STATUS;
class BookingRepository extends CrudRepository {
  constructor() {
    super(Bookings);
  }

  async createBooking(data, transaction) {
    const response = await Bookings.create(data, { transaction: transaction });
    return response;
  }

  async getBooking(data, transaction) {
    const response = await Bookings.findByPk(data, {
      transaction: transaction,
    });
    if (!response) {
      throw new AppError(
        "Not able to find the resource",
        StatusCodes.NOT_FOUND
      );
    }
    return response;
  }

  async update(id, data, transaction) {
    // data -> {col: value, ....}
    const response = await Bookings.update(
      data,
      {
        where: {
          id: id,
        },
      },
      { transaction: transaction }
    );
    return response;
  }

  async cancelOldBookings(timestamp) {
    console.log("in repo");
    const response = await Bookings.update(
      { status: CANCELLED },
      {
        where: {
          [Op.and]: [
            {
              createdAt: {
                [Op.lt]: timestamp,
              },
            },
            {
              status: {
                [Op.ne]: BOOKED,
              },
            },
            {
              status: {
                [Op.ne]: CANCELLED,
              },
            },
          ],
        },
      }
    );
    return response;
  }
}

module.exports = BookingRepository;
