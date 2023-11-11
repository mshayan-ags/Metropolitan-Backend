const ComplainCategory = require("../../models/Complain/ComplainCategory");
const { getAdminId } = require("../../utils/AuthCheck");
const { Router } = require("express");
const { CheckAllRequiredFieldsAvailaible } = require("../../utils/functions");
const { connectToDB } = require("../../Middlewares/Db");
const { default: mongoose } = require("mongoose");
const { SaveImageDB } = require("../Image");

const router = Router();

router.post("/Create-ComplainCategory", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getAdminId(req);
    if (id) {
      const Credentials = req.body;

      const Check = await CheckAllRequiredFieldsAvailaible(
        Credentials,
        ["title"],
        res
      );
      if (Check) {
        return;
      }
      const Obj = {
        title: Credentials?.title,
      };
      const newComplainCategory = new ComplainCategory(Obj);

      if (Credentials?.Icon) {
        const image = await SaveImageDB(
          Credentials?.Icon,
          {
            ComplainCategory: new mongoose.Types.ObjectId(
              newComplainCategory?._id
            ),
          },
          res
        );

        if (image?.file?._id) {
          newComplainCategory.Icon = new mongoose.Types.ObjectId(
            image?.file?._id
          );
        } else {
          res.status(500).json({ status: 500, message: image?.Error });
        }
      }

      await newComplainCategory.save();

      res.status(200).json({
        status: 200,
        id: newComplainCategory?._id,
        message: "Complain Category Created in Succesfully",
      });
    } else {
      res.status(401).json({ status: 401, message: message });
    }
  } catch (error) {
    console.log(error);
    if (error?.code == 11000) {
      res.status(500).json({
        status: 500,
        message: `Please Change your ${
          Object.keys(error?.keyValue)[0]
        } as it's not unique`,
      });
    } else {
      res.status(500).json({ status: 500, message: error });
    }
  }
});

router.post("/Update-ComplainCategory", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getAdminId(req);
    if (id) {
      const Credentials = req.body;

      const Check = await CheckAllRequiredFieldsAvailaible(
        Credentials,
        ["id"],
        res
      );
      if (Check) {
        return;
      }

      const searchComplainCategory = await ComplainCategory.findOne({
        _id: Credentials.id,
      });

      if (searchComplainCategory?._id) {
        if (Credentials?.Icon) {
          if (Credentials?.Icon?.name) {
            const image = await SaveImageDB(
              Credentials?.Icon,
              {
                ComplainCategory: new mongoose.Types.ObjectId(
                  searchComplainCategory?._id
                ),
              },
              res
            );
            if (image?.file?._id) {
              Credentials.savedIcon = new mongoose.Types.ObjectId(
                image?.file?._id
              );
            } else {
              res.status(500).json({ status: 500, message: image?.Error });
            }
          }
        }

        await ComplainCategory.updateOne(
          { _id: searchComplainCategory?._id },
          {
            title: Credentials?.title
              ? Credentials?.title
              : searchComplainCategory?.title,
            Icon: Credentials?.savedIcon
              ? Credentials?.savedIcon
              : searchComplainCategory?.Icon,
          },
          {
            new: false,
          }
        )
          .then((docs) => {
            res.status(200).json({
              status: 200,
              message: "Your ComplainCategory has been Updated",
            });
          })
          .catch((error) => {
            console.log(error);
            res.status(500).json({ status: 500, message: error });
          });
      } else {
        res.status(500).json({
          status: 500,
          message: "Service Not Found Please Check your Data",
        });
      }
    } else {
      res.status(401).json({ status: 401, message: message });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, message: error });
  }
});

router.get("/ComplainCategoryInfo/:id", async (req, res) => {
  try {
    connectToDB();
    const Check = await CheckAllRequiredFieldsAvailaible(
      req?.params,
      ["id"],
      res
    );
    if (Check) {
      return;
    }
    ComplainCategory.findOne({ _id: req.params.id })
      .populate("Icon")
      .then((data) => {
        res.status(200).json({ status: 200, data: data });
      })
      .catch((err) => {
        res.status(500).json({ status: 500, message: err });
      });
  } catch (error) {
    res.status(500).json({ status: 500, message: error });
  }
});

router.get("/GetAllComplainCategory", async (req, res) => {
  try {
    connectToDB();
    ComplainCategory.find()
      .populate("Icon")
      .then((data) => {
        res.status(200).json({ status: 200, data: data });
      })
      .catch((err) => {
        console.log(error);

        res.status(500).json({ status: 500, message: err });
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, message: error });
  }
});

module.exports = router;
