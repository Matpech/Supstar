import { Router } from "express";
import { requireLoggedIn } from "../middlewares/authMiddlewares";
import { ApiException, InvalidTokenException, ValidationException } from "../types/errors";
import type { Location, LocationUpdateArgs } from "../types/locations";
import validate from "../utils/validation/validator";
import { locationCreateSchema, locationUpdateSchema } from "../utils/validation/schemas/locationSchemas";
import { numericIdSchema } from "../utils/validation/schemas/generalSchemas";
import { createLocation, deleteLocation, updateLocation } from "../repositories/locationsRepo";

const router = Router({ mergeParams: true })

/**
 * The following endpoints need to be implemented :
 * - GET /                (search locations)
 * - GET /:location_id    (get one location)
 * 
 * + The gallery endpoints also
 * 
 * Another child router for PL reviews will also need to be created :
 * - POST /:location_id/reviews              (publish review)
 * - PATCH /:location_id/reviews/:review_id  (update review)
 * - DELETE /:location_id/reviews/:review_id (delete review)
 * - GET /:location_id/reviews               (get all reviews)
 */

router.post("/", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const data: Location = validate(req, locationCreateSchema)
    const user_id = numericIdSchema.validate(parseInt(req.params.user_id as string))
    if (!user_id.value) {
        throw new ValidationException("Invalid numeric ID")
    }

    // Only allow the owner to create locations
    if (req.user.id !== user_id.value) {
        throw new ApiException(403, "PL_ACCESS_DENIED", "You do not have permission to perform this action")
    }

    data.user_id = user_id.value
    const newLocation = await createLocation(data)
    return res.status(201).json(newLocation)
})

router.patch("/:location_id", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const data: LocationUpdateArgs = validate(req, locationUpdateSchema)
    const user_id = numericIdSchema.validate(parseInt(req.params.user_id as string))
    const location_id = numericIdSchema.validate(parseInt(req.params.location_id as string))
    if (!user_id.value || !location_id.value) {
        throw new ValidationException("Invalid numeric ID")
    }

    if (req.user.id !== user_id.value) {
        throw new ApiException(403, "PL_ACCESS_DENIED", "You do not have permission to perform this action")
    }

    const updatedLocation =  await updateLocation(data, location_id.value, undefined, req.user.id)
    return res.json(updatedLocation)
})

router.delete("/:location_id", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const user_id = numericIdSchema.validate(parseInt(req.params.user_id as string))
    const location_id = numericIdSchema.validate(parseInt(req.params.location_id as string))
    if (!user_id.value || !location_id.value) {
        throw new ValidationException("Invalid numeric ID")
    }

    if (req.user.id !== user_id.value) {
        throw new ApiException(403, "PL_ACCESS_DENIED", "You do not have permission to perform this action")
    }

    await deleteLocation(location_id.value, undefined, req.user.id)
    return res.sendStatus(204)
})

export default router