import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService, { isUserAdmin } from './authService';
import axios from 'axios';

export const initialState = {
  user: null,
  error: null,
  isLoading: false,
  isSuccess: false,
  isAdminLoggedIn: isUserAdmin(),
  isAuthenticated: false,
  message: '',
  users: [],
  userbyId: null,
};

// Registro de usuario
export const register = createAsyncThunk('auth/register', async (user, thunkAPI) => {
  try {
    return await authService.register(user);
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Inicio de sesión
export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
  try {
    return await authService.login(userData);
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Cierre de sesión
export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    await authService.logout();
    return initialState;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const requestPasswordReset = createAsyncThunk("auth/requestPasswordReset", async ({ email }, thunkAPI) => {
  try {
      console.log("🔹 Enviando solicitud a:", "https://water-clever-sage.glitch.me/users/reset-password");
      console.log("🔹 Email enviado:", email);

      const response = await axios.post("https://water-clever-sage.glitch.me/users/reset-password", { email: email.trim() });

      console.log("✅ Respuesta recibida:", response.data);
      return response.data;
  } catch (error) {
      console.error("❌ Error en la solicitud:", error.response?.data || error.message);

      return thunkAPI.rejectWithValue(error.response?.data?.message || "Error desconocido");
  }
});

// Obtener todos los usuarios (solo admin)
export const getAllUsers = createAsyncThunk('auth/getAllUsers', async (_, thunkAPI) => {
  try {
    const user = thunkAPI.getState().auth.user;

    if (!user?.isAdmin) {
      return thunkAPI.rejectWithValue('Acceso no autorizado.');
    }

    const users = await authService.getAllUsers(user.token);
    return users;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Obtener un usuario por ID (solo admin)
export const getUserById = createAsyncThunk('auth/getUserById', async (userId, thunkAPI) => {
  try {
    const user = thunkAPI.getState().auth.user;

    if (!user?.isAdmin) {
      return thunkAPI.rejectWithValue('Acceso no autorizado.');
    }

    const userById = await authService.getUserById(userId, user.token);
    return userById;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Slice de autenticación
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.error = null;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isAuthenticated = true;
        state.isAdminLoggedIn = isUserAdmin();
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.error = action.payload;
        state.message = action.payload;
        state.user = null;
        state.isAdminLoggedIn = false;
      })
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isAdminLoggedIn = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getUserById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.userbyId = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(requestPasswordReset.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.message = action.payload;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;