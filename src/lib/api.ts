import { Category, Provider, ServiceRequest, AppUser, Review } from './mock-data';

const API_URL = 'http://localhost:3001/api';

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch(`${API_URL}/categories`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
};

export const fetchProviders = async (): Promise<Provider[]> => {
  const response = await fetch(`${API_URL}/providers`);
  if (!response.ok) throw new Error('Failed to fetch providers');
  return response.json();
};

export const fetchServiceRequests = async (): Promise<ServiceRequest[]> => {
  const response = await fetch(`${API_URL}/requests`);
  if (!response.ok) throw new Error('Failed to fetch service requests');
  return response.json();
};

export const fetchUsers = async (): Promise<AppUser[]> => {
  const response = await fetch(`${API_URL}/users`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const fetchReviews = async (): Promise<Review[]> => {
  const response = await fetch(`${API_URL}/reviews`);
  if (!response.ok) throw new Error('Failed to fetch reviews');
  return response.json();
};

export const createProvider = async (data: Partial<Provider>): Promise<Provider> => {
  const response = await fetch(`${API_URL}/providers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create provider');
  return response.json();
};

export const updateProvider = async (id: string, data: Partial<Provider>): Promise<Provider> => {
  const response = await fetch(`${API_URL}/providers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update provider');
  return response.json();
};

export const deleteProvider = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/providers/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete provider');
};

export const createUser = async (data: Partial<AppUser>): Promise<AppUser> => {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create user');
  }
  return response.json();
};

export const deleteUser = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete user');
};
