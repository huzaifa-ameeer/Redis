import dotenv from "dotenv";
import express from "express";
import connectDb from "./src/config/db.js";
import userModel from "./src/models/user.mode.js";
import Redis from "ioredis";
dotenv.config();

const app = express();

const redis = new Redis(process.env.REDIS_URI);

app.use(express.json());

const port = process.env.PORT || 3000;

//post request

app.post("/create", async (req, res) => {
  const { name, email, password } = req.body;
  await redis.del("users:all")
  const user = await userModel.create({
    name,
    email,
    password,
  });
  res.json({
    message: "User created",
    user,
  });
});

//get request

app.get("/get", async (req, res) => {
  const cached = await redis.get("users:all");
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  const user = await userModel.find({});
  await redis.set("users:all", JSON.stringify(user));
  res.json({
    message: "All users fetched",
    user,
  });
});

app.listen(port, () => {
  connectDb();
  console.log(`Server running on ${port}`);
});
