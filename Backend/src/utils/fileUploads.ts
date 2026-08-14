import { fileTypeFromFile } from "file-type";
import multer from "multer";
import { ValidationException } from "../types/errors";

export const upload = multer({ dest: 'uploads/' })

const ALLOWED_IMAGE_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp"
]

export const validateImageFile = async (filePath: string) => {
    const fileType = await fileTypeFromFile(filePath)

    if (!fileType) {
        throw new ValidationException("Could not validate file type")
    }

    if (!ALLOWED_IMAGE_TYPES.includes(fileType.mime)) {
        throw new ValidationException("Unsupported file format")
    }

    return fileType.mime
}