import express from "express";
import {
  loginUser,
  fetchWallet,
  transferMoney,
  fetchTransactions,
  fetchUsers
} from "../controllers/users.controller.js";
import {authMiddleware} from "../middlewares/permissions.js";

const router = express.Router();

router.post("/login", loginUser);

router.get("/wallet", authMiddleware(), fetchWallet);
router.post("/wallet/transfer", authMiddleware(), transferMoney);
router.get("/transactions", authMiddleware(), fetchTransactions);

router.get("/users", authMiddleware(), fetchUsers); 


export default router;
