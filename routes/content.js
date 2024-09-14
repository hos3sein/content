const express = require("express");

const C = require("../controllers/content");
const responseTime = require("response-time");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();
router.use(
  responseTime((req, res, time) => {
    const seconds = time / 1000.0;

    // console.log("responce time", seconds);
  })
);
// POST
router.post("/createcontent", protect, C.createContent);
router.post("/createcontentweb",protect, C.createContentWeb);
router.post("/editcontent/:id", protect, C.editContent);
router.post("/addcomment",protect, C.addComment);
router.post("/updatepoints/:id",C.updatePoints)


// GET
router.get("/alllast", protect, C.allLast);

router.get("/allwithouttoken", C.allWithoutToken);

router.get("/allcontents", protect ,C.adminAll);

router.get("/all", protect, C.all);

router.get("/all", protect, C.all);

router.get("/allme", protect, C.allMe);

router.get("/delcontent/:id", protect, C.deleteContent);

router.get("/delnewsadmin/:id", protect, C.deleteNewstAdmin);

router.get("/delcontentadmin/:id", protect, C.deleteContentAdmin);

// router.get("/like/:id", protect, C.likeOrDisLike);
router.post("/confirmationContent/:id", C.confirmationContent);

router.get("/allbycategory/:id", protect, C.allByCategory);

router.get("/search/:word", protect, C.search);

router.get("/historyme", protect, C.searchHistoryMe);

router.get("/reportcontent/:id", C.reportContent);

router.get("/reportcomment/:id", C.reportComment);

router.post("/updateNews/:newsId" , protect , C.editAdminNews)


router.get("/activedeactive/:id",protect,C.activeDeactive)

//?likeSection

router.get("/likecontent/:id",protect,C.likeContent)
router.get("/dislikecontent/:id",protect,C.unLikeContent)
router.get("/likecomment/:id",protect,C.likeComment)
router.get("/dislikecomment/:id",protect,C.unLikeComment)


router.get("/commentsuspendtrue/:id",protect,C.suspendTrue)
router.get("/commentsuspendfalse/:id",protect,C.suspendFalse)

router.get("/allwithouttokenadmin",protect,C.getAllCommentForSuspend)

router.post("/editbadwords",protect,C.editBadWords)

router.get("/getbadwords",protect,C.getBadWords)

module.exports = router;
