import { Router } from "express";
import { InvalidTokenException } from "../types/errors";
import { deleteUser, getUserStats } from "../repositories/usersRepo";
import { requireLoggedIn } from "../middlewares/authMiddlewares";
import { exportLocations } from "../repositories/locationsRepo";

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

export default router