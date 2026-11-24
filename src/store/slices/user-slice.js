import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { apiData } from "../../api/client";

export const fetchWalletOverview = createAsyncThunk(
  "user/fetchWalletOverview",
  async (_, { rejectWithValue }) => {
    try {
      const [wallet, transactions, users] = await Promise.all([
        apiData(api.get("/user/wallet")),
        apiData(api.get("/user/transactions")),
        apiData(api.get("/user/users")),
      ]);

      return { wallet, transactions, users };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const sendMoney = createAsyncThunk(
  "user/sendMoney",
  async ({ toUserId, amount, idempotencyKey, simulateFailure }, { rejectWithValue }) => {
    try {
      return await apiData(
        api.post(
          "user/wallet/transfer",
          { toUserId, amount },
          {
            headers: {
              "Idempotency-Key": idempotencyKey,
              ...(simulateFailure ? { "x-simulate-failure": "true" } : {}),
            },
          },
        ),
      );
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

const initialState = {
  wallet: null,
  transactions: [],
  users: [],
  overviewLoading: false,
  transferLoading: false,
  error: null,
  lastTransfer: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    clearTransferStatus: (state) => {
      state.lastTransfer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletOverview.pending, (state) => {
        state.overviewLoading = true;
        state.error = null;
      })
      .addCase(fetchWalletOverview.fulfilled, (state, action) => {
        state.overviewLoading = false;
        state.wallet = action.payload.wallet;
        state.transactions = action.payload.transactions;
        state.users = action.payload.users;
      })
      .addCase(fetchWalletOverview.rejected, (state, action) => {
        state.overviewLoading = false;
        state.error = action.payload;
      })

      .addCase(sendMoney.pending, (state) => {
        state.transferLoading = true;
        state.error = null;
        state.lastTransfer = null;
      })
      .addCase(sendMoney.fulfilled, (state, action) => {
        state.transferLoading = false;
        state.lastTransfer = {
          success: true,
          message: `Sent ${action.payload.amount} Paisa successfully`,
        };
      })
      .addCase(sendMoney.rejected, (state, action) => {
        state.transferLoading = false;
        state.error = action.payload;
        state.lastTransfer = { success: false, message: action.payload };
      });
  },
});

export const { clearUserError, clearTransferStatus } = userSlice.actions;
export default userSlice.reducer;