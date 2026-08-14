import { Router } from "express";
import { requireLoggedIn } from "../middlewares/authMiddlewares";
import { InvalidTokenException, ValidationException } from "../types/errors";
import { numericIdSchema } from "../utils/validation/schemas/generalSchemas";
import { checkSharedListPermissions } from "../repositories/sharedListsRepo";
import { SharedListRoles } from "../types/sharedLists";
import validate from "../utils/validation/validator";
import { locationCreateSchema } from "../utils/validation/schemas/locationSchemas";
import type { Location } from "../types/locations";
import { createLocation } from "../repositories/locationsRepo";

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

export default router