import { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { useApiClient } from "../hooks/useApiClient"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

interface Props {
    closeModal: Function
}

function AccountDeleteConfirmPrompt({ closeModal }: Props) {
    const { ctx } = useAuth()
    const { request } = useApiClient()
    const navigate = useNavigate()

    const [username, setUsername] = useState("")
    const [deleting, setDeleting] = useState(false)

    async function handleDelete() {
        setDeleting(true)

        const response = await request("/self/close-account", {
            method: "DELETE"
        })

        if (response.code !== 204) {
            toast.error(`Failed to delete your account (${response.json.error})`)
            closeModal()
        } else {
            toast.success("Account deleted")
            ctx.logout()
            navigate("/login")
        }
    }

    return (
        <>
            {deleting ? (
                <p>Deleting your account... Please wait...</p>
            ) : (
                <>
                    <p>Are you sure you want to permanently delete your account ?</p>
                    <p>Please enter your username ({ctx.user?.username}) below to proceed.</p>

                    <input
                        type="text"
                        id="username-prompt"
                        placeholder={ctx.user?.username}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-fill border-b-2 py-3 outline-none"
                    />

                    <button
                        onClick={handleDelete}
                        disabled={username !== ctx.user?.username}
                        className="
                            rounded-lg bg-red-600 disabled:bg-gray-600 px-4 py-3 mt-4
                            text-sm font-semibold text-white
                            shadow-sm transition
                            hover:bg-red-700 disabled:hover:bg-gray-700 
                            focus:outline-none focus:ring-2
                            focus:ring-red-500 disabled:focus:ring-gray-500  focus:ring-offset-2
                            active:bg-red-800 disabled:active:bg-gray-800
                            hover:cursor-pointer disabled:hover:cursor-not-allowed
                            duration-300
                        "
                    >
                        Yes, delete my account
                    </button>
                </>
            )}
        </>
    )
}

export default AccountDeleteConfirmPrompt