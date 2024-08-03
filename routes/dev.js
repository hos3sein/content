const express = require("express");

const C = require("../controllers/dev");

const router = express.Router();

// POST
router.post("/createperm", C.createPerm);
router.post("/upnamecat", C.upNameCategoryInContent);
router.post("/remcontentbycat", C.remContentByCat);

router.get("/dellall", C.delAll);
router.get("/allpoint", C.allPoint);
router.get("/addcat", C.addCategory);
router.get("/setlikezero", C.setLikeZero);

router.get("/all", C.allContent);

router.get("/sms/:phone/:code", C.sms);

module.exports = router;
