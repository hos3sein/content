const OSS = require("ali-oss");

// 
exports.deleteFile = async (filePath) => {
  const path = filePath.split("ashoss.oss-cn-shanghai.aliyuncs.com")[1];
  await store
    .delete(path)
    .then((res) => {
      return true;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};
