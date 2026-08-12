import Express from "express"
import bodyParser from "body-parser"

const PORT = 4000
const app = Express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get("/test", (req, res) => {
    res.send("API is running")
})

app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`)
})