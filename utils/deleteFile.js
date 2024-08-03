const OSS = require("ali-oss");

const store = new OSS({
  region: "oss-cn-shanghai",
  accessKeyId: "LTAI5tSQooLRB9eQXncVQ8wr",
  accessKeySecret: "nAUj9B0ov1CZn0I1DS6qRsP9uW26m2",
  bucket: "ashoss",
  secure: true,
});

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
