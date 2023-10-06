const { Image } = require("../models/Image");
const { saveImage } = require("../utils/saveImage");
const { Router } = require("express");
const { existsSync } = require("fs");

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

const router = Router();

router.get("/GetImage/:filename", async (req, res) => {
  try {
    const Image = `./uploads/${req?.params?.filename}`;
    if (existsSync(Image)) return res.download(Image);
    else res.status(400).json({ status: 400, message: "Image Not Found ... " });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, message: error });
  }
});

router.get("/GetImageById/:id", async (req, res) => {
  try {
    const FindImage = await Image.findOne({ _id: req.params.id });
    const Img = `./uploads/${FindImage?.filename}`;
    if (existsSync(Img)) return res.download(Img);
    else res.status(400).json({ status: 400, message: "Image Not Found ... " });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, message: error });
  }
});

module.exports = { SaveImageDB, GetImage: router };
