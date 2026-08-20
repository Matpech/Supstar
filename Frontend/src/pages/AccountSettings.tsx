import { useState } from "react"
import GenericCard from "../components/ui/GenericCard"
import { createPortal } from "react-dom"
import AccountDeleteConfirmPrompt from "../components/AccountDeleteConfirmPrompt"
import ModalCard from "../components/ui/ModalCard"
import { useApiClient } from "../hooks/useApiClient"
import toast from "react-hot-toast"
import { useAuth } from "../hooks/useAuth"
import GenericButton from "../components/ui/GenericButton"

function AccountSettings() {
    const { request } = useApiClient()
    const { ctx } = useAuth()

    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [inputCurrentPassword, setInputCurrentPassword] = useState("")
    const [inputNewPassword, setInputNewPassword] = useState("")
    const [inputConfirmNewPassword, setInputConfirmNewPassword] = useState("")
    const [enablePwdUpdateBtn, setEnablePwdUpdateBtn] = useState(true)

    async function handlePasswordUpdate() {
        setEnablePwdUpdateBtn(false)

        if (inputNewPassword.length < 8) {
            toast.error("Password should be at least 8 characters long")
            setTimeout(() => setEnablePwdUpdateBtn(true), 2000)
            return
        }

        if (inputNewPassword !== inputConfirmNewPassword) {
            toast.error("Passwords do not match")
            setTimeout(() => setEnablePwdUpdateBtn(true), 2000)
            return
        }

        const response = await request("/auth/update-password", {
            method: "PATCH",
            body: JSON.stringify({
                oldPassword: inputCurrentPassword,
                newPassword: inputNewPassword,
                sessionId: ctx.sessionId
            })
        })

        if (response.code !== 204) {
            toast.error(`Failed to update password (${response.json.error})`)
        } else {
            toast.success("Password updated")
        }

        setTimeout(() => setEnablePwdUpdateBtn(true), 2000)
    }

    return (
        <div className="max-w-7xl mx-2 md:mx-auto md:p-0">
            <header className="py-12">
                <h2 className="text-3xl md:text-5xl">Account settings</h2>
            </header>

            <div className="flex flex-col gap-8">
                <GenericCard>
                    <h3 className="text-3xl font-bold">Security</h3>

                    <h4 className="text-xl">Update password</h4>
                    <p className="italic">You will be logged out from other devices</p>
                    <input
                        type="password"
                        id="current-password"
                        autoComplete="current-password"
                        value={inputCurrentPassword}
                        onChange={(e) => setInputCurrentPassword(e.target.value)}
                        placeholder="Current password"
                        className="
                            rounded-lg border border-gray-300
                            bg-white px-4 py-3 mr-2 text-sm text-gray-900
                            outline-none transition
                            placeholder:text-gray-400
                            focus:border-black
                        "
                    />

                    <input
                        type="password"
                        id="new-password"
                        autoComplete="new-password"
                        value={inputNewPassword}
                        onChange={(e) => setInputNewPassword(e.target.value)}
                        placeholder="New password"
                        className="
                            rounded-lg border border-gray-300
                            bg-white px-4 py-3 mr-2 text-sm text-gray-900
                            outline-none transition
                            placeholder:text-gray-400
                            focus:border-black
                        "
                    />

                    <input
                        type="password"
                        id="new-password-confirm"
                        autoComplete="new-password"
                        value={inputConfirmNewPassword}
                        onChange={(e) => setInputConfirmNewPassword(e.target.value)}
                        placeholder="New password (confirm)"
                        className="
                            rounded-lg border border-gray-300
                            bg-white px-4 py-3 mr-2 text-sm text-gray-900
                            outline-none transition
                            placeholder:text-gray-400
                            focus:border-black
                        "
                    />
                    
                    <GenericButton
                        type="primary"
                        action={handlePasswordUpdate}
                        disabled={!enablePwdUpdateBtn}
                    >
                        Update password
                    </GenericButton>
                </GenericCard>

                <GenericCard>
                    <h3 className="text-3xl font-bold">Delete account</h3>
                    <p>
                        <span className="font-bold">WARNING: </span>
                        This action will instantly delete your account and all associated data. This cannot be undone.
                    </p>
                    <GenericButton
                        type="danger"
                        action={() => setDeleteModalOpen(true)}
                        classNameOverride="mt-4"
                    >
                        Delete account
                    </GenericButton>

                </GenericCard>

                {deleteModalOpen && createPortal(
                    <ModalCard title="Account deletion" onClose={() => setDeleteModalOpen(false)}>
                        <AccountDeleteConfirmPrompt closeModal={() => setDeleteModalOpen(false)} />
                    </ModalCard>,
                    document.body
                )}
            </div>
        </div>
    )
}

export default AccountSettings