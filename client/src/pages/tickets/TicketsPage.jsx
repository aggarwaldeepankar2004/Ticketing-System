import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import Badge from '../../components/ui/Badge.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { ticketService } from '../../services/ticketService.js';
import { userService } from '../../services/userService.js';
import { TICKET_PRIORITIES, TICKET_STATUSES } from '../../utils/ticketOptions.js';

const emptyTicket = {
  title: '',
  description: '',
  status: 'Open',
  priority: 'Medium',
  assignedToId: '',
  dueDate: '',
};

const TicketsPage = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    assignedToId: '',
    due: '',
    scope: 'all',
    sortBy: 'updatedAt',
    sortDir: 'DESC',
  });
  const [modalState, setModalState] = useState({ open: false, ticket: null });
  const [form, setForm] = useState(emptyTicket);

  const { data: users = [] } = useQuery({ queryKey: ['users-for-ticket-form'], queryFn: userService.getAssignees });
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => ticketService.getTickets(filters),
  });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      modalState.ticket ? ticketService.updateTicket(modalState.ticket.id, payload) : ticketService.createTicket(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      setModalState({ open: false, ticket: null });
      Swal.fire({ title: 'Saved', text: 'Ticket saved successfully.', icon: 'success', confirmButtonColor: '#135fb0' });
    },
    onError: (error) => Swal.fire({ title: 'Unable to save ticket', text: error.friendlyMessage, icon: 'error', confirmButtonColor: '#135fb0' }),
  });

  const deleteMutation = useMutation({
    mutationFn: ticketService.deleteTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
    },
  });

  const openCreate = () => {
    setForm(emptyTicket);
    setModalState({ open: true, ticket: null });
  };

  const openEdit = (ticket) => {
    setForm({
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      assignedToId: ticket.assignedToId || '',
      dueDate: ticket.dueDate ? ticket.dueDate.slice(0, 10) : '',
    });
    setModalState({ open: true, ticket });
  };

  const handleSave = (event) => {
    event.preventDefault();
    saveMutation.mutate({
      ...form,
      assignedToId: form.assignedToId || null,
      dueDate: form.dueDate || null,
    });
  };

  const handleDelete = async (ticket) => {
    const result = await Swal.fire({
      title: 'Delete ticket?',
      text: ticket.title,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Delete',
    });
    if (result.isConfirmed) deleteMutation.mutate(ticket.id);
  };

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  const clearFilters = () =>
    setFilters({
      search: '',
      status: '',
      priority: '',
      assignedToId: '',
      due: '',
      scope: 'all',
      sortBy: 'updatedAt',
      sortDir: 'DESC',
    });

  const quickFilters = [
    { label: 'Open', next: { status: 'Open', due: '' }, active: filters.status === 'Open' },
    { label: 'Critical', next: { priority: 'Critical', due: '' }, active: filters.priority === 'Critical' },
    { label: 'Overdue', next: { due: 'overdue', status: '' }, active: filters.due === 'overdue' },
    { label: 'Due soon', next: { due: 'dueSoon', status: '' }, active: filters.due === 'dueSoon' },
    { label: 'Unassigned', next: { due: 'unassigned', assignedToId: '' }, active: filters.due === 'unassigned' },
  ];

  const scopeTabs = [
    { label: 'All accessible', value: 'all' },
    { label: 'Assigned to me', value: 'assignedToMe' },
    { label: 'Raised by me', value: 'raisedByMe' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Tickets</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create, assign, prioritize, and move work through the support queue.</p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreate}>
          New ticket
        </button>
      </div>

      <section className="theme-surface rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#0f1020]">
        <div className="mb-4 grid gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-900 sm:grid-cols-3">
          {scopeTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                filters.scope === tab.value ? 'bg-white text-brand-700 shadow-sm dark:bg-[#4A1992] dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              onClick={() => updateFilter('scope', tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">
          <input
            className="form-input mt-0 lg:flex-1"
            placeholder="Search by title or description"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
          <button type="button" className="btn-secondary" onClick={clearFilters}>
            Clear filters
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {quickFilters.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                item.active ? 'bg-brand-600 text-white shadow-sm dark:bg-[#4A1992]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
              onClick={() => setFilters((current) => ({ ...current, ...item.next }))}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-5">
          <select className="form-input mt-0" value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
            <option value="">All statuses</option>
            {TICKET_STATUSES.map((status) => <option key={status}>{status}</option>)}
          </select>
          <select className="form-input mt-0" value={filters.priority} onChange={(e) => updateFilter('priority', e.target.value)}>
            <option value="">All priorities</option>
            {TICKET_PRIORITIES.map((priority) => <option key={priority}>{priority}</option>)}
          </select>
          <select className="form-input mt-0" value={filters.assignedToId} onChange={(e) => updateFilter('assignedToId', e.target.value)}>
            <option value="">All assignees</option>
          {users.map((user) => <option key={user.id} value={user.id}>{user.name} ({user.role})</option>)}
          </select>
          <select className="form-input mt-0" value={filters.sortBy} onChange={(e) => updateFilter('sortBy', e.target.value)}>
            <option value="updatedAt">Recently updated</option>
            <option value="createdAt">Recently created</option>
            <option value="dueDate">Due date</option>
            <option value="priority">Priority</option>
          </select>
          <select className="form-input mt-0" value={filters.sortDir} onChange={(e) => updateFilter('sortDir', e.target.value)}>
            <option value="DESC">Descending</option>
            <option value="ASC">Ascending</option>
          </select>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-sky-100 bg-sky-50 p-4 dark:border-sky-500/20 dark:bg-sky-500/10">
          <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">Visible tickets</p>
          <p className="mt-1 text-2xl font-bold text-sky-950 dark:text-sky-100">{tickets.length}</p>
        </div>
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 dark:border-rose-500/20 dark:bg-rose-500/10">
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">Critical in view</p>
          <p className="mt-1 text-2xl font-bold text-rose-950 dark:text-rose-100">{tickets.filter((ticket) => ticket.priority === 'Critical').length}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Unassigned in view</p>
          <p className="mt-1 text-2xl font-bold text-amber-950 dark:text-amber-100">{tickets.filter((ticket) => !ticket.assignedToId).length}</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingState label="Loading tickets..." />
      ) : (
        <div className="table-shell">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="table-th">Ticket</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Priority</th>
                  <th className="table-th">Raised by</th>
                  <th className="table-th">Assigned</th>
                  <th className="table-th">Updated</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900">
                    <td className="table-td">
                      <p className="font-semibold text-ink dark:text-white">{ticket.title}</p>
                      <p className="mt-1 line-clamp-1 max-w-xl text-xs text-slate-500 dark:text-slate-400">{ticket.description}</p>
                    </td>
                    <td className="table-td"><Badge>{ticket.status}</Badge></td>
                    <td className="table-td"><Badge type="priority">{ticket.priority}</Badge></td>
                    <td className="table-td">{ticket.createdBy?.name || 'Unknown'}</td>
                    <td className="table-td">{ticket.assignedTo?.name || 'Unassigned'}</td>
                    <td className="table-td">{new Date(ticket.updatedAt).toLocaleDateString()}</td>
                    <td className="table-td">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className="btn-secondary px-3 py-2" onClick={() => openEdit(ticket)}>Edit</button>
                        <Link className="btn-secondary px-3 py-2" to={`/tickets/${ticket.id}`}>View</Link>
                        <button type="button" className="rounded-lg px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(ticket)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tickets.length === 0 && <p className="p-6 text-center text-sm text-slate-500">No tickets found.</p>}
        </div>
      )}

      {modalState.open && (
        <Modal title={modalState.ticket ? 'Edit ticket' : 'Create ticket'} onClose={() => setModalState({ open: false, ticket: null })}>
          <form className="space-y-4" onSubmit={handleSave}>
            <label className="block">
              <span className="form-label">Title</span>
              <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label className="block">
              <span className="form-label">Description</span>
              <textarea className="form-input min-h-28" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="form-label">Status</span>
                <select className="form-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {TICKET_STATUSES.map((status) => <option key={status}>{status}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="form-label">Priority</span>
                <select className="form-input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  {TICKET_PRIORITIES.map((priority) => <option key={priority}>{priority}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="form-label">Assign to</span>
                <select className="form-input" value={form.assignedToId} onChange={(e) => setForm({ ...form, assignedToId: e.target.value })}>
                  <option value="">Unassigned</option>
                  {users.map((user) => <option key={user.id} value={user.id}>{user.name} ({user.role})</option>)}
                </select>
              </label>
              <label className="block">
                <span className="form-label">Due date</span>
                <input className="form-input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" className="btn-secondary" onClick={() => setModalState({ open: false, ticket: null })}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save ticket'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TicketsPage;
