const fetch = require("node-fetch");

exports.maxReport = async (id) => {
  const url = `${process.env.SERVICE_SETTING}/api/v1/setting/variable/all`;
  try {
    const rawResponse = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
    });
    const response = await rawResponse.json();
    let max;
    response.data.map((item) => {
      if (item.name == "maxReport") {
        max = item.amount;
      }
    });

    return max;

    // console.log("response", max);
  } catch (error) {
    console.log("error", error);
  }
};
