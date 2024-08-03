const express = require("express");
const router = express.Router();

//prefix router User
const content = require("./content");
router.use("/", content);

//prefix router Dev
const dev = require("./dev");
router.use("/dev", dev);

module.exports = router;
