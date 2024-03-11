const mongoose = require("mongoose");

const VisitorSchema = new mongoose.Schema(
    {
        Name: {
            type: String,
            required: true
        },
         TowerNo: {
            type: Number,
            required: true
        },
          AppratmentNo: {
            type: String,
            required: true
        },
        VehicleNumber: {
            type: String,
            required: true
        },
        VisitPurpose: {
            type: String,
            required: true
        },
        EntryTime: {
            type: Date,
            default: Date.now,
            required: true
        },
        ExitTime: {
            type: Date
        },
        Visiting: {
            type: String,
            required: true
        },
        ContactNumber: {
            type: String,
            required: false      
         },
        Notes: {
            type: String,
            required: false
         },
                Admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
               required: false 
                }
    },
    {
        timestamps: { 
              createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);

const Visitor = mongoose.model("Visitor", VisitorSchema);

module.exports = { Visitor };
