import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import GenericCard from "../components/ui/GenericCard"
import GenericButton from "../components/ui/GenericButton"
import { useSharedList } from "../hooks/useSharedList"
import { SLRoles } from "../types/lists"
import { useApiClient } from "../hooks/useApiClient"
import MobileActionMenu from "../components/ui/MobileActionMenu"
import { createPortal } from "react-dom"
import ConfirmationPrompt from "../components/ui/ConfirmationPrompt"
import ModalCard from "../components/ui/ModalCard"

function SharedListSettings() {
    const navigate = useNavigate()
    const { request } = useApiClient()

    const [loading, setLoading] = useState(true)
    const [nameInput, setNameInput] = useState("")
    const [descInput, setDescInput] = useState("")
    const [disableNameBtn, setDisableNameBtn] = useState(false)
    const [disableDescBtn, setDisableDescBtn] = useState(false)
    const [inviteInput, setInviteInput] = useState("")
    const [inviteRole, setInviteRole] = useState<SLRoles>(SLRoles.READER)
    const [transferInput, setTransferInput] = useState("")
    const [members, setMembers] = useState<{
        id: number,
        username: string,
        role: SLRoles
    }[]>([])

    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
    const [confirmTransferOpen, setConfirmTransferOpen] = useState(false)

    const { list_id } = useParams()
    const listId = parseInt(list_id as string)
    if (Number.isNaN(listId) || listId <= 0) {
        return
    }

    const sl = useSharedList(listId)

    useEffect(() => {
        if (!sl) {
            navigate("/")
            return
        }

        // Check permissions if details are fully loaded
        if (!sl.details) return
        if (sl.details.role !== SLRoles.OWNER) {
            toast.error("You are not allowed to manage this shared list")
            navigate("/")
            return
        }

        // Load the current data
        setNameInput(sl.details.name)
        setDescInput(sl.details.description || "")
        setMembers(sl.details.members as any)

        setLoading(false)
    }, [sl.details])

    async function handleNameUpdate() {
        setDisableNameBtn(true)

        const response = await request(`/lists/${listId}`, {
            method: "PATCH",
            body: JSON.stringify({ name: nameInput.trim() })
        })

        if (response.code === 200) {
            toast.success("Information updated")
        } else {
            toast.error("Failed to update shared list details")
        }

        setTimeout(() => {
            setDisableNameBtn(false)
        }, 1000)
    }

    async function handleDescriptionUpdate() {
        setDisableDescBtn(true)

        const response = await request(`/lists/${listId}`, {
            method: "PATCH",
            body: JSON.stringify({ description: descInput.trim() })
        })

        if (response.code === 200) {
            toast.success("Information updated")
        } else {
            toast.error("Failed to update shared list details")
        }

        setTimeout(() => {
            setDisableDescBtn(false)
        }, 1000)
    }

    async function handleDelete() {
        const response = await request(`/lists/${listId}`, {
            method: "DELETE"
        })

        if (response.code !== 204) {
            toast.error(`Failed to delete the shared list (${response.json.error})`)
            setConfirmDeleteOpen(false)
            return
        }

        toast.success("Shared list deleted")
        setConfirmDeleteOpen(false)
        navigate("/")
    }

    async function handleAddMember() {
        const response = await request(`/lists/${listId}/member`, {
            method: "POST",
            body: JSON.stringify({ username: inviteInput.trim(), role: inviteRole })
        })

        if (response.code !== 200) {
            toast.error(`Failed to invite user "${inviteInput.trim()}" (${response.json.error})`)
            return
        }

        toast.success(`${inviteInput.trim()} is now a member`)
        setMembers([...members, response.json])
    }

    async function handleRemoveMember(userId: number) {
        const response = await request(`/lists/${listId}/member`, {
            method: "DELETE",
            body: JSON.stringify({ userId })
        })

        if (response.code !== 204) {
            toast.error(`Failed to remove user (${response.json.error})`)
            return
        }

        const username = members.find((member) => member.id === userId)?.username

        toast.success(`${username || "User"} has been removed from the list`)
        setMembers((prev) => prev.filter((member) => member.id !== userId))
    }

    async function handleOwnershipTransfer() {
        const response = await request(`/lists/${listId}/transfer-ownership`, {
            method: "POST",
            body: JSON.stringify({ username: transferInput.trim() })
        })

        if (response.code !== 204) {
            toast.error(`Failed to transfer ownership (${response.json.error})`)
            setConfirmTransferOpen(false)
            return
        }

        toast.success(`${transferInput.trim()} was successfully promoted as the new list owner`)
        setConfirmTransferOpen(false)
        navigate("..")
    }

    return (
        <div className="max-w-7xl mx-2 md:mx-auto md:p-0">
            {loading ? (
                <p className="text-2xl text-center">Loading settings page. Please wait...</p>
            ) : (
                <>
                    <header className="py-12">
                        <h2 className="text-3xl md:text-5xl">Shared list settings</h2>
                    </header>

                    <div className="flex flex-col gap-8">
                        <GenericCard>
                            <h3 className="text-3xl font-bold">General</h3>

                            <label htmlFor="name" className="mb-2 text-xl">
                                List name
                            </label>
                            <div className="flex gap-4">
                                <input
                                    id="name"
                                    type="text"
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    placeholder="Shared list name"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                                />

                                <GenericButton
                                    disabled={disableNameBtn || nameInput.trim() === ""}
                                    type="primary"
                                    action={() => handleNameUpdate()}
                                >
                                    Update
                                </GenericButton>
                            </div>

                            <label htmlFor="description" className="mb-2 text-xl">
                                Description
                            </label>
                            <div className="flex gap-4">
                                <input
                                    id="description"
                                    type="text"
                                    value={descInput}
                                    onChange={(e) => setDescInput(e.target.value)}
                                    placeholder="A short description"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                                />

                                <GenericButton
                                    disabled={disableDescBtn || descInput.trim() === ""}
                                    type="primary"
                                    action={() => handleDescriptionUpdate()}
                                >
                                    Update
                                </GenericButton>
                            </div>
                        </GenericCard>

                        <div className="border-2 rounded-2xl">
                            <div className="flex gap-2 flex-col md:flex-row md:items-center justify-between p-4">
                                <h3 className="text-3xl font-bold">Members</h3>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inviteInput}
                                        onChange={(e) => setInviteInput(e.target.value)}
                                        placeholder="Username"
                                        className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                                    />

                                    <select
                                        className="text-sm rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-black"
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value as SLRoles)}
                                    >
                                        <option value="reader">Reader</option>
                                        <option value="commenter">Commenter</option>
                                        <option value="editor">Editor</option>
                                    </select>

                                    <GenericButton
                                        disabled={inviteInput.trim() === ""}
                                        type="primary"
                                        action={() => handleAddMember()}
                                    >
                                        Add member
                                    </GenericButton>
                                </div>
                            </div>
                            
                            <table className="w-full table-fixed">
                                <thead>
                                    <tr className="border-b border-black">
                                        <th className="md:w-4/6 px-4 py-3 text-left font-semibold">Username</th>
                                        <th className="md:w-1/6 px-4 py-3 text-left font-semibold">Role</th>
                                        <th className="md:w-1/6 px-4 py-3 text-left font-semibold">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {members.map(member => (
                                        <tr
                                            key={member.id}
                                            className="even:bg-gray-200"
                                        >
                                            <td className="px-4 py-3 text-xs md:text-sm">{member.username}</td>
                                            <td className="px-4 py-3 text-xs md:text-sm">{member.role}</td>
                                            <td className="flex flex-col md:flex-row gap-1">
                                                {/* Mobile version - use an action menu */}
                                                <div className="flex justify-end md:hidden">
                                                    <MobileActionMenu>
                                                        <div className="flex flex-col gap-1">
                                                            <select className="text-xs rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-black">
                                                                <option value="">Set new role</option>
                                                                <option value="reader">Reader</option>
                                                                <option value="commenter">Commenter</option>
                                                                <option value="editor">Editor</option>
                                                            </select>

                                                            <GenericButton
                                                                classNameOverride="w-full"
                                                                type="danger"
                                                                action={() => handleRemoveMember(member.id)}
                                                            >
                                                                Remove
                                                            </GenericButton>
                                                        </div>
                                                    </MobileActionMenu>
                                                </div>

                                                {/* Desktop version - just show the actions */}
                                                <div className="hidden md:flex gap-1">
                                                    <select className="text-sm rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-black">
                                                        <option value="">Set new role</option>
                                                        <option value="reader">Reader</option>
                                                        <option value="commenter">Commenter</option>
                                                        <option value="editor">Editor</option>
                                                    </select>

                                                    <GenericButton
                                                        type="danger"
                                                        action={() => handleRemoveMember(member.id)}
                                                    >
                                                        Remove
                                                    </GenericButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <GenericCard>
                            <h3 className="text-3xl font-bold">Danger zone</h3>

                            <p className="text-xl">Delete shared list</p>
                            <p className="mb-2 italic text-gray-500">This action will irreversibly delete the list and all saved locations.</p>
                            <GenericButton
                                type="danger"
                                action={() => setConfirmDeleteOpen(true)}
                            >
                                Delete List
                            </GenericButton>
                            {confirmDeleteOpen && createPortal(
                                <ModalCard title="Delete shared list" onClose={() => setConfirmDeleteOpen(false)}>
                                    <ConfirmationPrompt
                                        message="Are you sure you want to delete your shared list ?"
                                        delay={1000}
                                        onCancel={() => setConfirmDeleteOpen(false)}
                                        onConfirm={() => handleDelete()}
                                    />
                                </ModalCard>,
                                document.body
                            )}

                            <p className="mt-2 text-xl">Transfer ownership</p>
                            <p className="mb-2 italic text-gray-500">You will be granted the "Editor" role once ownership is transferred.</p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={transferInput}
                                    onChange={(e) => setTransferInput(e.target.value)}
                                    placeholder="Enter username"
                                    className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                                />
                                <GenericButton
                                    disabled={transferInput.trim() === ""}
                                    type="danger"
                                    action={() => setConfirmTransferOpen(true)}
                                >
                                    Transfer ownership
                                </GenericButton>
                                {confirmTransferOpen && createPortal(
                                    <ModalCard title="Transfer ownership" onClose={() => setConfirmTransferOpen(false)}>
                                        <ConfirmationPrompt
                                            message={`Are you sure you want to transfer ownership of this list to ${transferInput.trim()} ?`}
                                            delay={1000}
                                            onCancel={() => setConfirmTransferOpen(false)}
                                            onConfirm={() => handleOwnershipTransfer()}
                                        />
                                    </ModalCard>,
                                    document.body
                                )}
                            </div>
                        </GenericCard>
                    </div>
                </>
            )}
        </div>
    )
}

export default SharedListSettings