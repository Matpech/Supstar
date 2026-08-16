import { Router } from "express";
import { requireLoggedIn } from "../middlewares/authMiddlewares";
import { InvalidTokenException, ValidationException } from "../types/errors";
import validate from "../utils/validation/validator";
import { reviewCreateSchema, reviewUpdateSchema } from "../utils/validation/schemas/reviewSchemas";
import { numericIdSchema } from "../utils/validation/schemas/generalSchemas";
import { verifyIdMatch } from "../repositories/locationsRepo";
import { deleteReview, getReviewsFromLocation, publishReview, updateReview } from "../repositories/reviewsRepo";
import type { ReviewUpdateParams } from "../types/reviews";

const router = Router({ mergeParams: true })

router.post("/", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const data = validate(req, reviewCreateSchema)
    const user_id = numericIdSchema.validate(parseInt(req.params.user_id as string))
    const location_id = numericIdSchema.validate(parseInt(req.params.location_id as string))
    if (!user_id.value || !location_id.value) {
        throw new ValidationException("Invalid numeric ID")
    }
    await verifyIdMatch(location_id.value, undefined, user_id.value)

    const review = await publishReview({
        location_id: location_id.value,
        reviewer_id: req.user.id,
        ...data
    })
    return res.status(201).json(review)
})

router.patch("/:review_id", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const data: ReviewUpdateParams = validate(req, reviewUpdateSchema)
    const review_id = numericIdSchema.validate(parseInt(req.params.review_id as string))
    if (!review_id.value) {
        throw new ValidationException("Invalid numeric ID")
    }

    const updated = await updateReview(data, review_id.value, req.user.id)
    return res.json(updated)
})

router.delete("/:review_id", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const review_id = numericIdSchema.validate(parseInt(req.params.review_id as string))
    if (!review_id.value) {
        throw new ValidationException("Invalid numeric ID")
    }

    await deleteReview(review_id.value, req.user.id)
    return res.sendStatus(204)
})

router.get("/", requireLoggedIn, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const user_id = numericIdSchema.validate(parseInt(req.params.user_id as string))
    const location_id = numericIdSchema.validate(parseInt(req.params.location_id as string))
    if (!user_id.value || !location_id.value) {
        throw new ValidationException("Invalid numeric ID")
    }
    await verifyIdMatch(location_id.value, undefined, user_id.value)

    const reviews = await getReviewsFromLocation(location_id.value)
    return res.json(reviews)
})

export default router