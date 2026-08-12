import Express from "express"
import bodyParser from "body-parser"
import { pool } from "./src/utils/db"
import { errorHandler } from "./src/middlewares/errorHandler"
import { jwtMiddleware } from "./src/middlewares/jwtMiddleware"

import authRouter from "./src/routers/authRouter"

const PORT = 4000
const app = Express()

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(jwtMiddleware)

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

// Handle errors last
app.use(errorHandler)

// Run the API
app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`)
})