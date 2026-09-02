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
  await redis.del("users:all");
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

//send otp

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redis.set(`otp:${email}`, otp, "EX", 30);
  res.json(otp);
});

//verify otp

app.post("/verify-otp", async (req, res) => {
  const { otp, email } = req.body;
  const cachedOtp = await redis.get(`otp:${email}`);
  if (!cachedOtp) {
    return res.json({
      message: "Otp not found or is expired",
    });
  }
  if (cachedOtp != otp) {
    return res.json({
      message: "Invalid otp",
    });
  }

  res.json({
    message: "Otp verified",
  });
});

app.listen(port, () => {
  connectDb();
  console.log(`Server running on ${port}`);
});
