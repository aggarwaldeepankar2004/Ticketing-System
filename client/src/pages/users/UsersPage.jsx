import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Swal from 'sweetalert2';
import Badge from '../../components/ui/Badge.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { userService } from '../../services/userService.js';
import { USER_ROLES } from '../../utils/ticketOptions.js';

const emptyUser = {
  name: '',
  email: '',
  password: 'Demo@12345',
  role: 'Employee',
  department: '',
  isActive: true,
};

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalState, setModalState] = useState({ open: false, user: null });
  const [form, setForm] = useState(emptyUser);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', search],
    queryFn: () => userService.getUsers({ search }),
  });

  const canManage = currentUser?.role === 'Admin';

  const saveMutation = useMutation({
    mutationFn: (payload) => (modalState.user ? userService.updateUser(modalState.user.id, payload) : userService.createUser(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setModalState({ open: false, user: null });
      Swal.fire({ title: 'Saved', text: 'User saved successfully.', icon: 'success', confirmButtonColor: '#135fb0' });
    },
    onError: (error) => Swal.fire({ title: 'Unable to save user', text: error.friendlyMessage, icon: 'error', confirmButtonColor: '#135fb0' }),
  });

  const deleteMutation = useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    onError: (error) => Swal.fire({ title: 'Unable to delete user', text: error.friendlyMessage, icon: 'error', confirmButtonColor: '#135fb0' }),
  });

  const openCreate = () => {
    setForm(emptyUser);
    setModalState({ open: true, user: null });
  };

  const openEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      department: user.department || '',
      isActive: Boolean(user.isActive),
    });
    setModalState({ open: true, user });
  };

  const handleSave = (event) => {
    event.preventDefault();
    const payload = { ...form };
    if (modalState.user && !payload.password) delete payload.password;
    saveMutation.mutate(payload);
  };

  const handleDelete = async (user) => {
    const result = await Swal.fire({
      title: 'Delete user?',
      text: user.email,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Delete',
    });
    if (result.isConfirmed) deleteMutation.mutate(user.id);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Users</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage roles, departments, and account status.</p>
        </div>
        {canManage && <button type="button" className="btn-primary" onClick={openCreate}>Create user</button>}
      </div>

      <section className="theme-surface rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#0f1020]">
        <input className="form-input mt-0 max-w-md" placeholder="Search users" value={search} onChange={(event) => setSearch(event.target.value)} />
      </section>

      {isLoading ? (
        <LoadingState label="Loading users..." />
      ) : (
        <div className="table-shell">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="table-th">User</th>
                  <th className="table-th">Role</th>
                  <th className="table-th">Department</th>
                  <th className="table-th">Status</th>
                  {canManage && <th className="table-th">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900">
                    <td className="table-td">
                      <p className="font-semibold text-ink dark:text-white">{user.name}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                    </td>
                    <td className="table-td"><Badge type="role">{user.role}</Badge></td>
                    <td className="table-td">{user.department || 'Not assigned'}</td>
                    <td className="table-td">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.isActive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {user.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    {canManage && (
                      <td className="table-td">
                        <div className="flex gap-2">
                          <button type="button" className="btn-secondary px-3 py-2" onClick={() => openEdit(user)}>Edit</button>
                          <button type="button" className="rounded-lg px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(user)}>Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && <p className="p-6 text-center text-sm text-slate-500">No users found.</p>}
        </div>
      )}

      {modalState.open && (
        <Modal title={modalState.user ? 'Edit user' : 'Create user'} onClose={() => setModalState({ open: false, user: null })}>
          <form className="space-y-4" onSubmit={handleSave}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="form-label">Name</span>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </label>
              <label className="block">
                <span className="form-label">Email</span>
                <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </label>
              <label className="block">
                <span className="form-label">Password</span>
                <input className="form-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!modalState.user} />
              </label>
              <label className="block">
                <span className="form-label">Role</span>
                <select className="form-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {USER_ROLES.map((role) => <option key={role}>{role}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="form-label">Department</span>
                <input className="form-input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </label>
              <label className="mt-8 flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Active account
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" className="btn-secondary" onClick={() => setModalState({ open: false, user: null })}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save user'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default UsersPage;
