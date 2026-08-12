/**
 * ApiException
 * 
 * Base class for API exceptions. Can be used for
 * specialized exception classes.
 */
export class ApiException extends Error {
    public readonly statusCode: number
    public readonly code: string

    constructor(
        statusCode: number,
        code: string,
        message: string,
        cause?: unknown
    ) {
        super(message, { cause })

        this.name = "ApiException"
        this.statusCode = statusCode
        this.code = code
    }
}

export class DatabaseException extends ApiException {
    constructor(error: Error) {
        super(500, "DATABASE_ERROR", "An error occured while accessing the database", error)
    }
}

export class ValidationException extends ApiException {
    constructor(message: string) {
        super(400, "VALIDATION_ERROR", message)
    }
}

export class InvalidTokenException extends ApiException {
    constructor() {
        super(401, "INVALID_TOKEN", "Your token is invalid or has expired")
    }
}
