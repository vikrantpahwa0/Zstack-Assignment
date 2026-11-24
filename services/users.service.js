import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import db from "../database/index.js";
import { failureMessages } from "../constants/messages.js";
import {
  MIN_PAISA,
  MAX_PAISA,
  UUID_RE,
} from "../constants/constants.js";
import {
  toPaisa,
  toRupees,
} from "../utils/common.js";

const { sequelize } = db;
const { USERS, TRANSACTIONS } = db;

export const loginUser = async (data) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new Error(failureMessages.INVALID_CREDENTIALS);
  }

  const user = await USERS.findOne({
    where: { email: email.toLowerCase() },
    attributes: ["id", "email", "password"],
  });

  if (!user) {
    throw new Error(failureMessages.INVALID_CREDENTIALS);
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error(failureMessages.INVALID_CREDENTIALS);
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESSTOKEN_EXPIRY },
  );

  return { token };
};

export const userWallet = async (userId) => {
  const user = await USERS.findOne({
    where: { id: userId },
    attributes: ["id", "name", "email", "balance"],
  });

  if (!user) {
    throw new Error(failureMessages.USER_NOT_FOUND);
  }

  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    balance: toPaisa(user.balance),
  };
};
export const transferMoney = async (data) => {
  // 1. Add simulateFailure to destructuring
  const { userId, toUserId, amount, idempotencyKey, simulateFailure } = data;

  if (!idempotencyKey) {
    const err = new Error(failureMessages.IDEMPOTENCY_KEY_REQUIRED);
    err.status = 400;
    throw err;
  }

  if (!UUID_RE.test(idempotencyKey)) {
    const err = new Error(failureMessages.INVALID_IDEMPOTENCY_KEY);
    err.status = 400;
    throw err;
  }

  if (amount === undefined || amount === null || amount === "") {
    const err = new Error(failureMessages.AMOUNT_REQUIRED);
    err.status = 400;
    throw err;
  }

  const amtPaisa = Number(amount);
  if (
    !Number.isInteger(amtPaisa) ||
    amtPaisa < MIN_PAISA ||
    amtPaisa > MAX_PAISA
  ) {
    const err = new Error(failureMessages.INVALID_AMOUNT);
    err.status = 400;
    throw err;
  }

  if (Number(toUserId) === Number(userId)) {
    const err = new Error(failureMessages.CANNOT_TRANSFER_TO_SELF);
    err.status = 400;
    throw err;
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      const existing = await TRANSACTIONS.findOne({
        where: { idempotency_key: idempotencyKey },
        transaction: t,
      });
      if (existing) {
        return serializeTransaction(existing);
      }

      const sender = await USERS.findByPk(userId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!sender) {
        const err = new Error(failureMessages.USER_NOT_FOUND);
        err.status = 404;
        throw err;
      }

      const receiver = await USERS.findByPk(toUserId, { transaction: t });
      if (!receiver) {
        const err = new Error(failureMessages.RECEIVER_NOT_FOUND);
        err.status = 404;
        throw err;
      }

      const senderBalancePaisa = toPaisa(sender.balance);
      if (senderBalancePaisa < amtPaisa) {
        const err = new Error(failureMessages.INSUFFICIENT_BALANCE);
        err.status = 400;
        throw err;
      }

      const receiverBalancePaisa = toPaisa(receiver.balance);

      await USERS.update(
        { balance: toRupees(senderBalancePaisa - amtPaisa) },
        { where: { id: userId }, transaction: t },
      );
      await USERS.update(
        { balance: toRupees(receiverBalancePaisa + amtPaisa) },
        { where: { id: toUserId }, transaction: t },
      );

      const tx = await TRANSACTIONS.create(
        {
          from_user_id: userId,
          to_user_id: toUserId,
          amount: toRupees(amtPaisa),
          status: "success",
          idempotency_key: idempotencyKey,
        },
        { transaction: t },
      );

      return serializeTransaction(tx);
    });
    if (simulateFailure) {
      const err = new Error("Simulated network drop");
      err.status = 500;
      throw err;
    }

    return result;
  } catch (e) {
    if (e.name === "SequelizeUniqueConstraintError") {
      const existing = await TRANSACTIONS.findOne({
        where: { idempotency_key: idempotencyKey },
      });
      if (existing) return serializeTransaction(existing);
    }
    throw e;
  }
};

export const fetchTransactions = async (userId) => {
  const txs = await TRANSACTIONS.findAll({
    where: {
      [Op.or]: [{ from_user_id: userId }, { to_user_id: userId }],
    },
    include: [
      { model: USERS, as: "sender", attributes: ["name"] },
      { model: USERS, as: "receiver", attributes: ["name"] },
    ],
    order: [["created_at", "DESC"]],
  });

  return txs.map((tx) => {
    const sent = Number(tx.from_user_id) === Number(userId);
    
    return {
      id: tx.id,
      direction: sent ? "SENT" : "RECEIVED",
      fromUserId: tx.from_user_id,
      toUserId: tx.to_user_id,
      fromUserName: tx.sender?.name || "Unknown",
      toUserName: tx.receiver?.name || "Unknown",
      amount: toPaisa(tx.amount),
      status: tx.status,
      createdAt: tx.created_at,
    };
  });
};

function serializeTransaction(tx) {
  return {
    id: tx.id,
    fromUserId: tx.from_user_id,
    toUserId: tx.to_user_id,
    amount: toPaisa(tx.amount),
    status: tx.status,
    createdAt: tx.created_at,
  };
}

export const getUsers = async () => {
  return await USERS.findAll({
    attributes: ["id", "name", "email"],
    order: [["id", "ASC"]],
  });
};