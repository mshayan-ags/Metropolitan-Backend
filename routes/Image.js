const { Image } = require("../models/Image");
const { saveImage } = require("../utils/saveImage");

async function SaveImageDB(image, rest, res) {
  try {
    const fleSaved = await saveImage(image, res);

    if (fleSaved?.filename) {
      const newImage = new Image({
        filename: fleSaved?.filename,
        mimetype: fleSaved?.mimetype,
        ...rest,
      });

      const saveImage = await newImage.save();

      return { file: saveImage };
    } else {
      return { Error: fleSaved?.Error };
    }
  } catch (error) {
    return { Error: error };
  }
}

module.exports = { SaveImageDB };
