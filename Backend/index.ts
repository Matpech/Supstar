import Express from "express"
import bodyParser from "body-parser"
import { pool } from "./src/utils/db"

const PORT = 4000
const app = Express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

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

app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`)
})