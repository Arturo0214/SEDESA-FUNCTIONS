import axios from 'axios';

const API_URL = "https://water-clever-sage.glitch.me/"

// Función para registrar usuario
const register = async (userData) => { 
  try {
    const response = await axios.post(`${API_URL}users`, userData);
    
    // ✅ Solo devolver los datos serializables (no el objeto completo de Axios)
    return response.data;
  } catch (error) {
    console.error('Error al registrar al usuario:', error);
    
    // ✅ Asegurar que Redux reciba solo un mensaje de error en formato de texto
    throw error.response?.data?.message || error.message || 'Error desconocido';
  }
};

// Manejo de cookies
export function setCookie(name, value, days) {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value || ''}${expires}; path=/`;
}

export function getCookie(name) {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i += 1) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
  }
  return null;
}

export function deleteCookie(name) {
  document.cookie = `${name}=; Max-Age=-99999999; path=/`;
}

// Función para iniciar sesión
const login = async (userData) => { 
  try {
    const response = await axios.post(`${API_URL}users/login`, userData);
    if (response.data) {
      setCookie('user', JSON.stringify(response.data), 1);
    }
    return response.data;
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw error.response?.data?.message || error.message || 'Error desconocido';
  }
};

// Cerrar sesión
const logout = () => {
  deleteCookie('user');
};

// Verificar si el usuario está autenticado
const isUserLoggedIn = () => {
  return !!getCookie('user');
};

// Verificar si el usuario es administrador
export const isUserAdmin = () => {
  const userCookie = getCookie('user');
  if (userCookie) {
    const user = JSON.parse(userCookie);
    return user.isAdmin === true;
  }
  return false;
};

// Obtener usuario desde las cookies
export function getUserFromCookie() {
  const userCookie = getCookie('user');
  return userCookie ? JSON.parse(userCookie) : null;
}

// Guardar usuario en las cookies
export function setUserToCookie(user) {
  setCookie('user', JSON.stringify(user), 1);
}

// Obtener todos los usuarios (requiere token de autenticación)
const getAllUsers = async (token) => {
  try {
    const response = await axios.get(`${API_URL}users/getusers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener todos los usuarios:', error);
    throw error.response?.data?.message || error.message || 'Error desconocido';
  }
};

// Obtener un usuario por ID
const getUserById = async (userId, token) => {
  try {
    const response = await axios.get(`${API_URL}users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    throw error.response?.data?.message || error.message || 'Error desconocido';
  }
};

const requestPasswordReset = async (email) => {
  try {
    console.log("🔹 Enviando solicitud desde el frontend...");

    const response = await axios.post(`${API_URL}reset-password`, { email });

    console.log("✅ Respuesta recibida en el frontend:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error en la solicitud desde el frontend:", error.response?.data || error.message);
    
    throw error.response?.data?.message || "Error desconocido";
  }
}

// Exportar el servicio de autenticación
const authService = {
  register,
  login,
  logout,
  isUserLoggedIn,
  isUserAdmin,
  getAllUsers,
  getUserById,
  requestPasswordReset,
};

export default authService;
