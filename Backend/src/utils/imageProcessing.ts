import fs from "fs"
import crypto from "crypto"
import sharp from "sharp"
import { ApiException } from "../types/errors"
import { addPhotoToIndex } from "../repositories/locationsRepo"

/**
 * Process a single image through the gallery photo pipeline :
 * - Generates a unique imageId for the image (using a random UUIDv4)
 * - Ensures the output directory exists
 * - Converts and saves the image in WebP format
 * - Adds the image to the index (database)
 * 
 * @param filePath The path of the uploaded image
 * @param locationId The unique ID of the location linked to the image
 * @throws ApiException (500, IMAGE_PROCESSING_FAILURE)
 */
export const processLocationPhoto = async (filePath: string, locationId: number) => {
    const imageId = crypto.randomUUID()

    try {
        // Initialize the photos directory if needed
        if (!fs.existsSync("/data/photos")) {
            await fs.promises.mkdir("/data/photos")
        }

        // Compress the images with WebP to save on disk space
        await sharp(filePath)
            .rotate()
            .webp({ quality: 85 })
            .toFile(`/data/photos/${imageId}.webp`)
        
        // Index the file on the database
        await addPhotoToIndex(locationId, imageId)
    } catch (error) {
        console.error(error) // The error handler middleware does not log ApiExceptions by default
        throw new ApiException(500, "IMAGE_PROCESSING_FAILURE", "Failed to process image")
    }
}