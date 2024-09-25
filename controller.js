import 'dotenv/config'
import IncomeDb from './model/income.js'
import { validateIncomeData } from './services/IncomeValidator.js'
import creditCustomerDb from './model/creditCustomers.js'
import { validateCustomerData } from './services/CustomerValidator.js'
import { validateExpenseData } from './services/expenseValidator.js'
import ExpenseDb from './model/expense.js'


async function login(req, res) {
  try {
    const ogUsername = process.env.ADMIN_USERNAME
    const ogPassword = process.env.ADMIN_PASSWORD
    const { username, password } = req.body

    if (!username) {
      return res.status(400).json({
        error: true,
        message: "please enter username"
      })
    }
    if (!password) {
      return res.status(400).json({
        error: true,
        message: 'please enter password'
      })
    }
    if (username == ogUsername && password == ogPassword) {
      res.status(200).json({
        error: false,
        message: "admin authenticated successfully"
      })
    } else {
      res.status(400).json({
        error: true,
        message: "invalid credantials"
      })
    }

  } catch (error) {
    res.status(500).json({
      error: true,
      message: "internel server error"
    })
  }
}

async function addcustomer(req, res) {
  try {
    const customerData = req.body;
    if (typeof customerData.vehicleNumber === 'string') {
      customerData.vehicleNumber = customerData.vehicleNumber
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v);
    }

    // Validate customer data
    const errors = await validateCustomerData(customerData);
    console.log(errors)
    if (errors.length > 0) {
      console.log('getting here')
      return res.status(400).json({
        error: true,
        message: "Validation error",
        errors: errors,
      });
    }

    // Check if vehicleNumber is a string and convert it to an array


    // Save the customer data with the transformed vehicleNumber
    await creditCustomerDb.create(customerData);

    res.status(200).json({
      error: false,
      message: "Customer added successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
}


async function addIncome(req, res) {
  try {
    const incomeData = req.body;

    const errors = validateIncomeData(incomeData);

    if (errors.length > 0) {
      return res.status(400).json({
        error: true,
        message: "validation error",
        errors: errors
      });
    }

    await IncomeDb.create(incomeData)
    res.status(200).json({
      error: false,
      message: "income added Successfully"
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: true,
      message: "internel server error"
    })
  }
}


export async function incomeHistory(req, res) {
  try {
    const incomes = await IncomeDb.find().sort({ _id: -1 });
    res.status(200).json({
      error: false,
      message: "Income fetched successfully",
      data: incomes,
    });

  } catch (error) {
    console.error("Error fetching income history:", error);

    res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
}



async function addExpense(req, res) {
  try {
    const expenseData = req.body
    const errors = await validateExpenseData(expenseData)

    if (errors.length > 0) {
      return res.status(400).json({
        error: true,
        message: "validation error",
        errors: errors
      });
    }


    await ExpenseDb.create(expenseData)
    res.status(200).json({
      error: false,
      message: "expense added successfully"
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: true,
      message: "internel server error"
    })
  }
}



async function getExpenses(req, res) {
  try {
    // Fetch all expenses sorted by the latest entry
    const expenses = await ExpenseDb.find().sort({ _id: -1 });

    // Calculate total expense
    const totalExpense = expenses.reduce((sum, expense) => sum + expense.totalExpense, 0);

    // Get the current date details
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed in JavaScript
    const currentDay = currentDate.getDate();

    console.log('currentDate ', currentDate)
    console.log('currentYear ', currentYear)
    console.log('currentMonth ', currentMonth)
    console.log('currentDay ', currentDay)

    // Aggregate total expenses for the current year
    const currentYearTotal = await ExpenseDb.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalExpense" },
        },
      },
    ]);

    // Aggregate total expenses for the current month
    const currentMonthTotal = await ExpenseDb.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${currentYear}-${currentMonth}-01`),
            $lte: new Date(`${currentYear}-${currentMonth}-31`),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalExpense" },
        },
      },
    ]);

    // Aggregate total expenses for the current day
    const currentDayTotal = await ExpenseDb.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${currentYear}-${currentMonth}-${currentDay}T00:00:00.000Z`),
            $lte: new Date(`${currentYear}-${currentMonth}-${currentDay}T23:59:59.999Z`),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalExpense" },
        },
      },
    ]);

    // Log the totals for debugging purposes
    console.log('Total Expense:', totalExpense);
    console.log('Current Year Total:', currentYearTotal[0]?.total || 0);
    console.log('Current Month Total:', currentMonthTotal[0]?.total || 0);
    console.log('Current Day Total:', currentDayTotal[0]?.total || 0);

    // Format the response data
    res.status(200).json({
      error: false,
      message: "Expenses fetched successfully",
      data: expenses,
      totalExpense,
      currentYearTotal: currentYearTotal[0]?.total || 0,
      currentMonthTotal: currentMonthTotal[0]?.total || 0,
      currentDayTotal: currentDayTotal[0]?.total || 0,
    });
  } catch (error) {
    console.error("Error fetching expense history:", error);

    res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
}


async function getCustomers(req, res) {
  try {
    const customers = await creditCustomerDb.find().sort({ _id: -1 });
    res.status(200).json({
      error: false,
      message: "customers fetched successfully",
      data: customers
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: true,
      message: "internel server error"
    })
  }
}


async function repayment(req, res) {
  try {
    const { customer, details } = req.body;

    const updatedCustomer = await creditCustomerDb.findByIdAndUpdate(
      customer._id,
      {
        $inc: { paidAmount: details.repaymentAmount },
        $push: {
          transactionHistory: {
            date: new Date(), // Current date
            vehicleNumber: customer.vehicleNumber[0], // Assuming you want to use the customer's vehicle number
            phoneNumber: customer.phoneNumber, // Assuming you want to use the customer's phone number
            paymentType: details.paymentMethod, // Assuming this is part of your details
            Amount: details.repaymentAmount, // The amount being repaid
          },
        },
      },
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    console.log(customer)
    const updateIncomeData = new IncomeDb({
      workDate: details.repaymentDate,
      customerName: customer.customerName,
      vehicleNumber: customer.vehicleNumber[0].toUpperCase(),
      contactNumber: customer.phoneNumber,
      paymentMethod: "Credit Repayment",
      totalServiceCost: details.repaymentAmount,
      workDescriptions: [{
        description: customer.workDetails[0].description,
        amount: details.repaymentAmount,
        reference: customer.phoneNumber
      }]
    })

    if (updatedCustomer.creditAmount == updatedCustomer.paidAmount) {
      await creditCustomerDb.deleteOne({ _id: customer._id })
    }

    await updateIncomeData.save()


    res.status(200).json({
      error: false,
      message: 'Repayment successful',
    });
  } catch (error) {
    console.error('Error during repayment:', error);
    res.status(500).json({ message: 'Internal server error', error, error: true });
  }
}

async function getIncomeAndExpense(req, res) {
  try {
    const today = new Date();

    // Set today's start and end dates
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0); // Set start to today at 12 AM

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(todayStart.getDate() + 1); // Tomorrow at 12 AM

    // Set yesterday's start and end dates
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1); // Yesterday at 12 AM

    const yesterdayEnd = new Date(todayStart); // End of yesterday is today at 12 AM

    console.log("Today Start : ", todayStart.toISOString());
    console.log("Tomorrow Start : ", tomorrowStart.toISOString());
    console.log("Yesterday Start : ", yesterdayStart.toISOString());
    console.log("Yesterday End : ", yesterdayEnd.toISOString());

    // Fetch today's total income from IncomeDb
    const todayIncomeResult = await IncomeDb.aggregate([
      {
        $match: {
          workDate: { $gte: todayStart, $lt: tomorrowStart }, // Only comparing date
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalServiceCost' },
        },
      },
    ]);

    // Fetch today's total expense from ExpenseDb
    const todayExpenseResult = await ExpenseDb.aggregate([
      {
        $match: {
          date: { $gte: todayStart, $lt: tomorrowStart }, // Only comparing date
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalExpense' },
        },
      },
    ]);

    // Fetch yesterday's total income from IncomeDb
    const yesterdayIncomeResult = await IncomeDb.aggregate([
      {
        $match: {
          workDate: { $gte: yesterdayStart, $lt: yesterdayEnd }, // Only comparing date
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalServiceCost' },
        },
      },
    ]);

    // Fetch yesterday's total expense from ExpenseDb
    const yesterdayExpenseResult = await ExpenseDb.aggregate([
      {
        $match: {
          date: { $gte: yesterdayStart, $lt: yesterdayEnd }, // Only comparing date
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalExpense' },
        },
      },
    ]);

    // Fetch today's customer count from customerDb
    const todayCustomerCountResult = await IncomeDb.aggregate([
      {
        $match: {
          workDate: { $gte: todayStart, $lt: tomorrowStart }, // Filter documents within the specified date range
        },
      },
      {
        $group: {
          _id: "$contactNumber", // Group by contactNumber to find unique numbers
        },
      },
      {
        $count: "totalUniqueCustomers", // Count the total number of unique contactNumbers
      },
    ]);


    // Extract amounts or set to 0 if no results
    const todayIncome = todayIncomeResult[0]?.totalAmount || 0;
    const todayExpense = todayExpenseResult[0]?.totalAmount || 0;
    const yesterdayIncome = yesterdayIncomeResult[0]?.totalAmount || 0;
    const yesterdayExpense = yesterdayExpenseResult[0]?.totalAmount || 0;
    const todayCustomerCount = todayCustomerCountResult[0]?.totalUniqueCustomers || 0; // Get customer count

    // Log results for debugging
    console.log("todayIncome:", todayIncome);
    console.log("todayExpense:", todayExpense);
    console.log("yesterdayIncome:", yesterdayIncome);
    console.log("yesterdayExpense:", yesterdayExpense);
    console.log("todayCustomerCount:", todayCustomerCount);

    // Send response
    res.status(200).json({
      error: false,
      message: "Fetched successfully",
      todayIncome,
      todayExpense,
      yesterdayIncome,
      yesterdayExpense,
      todayCustomerCount,
    });

  } catch (error) {
    console.error('Error fetching income and expense:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
}

async function addCredit(req, res) {
  try {
    const { date, vehicleNumber, workRows, creditAmount, _id, phoneNumber } = req.body

    const customer = await creditCustomerDb.findOne({ phoneNumber: phoneNumber, _id: _id });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const updatedCreditAmount = customer.creditAmount + creditAmount;

    await creditCustomerDb.updateOne(
      { _id: customer._id },
      {
        $set: { creditAmount: updatedCreditAmount },
        $push: {
          vehicleNumber: vehicleNumber.toUpperCase(),
          workDetails: { $each: workRows },
          transactionHistory: {
            date: new Date(date),
            vehicleNumber: vehicleNumber,
            phoneNumber: phoneNumber, // Replace with the actual phone number or keep as sample
            paymentType: "Credit",
            Amount: creditAmount,
          },
        },
      }
    );

    return res.status(200).json({ message: "Credit added successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", error });
  }
}



export default {
  login,
  addIncome,
  addcustomer,
  incomeHistory,
  addExpense,
  getExpenses,
  getCustomers,
  repayment,
  getIncomeAndExpense,
  addCredit
}