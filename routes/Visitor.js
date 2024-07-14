const { Router } = require("express");
const { Visitor } = require("../models/Visitor"); // Assuming you've created this model
const { getAdminId, getUserId } = require("../utils/AuthCheck");
const { connectToDB } = require("../Middlewares/Db");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { default: mongoose } = require("mongoose");
const { Admin } = require("../models/Admin");

const router = Router();

// Create a new visitor entry
router.post("/create-visitor", async (req, res) => {
    try {
        connectToDB();

        const { id, message } = await getAdminId(req);
        if (!id) {
            return res.status(401).json({ status: 401, message: message });
        }

        const visitorInfo = req.body;
        const requiredFields = ["Name", "VehicleNumber", "VisitPurpose", "Visiting", "TowerNo", "AppratmentNo"];

        const check = await CheckAllRequiredFieldsAvailaible(visitorInfo, requiredFields, res);
        if (check) {
            return;
        }

        const newVisitor = new Visitor({
            ...visitorInfo,
            Admin: new mongoose.Types.ObjectId(id)
        });
        const savedVisitor = await newVisitor.save();

        res.status(200).json({
            status: 200,
            message: "Visitor created successfully",
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, message: "Error creating visitor", error: error.message });
    }
});


router.post("/Change-ExitTime-Visitor", async (req, res) => {
    try {
        connectToDB();
        const Credentials = req.body;

        const Check = await CheckAllRequiredFieldsAvailaible(
            Credentials,
            ["id", "ExitTime"],
            res
        );
        if (Check) {
            return;
        }

        const searchVisitor = await Visitor.findOne({ _id: Credentials?.id });
        if (searchVisitor?._id) {
            await Visitor.updateOne(
                { _id: searchVisitor?._id },
                { ExitTime: Credentials?.ExitTime },
                {
                    new: false
                }
            )
                .then((docs) => {
                    res.status(200).json({
                        status: 200,
                        message: "Your ExitTime has been Changed"
                    });
                })
                .catch((error) => {
                    res.status(500).json({ status: 500, message: error });
                });
        } else {
            res.status(500).json({ status: 500, message: "Visitor Not Found or wrong email" });
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error });
    }
});


router.get("/visitorInfo/:id", async (req, res) => {
    try {
        connectToDB();
        const { id } = req.params;

        const visitor = await Visitor.findById(id);
        if (!visitor) {
            return res.status(404).json({ status: 404, message: "Visitor not found" });
        }

        res.status(200).json({ status: 200, data: visitor });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Error fetching visitor information", error: error.message });
    }
});

router.get("/GetAllVisitors", async (req, res) => {
    try {
        connectToDB();
        const { id, message } = await getAdminId(req);
        if (!id) {
            return res.status(401).json({ status: 401, message: message });
        }
        const FindAdmin = await Admin.findOne({ _id: id })
        const Filter = {};

        if (FindAdmin?.Role == "reception" || FindAdmin?.Role == "user") {
            Filter.TowerNo = FindAdmin?.TowerNo
        }
        const visitors = await Visitor.find(Filter);
        res.status(200).json({ status: 200, data: visitors });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Error listing visitors", error: error.message });
    }
});

module.exports = router;
