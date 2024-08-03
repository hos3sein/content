const fetch = require("node-fetch");

exports.notification = async (
  notificationType,
  message,
  recipient,
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
        message,
        recipient,
        relation,
        relationModel,
      }),
    });
    const response = await rawResponse.json();

    // return console.log("response");

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