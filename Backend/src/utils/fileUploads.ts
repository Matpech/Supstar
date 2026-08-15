import { fileTypeFromFile } from "file-type";
import multer from "multer";
import { ValidationException } from "../types/errors";

export const upload = multer({ dest: 'uploads/' })

const ALLOWED_IMAGE_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp"
]

/**
 * Verify if a file uploaded by a user is a supported image file using
 * its MIME type and the magic number of the uploaded file
 * 
 * @param filePath The path of the file to validate 
 * @returns The MIME type of the image
 * @throws ValidationException (cannot validate/unsupported format)
 */
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