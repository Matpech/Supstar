import { Router } from "express";
import validate from "../utils/validation/validator";
import { loginSchema, passwordUpdateSchema, registrationSchema, sessionIdSchema } from "../utils/validation/schemas/authSchemas";
import type { UserRegistration } from "../types/users";
import { createUser } from "../repositories/usersRepo";
import { generateSessionToken, invalidateAllSessionIds, invalidateSessionId, signToken, updatePassword, verifyLoginCredentials, verifyPassword, verifySessionId } from "../utils/security";
import type { LoginCredentials, UserJWT } from "../types/security";
import { requireLoggedIn, requireLoggedOut } from "../middlewares/authMiddlewares";
import { ApiException, InvalidTokenException } from "../types/errors";

const router = Router()

router.post("/register", requireLoggedOut, async (req, res) => {
    const data: UserRegistration = validate(req, registrationSchema)

    const userId: number = await createUser(data)
    const sessionId: string = await generateSessionToken(userId)
    const token: string = signToken({
        id: userId,
        username: data.username
    })

    return res.json({sessionId, token})
})

router.post("/login", requireLoggedOut, async (req, res) => {
    const data: LoginCredentials = validate(req, loginSchema)
    const userData: UserJWT = await verifyLoginCredentials(data)
    const sessionId: string = await generateSessionToken(userData.id)
    const token: string = signToken(userData)

    return res.json({sessionId, token})
})

router.post("/refresh", async (req, res) => {
    const { sessionId } = validate(req, sessionIdSchema) as { sessionId: string }
    const userData: UserJWT = await verifySessionId(sessionId)
    const token: string = signToken(userData)

    return res.json({token})
})

router.post("/logout", requireLoggedIn, async (req, res) => {
    const { sessionId } = validate(req, sessionIdSchema) as { sessionId: string }
    if (!req.user) {
        throw new InvalidTokenException()
    }
    const endAllSessions = req.query.all_sessions !== undefined
    
    const userData: UserJWT = await verifySessionId(sessionId)
    if (req.user.id !== userData.id) {
        throw new ApiException(403, "SESSION_MISMATCH", "This session does not belong to you")
    }

    if (endAllSessions) {
        await invalidateAllSessionIds(userData.id)
    } else {
        await invalidateSessionId(sessionId)
    }

    return res.sendStatus(204)
})

router.patch("/update-password", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const data = validate(req, passwordUpdateSchema)
    const userData: UserJWT = await verifySessionId(data.sessionId)
    if (req.user.id !== userData.id) {
        throw new ApiException(403, "SESSION_MISMATCH", "This session does not belong to you")
    }

    // Check if password is correct, then update it and invalidate
    // all sessions (except the current one)
    await verifyPassword(userData.id, data.oldPassword)
    await updatePassword(userData.id, data.newPassword)
    await invalidateAllSessionIds(userData.id, data.sessionId)

    return res.sendStatus(204)
})

export default router