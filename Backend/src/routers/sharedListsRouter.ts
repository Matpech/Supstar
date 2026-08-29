import { Router } from "express";
import { requireLoggedIn } from "../middlewares/authMiddlewares";
import { ApiException, InvalidTokenException, ValidationException } from "../types/errors";
import { addMemberToList, changeSLMemberRole, checkSharedListPermissions, createSharedList, deleteSharedList, getAvailableSharedLists, getOneSharedList, removeMemberFromList, transferSLOwnership, updateSharedListDetails } from "../repositories/sharedListsRepo";
import validate from "../utils/validation/validator";
import { sharedListAddMemberSchema, sharedListCreateSchema, sharedListRemoveMemberSchema, sharedListTransferOwnershipSchema, sharedListUpdateMemberRoleSchema, sharedListUpdateSchema } from "../utils/validation/schemas/sharedListsSchemas";
import { numericIdSchema } from "../utils/validation/schemas/generalSchemas";
import { SharedListRoles } from "../types/sharedLists";
import SLLocationsRouter from "./sharedListLocationsRouter";
import { bulkImportLocations, exportLocations } from "../repositories/locationsRepo";
import { upload } from "../utils/fileUploads";
import fs from "fs";
import { sanitizeImportedData } from "../utils/imports";

const router = Router()

router.get("/", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const availableLists = await getAvailableSharedLists(req.user.id)
    return res.json({
        total: availableLists.length,
        lists: availableLists
    })
})

router.get("/:sl_id", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const sl_id = numericIdSchema.validate(parseInt(req.params.sl_id as string))
    if (!sl_id.value) {
        throw new ValidationException("Invalid numeric ID")
    }
    await checkSharedListPermissions(req.user.id, sl_id.value, SharedListRoles.READER)

    const listDetails = await getOneSharedList(sl_id.value, req.user.id)
    return res.json(listDetails)
})

router.post("/", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const data = validate(req, sharedListCreateSchema)

    const list = await createSharedList({
        name: data.name,
        description: data.description,
        owner_id: req.user.id
    })

    return res.status(201).json(list)
})

router.patch("/:sl_id", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const sl_id = numericIdSchema.validate(parseInt(req.params.sl_id as string))
    if (!sl_id.value) {
        throw new ValidationException("Invalid numeric ID")
    }
    const data = validate(req, sharedListUpdateSchema)
    await checkSharedListPermissions(req.user.id, sl_id.value, SharedListRoles.OWNER)

    const updatedList = await updateSharedListDetails(sl_id.value, data)
    return res.json(updatedList)
})

router.delete("/:sl_id", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const sl_id = numericIdSchema.validate(parseInt(req.params.sl_id as string))
    if (!sl_id.value) {
        throw new ValidationException("Invalid numeric ID")
    }
    await checkSharedListPermissions(req.user.id, sl_id.value, SharedListRoles.OWNER)

    await deleteSharedList(sl_id.value)
    return res.sendStatus(204)
})

router.post("/:sl_id/member", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const data = validate(req, sharedListAddMemberSchema)
    const sl_id = numericIdSchema.validate(parseInt(req.params.sl_id as string))
    if (!sl_id.value) {
        throw new ValidationException("Invalid numeric ID")
    }
    await checkSharedListPermissions(req.user.id, sl_id.value, SharedListRoles.OWNER)

    const userId = await addMemberToList(data.username, sl_id.value, data.role)
    return res.status(200).json({
        id: userId,
        username: data.username,
        role: data.role
    })
})

router.delete("/:sl_id/member", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const { userId } = validate(req, sharedListRemoveMemberSchema) as { userId: number }
    const sl_id = numericIdSchema.validate(parseInt(req.params.sl_id as string))
    if (!sl_id.value) {
        throw new ValidationException("Invalid numeric ID")
    }
    await checkSharedListPermissions(req.user.id, sl_id.value, SharedListRoles.OWNER)

    await removeMemberFromList(userId, sl_id.value)
    return res.sendStatus(204)
})

router.patch("/:sl_id/member", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const data = validate(req, sharedListUpdateMemberRoleSchema)
    const sl_id = numericIdSchema.validate(parseInt(req.params.sl_id as string))
    if (!sl_id.value) {
        throw new ValidationException("Invalid numeric ID")
    }
    await checkSharedListPermissions(req.user.id, sl_id.value, SharedListRoles.OWNER)

    await changeSLMemberRole(data.userId, sl_id.value, data.role)
    return res.sendStatus(204)
})

router.post("/:sl_id/transfer-ownership", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const { username } = validate(req, sharedListTransferOwnershipSchema) as { username: string }
    const sl_id = numericIdSchema.validate(parseInt(req.params.sl_id as string))
    if (!sl_id.value) {
        throw new ValidationException("Invalid numeric ID")
    }
    await checkSharedListPermissions(req.user.id, sl_id.value, SharedListRoles.OWNER)

    await transferSLOwnership(req.user.id, username, sl_id.value)
    return res.sendStatus(204)
})

router.get("/:sl_id/export", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const sl_id = numericIdSchema.validate(parseInt(req.params.sl_id as string))
    if (!sl_id.value) {
        throw new ValidationException("Invalid numeric ID")
    }
    await checkSharedListPermissions(req.user.id, sl_id.value, SharedListRoles.READER)

    const details = await getOneSharedList(sl_id.value, req.user.id)
    const locations = await exportLocations(sl_id.value)
    return res.json({
        name: details.name,
        description: details.description,
        locations
    })
})

router.post("/:sl_id/import", requireLoggedIn, upload.single('data'), async (req, res) => {
    try {
        if (!req.user) {
            throw new InvalidTokenException()
        }

        if (!req.file) {
            throw new ValidationException("You must upload a file")
        }

        // Verify permissions
        const sl_id = numericIdSchema.validate(parseInt(req.params.sl_id as string))
        if (!sl_id.value) {
            throw new ValidationException("Invalid numeric ID")
        }
        await checkSharedListPermissions(req.user.id, sl_id.value, SharedListRoles.EDITOR)

        // Sanitize input
        const rawData = fs.readFileSync(req.file.path).toString()
        const rawJson = JSON.parse(rawData)
        if (!rawJson.locations) {
            throw new ValidationException("No locations found in the import file")
        }
        const sanitizedData = sanitizeImportedData(rawJson.locations, sl_id.value)

        // Bulk insert in the DB
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

router.use("/:sl_id/locations", SLLocationsRouter)

export default router