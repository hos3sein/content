const Group = require("../models/Group");
const Point = require("../models/Point");
const schedule = require("node-schedule");
const fetch = require("node-fetch");

// ! ino az samy beporsam
// az service setting data group va perm ro migiram va save mikonm
const checkUpdateGroup = async () => {
  let count = 0;
  const url = `${process.env.SERVICE_SETTING}/api/v1/setting/dev/allgroup`;
  // console.log("1111", count);
  let response;
  try {
    if (count == 0) {
      // console.log("2222", count);

      const rawResponse = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
      });
      response = await rawResponse.json();
    }

    if (response.success) {
      count++;
      // console.log("3333", count);

      for (let i = 0; i < response.data.length; i++) {
        const element = response.data[i];
        const find = await Group.findOne({ name: element.name });

        if (find) {
          await find.updateOne({
            name: element.name,
            permissions: element.permissions,
            autoApprove: element.autoApprove,
          });
        }

        if (!find) {
          await Group.create(element);
        }
      }
    }
  } catch (error) {
    console.log("error", error);
  }
};

// az service setting data point ro migiram va save mikonm
const checkUpdatePoint = async () => {
  let count = 0;
  const url = `${process.env.SERVICE_SETTING}/api/v1/setting/dev/allpoint`;
    
  // console.log("its work nice");
  let response;
  try {
    if (count == 0) {
      const rawResponse = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
      });
      response = await rawResponse.json();
    }

    if (response.success) {
      count++;
      const find = await Point.find();

      if (find.length) {
        await find[0].updateOne({
          like: response.data.like,
          comment: response.data.comment,
          createForum: response.data.createForum,
        });
      }

      if (!find.length) {
        await Point.create(response.data);
      }
    }
  } catch (error) {
    console.log("error", error);
  }
};

exports.checkGroup = async (req, res, next) => {
  let count = 0;
  schedule.scheduleJob(`* 30 * * * *`, function () {
    if (count == 0) {
      checkUpdateGroup();
      count++;
    }
  });
};

exports.checkPoint = async (req, res, next) => {
  let count = 0;
  schedule.scheduleJob(`* 30 * * * *`, function () {
    if (count == 0) {
      checkUpdatePoint();
      count++;
    }
  });
};

