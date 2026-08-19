import { useState, type SubmitEvent } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import type { ApiError } from "../types/api";
import { Link, useNavigate } from "react-router-dom";
import { Gamepad2 } from "lucide-react";

function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const auth = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault()

        toast.promise(
            auth.login(email, password),
            {
                loading: "Logging in...",
                success: (data) => `Welcome back, ${data.username}!`,
                error: (err: ApiError) => err.message
            }
        ).then((_data) => navigate("/")).catch(_err => {})
    };

    return (
        <main className="min-h-screen bg-linear-to-tr from-green-400/80 via-green-50 to-white flex items-center justify-center px-4">
            <section className="w-full max-w-md">
                <div className="rounded-2xl bg-white/90 p-8 shadow-xl ring-1 ring-black/5 backdrop-blur-sm">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Welcome back
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Log in to your Supstar account to continue
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="
                                    w-full rounded-lg border border-gray-300
                                    bg-white px-4 py-3 text-sm text-gray-900
                                    outline-none transition
                                    placeholder:text-gray-400
                                    focus:border-green-500
                                    focus:ring-2 focus:ring-green-500/20
                                "
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="
                                    w-full rounded-lg border border-gray-300
                                    bg-white px-4 py-3 text-sm text-gray-900
                                    outline-none transition
                                    placeholder:text-gray-400
                                    focus:border-green-500
                                    focus:ring-2 focus:ring-green-500/20
                                "
                            />
                        </div>

                        <button
                            type="submit"
                            className="
                                w-full rounded-lg bg-green-600 px-4 py-3
                                text-sm font-semibold text-white
                                shadow-sm transition
                                hover:bg-green-700
                                focus:outline-none focus:ring-2
                                focus:ring-green-500 focus:ring-offset-2
                                active:bg-green-800
                            "
                        >
                            Log in
                        </button>
                    </form>

                    <a
                        className="
                            w-full rounded-lg bg-violet-600 px-4 py-3 mt-2
                            flex justify-center items-center gap-2
                            text-sm font-semibold text-white
                            shadow-sm transition
                            hover:bg-violet-700
                            focus:outline-none focus:ring-2
                            focus:ring-violet-500 focus:ring-offset-2
                            active:bg-violet-800
                        "
                        href="/api/auth/discord/login"
                    >
                        <Gamepad2 height={24} /> Log in via Discord
                    </a>

                    {/* Register */}
                    <p className="mt-6 text-center text-sm text-gray-500">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="font-semibold text-green-600 hover:text-green-700"
                        >
                            Create one
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    )
}

export default Login