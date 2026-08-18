import { useState, type SubmitEvent } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import type { ApiError } from "../types/api";
import { Link, useNavigate } from "react-router-dom";

function Register() {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const auth = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault()

        if (password.length < 8) {
            return toast.error("Password should have at least 8 characters")
        }

        if (password !== confirmPassword) {
            return toast.error("Passwords do not match")
        }

        toast.promise(
            auth.register(email, username, password),
            {
                loading: "Creating account...",
                success: (data) => `Account created! Welcome, ${data.username}!`,
                error: (err: ApiError) => err.message
            }
        ).then((_data) => navigate("/")).catch(_err => {})
    };

    return (
        <main className="min-h-screen bg-gradient-to-tr from-green-400/80 via-green-50 to-white flex items-center justify-center px-4">
            <section className="w-full max-w-md">
                <div className="rounded-2xl bg-white/90 p-8 shadow-xl ring-1 ring-black/5 backdrop-blur-sm">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Welcome
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Let's create your Supstar account
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="username"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Username
                            </label>

                            <input
                                id="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="JohnDoe"
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
                                autoComplete="new-password"
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

                        <div>
                            <label
                                htmlFor="passwordConfirm"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Confirm password
                            </label>

                            <input
                                id="passwordConfirm"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                            Create account
                        </button>
                    </form>

                    {/* Register */}
                    <p className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-semibold text-green-600 hover:text-green-700"
                        >
                            Log in
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    )
}

export default Register