import { createUser, deleteUser, listAssignableUsers, listUsers, updateUser } from '../services/userService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getUsers = asyncHandler(async (req, res) => {
  const users = await listUsers(req.query);
  res.status(200).json({ success: true, data: { users } });
});

export const getAssignableUsers = asyncHandler(async (_req, res) => {
  const users = await listAssignableUsers();
  res.status(200).json({ success: true, data: { users } });
});

export const storeUser = asyncHandler(async (req, res) => {
  const user = await createUser(req.body);
  res.status(201).json({ success: true, message: 'User created successfully.', data: { user } });
});

export const patchUser = asyncHandler(async (req, res) => {
  const user = await updateUser(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'User updated successfully.', data: { user } });
});

export const removeUser = asyncHandler(async (req, res) => {
  await deleteUser(req.params.id, req.user.id);
  res.status(200).json({ success: true, message: 'User deleted successfully.' });
});
