import { asyncHandler } from '../utils/asyncHandler.js';
import { loginUser, registerUser } from '../services/authService.js';

export const register = asyncHandler(async (req, res) => {
  const data = await registerUser(req.body, req.user || null);
  res.status(201).json({ success: true, message: 'Account created successfully.', data });
});

export const login = asyncHandler(async (req, res) => {
  const data = await loginUser(req.body);
  res.status(200).json({ success: true, message: 'Logged in successfully.', data });
});

export const me = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user } });
});

export const logout = asyncHandler(async (_req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
});
