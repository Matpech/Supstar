import { Router } from "express";

const router = Router()

/**
 * The following endpoints need to be implemented :
 * - POST /               (create location)
 * - PATCH /:location_id  (update location)
 * - DELETE /:location_id (detele location)
 * - GET /                (search locations)
 * - GET /:location_id    (get one location)
 * 
 * Another child router for PL reviews will also need to be created :
 * - POST /:location_id/reviews              (publish review)
 * - PATCH /:location_id/reviews/:review_id  (update review)
 * - DELETE /:location_id/reviews/:review_id (delete review)
 * - GET /:location_id/reviews               (get all reviews)
 */

export default router