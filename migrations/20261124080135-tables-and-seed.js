import bcrypt from "bcrypt";

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      balance: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 10000.0,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex("users", ["email"], {
      unique: true,
      name: "unique_users_email",
    });

    const now = new Date();
    const hashedPassword = await bcrypt.hash("password123", 10);

    await queryInterface.bulkInsert("users", [
      {
        name: "Alice",
        email: "alice@example.com",
        password: hashedPassword,
        balance: 10000.0,
        created_at: now,
      },
      {
        name: "Bob",
        email: "bob@example.com",
        password: hashedPassword,
        balance: 10000.0,
        created_at: now,
      },
      {
        name: "Carol",
        email: "carol@example.com",
        password: hashedPassword,
        balance: 10000.0,
        created_at: now,
      },
    ]);

    await queryInterface.createTable("transactions", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      from_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      to_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("success", "failed"),
        allowNull: false,
        defaultValue: "success",
      },
      idempotency_key: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex("transactions", ["idempotency_key"], {
      unique: true,
      name: "unique_transactions_idempotency_key",
    });

    await queryInterface.addIndex("transactions", ["from_user_id", "created_at"], {
      name: "idx_transactions_from_created",
    });
    await queryInterface.addIndex("transactions", ["to_user_id", "created_at"], {
      name: "idx_transactions_to_created",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("transactions");
    await queryInterface.dropTable("users");
  },
};