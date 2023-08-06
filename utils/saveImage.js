const { existsSync, mkdirSync, unlinkSync, createWriteStream } = require("fs");
const path = require("path");

async function saveImage(image) {
  return await new Promise((resolve, reject) => {
    try {
      image
        .then(({ createReadStream, ...rest }) => {
          const filename = `${Math.random().toString(32).substr(7, 5)}-${
            rest.filename
          }`;
          // checking whether the uploads folder is exists
          if (!existsSync("./uploads")) mkdirSync("./uploads");

          rest.filename = filename;

          createReadStream()
            .pipe(createWriteStream(path.join("./uploads", filename)))
            .on("error", (error) => reject(new Error(error.message)))
            .on("finish", () => resolve(rest));
        })
        .catch((error) => console.error(error));
    } catch (error) {
      console.error("catch error", error);
    }
  });
}

module.exports = saveImage;
