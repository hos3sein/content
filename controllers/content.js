const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const Content = require("../models/Content");
const Comment = require("../models/Comment");
const BadWords = require("../models/BadWord");
const SearchHistory = require("../models/SearchHistory");
const { refresh } = require("../middleware/refresh");
const { maxReport } = require("../middleware/maxReportLength");

const Point = require("../models/Point");
const {
  deleteFileNews,
  delteFileContent,
  notification,
  addPoint
} = require("../utils/request");
const { deleteFile } = require("../utils/deleteFile");
exports.createContent = asyncHandler(async (req, res, next) => {
  
  let approve=true
  let badWords
  const findBadWords=await BadWords.find()
  if(findBadWords==0){
    badWords=[]
  }else{
    badWords=findBadWords[0].badWords
  }
  

  if(findBadWords==0){
    badWords=[]
  }

  if (req.body.title) {
    const { title, description, photo, video, voice, category } = req.body;
    // create post
    badWords.forEach(item=>{
      let titleCheck
      let descriptionCheck
      if(title){
        const lowerItem=item.toLowerCase()
        const lowerTitle=title.toLowerCase()
        titleCheck.toLowerCase()=lowerTitle.includes(lowerItem)
      }
      if(description){
        const lowerItem=item.toLowerCase()
        const descriptionlower=description.toLowerCase()
        descriptionCheck=descriptionlower.includes(lowerItem)
      }
      if(!titleCheck||!descriptionCheck){
        approve=false
      }
    })
    
    const content = await Content.create({
      title,
      description,
      photo,
      video,
      voice,
      category,
      approve
    });
    if (!content) {
      return next(new ErrorResponse(`create content failed`, 404));
    }
    res.status(200).json({
      success: true,
      data: content,
    });
  } else {
    console.log("fistPlace",approve);
    const obj = {
      _id: req.user._id,
      username: req.user.username,
      pictureProfile: req.user.pictureProfile,
    };

    if (!req.body.category) {
      return next(new ErrorResponse(`Category is required`, 401));
    }
    console.log("BAAADD",badWords);
    badWords.forEach(item=>{
      let textCheck
      if(req.body.input[0].text){
        const lowerItem=item.word.toLowerCase()
        const lowerText=req.body.input[0].text.toLowerCase()
        console.log(lowerItem);
        console.log(lowerText);
        textCheck=lowerText.includes(lowerItem)
        console.log(textCheck);
      }
      if(textCheck){
        approve=false
      }
    })
     
    const content = await Content.create({
      input: req.body.input,
      category: req.body.category,
      writer: obj,
      approve
    });

    if (!content) {
      return next(new ErrorResponse(`create content failed`, 404));
    }
    
    console.log("secondPlace",approve);
    const forum = await Content.find()
    .populate({
      path: "comments",
    })
    .sort({ createdAt: "desc" });
    await refresh(forum);

    res.status(200).json({
      success: true,
      data: content,
    });
  }
});

exports.createContentWeb = asyncHandler(async (req, res, next) => {
  const isAdmin = req.user.group.includes("admin");
  const isSuperAdmin = req.user.group.includes("superAdmin");
  if (!isAdmin && !isSuperAdmin) {
    return next(new ErrorResponse("you dont have access to this route", 401));
  }
  const { title, description, category, photo, video, voice, file } = req.body;

  if (!title) {
    return next(new ErrorResponse(`News must have a title`, 403));
  }
  if (!description) {
    return next(new ErrorResponse(`News must have a description`, 403));
  }

  if (!category) {
    return next(new ErrorResponse(`News must have a category `, 403));
  }

  const newContent = await Content.create({
    title,
    category,
    description,
    photo,
    video,
    voice,
    file,
  });

  res.status(201).json({ success: true, content: newContent });
});

exports.allMe = asyncHandler(async (req, res, next) => {
  // find all post that sender == me
  const content = await Content.find({ "writer._id": req.user._id }).sort({
    createdAt: -1,
  });

  if (!content) {
    return next(new ErrorResponse(`content me not found`, 404));
  }

  res.status(200).json({
    success: true,
    data: content,
  });
});

exports.editContent = asyncHandler(async (req, res, next) => {
  const { title, description, photo, video, voice } = req.body;

  const content = await Content.findById(req.params.id);

  if (!content) {
    return next(new ErrorResponse(`content not found`, 404));
  }

  if (!content.title) {
    await content.updateOne(req.body, {
      new: true,
      runValidators: true,
    });

    await refresh();

    res.status(200).json({
      success: true,
      data: forumNew,
    });
  } else {
    await content.updateOne(
      { title, description, photo, video, voice },
      {
        new: true,
        runValidators: true,
      }
    );

    await refresh(req.user._id);

    res.status(200).json({
      success: true,
      data: {},
    });
  }
});

exports.deleteContent = asyncHandler(async (req, res, next) => {
  // find post me
  const content = await Content.findById(req.params.id);

  if (!content) {
    return next(new ErrorResponse(`content not found`, 404));
  }

  if (!content.title) {
    if (content.writer._id.toString() === req.user._id.toString()) {
      if (process.env.TYPE_APP == "main") {
        const content = await Content.findById(req.params.id);
        const writerId = content.writer._id;
        const paths = [];

        if (!content) {
          return next(new ErrorResponse(`content not found`, 404));
        }
        if (content.photo.length > 0) {
          content.photo.forEach((element) => {
            paths.push(element);
          });
        }

        if (content.voice.length > 0) {
          content.voice.forEach((element) => {
            paths.push(element);
          });
        }
        if (content.file.length > 0) {
          content.file.forEach((element) => {
            paths.push(element);
          });
        }
        if (content.video.length > 0) {
          content.video.forEach((element) => {
            paths.push(element);
          });
        }

        if (paths.length > 0) {
          paths.forEach(async (item) => {
            const respond = await deleteFile(paths);
            if (!respond) {
              return next(new ErrorResponse("delete fail ", 500));
            }
          });
        }
        await Content.findByIdAndRemove(req.params.id);

        // remove comment
        await Comment.deleteMany({ contentId: req.params.id });

        await refresh(writerId);

        await addPoint("deleteForum",content.writer._id,content._id)

        return res.status(200).json({
          success: true,
        });
      }

      if (content.photo.length > 0) {
        content.photo.forEach((element) => {
          paths.push(element);
        });
      }

      if (content.voice.length > 0) {
        content.voice.forEach((element) => {
          paths.push(element);
        });
      }
      if (content.file.length > 0) {
        content.file.forEach((element) => {
          paths.push(element);
        });
      }
      if (content.video.length > 0) {
        content.video.forEach((element) => {
          paths.push(element);
        });
      }

      if (paths.length > 0) {
        const respond = await delteFileContent(paths);

        if (!respond.success) {
          return next(new ErrorResponse("delete fail ", 500));
        }
      }
      // remove post
      await Content.findByIdAndRemove(req.params.id);

      // remove comment
      await Comment.deleteMany({ contentId: req.params.id });

      await refresh(req.user._id);

      res.status(200).json({
        success: true,
      });
    } else {
      return next(
        new ErrorResponse(`You are not the author of this content`, 404)
      );
    }
  } else {
    if (content.photo.length > 0) {
      content.photo.forEach((element) => {
        paths.push(element);
      });
    }

    if (content.voice.length > 0) {
      content.voice.forEach((element) => {
        paths.push(element);
      });
    }
    if (content.file.length > 0) {
      content.file.forEach((element) => {
        paths.push(element);
      });
    }
    if (content.video.length > 0) {
      content.video.forEach((element) => {
        paths.push(element);
      });
    }

    if (paths.length > 0) {
      const respond = await delteFileContent(paths);

      if (!respond.success) {
        return next(new ErrorResponse("delete fail ", 500));
      }
    }
    await Content.findByIdAndRemove(req.params.id);

    await Comment.deleteMany({ contentId: req.params.id });

    await refresh(req.user._id);

    return res.status(200).json({
      success: true,
    });
  }
});

exports.confirmationContent = asyncHandler(async (req, res, next) => {
  // find post me
  const content = await Content.findById(req.params.id);

  if (!content) {
    return next(new ErrorResponse(`content not found`, 404));
  }

  if (req.body.confirm === "approve") {
    // console.log("11111111111");
    await content.updateOne({ approve: true });
  }

  if (req.body.confirm === "deActive") {
    // console.log("2222222222222");

    await content.updateOne({ approve: false });
  }

  if (req.body.confirm === "delete") {
    // console.log("333333333333");

    await Content.findByIdAndRemove(req.params.id);
    await Comment.deleteMany({ contentId: req.params.id });
  }

  res.status(200).json({
    success: true,
  });
});

exports.allLast = asyncHandler(async (req, res, next) => {
  const forum = await Content.find({
    approve:true
  })
    .populate({
      path: "comments",
      match:{isSuspend:false}
    })
    .sort({ createdAt: -1 })
    .limit(100);

  if (!forum) {
    return next(new ErrorResponse(`forums not found `, 404));
  }

  res.status(200).json({
    success: true,
    length: forum.length,
    data: forum,
  });
});

exports.allWithoutToken = asyncHandler(async (req, res, next) => {
  const forum = await Content.find({
    approve:true
  })
    .populate({
      path: "comments",
    })
    .sort({ createdAt: -1 })
    .limit(10);

  if (!forum) {
    return next(new ErrorResponse(`forums not found `, 404));
  }

  res.status(200).json({
    success: true,
    length: forum.length,
    data: forum,
  });
});

exports.all = asyncHandler(async (req, res, next) => {
  const find = await SearchHistory.find({ me: req.user._id });
  let newreplayArray = [];
  
  if (find.length == 0) {
    await SearchHistory.create({
      me: req.user._id,
    });
  }

  const forum = await Content.find({
    approve:true
  })
    .populate({
      path: "comments",
    })
    .sort({ createdAt: "desc" });
  if (!forum) {
    return next(new ErrorResponse(`forums not found `, 404));
  }

  // const newForum= forum.forEach(async(item)=>{
  //   item.comments.forEach(async(item)=>{
  //     // newreplayArray.push(item.replay)
  //     if(item.replay.length!==0){
  //       item.replay.forEach(async(element)=>{
  //         newreplayArray.push(element.replayId);
  //       })
  //     }
  //   })
  // })
  // const replays= await findReplayFunction(newreplayArray)
  res.status(200).json({
    success: true,
    length: forum.length,
    data: forum,
  });
});

exports.allByCategory = asyncHandler(async (req, res, next) => {
  // find post by category id
  const post = await Content.find({ "category._id": req.params.id });

  if (!post) {
    return next(new ErrorResponse(`post not found`, 404));
  }

  res.status(200).json({
    success: true,
    data: post,
  });
});
exports.activeDeactive = asyncHandler(async (req, res, next) => {
  const isAdmin = req.user.group.includes("admin");
  const isSuperAdmin = req.user.group.includes("superAdmin");
  if (!isAdmin && !isSuperAdmin) {
    return next(new ErrorResponse("you dont have access to this route", 401));
  }
  const content = await Content.findById(req.params.id);

  const approve = content.approve;

  content.approve = !approve;

  await content.save();

  await refresh()

  return res.status(200).json({
    success: true,
    data: {},
  });
});

exports.search = asyncHandler(async (req, res, next) => {
  const findHistory = await SearchHistory.find({ me: req.user._id });

  if (findHistory.length) {
    if (findHistory[0].history.length == 50) {
      let newHistory;
      newHistory = await findHistory[0].history.shift();
      newHistory = await findHistory[0].history.push(req.params.word);

      newHistory = await findHistory[0].history;
      await findHistory[0].updateOne({
        history: newHistory,
      });
    } else {
      await findHistory[0].updateOne({
        $addToSet: { history: req.params.word },
      });
    }
  }

  if (findHistory.length == 0) {
    await SearchHistory.create({
      history: req.params.word,
      me: req.user._id,
    });
  }

  // search in posts
  const allPost = await Content.find({
    $or: [
      { description: { $regex: ".*" + req.params.word + ".*", $options: "i" } },
      { title: { $regex: ".*" + req.params.word + ".*", $options: "i" } },
      {
        "input.text": { $regex: ".*" + req.params.word + ".*", $options: "i" },
      },
    ],
  });

  await res.status(200).json({
    success: true,
    data: allPost,
  });
});

exports.searchHistoryMe = asyncHandler(async (req, res, next) => {
  const me = await SearchHistory.findOne({ me: req.user._id });

  const rev = me.history.reverse();
  const newRev = rev.slice(0, 5);

  return res.status(200).json({
    success: true,
    data: newRev,
  });
});

// two
exports.addComment = asyncHandler(async (req, res, next) => {
  let isSuspend=false
  let badWords
  const { text, contentId, responseTo } = req.body;
  
  const findBadWords=await BadWords.find()
  if(findBadWords==0){
    badWords=[]
  }else{
    badWords=findBadWords[0].badWords
  }

   
  badWords.forEach(item=>{
    let textCheck
    const lowerText=req.body.input.text.toLowerCase()
    const lowerItem=item.word.toLowerCase()
    if(req.body.input.text)
    {textCheck=lowerText.includes(lowerItem)
    }
    if(!textCheck){
      isSuspend=true
    }
  })


  if (!text) {
    return next(new ErrorResponse(`Please add a text`, 404));
  }
  if (!responseTo) {
    const content = await Content.findById(contentId);
    if (!content) {
      return next(new ErrorResponse("content not found", 404));
    }
    
    const writer = {
      _id: req.user._id,
      username: req.user.username,
      pictureProfile: req.pictureProfile,
    };

    const newComment = await Comment.create({
      text,
      writer,
      contentId,
      isSuspend
    });

    await content.updateOne({
      $addToSet: { comments: newComment._id },
      commentLength: content.comments.length + 1,
    });

    await refresh(req.user._id);
    return res.status(201).json({
      success: true,
    });
  }

  const comment = await Comment.findOne({
    $and: [{ contentId: contentId }, { _id: responseTo }],
  });

  if (!comment) {
    return next(new ErrorResponse("comment not found", 404));
  }

  const writer = {
    _id: req.user._id,
    username: req.user.username,
    pictureProfile: req.pictureProfile,
  };

  const replay = {
    _id: responseTo,
    writerResponseToId: comment.writer._id,
    username: comment.writer.username,
    pictureProfile: comment.writer.pictureProfile,
  };

  const newComment = await Comment.create({
    writer,
    responseTo: replay,
    responseTo,
    text,
    isSuspend
  });

  const dataReplayWriter = {
    replayWriter: req.user._id,
    replayId: newComment._id,
    username: req.user.username,
    pictureProfile: req.user.pictureProfile,
    createAt: Date.now(),
    text: text,
  };

  await comment.updateOne({
    $push: { replay: dataReplayWriter },
    replayLength: comment.replay.length + 1,
  });

  await refresh(req.user._id);

  await addPoint("comment",comment.writer._id,comment.contentId,comment._id)
  // await refresh(req.user._id);

  res.status(201).json({
    success: true,
  });

  // // in body

  // const { text, contentId, responseTo } = newData;

  // if (!text) {
  //   return next(new ErrorResponse(`Please add a text`, 404));
  // }

  // const obj = {
  //   _id: req.user._id,
  //   username: req.user.username,
  //   pictureProfile: req.user.pictureProfile,
  // };

  // // replay to comment
  // if (responseTo) {
  //   const rep = await Comment.findById(responseTo);
  //   const content = await Content.findById(contentId);

  //   const writerId = content.writer._id.valueOf();

  //   if (!rep.replayLength) {
  //     await rep.updateOne(
  //       {
  //         replayLength: rep.replay.length,
  //       },
  //       { new: true, strict: false }
  //     );

  //     await content.updateOne(
  //       {
  //         commentLength: content.comments.length,
  //       },
  //       { new: true, strict: false }
  //     );
  //   }
  //   const replay = {
  //     _id: responseTo,
  //     writerResponseToId: rep.writer._id,
  //     username: rep.writer.username,
  //     pictureProfile: rep.writer.pictureProfile,
  //   };

  //   // create comment to comment
  //   const comment = await Comment.create({
  //     writer: obj,
  //     responseTo: replay,
  //     contentId,
  //     text,
  //   });

  //   const dataReplayWriter = {
  //     replayWriter: req.user._id,
  //     replayId: comment._id,
  //   };

  //   await rep.updateOne(
  //     {
  //       $push: { replay: dataReplayWriter },
  //       replayLength: rep.replay.length + 1,
  //     },
  //     { new: true, strict: false }
  //   );

  //   await content.updateOne(
  //     {
  //       $addToSet: { comments: comment._id },
  //       commentLength: content.comments.length + 1,
  //     },
  //     { new: true, strict: false }
  //   );

  //   if (content.input.length !== 0) {
  //     const recipient = {
  //       _id: content.writer._id,
  //       username: content.writer.username,
  //       pictureProfile: content.writer.pictureProfile,
  //     };

  //     if (rep.writer._id.toString() == content.writer._id.toString()) {
  //       await notification("replay", recipient, obj, content._id, "Content");
  //     } else {
  //       const recipientReplay = {
  //         _id: rep.writer._id,
  //         username: rep.writer.username,
  //         pictureProfile: rep.writer.pictureProfile,
  //       };

  //       await notification("replay", recipient, obj, content._id, "Content");

  //       await notification(
  //         "replay",
  //         recipientReplay,
  //         obj,
  //         content._id,
  //         "Content"
  //       );
  //     }
  //   } else {
  //     const recipient = {
  //       _id: rep.writer._id,
  //       username: rep.writer.username,
  //       pictureProfile: rep.writer.pictureProfile,
  //     };
  //     await notification("replay", recipient, obj, content._id, "Content");
  //   }o

  //   await refresh(req.user._id);
  //   await addPoint("comment", writerId);

  //   return res.status(200).json({
  //     success: true,
  //     data: {},
  //   });
  // } else {
  //   const content = await Content.findById(contentId);

  //   if (!content.commentLength) {
  //     await content.updateOne(
  //       {
  //         commentLength: content.comments.length,
  //       },
  //       { new: true, strict: false }
  //     );
  //   }

  //   // create comment to post
  //   const comment = await Comment.create({
  //     writer: obj,
  //     contentId,
  //     text,
  //   });

  //   await content.updateOne(
  //     {
  //       $addToSet: { comments: comment._id },
  //       commentLength: content.comments.length + 1,
  //     },
  //     { new: true, strict: false }
  //   );

  //   if (content.input.length !== 0) {
  //     const recipient = {
  //       _id: content.writer._id,
  //       username: content.writer.username,
  //       pictureProfile: content.writer.pictureProfile,
  //     };
  //     await notification("comment", recipient, obj, content._id, "Content");
  //   }
  //   await refresh(req.user._id);

  //   await addPoint("comment", content.writer._id);

  //   res.status(200).json({
  //     success: true,
  //     data: {},
  //   });
});

exports.likeOrDisLike = asyncHandler(async (req, res, next) => {
  let isLiked = true;

  let writerId;
  // find post

  const existingPost = await Content.findById(req.params.id);

  console.log("logexistPost", existingPost);

  if (existingPost) {
    writerId = existingPost.writer._id.valueOf();
  }

  // find comment
  const existingComment = await Comment.findById(req.params.id);

  if (existingPost) {
    existingPost.like.find((e) => {
      if (e._id.toString() === req.user._id.toString()) {
        isLiked = false;
      }
    });
  }

  console.log("existLog", existingComment);

  if (existingComment) {
    existingComment.like.find((e) => {
      if (e._id.toString() === req.user._id.toString()) {
        isLiked = false;
      }
    });
  }

  const obj = {
    _id: req.user._id,
    username: req.user.username,
    pictureProfile: req.user.pictureProfile,
  };

  if (existingPost && isLiked) {
    if (!existingPost.likeLength) {
      await existingPost.updateOne(
        {
          likeLength: existingPost.like.length,
          commentLength: existingPost.comments.length,
        },
        { new: true, strict: false }
      );
    }

    // update forum
    await Content.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: { like: obj },
        likeLength: existingPost.like.length + 1,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (existingPost.input.length !== 0) {
      const recipient = {
        _id: existingPost.writer._id,
        username: existingPost.writer.username,
        pictureProfile: existingPost.writer.pictureProfile,
      };
      // await notification(
      //   "like post",
      //   recipient,
      //   obj,
      //   existingPost._id,
      //   "Content"
      // );
    }

    console.log("like");
    await addPoint("like", writerId);
  }

  if (existingPost && !isLiked) {
    if (!existingPost.likeLength) {
      await existingPost.updateOne(
        {
          likeLength: existingPost.like.length,
          commentLength: existingPost.comments.length,
        },
        { new: true, strict: false }
      );
    }
    // update forum
    await Content.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { like: { _id: req.user._id } },
        likeLength: existingPost.like.length - 1,
      },
      {
        new: true,
        runValidators: true,
      }
    );
  }

  if (existingComment && isLiked) {
    const recipient = {
      _id: existingComment.writer._id,
      username: existingComment.writer.username,
      pictureProfile: existingComment.writer.pictureProfile,
    };

    if (!existingComment.likeLength) {
      await existingComment.updateOne(
        {
          likeLength: existingComment.like.length,
          replayLength: existingComment.replay.length,
        },
        { new: true, strict: false }
      );
    }
    // update comment
    await Comment.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: { like: obj },
        likeLength: existingComment.like.length + 1,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // await notification(
    //   "like comment",
    //   recipient,
    //   obj,
    //   existingComment._id,
    //   "Content"
    // );
  }

  if (existingComment && !isLiked) {
    if (!existingComment.likeLength) {
      await existingComment.updateOne(
        {
          likeLength: existingComment.like.length,
          replayLength: existingComment.replay.length,
        },
        { new: true, strict: false }
      );
    }

    // update comment
    await Comment.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { like: { _id: req.user._id } },
        likeLength: existingComment.like.length - 1,
      },
      {
        new: true,
        runValidators: true,
      }
    );
  }

  await refresh(req.user._id);

  res.status(200).json({
    success: true,
    data: {},
  });
});

// ! bedone token & perm
exports.reportContent = asyncHandler(async (req, res, next) => {
  const content = await Content.findById(req.params.id);

  if (!content) {
    return next(new ErrorResponse(`content not found`, 404));
  }
  const max = await maxReport();

  if (max <= content.reportLength + 1) {
    // console.log("max>>>11111", max);
    await content.updateOne(
      {
        reportLength: content.reportLength + 1,
        isSuspend: true,
      },
      { new: true, strict: false }
    );
  } else {
    // console.log("max>>>222", max);

    await content.updateOne(
      {
        reportLength: content.reportLength + 1,
      },
      { new: true, strict: false }
    );
  }
  await addPoint("reportContent",content.writer._id,content._id)

  return res.status(200).json({
    success: true,
    data: content,
  });
});

// ! bedone token & perm
exports.reportComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(new ErrorResponse(`comment not found`, 404));
  }

  const max = await maxReport();

  if (max <= comment.reportLength + 1) {
    // console.log("max>>>11111", max);
    await comment.updateOne(
      {
        reportLength: comment.reportLength + 1,
        isSuspend: true,
      },
      { new: true, strict: false }
    );
  } else {
    // console.log("max>>>222", max);

    await comment.updateOne(
      {
        reportLength: comment.reportLength + 1,
      },
      { new: true, strict: false }
    );
  }
  await addPoint("reportComment",comment.writer._id,comment.contentId,comment._id)

  return res.status(200).json({
    success: true,
    data: comment,
  });
});
exports.updatePoints = asyncHandler(async (req, res, next) => {
  const { like, createForum, comment } = req.body;

  await Point.findByIdAndUpdate(req.params.id, {
    like,
    createForum,
    comment,
  });

  return res.status(200).json({
    success: true,
    data: {},
  });
});

exports.deleteContentAdmin = asyncHandler(async (req, res, next) => {
  // find post me
  const isAdmin = req.user.group.includes("admin");
  const isSuperAdmin = req.user.group.includes("superAdmin");
  if (!isAdmin && !isSuperAdmin) {
    return next(new ErrorResponse("you dont have access to this route", 401));
  }
  if (process.env.TYPE_APP == "main") {
    const content = await Content.findById(req.params.id);
    const writerId = content.writer._id;
    const paths = [];

    if (!content) {
      return next(new ErrorResponse(`content not found`, 404));
    }
    if (content.photo.length > 0) {
      content.photo.forEach((element) => {
        paths.push(element);
      });
    }

    if (content.voice.length > 0) {
      content.voice.forEach((element) => {
        paths.push(element);
      });
    }
    if (content.file.length > 0) {
      content.file.forEach((element) => {
        paths.push(element);
      });
    }
    if (content.video.length > 0) {
      content.video.forEach((element) => {
        paths.push(element);
      });
    }

    if (paths.length > 0) {
      paths.forEach(async (item) => {
        const respond = await deleteFile(paths);
        if (!respond) {
          return next(new ErrorResponse("delete fail ", 500));
        }
      });
    }
    await Content.findByIdAndRemove(req.params.id);

    // remove comment
    await Comment.deleteMany({ contentId: req.params.id });

    await refresh(writerId);

    res.status(200).json({
      success: true,
    });
  } else {
    const content = await Content.findById(req.params.id);

    const writerId = content.writer._id;
    const paths = [];

    if (!content) {
      return next(new ErrorResponse(`content not found`, 404));
    }
    if (content.photo.length > 0) {
      content.photo.forEach((element) => {
        paths.push(element);
      });
    }

    if (content.voice.length > 0) {
      content.voice.forEach((element) => {
        paths.push(element);
      });
    }
    if (content.file.length > 0) {
      content.file.forEach((element) => {
        paths.push(element);
      });
    }
    if (content.video.length > 0) {
      content.video.forEach((element) => {
        paths.push(element);
      });
    }

    if (paths.length > 0) {
      const respond = await delteFileContent(paths);

      if (!respond.success) {
        return next(new ErrorResponse("delete fail ", 500));
      }
    }

    if (!content.title) {
      // remove post
      await Content.findByIdAndRemove(req.params.id);

      // remove comment
      await Comment.deleteMany({ contentId: req.params.id });

      await refresh(writerId);

      res.status(200).json({
        success: true,
      });
    } else {
      await Content.findByIdAndRemove(req.params.id);

      await Comment.deleteMany({ contentId: req.params.id });

      await refresh(writerId);

      res.status(200).json({
        success: true,
      });
    }
  }
});
exports.deleteNewstAdmin = asyncHandler(async (req, res, next) => {
  // find post me

  const isAdmin = req.user.group.includes("admin");
  const isSuperAdmin = req.user.group.includes("superAdmin");
  if (!isAdmin && !isSuperAdmin) {
    return next(new ErrorResponse("you dont have access to this route", 401));
  }
  const content = await Content.findById(req.params.id);

  console.log(content);

  if (!content) {
    return next(new ErrorResponse(`content not found`, 404));
  }
  const writerId = content.writer._id;
  const paths = [];
  // const paths=[...content.photo,...content.video,...Content.voice,...content.file]
  if (content.photo.length > 0) {
    content.photo.forEach((element) => {
      paths.push(element);
    });
  }

  if (content.voice.length > 0) {
    content.voice.forEach((element) => {
      paths.push(element);
    });
  }
  if (content.file.length > 0) {
    content.file.forEach((element) => {
      paths.push(element);
    });
  }
  if (content.video.length > 0) {
    content.video.forEach((element) => {
      paths.push(element);
    });
  }

  if (paths.length > 0) {
    const respond = await deleteFileNews(paths);

    if (!respond.success) {
      return next(new ErrorResponse("delete fail ", 500));
    }
  }

  if (!content.title) {
    // remove post
    await Content.findByIdAndRemove(req.params.id);

    // remove comment
    await Comment.deleteMany({ contentId: req.params.id });

    await refresh(writerId);

    res.status(200).json({
      success: true,
    });
  } else {
    await Content.findByIdAndRemove(req.params.id);

    await Comment.deleteMany({ contentId: req.params.id });

    await refresh(writerId);

    res.status(200).json({
      success: true,
    });
  }
});

exports.likeContent = asyncHandler(async (req, res, next) => {

  let isLike = false;

  const contentId = req.params.id;

  const user = {
    _id: req.user._id,
    username: req.user.username,
    pictureProfile: req.user.pictureProfile,
  };

  const content = await Content.findById(contentId);

  if (!content) {
    return next(new ErrorResponse("Content Not Found", 404));
  }

  const likeArray = content.like; 
  
  

  likeArray.forEach((item) => {
    console.log(item);
    if (item._id==user._id) {
       isLike = true 
    }
  });
  if (isLike) {
    return next(new ErrorResponse("User Already Like This Content", 403));
  }
  likeArray.push(user);
  content.like = likeArray;
  content.likeLength = content.likeLength + 1;
  const likeLength=content.likeLength 
  await content.save();
  await refresh(user._id);
  const likeRes=!isLike
  await addPoint("like",content.writer._id,content._id)
  res.status(200).json({
    success: true,
    isLike:likeRes,
    likeLength
  });
});
exports.unLikeContent = asyncHandler(async (req, res, next) => {
  let isLike = false;

  const contentId = req.params.id;

  const user = {
    _id: req.user._id,
    username: req.user.username,
    pictureProfile: req.user.pictureProfile,
  };
  console.log(user);

  const content = await Content.findById(contentId);
  if (!content) {
    return next(new ErrorResponse("Content Not Found", 404));
  }
  const likeArray = content.like;
  likeArray.forEach((item) => {
    if (item._id == user._id) {
       console.log("isLickeCheck",(item._id == user._id));
       isLike = true;
    }
  });
  if (!isLike) {
    return next(new ErrorResponse("User Already UnLike This Content", 403));
  }
  
  const filterArray=likeArray.filter((item) => {
    return item._id.valueOf()!==user._id
  });
  content.like = filterArray;
  content.likeLength = content.likeLength - 1;
  const likeLength=content.likeLength 
  await content.save();

  await refresh(user._id);
  await addPoint("unlike",content.writer._id,content._id)

  const likeRes=!isLike
  res.status(200).json({
    success: true,
    isLike:likeRes,
    likeLength
  });
});
exports.likeComment = asyncHandler(async (req, res, next) => {
  let isLike = false;
  const commentId = req.params.id;
  const user = {
    _id: req.user._id,
    username: req.user.username,
    pictureProfile: req.user.pictureProfile,
  };
  const comment = await Comment.findById(commentId);
  if (!comment) {
    console.log("comment not found");
    return next(new ErrorResponse("Comment Not Found", 404));
  }
  const likeArray = comment.like;
  likeArray.forEach((item) => {
    if (item._id == user._id) {
      isLike = true;
    }
  });
  if (isLike) {
    return next(new ErrorResponse("User Already Like This Comment", 403));
  }
  likeArray.push(user);
  comment.like = likeArray;
  comment.likeLength = comment.likeLength + 1;
  const likeLength=comment.likeLength 
  await comment.save();
  await refresh(user._id);
  const likeRes=!isLike
  await addPoint("like",comment.writer._id,comment.contentId,comment._id)
  res.status(200).json({
    success: true,
    isLike:likeRes,
    likeLength
  });
});
exports.unLikeComment = asyncHandler(async (req, res, next) => {
  let isLike = false;
  
  const commentId = req.params.id;
  const user = {
    _id: req.user._id,
    username: req.user.username,
    pictureProfile: req.user.pictureProfile,
  };
  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next(new ErrorResponse("Comment Not Found", 404));
  }
  const likeArray = comment.like;
  likeArray.forEach((item) => {
    if (item._id == user._id) {
      isLike = true;
    }
  });
  if (!isLike) {
    return next(new ErrorResponse("User Already UnLike This Comment", 403));
  }
  const filterArray=likeArray.filter((item) => {
    return item._id.valueOf()!==user._id
  });
  comment.like =filterArray ;
  comment.likeLength = comment.likeLength - 1;
  const likeLength=comment.likeLength 
  await comment.save();
  await refresh(user._id);
  const likeRes=!isLike
  await addPoint("unlike",comment.writer._id,comment.contentId,comment._id)
  res.status(200).json({
    success: true,
    isLike:likeRes,
    likeLength
  });
});
exports.suspendTrue = asyncHandler(async (req, res, next) => {
  const comment=await Comment.findByIdAndUpdate(req.params.id,{
    isSuspend:true,
  })
  if(!comment.responseTo){
    console.log("section1");
    const responseComment=await Comment.findById(comment.responseTo._id)
    responseComment.replayLength=responseComment.replayLength-1
    await responseComment.save()
  }else{
    console.log("section2");
    const content=await Content.findById(comment.contentId)
    console.log(content);
    content.commentLength=content.commentLength-1
    await content.save()
  }
  if(comment.replay.length!=0){
    console.log("section3");
    console.log(comment.replay);
    await Comment.updateMany({
      "responseTo.":comment._id
    },{
      suspend:true
    })
  }
  const finalInfo=await Comment.findById(req.params.id)
  const finalInfoContent=await Content.findById(finalInfo.contentId)

  await refresh(req.params.id)

  res.status(200).json({
    success: true,
    finalInfo,
    finalInfoContent
  });
});
exports.suspendFalse = asyncHandler(async (req, res, next) => {
 
  const comment=await Comment.findByIdAndUpdate(req.params.id,{
    isSuspend:false,
  })
  if(!comment.responseTo){
    console.log("section1");
    const responseComment=await Comment.findById(comment.responseTo._id)
    responseComment.replayLength=responseComment.replayLength+1
    await responseComment.save()
  }else{
    console.log("section2");
    const content=await Content.findById(comment.contentId)
    content.commentLength=content.commentLength+1
    await content.save()
  }
  if(comment.replay.length!=0){
    console.log("section3");
    await Comment.updateMany({
      "responseTo._id":comment._id
    },{
      suspend:false
    })
  }

  await refresh(req.params.id)

  res.status(200).json({
    success: true,
  });
});

exports.getAllCommentForSuspend = asyncHandler(async (req, res, next) => {
  const forum = await Content.find()
    .populate({
      path: "comments",
    })
    .sort({ createdAt: -1 })
  if (!forum) {
    return next(new ErrorResponse(`forums not found `, 404));
  }

  res.status(200).json({
    success: true,
    length: forum.length,
    data: forum,
  });
})
exports.editBadWords = asyncHandler(async (req, res, next) => {
  const {array}=req.body
  const badWords=await BadWords.find()

  if(badWords.length!=0){
      await BadWords.findByIdAndUpdate(badWords[0]._id,{
      badWords:array
     })
  }
  else{
      await BadWords.create(array)
  }
  res.status(200).json({
    success: true,
    data:array
  });
})
exports.editBadWords = asyncHandler(async (req, res, next) => {
  const {badWord}=req.body
  const badWords=await BadWords.find()
  console.log("baswords",badWord);
  if(badWords.length!=0){
      await BadWords.findByIdAndUpdate(badWords[0]._id,{
      badWords:badWord
     })
  }
  else{
      await BadWords.create({
        badWords:badWord
      })
  }
  res.status(201).json({
    success: true,
    data:badWord
  });
})
exports.getBadWords = asyncHandler(async (req, res, next) => {
  // await BadWords.remove()
  // res.status(200).json({
  //   success:true
  // })
  const find=await BadWords.find()
  const badWords=find[0].badWords
  res.status(200).json({
    success: true,
    data:badWords
  });
})
