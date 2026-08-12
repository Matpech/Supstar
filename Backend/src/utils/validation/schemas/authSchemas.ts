import Joi from "joi";

export const registrationSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    username: Joi.string().min(3).max(32).custom((val, helpers) => {
        if (val.endsWith("-d")) return helpers.error("suffix.discord")
    }).messages({ "suffix.discord": "Suffix '-d' is not allowed" }).required(),
    password: Joi.string().min(8).max(128).required()
})

export const loginSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    password: Joi.string().min(8).max(128).required()
})

export const sessionIdSchema = Joi.object({
    sessionId: Joi.string().length(64).required()
})

export const passwordUpdateSchema = Joi.object({
    oldPassword: Joi.string().min(8).max(128).required(),
    newPassword: Joi.string().min(8).max(128).required(),
    sessionId: Joi.string().length(64).required()
})