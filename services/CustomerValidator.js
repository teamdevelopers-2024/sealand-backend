import creditCustomerDb from '../model/creditCustomers.js';
import validator from 'validator';

// Function to validate customer entry data
export async function validateCustomerData(data) {
    const {
        dateOfService,
        customerName,
        vehicleNumber,
        phoneNumber,
        creditAmount,
        workDetails,
    } = data;

    // Array to collect validation errors
    const errors = [];
    console.log("vehicleNumber : ",vehicleNumber)
    // Validate dateOfService
    if (!dateOfService) {
        errors.push({ field: 'dateOfService', message: 'Date of Service is required.' });
    } else if (!validator.isDate(dateOfService)) {
        errors.push({ field: 'dateOfService', message: 'Date of Service must be a valid date.' });
    }

    // Validate customerName
    if (!customerName) {
        errors.push({ field: 'customerName', message: 'Customer Name is required.' });
    } else if (!validator.isLength(customerName, { min: 2 })) {
        errors.push({ field: 'customerName', message: 'Customer Name must be at least 2 characters long.' });
    }
    console.log(vehicleNumber[0])
    if (!vehicleNumber[0]) {
        errors.push({ field: 'vehicleNumber', message: 'Vehicle Number is required.' });
    } else if (!/^(?=.*[A-Za-z].*[A-Za-z])(?=.*\d.*\d)[A-Za-z0-9- ]+$/.test(vehicleNumber[0])) {
        errors.push({ field: 'vehicleNumber', message: 'Enter valid VehicleNumber' });
    }

    if (!phoneNumber) {
        errors.push({ field: 'phoneNumber', message: 'Phone Number is required.' });
    } else if (phoneNumber.length < 10) {
        errors.push({ field: 'phoneNumber', message: 'Phone Number must be at least 10 digits long.' });
    } else {
        const existingCustomer = await creditCustomerDb.findOne({ phoneNumber });
        if (existingCustomer) {
            errors.push({ field: 'phoneNumber', message: 'Phone Number already exists.' });
        }
    }

    if (!creditAmount) {
        errors.push({ field: 'creditAmount', message: 'Credit Amount is required.' });
    } else if (!validator.isFloat(creditAmount.toString(), { gt: 0 })) {
        errors.push({ field: 'creditAmount', message: 'Credit Amount must be a positive number.' });
    }

    // Validate workDetails
    if (!Array.isArray(workDetails)) {
        errors.push({ field: 'workDetails', message: 'Work Details must be an array.' });
    } else if (workDetails.length === 0) {
        errors.push({ field: 'workDetails', message: 'At least one work description is required.' });
    } else {
        // Validate each work description item
        workDetails.forEach((work, index) => {
            const { description, amount } = work;

            if (!description) {
                errors.push({ field: `workDetails[${index}].description`, message: `Description is required for Work Item ${index + 1}.` });
            } else if (validator.isEmpty(description)) {
                errors.push({ field: `workDetails[${index}].description`, message: `Description cannot be empty for Work Item ${index + 1}.` });
            }

            if (!amount) {
                errors.push({ field: `workDetails[${index}].amount`, message: `Amount is required for Work Item ${index + 1}.` });
            } else if (!validator.isFloat(amount.toString(), { gt: 0 })) {
                errors.push({ field: `workDetails[${index}].amount`, message: `Amount must be a positive number for Work Item ${index + 1}.` });
            }
        });
    }

    return errors;
}
