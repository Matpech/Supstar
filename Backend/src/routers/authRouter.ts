import { Router } from "express";
import validate from "../utils/validation/validator";
import { registrationSchema } from "../utils/validation/schemas/authSchemas";
import type { UserRegistration } from "../types/users";
import { createUser } from "../repositories/usersRepo";
import { generateSessionToken, signToken } from "../utils/security";

const router = Router()

router.post("/register", async (req, res) => {
    const data: UserRegistration = validate(req, registrationSchema)

    const userId: number = await createUser(data)
    const sessionId: string = await generateSessionToken(userId)
    const token: string = signToken({
        id: userId,
        username: data.username
    })

    return res.json({sessionId, token})
})

export default router