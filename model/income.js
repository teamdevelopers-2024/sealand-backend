import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema({
    workDate: {
        type: Date,
        required: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    vehicleNumber: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true , 
    },
    totalServiceCost: {
        type: Number,
        required: true,
    },
    workDescriptions: [
        {
            description: {
                type: String,
            },
            amount: {
                type: Number,
            },
            reference: {
                type: String,
            },
        },
    ],
});

const IncomeDb = mongoose.model("Income", incomeSchema);

export default IncomeDb;
