import Joi from "joi";

export const reviewCreateSchema = Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().max(300)
})

export const reviewUpdateSchema = Joi.object({
    rating: Joi.number().min(1).max(5),
    comment: Joi.string().max(300)
})