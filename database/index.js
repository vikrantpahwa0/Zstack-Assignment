import sequelize from "./db.config.js";
import UsersModel from "./models/users.js";
import TransactionsModel from "./models/transactions.js";

const Users = UsersModel(sequelize);
const Transactions = TransactionsModel(sequelize);

const models = {
  Users,
  Transactions,
};

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

const db = {
  sequelize,
  USERS: Users,
  TRANSACTIONS: Transactions,
};

export default db;