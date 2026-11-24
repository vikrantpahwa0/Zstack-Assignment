// constants/messages.js

export const successMessages = {
  SUCCESS: "Success",
  LOGIN_SUCCESS: "Login successful",
  USER_WALLET_FETCHED: "User wallet fetched successfully",
  TRANSFER_SUCCESSFUL: "Transfer successful",
  TRANSACTIONS_FETCHED: "Transactions fetched successfully",
  USERS_FETCHED : "Users fetched"
};

export const failureMessages = {
  SOMETHING_WENT_WRONG: "Something went wrong",
  LOGIN_FAILED: "Login failed",
  INVALID_CREDENTIALS: "Invalid credentials",
  USER_NOT_FOUND: "User not found",
  RECEIVER_NOT_FOUND: "Receiver not found",
  INSUFFICIENT_BALANCE: "Insufficient balance",
  IDEMPOTENCY_KEY_REQUIRED: "Idempotency-Key header is required",
  INVALID_IDEMPOTENCY_KEY: "Idempotency-Key must be a valid UUID",
  INVALID_AMOUNT: "amount must be between ₹1 and ₹50,000",
  AMOUNT_REQUIRED: "amount is required",
  CANNOT_TRANSFER_TO_SELF: "Cannot transfer to yourself",
};

export const validationMessages = {
  TOKEN_REQUIRED: "Authorization token is required",
  TOKEN_EXPIRED: "Authorization token has expired",
  INVALID_TOKEN: "Invalid Token",
  TOKEN_VERIFICATION_FAILED: "Token verification failed",
};

export const httpCodes = {
  INTERNAL_SERVER_ERROR: 500,
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
};