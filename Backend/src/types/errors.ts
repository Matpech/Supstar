/**
 * Base class for API exceptions. Can be used for specialized exception classes
 * or on its own. Contains a status code, error code, and message.
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

/**
 * Specialized type of ApiException used when a database request fails in unexpected
 * ways (database unreachable, etc).
 * 
 * Returns an HTTP 500 error called `DATABASE_ERROR` with a predefined message.
 * 
 * @param error Optional argument used to define the cause of the DatabaseException
 * (for debugging purposes)
 */
export class DatabaseException extends ApiException {
    constructor(error: Error) {
        super(500, "DATABASE_ERROR", "An error occured while accessing the database", error)
    }
}

/**
 * Specialized type of ApiException used when input data sent by the user is found
 * to be invalid (a numeric ID in the URL, a JSON payload, etc).
 * 
 * Returns an HTTP 400 error called `VALIDATION_ERROR`.
 * 
 * @param message The error message to send back to the client, indicating what is
 * wrong with the input data
 */
export class ValidationException extends ApiException {
    constructor(message: string) {
        super(400, "VALIDATION_ERROR", message)
    }
}

/**
 * Specialized type of ApiException used when the JWT of a request (found in the
 * authorization header) cannot be verified by the authentication middlewares.
 * 
 * Returns an HTTP 401 error called `INVALID_TOKEN` with a predefined message.
 */
export class InvalidTokenException extends ApiException {
    constructor() {
        super(401, "INVALID_TOKEN", "Your token is invalid or has expired")
    }
}

/**
 * Specialized type of ApiException used when the target resource cannot be found
 * in the database.
 * 
 * Returns an HTTP 404 error called `NOT_FOUND`.
 * 
 * @param resourceName The name of the resource that was not found (defaults to
 * "Resource" if none is passed)
 */
export class NotFoundException extends ApiException {
    constructor(resourceName = "Resource") {
        super(404, "NOT_FOUND", `${resourceName} was not found`)
    }
}

/**
 * Specialized type of ApiException used when an API endpoint called by the user
 * (or a specialized function) does not have an implementation. Only used temporarily
 * when structuring the backend for a new feature.
 * 
 * Returns an HTTP 501 error called `NOT_IMPLEMENTED` with a predefined message.
 */
export class NotImplementedException extends ApiException {
    constructor() {
        super(501, "NOT_IMPLEMENTED", "This feature has not been implemented yet")
    }
}
