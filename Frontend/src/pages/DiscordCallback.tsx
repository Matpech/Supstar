import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useApiClient } from "../hooks/useApiClient";
import { decodeBase64 } from "../utils/base64";

function DiscordCallback() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const auth = useAuth()
    const { request } = useApiClient()
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const handleDiscordCallback = async () => {
            try {
                const code = searchParams.get("code")
                const errorParam = searchParams.get("error")
                const errorDescription = searchParams.get("error_description")

                // If the user clicked "Refuse" on the Discord login page
                if (errorParam) {
                    setError(errorDescription || "Discord authentication refused")
                    setLoading(false)
                    return
                }

                // No code received
                if (!code) {
                    setError("Code is missing")
                    setLoading(false)
                    return
                }

                const response = await request(`/auth/discord/callback?code=${code}`)

                if (response.code !== 200) {
                    setError(response.json.error)
                    setLoading(false)
                    return
                }

                // Decode JWT to extract user data
                const jwtPayload = response.json.token.split(".")[1]
                const userData = JSON.parse(decodeBase64(jwtPayload))
                delete userData.iat
                delete userData.exp

                auth.ctx.login(userData, response.json.sessionId, response.json.token)

                // Redirect to Homepage if authentication is successful
                navigate("/", { replace: true })
            } catch (err) {
                setError(err.message)
                setLoading(false)
            }
        };

        handleDiscordCallback()
    }, [])

    return (
        <main className="min-h-screen bg-gradient-to-tr from-green-400/80 via-green-50 to-white flex items-center justify-center px-4">
            <section className="w-full max-w-md">
                <div className="rounded-2xl bg-white/90 p-8 shadow-xl ring-1 ring-black/5 backdrop-blur-sm">
                    <h1 className="mb-8 text-3xl text-center font-bold tracking-tight text-gray-900">
                        Supstar
                    </h1>
                    {loading ? (
                        <p className="text-center text-gray-900">Logging in... Please wait...</p>
                    ) : (
                        <>
                            <p className="text-center text-gray-900">Failed to log in</p>
                            {error && <p className="text-center text-gray-500">{error}</p>}
                            <button
                                className="
                                    w-full rounded-lg bg-green-600 px-4 py-3 mt-8
                                    text-sm font-semibold text-white
                                    shadow-sm transition
                                    hover:bg-green-700
                                    focus:outline-none focus:ring-2
                                    focus:ring-green-500 focus:ring-offset-2
                                    active:bg-green-800
                                "
                                onClick={() => navigate("/login")}
                            >
                                Go back
                            </button>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}

export default DiscordCallback;