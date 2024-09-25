import express from 'express'
import controller from './controller.js'

const router = express.Router()

router.post('/login',controller.login)
router.post('/addIncome',controller.addIncome)
router.post('/addcustomer',controller.addcustomer)
router.post("/addExpense",controller.addExpense)
router.post("/addCredit",controller.addCredit)

router.get('/incomehistory',controller.incomeHistory)
router.get("/getExpenses",controller.getExpenses)
router.get("/getCustomers",controller.getCustomers)
router.get("/getTodayIncomeAndExpense",controller.getIncomeAndExpense)

router.put('/repayment',controller.repayment)
export default router