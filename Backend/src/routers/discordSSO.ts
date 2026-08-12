import { Router } from "express";
import { ApiException } from "../types/errors";
import { createUser, getOneUserByDiscordId, getOneUserByUsername } from "../repositories/usersRepo";
import { generateSessionToken, signToken } from "../utils/security";
import type { User } from "../types/users";

const router = Router()

router.get("/login", (_req, res) => {
    const params = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID as string,
        response_type: "code",
        redirect_uri: process.env.DISCORD_REDIRECT_URI as string,
        scope: "identify email",
    })
    res.redirect(`https://discord.com/oauth2/authorize?${params}`)
})

router.get("/callback", async (req, res) => {
    const { code, error, error_description } = req.query;

    if (error) {
        throw new ApiException(400, "DISCORD_ERROR", error_description as string)
    }

    // 1. Acquire token with the one time code to access the Discord API
    const params = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID as string,
        client_secret: process.env.DISCORD_CLIENT_SECRET as string,
        grant_type: "authorization_code",
        code: code as string,
        redirect_uri: process.env.DISCORD_REDIRECT_URI as string,
    });
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        body: params,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    const discordCredentials = (await tokenResponse.json()) as {
        access_token?: string;
        token_type?: string;
        expires_in?: number;
        refresh_token?: string;
        scope?: string;
        error?: string;
        error_description?: string;
    };

    if (!discordCredentials || !discordCredentials.access_token) {
        throw new ApiException(500, "DISCORD_ERROR", "Failed to acquire access token from Discord")
    }

    // 2. Get user data using the Discord API
    const userResponse = await fetch("https://discord.com/api/users/@me", {
        headers: {
            Authorization: `Bearer ${discordCredentials.access_token}`,
        },
    });
    const userData = (await userResponse.json()) as {
        id: string;
        username: string;
        email?: string;
    };

    // 3a. If user is already in the DB, create credentials
    const account: User = await getOneUserByDiscordId(userData.id)
    if (account) {
        const sessionId = await generateSessionToken(account.id)
        const token = signToken({ id: account.id, username: account.username })
        return res.json({ sessionId, token })
    }

    // 3b. Register a new user if all conditions are met :
    //     - An email is linked to the Discord account
    //     - The email is not already in use
    //     - The username is available (if not, add suffix)
    if (!userData.email) {
        throw new ApiException(409, "DISCORD_EMAIL_REQUIRED", "No email linked to the Discord account. Please link your email to your Discord account and try again.")
    }

    let username = userData.username
    const usernameTaken = await getOneUserByUsername(userData.username)
    if (usernameTaken) {
        username = userData.username + "-d"
    }

    // Try to insert the new user (will fail if email is already in use)
    const userId = await createUser({
        discord_id: userData.id,
        email: userData.email,
        username
    })

    // Return credentials to the client
    const sessionId = await generateSessionToken(userId)
    const token = signToken({ id: userId, username })
    return res.json({ sessionId, token })
})

export default router