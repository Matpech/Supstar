import Joi from "joi";

export const registrationSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    username: Joi.string().min(3).max(32).required(),
    password: Joi.string().min(8).max(128).required()
})

export const loginSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    password: Joi.string().min(8).max(128).required()
})

export const tokenRefreshSchema = Joi.object({
    sessionId: Joi.string().length(64).required()
})