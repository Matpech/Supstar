import { Router } from "express";
import { requireLoggedIn } from "../middlewares/authMiddlewares";
import { ApiException, InvalidTokenException, ValidationException } from "../types/errors";
import type { Location, LocationSearchParams, LocationUpdateArgs } from "../types/locations";
import validate from "../utils/validation/validator";
import { galleryDeleteSchema, locationCreateSchema, locationSearchSchema, locationUpdateSchema } from "../utils/validation/schemas/locationSchemas";
import { numericIdSchema } from "../utils/validation/schemas/generalSchemas";
import { countPhotos, createLocation, deleteLocation, deletePhoto, getLocations, getOneLocation, updateLocation, verifyIdMatch } from "../repositories/locationsRepo";
import { upload, validateImageFile } from "../utils/fileUploads";
import fs from "fs"
import { processLocationPhoto } from "../utils/imageProcessing";
import PLReviewsRouter from "./personalListReviewsRouter";

const router = Router({ mergeParams: true })

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

router.post("/:location_id/gallery", requireLoggedIn, upload.array('images', 10), async (req, res) => {
    try {
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

        await verifyIdMatch(location_id.value, undefined, req.user.id)

        // Check if the file array is empty
        if (!req.files || req.files.length === 0) {
            throw new ValidationException("You must upload at least 1 image file")
        }

        // Only allow 10 images for a location
        const currentImageCount = await countPhotos(location_id.value)
        if (currentImageCount + req.files.length > 10) {
            throw new ApiException(409, "IMAGE_LIMIT_REACHED", "Cannot have more than 10 images on a location")
        }

        const files = req.files as Express.Multer.File[]
        const paths = files.map(f => f.path)
    
        // Validate all images before processing (prevents partial upload, all or nothing)
        for (const path of paths) {
            await validateImageFile(path)
        }

        // Process images
        for (const path of paths) {
            await processLocationPhoto(path, location_id.value)
        }

        return res.sendStatus(201)
    } catch (error) {
        throw error
    } finally {
        // Clean up uploads directory once finished
        const files = req.files as Express.Multer.File[]
        const paths = files.map(f => f.path)
        for (const path of paths) {
            fs.unlinkSync(path)
        }
    }
})

router.delete("/:location_id/gallery", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const { imageId } = validate(req, galleryDeleteSchema) as { imageId: string }
    const user_id = numericIdSchema.validate(parseInt(req.params.user_id as string))
    const location_id = numericIdSchema.validate(parseInt(req.params.location_id as string))
    if (!user_id.value || !location_id.value) {
        throw new ValidationException("Invalid numeric ID")
    }

    if (req.user.id !== user_id.value) {
        throw new ApiException(403, "PL_ACCESS_DENIED", "You do not have permission to perform this action")
    }

    await verifyIdMatch(location_id.value, undefined, req.user.id)

    await deletePhoto(imageId, location_id.value)
    return res.sendStatus(204)
})

router.get("/", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const data = req.body
        ? validate(req, locationSearchSchema)
        : null

    const user_id = numericIdSchema.validate(parseInt(req.params.user_id as string))
    if (!user_id.value) {
        throw new ValidationException("Invalid numeric ID")
    }

    const params: LocationSearchParams = data
        ? { userId: user_id.value, ...data }
        : { userId: user_id.value }

    const results = await getLocations(params)

    return res.json({
        total: results.length,
        results
    })
})

router.get("/:location_id", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const user_id = numericIdSchema.validate(parseInt(req.params.user_id as string))
    const location_id = numericIdSchema.validate(parseInt(req.params.location_id as string))
    if (!user_id.value || !location_id.value) {
        throw new ValidationException("Invalid numeric ID")
    }

    const result = await getOneLocation(location_id.value, undefined, user_id.value)
    return res.json(result)
})

router.use("/:location_id/reviews", PLReviewsRouter)

export default router