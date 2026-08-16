import { Router } from "express";
import { ApiException, InvalidTokenException, ValidationException } from "../types/errors";
import { deleteUser, getUserStats } from "../repositories/usersRepo";
import { requireLoggedIn } from "../middlewares/authMiddlewares";
import { bulkImportLocations, exportLocations } from "../repositories/locationsRepo";
import { upload } from "../utils/fileUploads";
import fs from "fs"
import { sanitizeImportedData } from "../utils/imports";

const router = Router()

router.delete("/close-account", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    await deleteUser(req.user.id)
    return res.sendStatus(204)
})

router.get("/stats", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const stats = await getUserStats(req.user.id)
    return res.json(stats)
})

router.get("/pl-export", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const data = await exportLocations(undefined, req.user.id)
    res.json({locations: data})
})

router.post("/pl-import", requireLoggedIn, upload.single('data'), async (req, res) => {
    try {
        if (!req.user) {
            throw new InvalidTokenException()
        }

        if (!req.file) {
            throw new ValidationException("You must upload a file")
        }

        // Read and sanitize the uploaded (supposedly) JSON file
        const rawData = fs.readFileSync(req.file.path).toString()
        const rawJson = JSON.parse(rawData)
        if (!rawJson.locations) {
            throw new ValidationException("No locations found in the import file")
        }
        const sanitizedData = sanitizeImportedData(rawJson.locations, undefined, req.user.id)

        // Bulk insert the sanitized data in the DB
        const insertedCount = await bulkImportLocations(sanitizedData)
        return res.json({ insertedCount })
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new ApiException(422, "PARSING_ERROR", "Failed to parse JSON file")
        }

        throw error
    } finally {
        if (req.file) fs.unlinkSync(req.file?.path)
    }
})

export default router