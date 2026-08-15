import type { Request } from "express"
import type { Schema } from "joi"
import { ValidationException } from "../../types/errors"

/**
 * Validate a request's body against a Joi schema
 * 
 * @param req The Express Request object
 * @param schema The Joi schema to use for validation
 * @returns The validated data
 * @throws ValidationException
 */
export default function validate(
    req: Request,
    schema: Schema
) {
    const body = req.body
    const result = schema.validate(body)

    if (result.error) {
        throw new ValidationException(result.error.message)
    }

    if (!result.value) {
        throw new ValidationException("No data")
    }

    return result.value
}