import { DataTypes } from "sequelize";

export default (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      balance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 10000.0,
      },

      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "users",
      timestamps: false,
    },
  );

  User.associate = (models) => {
    User.hasMany(models.Transactions, {
      foreignKey: "from_user_id",
      as: "sentTransactions",
    });
    User.hasMany(models.Transactions, {
      foreignKey: "to_user_id",
      as: "receivedTransactions",
    });
  };

  return User;
};