const fs = require("fs");
const path = require("path");
const { CheckAllRequiredFieldsAvailaible } = require("./functions");

async function saveImage(image, res) {
  try {
    const imageData = JSON.parse(image);
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
    }.${imageData?.type}`;
    const imagePath = path.join(__dirname, "../uploads", filename);

    fs.writeFileSync(imagePath, imageData?.data, "base64");
    return { filename: filename, mimetype: imageData?.type };
  } catch (error) {
    console.error("Error uploading image:", error);
    return { Error: "There Was Some Issue" };
  }
}

module.exports = { saveImage };
