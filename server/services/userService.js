import { Op } from 'sequelize';
import { User } from '../models/index.js';
import { ApiError } from '../utils/apiError.js';
import { ROLES } from '../utils/constants.js';

export const listUsers = async ({ search = '' } = {}) => {
  const where = search
    ? {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { department: { [Op.like]: `%${search}%` } },
        ],
      }
    : {};

  return User.findAll({
    where,
    order: [
      ['isActive', 'DESC'],
      ['name', 'ASC'],
    ],
  });
};

export const listAssignableUsers = async () =>
  User.findAll({
    where: {
      isActive: true,
      role: {
        [Op.in]: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPPORT_AGENT],
      },
    },
    order: [
      ['role', 'ASC'],
      ['name', 'ASC'],
    ],
  });

export const createUser = async (payload) =>
  User.create({
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: payload.role,
    department: payload.department || null,
    isActive: payload.isActive ?? true,
  });

export const updateUser = async (id, payload) => {
  const user = await User.findByPk(id);

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const updates = { ...payload };
  if (updates.department === '') updates.department = null;
  if (!updates.password) delete updates.password;

  await user.update(updates);
  return User.findByPk(id);
};

export const deleteUser = async (id, currentUserId) => {
  if (Number(id) === Number(currentUserId)) {
    throw new ApiError(400, 'You cannot delete your own account.');
  }

  const user = await User.findByPk(id);

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  await user.destroy();
};
