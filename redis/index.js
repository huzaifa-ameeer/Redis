import dotenv from "dotenv";
import express from "express";
import connectDb from "./src/config/db.js";
import userModel from "./src/models/user.mode.js";
dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

//post request

app.post("/create", async (req, res) => {
  const { name, email, password } = req.body;
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
  const user = await userModel.find({});
  res.json({
    message: "All users fetched",
    user,
  });
});

app.listen(port, () => {
  connectDb();
  console.log(`Server running on ${port}`);
});
