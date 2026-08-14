import { Router } from "express";
import { requireLoggedIn } from "../middlewares/authMiddlewares";
import { InvalidTokenException, ValidationException } from "../types/errors";
import { numericIdSchema } from "../utils/validation/schemas/generalSchemas";
import { checkSharedListPermissions } from "../repositories/sharedListsRepo";
import { SharedListRoles } from "../types/sharedLists";
import validate from "../utils/validation/validator";
import { galleryDeleteSchema, locationCreateSchema, locationUpdateSchema } from "../utils/validation/schemas/locationSchemas";
import type { Location, LocationUpdateArgs } from "../types/locations";
import { createLocation, deleteLocation, deletePhoto, updateLocation } from "../repositories/locationsRepo";
import { upload, validateImageFile } from "../utils/fileUploads";
import fs from "fs";
import { processLocationPhoto } from "../utils/imageProcessing";

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

    const updatedLocation =  await updateLocation(location_id.value, data)
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

    await deleteLocation(location_id.value)
    return res.sendStatus(204)
})

router.post("/:location_id/gallery", requireLoggedIn, upload.array('images'), async (req, res) => {
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
    
        // Check if the file array is empty
        if (!req.files || req.files.length === 0) {
            throw new ValidationException("You must upload at least 1 image file")
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

    await deletePhoto(imageId)
    return res.sendStatus(204)
})

export default router