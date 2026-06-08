import { User } from '../models/index.js';
import { ROLES } from '../utils/constants.js';
import { ApiError } from '../utils/apiError.js';
import { signToken } from '../utils/jwt.js';

const sanitizeUser = (user) => {
  const plain = user.get({ plain: true });
  delete plain.password;
  return plain;
};

export const registerUser = async (payload, currentUser = null) => {
  const requestedRole = payload.role || ROLES.EMPLOYEE;

  if (requestedRole !== ROLES.EMPLOYEE && currentUser?.role !== ROLES.ADMIN) {
    throw new ApiError(403, 'Only admins can create privileged users.');
  }

  const user = await User.create({
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: requestedRole,
    department: payload.department || null,
  });

  const token = signToken({ id: user.id, role: user.role });
  return { user: sanitizeUser(user), token };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.scope('withPassword').findOne({ where: { email } });

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account is disabled.');
  }

  const token = signToken({ id: user.id, role: user.role });
  return { user: sanitizeUser(user), token };
};
