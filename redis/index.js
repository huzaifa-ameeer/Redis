import dotenv from "dotenv"
import express from "express"
import connectDb from "./src/config/db.js"
dotenv.config()

const app = express()

const port = process.env.PORT || 3000

app.listen(port, ()=>{
    connectDb()
    console.log(`Server running on ${port}`)
})