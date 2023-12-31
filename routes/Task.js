const express = require("express");
const { Task } = require("../models/Task");
const { Admin } = require("../models/Admin");
const { Complain } = require("../models/Complain/Complain");
const { Service } = require("../models/Service");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { connectToDB } = require("../Middlewares/Db");
const { getAdminId } = require("../utils/AuthCheck");
const { default: mongoose } = require("mongoose");

const router = express.Router();

router.post("/CreateTask", async (req, res) => {
  try {
    connectToDB();
    const { id: assignedById, message: assignedByMessage } = await getAdminId(req);

    if (assignedById) {
      const Credentials = req.body;

      const Check = await CheckAllRequiredFieldsAvailaible(
        Credentials,
        ["assignedTo", "status"],
        res
      );

      if (Check) {
        return;
      }

      // Check if assignedTo is a valid admin ID
      const assignedToAdmin = await Admin.findOne({
        _id: Credentials.assignedTo,
      });

      if (!assignedToAdmin) {
        res.status(400).json({
          status: 400,
          message: "Invalid assignedTo admin ID.",
        });
        return;
      }

      // Create Task
      const newTask = new Task({
        assignedBy: assignedById,
        assignedTo: Credentials.assignedTo,
        status: Credentials.status,
      });

      // Check if the task ID is not already in the array before pushing
      if (!assignedToAdmin.Tasks.some(taskId => taskId.equals(newTask._id))) {
        assignedToAdmin.Tasks.push(newTask._id);

        // Connect the Task to either Complain or Service
        if (Credentials.complainId) {
          newTask.complain = new mongoose.Types.ObjectId(Credentials.complainId);
        } else if (Credentials.serviceId) {
          newTask.service = new mongoose.Types.ObjectId(Credentials.serviceId);
        }

        await newTask.save();

        assignedToAdmin.Tasks.push(new mongoose.Types.ObjectId(newTask._id));
        await assignedToAdmin.save();

        if (Credentials.serviceId) {
          const Task_Service = await Task.find({
            Service: Credentials?.serviceId,
          }).select("_id");

          await Service.updateOne(
            { _id: Credentials?.serviceId },
            {
              Task: Task_Service,
            }
          ).then((data) => {
            res.status(200).json({
              status: 200,
              message: "Task Assigned Successfully",
            });
          }).catch((err) => {
            console.log(err);
            res.status(500).json({ status: 500, message: err });
          });
        }
        else if (Credentials.complainId) {
          const Task_Complain = await Task.find({
            Complain: Credentials?.complainId,
          }).select("_id");

          await Complain.updateOne(
            { _id: Credentials?.complainId },
            {
              Task: Task_Complain,
            }
          ).then((data) => {
            res.status(200).json({
              status: 200,
              message: "Task Assigned Successfully",
            });
          }).catch((err) => {
            console.log(err);
            res.status(500).json({ status: 500, message: err });
          });

        }
      } else {
        res.status(400).json({
          status: 400,
          message: "Task ID already exists in the assignedTo admin's Tasks array.",
        });
      }
    } else {
      res.status(401).json({ status: 401, message: assignedByMessage });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
});

router.put("/UpdateTask/:taskId", async (req, res) => {
  try {
    connectToDB();
    const { id: assignedById, message: assignedByMessage } = await getAdminId(req);

    if (assignedById) {
      const Credentials = req.body;

      const Check = await CheckAllRequiredFieldsAvailaible(
        Credentials,
        ["status"],
        res
      );

      if (Check) {
        return;
      }

      const task = await Task.findOne({ _id: req.params.taskId });

      if (!task) {
        res.status(404).json({
          status: 404,
          message: "Task not found",
        });
        return;
      }

      // Check if the updating admin is the assignedBy admin
      if (task.assignedBy.toString() !== assignedById) {
        res.status = 403;
        res.json({
          status: 403,
          message: "You are not allowed to update this task",
        });
        return;
      }

      // Update Task
      task.status = Credentials.status;
      await task.save();

      res.status(200).json({
        status: 200,
        message: "Task Updated Successfully",
      });
    } else {
      res.status(401).json({ status: 401, message: assignedByMessage });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
});

router.get("/TaskInfoId/:id", async (req, res) => {
  try {
    connectToDB();
    const task = await Task.findOne({ _id: req.params.id })
      .populate("assignedBy assignedTo complain service")
      .exec();

    if (!task) {
      res.status(404).json({
        status: 404,
        message: "Task not found",
      });
      return;
    }

    res.status(200).json({
      status: 200,
      data: task,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
});

router.get("/TaskInfoComplain/:complainId", async (req, res) => {
  try {
    connectToDB();
    const task = await Task.find({ complain: req?.params?.complainId })
      .populate("assignedBy assignedTo")
      .exec();

    if (!task) {
      res.status(404).json({
        status: 404,
        message: "Task not found",
      });
      return;
    }

    res.status(200).json({
      status: 200,
      data: task,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
});


router.get("/TaskInfoService/:serviceId", async (req, res) => {
  try {
    connectToDB();
    const task = await Task.find({ service: req?.params?.serviceId })
      .populate("assignedBy assignedTo")
      .exec();

    if (!task) {
      res.status(404).json({
        status: 404,
        message: "Task not found",
      });
      return;
    }

    res.status(200).json({
      status: 200,
      data: task,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
});


router.get("/GetAllTasks", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getAdminId(req);

    if (id) {
      const tasks = await Admin.findOne({ _id: id })
        .populate("Tasks")
        .then((admin) => admin.Tasks);

      res.status(200).json({
        status: 200,
        data: tasks,
      });
    } else {
      res.status(401).json({ status: 401, message: message });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
});

module.exports = router;
