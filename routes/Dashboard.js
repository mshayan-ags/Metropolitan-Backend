const { getAdminId, getUserId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { connectToDB } = require("../Middlewares/Db");
const { Task } = require("../models/Task");
const { Service } = require("../models/Service");
const { Complain } = require("../models/Complain/Complain");
const { Admin } = require("../models/Admin");
const { Bill } = require("../models/Bill");
const { Payment } = require("../models/Payment");
const router = Router();

router.get("/DashboardAdmin/:from/:to", async (req, res) => {
	try {
		connectToDB();
		const { id, message } = await getAdminId(req);
		if (id) {
			const fromDate = new Date(req.params.from).toISOString();
			const toDate = new Date(req.params.to).toISOString();

			const FindAdmin = (await Admin.findOne({ _id: id }))?.Role;
			const Filter = {
				created_at: {
					$gte: fromDate,
					$lt: toDate
				}
			};
			const FilterTasks = {
				created_at: {
					$gte: fromDate,
					$lt: toDate
				}
			};

			if (FindAdmin == "user" || FindAdmin == "manager") {
				Filter.Admin = id;
				FilterTasks.assignedTo = id;
			}

			const TasksArr = await Task.find(FilterTasks);

			const ServicesArr = await Service.find(Filter);

			const ComplainsArr = await Complain.find(Filter);

			const BillsArr = await Bill.find(Filter);
			const PaymentsArr = await Payment.find(Filter);

			res.status(200).json({
				status: 200,
				data: {
					Tasks: await TasksArr,
					Forwarded: await TasksArr.filter((a) => a.status == "Forwarded"),
					Pending: await TasksArr.filter((a) => a.status == "Pending"),
					Completed: await TasksArr.filter((a) => a.status == "Completed"),
					InProgress: await TasksArr.filter((a) => a.status == "InProgress"),
					Services: await ServicesArr,
					Complain: await ComplainsArr,
					Bill: await BillsArr,
					Payment: await PaymentsArr,
				}
			});
		} else {
			res.status(401).json({ status: 401, message: message });
		}
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

module.exports = router;
