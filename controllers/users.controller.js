import * as userService from "../services/users.service.js";
import { successResponse, errorResponse } from "../constants/response.js";
import {
  httpCodes,
  successMessages,
} from "../constants/messages.js";

export const loginUser = async (req, res) => {
  try {
    const userInfo = await userService.loginUser(req.body);
    return successResponse(
      res,
      userInfo,
      successMessages.LOGIN_SUCCESS,
      httpCodes.SUCCESS,
    );
  } catch (err) {
    return errorResponse(res, err.message, httpCodes.UNAUTHORIZED, err);
  }
};

export const fetchWallet = async (req, res) => {
  try {
    const userWallet = await userService.userWallet(req.user.userId);
    return successResponse(
      res,
      userWallet,
      successMessages.USER_WALLET_FETCHED,
      httpCodes.SUCCESS,
    );
  } catch (err) {
    return errorResponse(res, err.message, err.status || httpCodes.BAD_REQUEST, err);
  }
};

export const transferMoney = async (req, res) => {
  try {
    const transaction = await userService.transferMoney({
      userId: req.user.userId,
      ...req.body,
      idempotencyKey: req.headers["idempotency-key"],
      simulateFailure: req.headers["x-simulate-failure"] === "true",
    });
    return successResponse(
      res,
      transaction,
      successMessages.TRANSFER_SUCCESSFUL,
      httpCodes.CREATED,
    );
  } catch (err) {
    return errorResponse(res, err.message, err.status || httpCodes.BAD_REQUEST, err);
  }
};

export const fetchTransactions = async (req, res) => {
  try {
    const transactions = await userService.fetchTransactions(req.user.userId);
    return successResponse(
      res,
      transactions,
      successMessages.TRANSACTIONS_FETCHED,
      httpCodes.SUCCESS,
    );
  } catch (err) {
    return errorResponse(res, err.message, err.status || httpCodes.BAD_REQUEST, err);
  }
};

export const fetchUsers = async (req, res) => {
  try {
    const users = await userService.getUsers();
    return successResponse(res, users, successMessages.USERS_FETCHED, httpCodes.SUCCESS);
  } catch (err) {
    return errorResponse(res, err.message, httpCodes.BAD_REQUEST, err);
  }
};