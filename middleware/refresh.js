const fetch = require("node-fetch");

exports.refresh = async (data) => {
  const url = `${process.env.SERVICE_REFRESH}/api/v1/refresh/callcontent`;
  // console.log(data);
  try {
    const rawResponse = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data }),
    });
    const response = await rawResponse.json();
      console.log("refreh",response)
  } catch (error) {
    console.log("error", error);
  } 
};
