import { Router } from "express";
import { requireLoggedIn } from "../middlewares/authMiddlewares";
import { InvalidTokenException, ValidationException } from "../types/errors";
import { addMemberToList, changeSLMemberRole, checkSharedListPermissions, createSharedList, deleteSharedList, getAvailableSharedLists, getOneSharedList, removeMemberFromList, transferSLOwnership, updateSharedListDetails } from "../repositories/sharedListsRepo";
import validate from "../utils/validation/validator";
import { sharedListAddMemberSchema, sharedListCreateSchema, sharedListRemoveMemberSchema, sharedListUpdateMemberRoleSchema, sharedListUpdateSchema } from "../utils/validation/schemas/sharedListsSchemas";
import { numericIdSchema } from "../utils/validation/schemas/generalSchemas";
import { SharedListRoles } from "../types/sharedLists";
import SLLocationsRouter from "./sharedListLocationsRouter";

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

    const listDetails = await getOneSharedList(sl_id.value)
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

    await addMemberToList(data.userId, sl_id.value, data.role)
    return res.sendStatus(204)
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

    const { userId } = validate(req, sharedListRemoveMemberSchema) as { userId: number }
    const sl_id = numericIdSchema.validate(parseInt(req.params.sl_id as string))
    if (!sl_id.value) {
        throw new ValidationException("Invalid numeric ID")
    }
    await checkSharedListPermissions(req.user.id, sl_id.value, SharedListRoles.OWNER)

    await transferSLOwnership(req.user.id, userId, sl_id.value)
    return res.sendStatus(204)
})

router.use("/:sl_id/locations", SLLocationsRouter)

export default router