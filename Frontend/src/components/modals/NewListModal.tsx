import { useState } from "react"
import GenericButton from "../ui/GenericButton"
import { useApiClient } from "../../hooks/useApiClient"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

interface Props {
    close: () => void
}

function NewListModal({ close }: Props) {
    const { request } = useApiClient()
    const navigate = useNavigate()
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")

    async function handleCreate() {
        const payload = {
            name,
            description: (description.trim() === "" ? undefined : description.trim())
        }

        const response = await request("/lists", {
            method: "POST",
            body: JSON.stringify(payload)
        })

        if (response.code !== 201) {
            toast.error(`Failed to create shared list (${response.json.error})`)
            return
        }

        toast.success(`List "${response.json.name}" successfully created`)
        navigate(`/list/${response.json.id}`)
        close()
    }

    return (
        <div>
            <div>
                <label htmlFor="name" className="mb-2 text-md font-bold">
                    List name
                </label>

                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Shared list name"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                />
            </div>

            <div>
                <label htmlFor="description" className="mb-2 text-md font-bold">
                    Description
                </label>

                <input
                    id="description"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A short description of the list (optional)"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                />
            </div>

            <GenericButton
                disabled={name.trim() === ""}
                type="primary"
                action={handleCreate}
                classNameOverride="mt-2"
            >
                Create
            </GenericButton>
        </div>
    )
}

export default NewListModal