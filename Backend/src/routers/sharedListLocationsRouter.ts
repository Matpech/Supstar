import { Router } from "express";
import { requireLoggedIn } from "../middlewares/authMiddlewares";
import { ApiException, InvalidTokenException, ValidationException } from "../types/errors";
import { numericIdSchema } from "../utils/validation/schemas/generalSchemas";
import { checkSharedListPermissions } from "../repositories/sharedListsRepo";
import { SharedListRoles } from "../types/sharedLists";
import validate from "../utils/validation/validator";
import { galleryDeleteSchema, locationCreateSchema, locationSearchSchema, locationUpdateSchema } from "../utils/validation/schemas/locationSchemas";
import type { Location, LocationSearchParams, LocationUpdateArgs } from "../types/locations";
import { countPhotos, createLocation, deleteLocation, deletePhoto, getLocations, getOneLocation, updateLocation, verifyIdMatch } from "../repositories/locationsRepo";
import { upload, validateImageFile } from "../utils/fileUploads";
import fs from "fs";
import { processLocationPhoto } from "../utils/imageProcessing";
import SLReviewsRouter from "./sharedListReviewsRouter";

const router = Router({ mergeParams: true })

router.post("/", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const data: Location = validate(req, locationCreateSchema)
    const sl_id = numericIdSchema.validate(parseInt(req.params.sl_id as string))
    if (!sl_id.value) {
        throw new ValidationException("Invalid numeric ID")
    }
    await checkSharedListPermissions(req.user.id, sl_id.value, SharedListRoles.EDITOR)

    data.list_id = sl_id.value
    const newLocation = await createLocation(data)
    return res.status(201).json(newLocation)
})

/**
 * Note:
 * 
 * This implementation allows EVERY EDITOR (and the SL owner) to edit ANY LOCATION (even if
 * they did not create it).
 * 
 * Another model would be to only allow the creator of the location to update/delete. This
 * modification would require adding a field for ownership in the database and add more logic
 * in the permission checks, but with the benefit of better security and "vandalism protection".
 * 
 * I decided to keep this model because I expect SL owners to trust their editors.
 */
router.patch("/:location_id", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const data: LocationUpdateArgs = validate(req, locationUpdateSchema)
    const sl_id = numericIdSchema.validate(parseInt(req.params.sl_id as string))
    const location_id = numericIdSchema.validate(parseInt(req.params.location_id as string))
    if (!sl_id.value || !location_id.value) {
        throw new ValidationException("Invalid numeric ID")
    }
    await checkSharedListPermissions(req.user.id, sl_id.value, SharedListRoles.EDITOR)

    const updatedLocation =  await updateLocation(data, location_id.value, sl_id.value)
    return res.json(updatedLocation)
})

router.delete("/:location_id", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const sl_id = numericIdSchema.validate(parseInt(req.params.sl_id as string))
    const location_id = numericIdSchema.validate(parseInt(req.params.location_id as string))
    if (!sl_id.value || !location_id.value) {
        throw new ValidationException("Invalid numeric ID")
    }
    await checkSharedListPermissions(req.user.id, sl_id.value, SharedListRoles.EDITOR)

    await deleteLocation(location_id.value, sl_id.value)
    return res.sendStatus(204)
})

router.post("/:location_id/gallery", requireLoggedIn, upload.array('images', 10), async (req, res) => {
    try {
        if (!req.user) {
            throw new InvalidTokenException()
        }
    
        const sl_id = numericIdSchema.validate(parseInt(req.params.sl_id as string))
        const location_id = numericIdSchema.validate(parseInt(req.params.location_id as string))
        if (!sl_id.value || !location_id.value) {
            throw new ValidationException("Invalid numeric ID")
        }
        await checkSharedListPermissions(req.user.id, sl_id.value, SharedListRoles.EDITOR)
        await verifyIdMatch(location_id.value, sl_id.value)
    
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
    const sl_id = numericIdSchema.validate(parseInt(req.params.sl_id as string))
    const location_id = numericIdSchema.validate(parseInt(req.params.location_id as string))
    if (!sl_id.value || !location_id.value) {
        throw new ValidationException("Invalid numeric ID")
    }
    await checkSharedListPermissions(req.user.id, sl_id.value, SharedListRoles.EDITOR)
    await verifyIdMatch(location_id.value, sl_id.value)

    await deletePhoto(imageId, location_id.value)
    return res.sendStatus(204)
})

router.get("/", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    // Allow requests without filters
    const data = req.body
        ? validate(req, locationSearchSchema)
        : null
    
    const sl_id = numericIdSchema.validate(parseInt(req.params.sl_id as string))
    if (!sl_id.value) {
        throw new ValidationException("Invalid numeric ID")
    }
    await checkSharedListPermissions(req.user.id, sl_id.value, SharedListRoles.READER)

    // Build the search params
    const params: LocationSearchParams = data
        ? { listId: sl_id.value, ...data }
        : { listId: sl_id.value }

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

    const sl_id = numericIdSchema.validate(parseInt(req.params.sl_id as string))
    const location_id = numericIdSchema.validate(parseInt(req.params.location_id as string))
    if (!sl_id.value || !location_id.value) {
        throw new ValidationException("Invalid numeric ID")
    }
    await checkSharedListPermissions(req.user.id, sl_id.value, SharedListRoles.READER)

    const result = await getOneLocation(location_id.value, sl_id.value)
    return res.json(result)
})

router.use("/:location_id/reviews", SLReviewsRouter)

export default router