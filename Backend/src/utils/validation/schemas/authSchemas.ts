import Joi from "joi";

export const registrationSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    username: Joi.string().min(3).max(32).required(),
    password: Joi.string().min(8).max(128).required()
})