const mongoose = require("mongoose");

const DailyReportSchema = new mongoose.Schema(
  {
    FileNo: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    PO: {
      type: String,
      required: true,
      trim: true,
    },
    ItemDescription: {
      type: String,
      required: true,
    },
    NetWeight: {
      type: String,
      required: true,
      trim: true,
    },
    GWeight: {
      type: String,
      required: true,
      trim: true,
    },
    Containers: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    Currency: {
      type: String,
      required: true,
      trim: true,
    },
    ShippmentAmount: {
      type: String,
      required: true,
    },
    Vessel: {
      type: String,
      required: true,
      trim: true,
    },
    ETA: {
      type: String,
      required: true,
      trim: true,
    },
    PortOfLoading: {
      type: String,
      required: true,
    },
    IGM_NO: {
      type: String,
      required: true,
      trim: true,
    },
    IGM_Date: {
      type: String,
      required: true,
      trim: true,
    },
    OFFLoadingPort: {
      type: String,
      required: true,
    },
    PCL: {
      type: String,
      required: true,
      trim: true,
    },
    OrignalDocumentReceiveDate: {
      type: String,
      required: true,
      trim: true,
    },
    Remarks: {
      type: String,
      required: true,
      trim: true,
    },
    Status: {
      type: String,
      required: true,
      trim: true,
    },
    LastDemurageDate: {
      type: String,
      required: true,
      trim: true,
    },
    EstimatedDemurage: {
      type: String,
      required: true,
      trim: true,
    },
    LastDetentionDate: {
      type: String,
      required: true,
      trim: true,
    },
    ExchangeRate: {
      type: String,
      required: true,
      trim: true,
    },
    CustomDuty: {
      type: String,
      required: true,
      trim: true,
    },
    ACDuty: {
      type: String,
      required: true,
      trim: true,
    },
    RD: {
      type: String,
      required: true,
      trim: true,
    },
    SaleTax: {
      type: String,
      required: true,
      trim: true,
    },
    IncomeTax: {
      type: String,
      required: true,
      trim: true,
    },
    TotalDuty: {
      type: String,
      required: true,
      trim: true,
    },
    DataEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DataEntry",
    },
  },
  {
    timestamps: {
      createdAt: "created_at", // Use `created_at` to store the created date
      updatedAt: "updated_at", // and `updated_at` to store the last updated date
    },
  }
);

const DailyReport = mongoose.model("DailyReport", DailyReportSchema);

module.exports = DailyReport;
