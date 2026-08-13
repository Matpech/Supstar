import { Router } from "express";
import { InvalidTokenException, NotFoundException } from "../types/errors";
import { deleteUser, getOneUserById } from "../repositories/usersRepo";
import validate from "../utils/validation/validator";
import { verifyLoginCredentials } from "../utils/security";
import type { User } from "../types/users";
import { requireLoggedIn } from "../middlewares/authMiddlewares";

const router = Router()

router.delete("/close-account", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    await deleteUser(req.user.id)
    return res.sendStatus(204)
})

export default router