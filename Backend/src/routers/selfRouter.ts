import { Router } from "express";
import { InvalidTokenException } from "../types/errors";
import { deleteUser, exportPersonalListLocations, getUserStats } from "../repositories/usersRepo";
import { requireLoggedIn } from "../middlewares/authMiddlewares";

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

    const data = await exportPersonalListLocations(req.user.id)
    res.json(data)
})

export default router