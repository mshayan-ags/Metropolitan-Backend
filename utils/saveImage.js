const fs = require("fs");
const path = require("path");
const { CheckAllRequiredFieldsAvailaible } = require("./functions");
const { default: axios } = require("axios");

async function saveImage(image, res) {
  try {
    const imageData = image;
    const Check = await CheckAllRequiredFieldsAvailaible(
      imageData,
      ["name", "data", "type"],
      res
    );
    if (Check) {
      return { Error: "There Was Some Issue" };
    }
    const filename = `${Math.random().toString(32).substr(7, 5)}-${
      imageData?.name
    }`;
    const imagePath = path.join(__dirname, "../uploads", filename);

    const base64Data = imageData?.data.split("base64,")[1];
    fs.writeFileSync(imagePath, base64Data, "base64");
    return { filename: filename, mimetype: imageData?.type };
  } catch (error) {
    console.error("Error uploading image:", error);
    return { Error: "There Was Some Issue" };
  }
}

async function saveImageCloud(image, res) {
  try {
    const Check = await CheckAllRequiredFieldsAvailaible(
      image,
      ["name", "data", "type"],
      res
    );
    if (Check) {
      return { Error: "There Was Some Issue" };
    }
    const Request = await axios.post(
      "http://motiwalabuilders.online/SaveImage",
      { image: image }
    );
    console.log(Request?.data);
    if (Request?.status == 200 && Request?.data?.data) {
      return Request?.data?.data;
    } else {
      return { Error: Request?.data?.message };
    }
  } catch (error) {
    return { Error: "There Was Some Issue" };
  }
}

module.exports = { saveImage, saveImageCloud };
