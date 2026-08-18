import Express from "express"
import bodyParser from "body-parser"
import { pool } from "./src/utils/db"
import { errorHandler } from "./src/middlewares/errorHandler"
import { jwtMiddleware } from "./src/middlewares/jwtMiddleware"
import cors from "cors"

import authRouter from "./src/routers/authRouter"
import selfRouter from "./src/routers/selfRouter"
import sharedListsRouter from "./src/routers/sharedListsRouter"
import usersRouter from "./src/routers/usersRouter"

const PORT = 4000
const app = Express()

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(jwtMiddleware)
app.use(cors({
    origin: [
        "http://localhost:5173"
        // Production will be added later
    ]
}))

// Test/Healthcheck endpoint
app.get("/test", async (req, res) => {
    try {
        pool.query("SELECT 1")
        return res.json({
            api: "OK",
            database: "OK"
        })
    } catch (error) {
        return res.json({
            api: "OK",
            database: "ERROR",
            err: error
        })
    }
})

// Routers
app.use("/auth", authRouter)
app.use("/self", selfRouter)
app.use("/lists", sharedListsRouter)
app.use("/users", usersRouter)

// Handle errors last
app.use(errorHandler)

// Run the API
app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`)
})