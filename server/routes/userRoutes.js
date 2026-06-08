import { Router } from 'express';
import { getAssignableUsers, getUsers, patchUser, removeUser, storeUser } from '../controllers/userController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createUserValidation, updateUserValidation, userIdValidation } from '../validations/userValidation.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.use(authenticate);

router.get('/assignees', getAssignableUsers);
router.get('/', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPPORT_AGENT), getUsers);
router.post('/', authorize(ROLES.ADMIN), createUserValidation, validateRequest, storeUser);
router.patch('/:id', authorize(ROLES.ADMIN), updateUserValidation, validateRequest, patchUser);
router.delete('/:id', authorize(ROLES.ADMIN), userIdValidation, validateRequest, removeUser);

export default router;
