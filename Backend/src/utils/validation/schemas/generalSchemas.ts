import Joi from "joi";

export const numericIdSchema = Joi.number().positive().not(0)