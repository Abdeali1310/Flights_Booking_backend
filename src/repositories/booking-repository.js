const { StatusCodes } = require("http-status-codes");
const {Bookings} = require('../models');
const CrudRepository = require('./crud-repository');
const AppError = require("../utils/error/app-error");

class BookingRepository extends CrudRepository{
    constructor(){
        super(Bookings);
    }

    async createBooking(data, transaction) {
        const response = await Bookings.create(data, {transaction: transaction});
        return response;
    }

    async getBooking(data, transaction) {
        const response = await this.model.findByPk(data, {transaction: transaction});
        if(!response) {
            throw new AppError('Not able to find the resource', StatusCodes.NOT_FOUND);
        }
        return response;
    }

    async update(id, data, transaction) { // data -> {col: value, ....}
        const response = await this.model.update(data, {
            where: {
                id: id
            }
        }, {transaction: transaction});
        return response;
    }
}

module.exports = BookingRepository;