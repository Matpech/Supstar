import type { Request, Response } from "express"
import type { Schema } from "joi"
import { ValidationException } from "../../types/errors"

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