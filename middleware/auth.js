const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const Group = require("../models/Group");
const _ = require("lodash");

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(" ")[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return next(
        new ErrorResponse("Not authorized to access this route", 401)
      );
    }

    req.user = decoded;
    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
});

// Grant access to specific roles
exports.authorize = asyncHandler(async (req, res, next) => {
  const str = req.originalUrl.substring(8);
  // console.log("str>>>>", str);
  const result = str.match(/\w+/g);

  let equal = false;

  for (let i = 0; i < req.user.group.length; i++) {
    const element = req.user.group[i];

    const group = await Group.findOne({ name: element });

    for (let k = 0; k < group.permissions.length; k++) {
      let count = 1;
      const elem = group.permissions[k];

      let e;
      let eq;

      if (elem?.prefixName == "") {
        e = [elem.serviceName, elem.funcName];
        eq = await _.isEqual(result.slice(0, 2), e);
      } else {
        e = [elem.serviceName, elem?.prefixName, elem.funcName];
        eq = await _.isEqual(result.slice(0, 3), e);
      }

      if (eq) {
        equal = true;
      }

      count++;

      // console.log("element", eq);
    }
  }

  if (equal) {
    // console.log("NEXT");
    next();
  } else {
    return next(
      new ErrorResponse(
        "Not authorized to access this route for access to route should request for permission",
        401
      )
    );
  }
});
