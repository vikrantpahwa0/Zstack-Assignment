import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Transaction = sequelize.define(
    "Transaction",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      from_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
      },

      to_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
      },

      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM("success", "failed"),
        allowNull: false,
        defaultValue: "success",
      },

      idempotency_key: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },

      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "transactions",
      timestamps: false,
      indexes: [
        { fields: ["from_user_id", "created_at"] },
        { fields: ["to_user_id", "created_at"] },
      ],
    },
  );

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.Users, {
      foreignKey: "from_user_id",
      as: "sender",
    });
    Transaction.belongsTo(models.Users, {
      foreignKey: "to_user_id",
      as: "receiver",
    });
  };

  return Transaction;
};