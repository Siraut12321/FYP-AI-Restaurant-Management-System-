import api from '../api/api';

// Unwrap the standard { success, message, data } envelope
const unwrap = (res) => res.data;

// ── Core CRUD ────────────────────────────────────────────────────────────────

export const getAllMenuItems = async () => {
  const res = await api.get('/menu');
  // Returns { success, message, data: [...items] }  →  expose as { data: [...items] }
  return unwrap(res);
};

export const getMenuItemById = async (id) => {
  const res = await api.get(`/menu/${id}`);
  return unwrap(res);
};

export const createMenuItem = async (formData) => {
  const res = await api.post('/menu', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrap(res);
};

export const updateMenuItem = async (id, formData) => {
  const res = await api.patch(`/menu/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrap(res);
};

export const deleteMenuItem = async (id) => {
  const res = await api.delete(`/menu/${id}`);
  return unwrap(res);
};

export const toggleAvailability = async (id) => {
  const res = await api.patch(`/menu/${id}/toggle-availability`);
  return unwrap(res);
};

export const toggleFeatured = async (id) => {
  const res = await api.patch(`/menu/${id}/toggle-featured`);
  return unwrap(res);
};

// Alias kept for MenuManagement.jsx compatibility
export const fetchMenuItems = getAllMenuItems;

export const getCategories = async () => {
  const res = await api.get('/menu/categories');
  return unwrap(res);
};
