const { response } = require("express");
const fetch = require("node-fetch");

exports.oneCategory = async (id) => {
  const url = `${process.env.SERVICE_SETTING}/api/v1/setting/category/one/${id}`;

  try {
    const rawResponse = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
    });
    const response = await rawResponse.json();
    if (response.success) {
      return response;
    }
  } catch (err) {
    console.log("err", err);
  }
};

exports.notification = async (
  notificationType,
  recipient,
  sender,
  relation,
  relationModel
) => {
  const url = `${process.env.SERVICE_NOTIFICATION}/api/v1/notification/create`;

  try {
    const rawResponse = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notificationType,
        recipient,
        sender,
        relation,
        relationModel,
      }),
    });
    const response = await rawResponse.json();

    if (response.success) {
      console.log("success");
    }
  } catch (error) {
    console.log("error", error);
  }
};
exports.pushNotification = async (
  title,
  message,
  recipient,
  sender,
  navigate
) => {
  const url = `${process.env.SERVICE_NOTIFICATION}/api/v1/notification/pushnotification/createpushnotif`;

  try {
    const rawResponse = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        message,
        recipient,
        sender,
        navigate,
      }),
    });
    const response = await rawResponse.json();

    if (response.success) {
      // console.log("success");
    }
  } catch (error) {
    console.log("error", error);
  }
};
exports.deleteFileNews = async (
 paths
) => {
  const url = `${process.env.SERVICE_UPLOAD_ADMIN}/upload/interservice/removefile`;
  console.log(paths);
  try {
    const rawResponse = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paths
      }),
    });
    const response = await rawResponse.json();

    if (response.success) {
      return response
    }
  } catch (error) {
    console.log("error", error);
  }
};
exports.delteFileContent = async (
  paths
 ) => {
   const url = `${process.env.SERVICE_UPLOAD_APP}/upload/removefile`;
 
   try {
     const rawResponse = await fetch(url, {
       method: "POST",
       headers: {
         Accept: "*/*",
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         paths
       }),
     });
     const response = await rawResponse.json();
 
     if (response.success) {
       return response
     }
   } catch (error) {
     console.log("error", error);
   }
 };


 exports.addPoint = async (type,userId ,contentId,commentId) => {
  const url = `${process.env.SERVICE_AUTHENTICATION}/api/v1/auth/interservice/addpointcontent`;
  try {
    const rawResponse = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        userId,
        contentId,
        commentId
      }),
    });
    const response = await rawResponse.json();

    if (response.success) {
      console.log("success");
    }
  } catch (error) {
    console.log("error", error);
  }
};
