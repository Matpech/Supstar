import { Router } from "express";
import validate from "../utils/validation/validator";
import { loginSchema, registrationSchema } from "../utils/validation/schemas/authSchemas";
import type { UserRegistration } from "../types/users";
import { createUser } from "../repositories/usersRepo";
import { generateSessionToken, signToken, verifyLoginCredentials } from "../utils/security";
import type { LoginCredentials, UserJWT } from "../types/security";

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

router.post("/login", async (req, res) => {
    const data: LoginCredentials = validate(req, loginSchema)
    const userData: UserJWT = await verifyLoginCredentials(data)
    const sessionId: string = await generateSessionToken(userData.id)
    const token: string = signToken(userData)

    return res.json({sessionId, token})
})

export default router