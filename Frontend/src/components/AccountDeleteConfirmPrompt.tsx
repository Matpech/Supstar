import { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { useApiClient } from "../hooks/useApiClient"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import GenericButton from "./ui/GenericButton"

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

                    <GenericButton
                        type="danger"
                        action={handleDelete}
                        disabled={username !== ctx.user?.username}
                        classNameOverride="mt-4"
                    >
                        Yes, delete my account
                    </GenericButton>
                </>
            )}
        </>
    )
}

export default AccountDeleteConfirmPrompt