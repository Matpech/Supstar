import { Router } from "express";
import PLLocationsRouter from "./personalListLocationsRouter"

const router = Router()

/**
 * Currently, the users router has no use outside of serving as an intermediary
 * router to access personal lists in a logical way.
 * 
 * This router may be expanded if we add profile pages to the application.
 */

router.use("/:user_id/locations", PLLocationsRouter)

export default router