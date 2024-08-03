const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const fetch = require("node-fetch");
const Comment = require("../models/Comment");
const Content = require("../models/Content");
const SearchHistory = require("../models/SearchHistory");
const Point = require("../models/Point");

// create perm haye service content
exports.createPerm = asyncHandler(async (req, res, next) => {
  const { data } = req.body;
  try {
    console.log(">>req.body.data");
    const urll = `${process.env.SERVICE_SETTING}/api/v1/setting/dev/createperm`;
    const rawResponse = await fetch(urll, {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const response = await rawResponse.json();

    if (response.success) {
      res.status(200).json({
        success: true,
        data: {},
      });
    }
  } catch (err) {
    console.log("err", err);
  }
});

// baraye pak kardan database content
exports.delAll = asyncHandler(async (req, res, next) => {
  // await SearchHistory.remove();
  await Content.remove();
  // await Comment.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// data service point ke zakhire shode ro inja get all migirim
exports.allPoint = asyncHandler(async (req, res, next) => {
  const all = await Point.find();

  res.status(200).json({
    success: true,
    dta: all,
  });
});

exports.upNameCategoryInContent = asyncHandler(async (req, res, next) => {
  console.log("req.body", req.body);
  const all = await Content.find({ category: req.body.current });

  for (let i = 0; i < all.length; i++) {
    const element = all[i];
    await element.updateOne({
      category: req.body.new,
    });
    console.log("element", element);
  }

  res.status(200).json({
    success: true,
    data: all,
  });
});

exports.remContentByCat = asyncHandler(async (req, res, next) => {
  console.log("req.body", req.body);
  const all = await Content.find({ category: req.body.category });

  await Content.deleteMany({ category: req.body.category });

  res.status(200).json({
    success: true,
    data: {},
  });
});

exports.addCategory = asyncHandler(async (req, res, next) => {
  // console.log("req.body", req.body);
  const all = await Content.find();

  for (let i = 0; i < all.length; i++) {
    const element = all[i];
    if (!element.category) {
      console.log("element", element);
      await element.updateOne(
        {
          category: "category 0",
        },
        { new: true, strict: false }
      );
    }
  }

  // await Content.deleteMany({ category: req.body.category });

  res.status(200).json({
    success: true,
    data: {},
  });
});

exports.allContent = asyncHandler(async (req, res, next) => {
  const all = await Content.find();
  // all.forEach(async(item)=>{
  //       await Content.findByIdAndRemove(item._id)
  // })
  res.status(200).json({
    success: true,
    data:all
  });
});
exports.setLikeZero = asyncHandler(async (req, res, next) => {
  const all = await Content.find();
   
  all.forEach(async(item)=>{
    await Content.findByIdAndUpdate(item._id,{
      likeLength:0,
      like:[]
    })
  })

  res.status(200).json({
    success: true,
  });
});
exports.sms = asyncHandler(async (req, res, next) => {
const phone=req.params.phone
const code=req.params.code


  try {
    const url = `http://185.110.189.251:8002/api/v1/auth/dev/sms/${phone}/${code}`;

    const rawResponse = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
    });
    const response = await rawResponse.json();
    return response
    
  } catch (err) {
    console.log("err>>>", err);
  }


  res.status(200).json({
    success: true,
    response
  });
});