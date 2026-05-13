const express = require("express");
const mongoose = require("mongoose");

const app = express();

const PORT = process.env.PORT;
const DB = process.env.MONGO_URI;
const APP_NAME = process.env.APP_NAME;

mongoose.connect(DB)
  .then(() => console.log("DB Connected"))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send(`${APP_NAME} running on port ${PORT}`);
});

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});