const { StatusCodes } = require("http-status-codes");
const logger  = require("../config/logger-config");
const AppError = require("../utils/error/app-error");


class crudRepository{
    constructor(model){
        this.model = model;
    }

    async create(data){
        try {
            const res = await this.model.create(data);
            return res;
        } catch (error) {
            logger.error("Error in create");
            throw error;
        }
    }
    async destroy(data){
        try {
            const res = await this.model.destroy({
                where:{
                    id:data,
                }
            });
            if(!res){
                throw new AppError("Data not found",StatusCodes.NOT_FOUND);
            }
            return res;
        } catch (error) {
            logger.error("Error in Destroy");
            throw error;
        }
    }
    async getAll(){
        try {
            const res = await this.model.findAll();
            return res;
        } catch (error) {
            logger.error("Error in Get");
            throw error;
        }
    }

    async get(data){
        try {
            const res = await this.model.findByPk(data);
            if(!res){
                throw new AppError("Data not found",StatusCodes.NOT_FOUND);
            }
            return res;
        } catch (error) {
            logger.error("Error in Get");
            throw error;
        }
    }


    async update(id,data){
        try {
            const res = await this.model.update(data,{
                where:{
                    id:id,
                }
            });
            if(!res){
                throw new AppError("Data not found",StatusCodes.NOT_FOUND);
            }
            return res;
        } catch (error) {
            logger.error("Error in Update");
            throw error;
        }
    }
}

module.exports = crudRepository