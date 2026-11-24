import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { apiData, setAccessToken } from "../../api/client";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await apiData(api.post("/user/login", { email, password }));
      // data = { token }
      setAccessToken(data.token);
      return data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

const initialState = {
  isLoading: false,
  error: null,
  accessToken: localStorage.getItem("accessToken") || null,
  isAuthenticated: !!localStorage.getItem("accessToken"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      setAccessToken(null);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, logout } = authSlice.actions;
export default authSlice.reducer;