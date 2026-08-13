import Joi from "joi";

export const sharedListCreateSchema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    description: Joi.string().max(2000)
})

export const sharedListUpdateSchema = Joi.object({
    name: Joi.string().min(3).max(255),
    description: Joi.string().max(2000)
})