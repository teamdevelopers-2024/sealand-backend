import validator from 'validator';

// Function to validate expense entry data
export function validateExpenseData(data) {
    const {
        date,
        payeeName,
        expenseType,
        contactNumber,
        paymentMethod,
        totalExpense,
        expenseDetails
    } = data;

    // Array to collect validation errors
    const errors = [];

    // Validate date
    if (!date || !validator.isDate(date.toString())) {
        errors.push('Date is required and must be a valid date.');
    }

    // Validate payeeName
    if (!payeeName || !validator.isLength(payeeName, { min: 2 })) {
        errors.push('Payee name is required and must be at least 2 characters long.');
    }

    // Validate expenseType
    if (!expenseType || !validator.isLength(expenseType, { min: 2 })) {
        errors.push('Expense type is required and must be at least 2 characters long.');
    }

    // Validate contactNumber
    if (!contactNumber || contactNumber.length<10) {
        errors.push('Contact number is required and must be a valid phone number.');
    }

    // Validate paymentMethod
    const validPaymentMethods = ['Cash', 'UPI', 'Online Transfer'];
    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
        errors.push('Payment method is required and must be one of Cash, UPI, or Online Transfer.');
    }

    // Validate totalExpense
    if (!totalExpense || !validator.isFloat(totalExpense.toString(), { gt: 0 })) {
        errors.push('Total expense is required and must be a positive number.');
    }

    // Validate workDescriptions
    if (!Array.isArray(expenseDetails) || expenseDetails    .length === 0) {
        errors.push('At least one work description is required.');
    } else {
        // Validate each work description item
        expenseDetails.forEach((work, index) => {
            const { description, amount, reference } = work;

            if (!description || validator.isEmpty(description)) {
                errors.push(`Description is required for work item ${index + 1}.`);
            }
            if (!amount || !validator.isFloat(amount.toString(), { gt: 0 })) {
                errors.push(`Amount must be a positive number for work item ${index + 1}.`);
            }
            if (reference && !validator.isLength(reference, { max: 255 })) {
                errors.push(`Reference should be less than 255 characters for work item ${index + 1}.`);
            }
        });
    }

    return errors;
}
