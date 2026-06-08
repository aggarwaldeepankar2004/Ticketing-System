import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import Swal from 'sweetalert2';
import Badge from '../../components/ui/Badge.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import { ticketService } from '../../services/ticketService.js';

const formatDateTime = (value) =>
  value
    ? new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : 'Not set';

const formatFileSize = (bytes) => {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const TicketDetailsPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [file, setFile] = useState(null);

  const {
    data: ticket,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['ticket-details', id],
    queryFn: () => ticketService.getTicketDetails(id),
  });

  const addCommentMutation = useMutation({
    mutationFn: (payload) => ticketService.addComment(id, payload),
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['ticket-details', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
    },
    onError: (error) => Swal.fire({ title: 'Unable to add comment', text: error.friendlyMessage, icon: 'error', confirmButtonColor: '#135fb0' }),
  });

  const uploadMutation = useMutation({
    mutationFn: (selectedFile) => ticketService.uploadAttachment(id, selectedFile),
    onSuccess: () => {
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ['ticket-details', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      Swal.fire({ title: 'Uploaded', text: 'Attachment uploaded successfully.', icon: 'success', confirmButtonColor: '#135fb0' });
    },
    onError: (error) => Swal.fire({ title: 'Unable to upload', text: error.friendlyMessage, icon: 'error', confirmButtonColor: '#135fb0' }),
  });

  const downloadMutation = useMutation({
    mutationFn: (attachment) => ticketService.downloadAttachment(id, attachment),
    onError: (error) => Swal.fire({ title: 'Unable to download', text: error.friendlyMessage, icon: 'error', confirmButtonColor: '#135fb0' }),
  });

  const handleAddComment = (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    addCommentMutation.mutate({ body: comment });
  };

  const handleUpload = (event) => {
    event.preventDefault();
    if (!file) return;
    uploadMutation.mutate(file);
  };

  if (isLoading) return <LoadingState label="Loading ticket details..." />;

  if (isError || !ticket) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
        <p className="font-semibold">Ticket could not be loaded.</p>
        <Link className="mt-3 inline-block text-sm font-semibold underline" to="/tickets">
          Back to tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <Link className="text-sm font-semibold text-brand-600 hover:text-brand-700" to="/tickets">
            Back to tickets
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-ink dark:text-white">{ticket.title}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>{ticket.status}</Badge>
            <Badge type="priority">{ticket.priority}</Badge>
          </div>
        </div>
        <div className="theme-surface rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#0f1020] lg:min-w-72">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Ownership</p>
          <dl className="mt-3 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500 dark:text-slate-400">Created by</dt>
              <dd className="font-semibold text-slate-800 dark:text-slate-100">{ticket.createdBy?.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500 dark:text-slate-400">Assigned to</dt>
              <dd className="font-semibold text-slate-800 dark:text-slate-100">{ticket.assignedTo?.name || 'Unassigned'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500 dark:text-slate-400">Due date</dt>
              <dd className="font-semibold text-slate-800 dark:text-slate-100">{formatDateTime(ticket.dueDate)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="theme-surface rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0f1020]">
        <h2 className="text-lg font-semibold text-ink dark:text-white">Description</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">{ticket.description}</p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <section className="theme-surface rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0f1020]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink dark:text-white">Conversation</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Comments and updates from the people working this ticket.</p>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">{ticket.comments?.length || 0} comments</span>
          </div>

          <div className="mt-5 space-y-4">
            {(ticket.comments || []).map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{item.author?.name}</p>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{item.author?.role}</p>
                  </div>
                  <time className="shrink-0 text-xs font-medium text-slate-400">{formatDateTime(item.createdAt)}</time>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">{item.body}</p>
              </article>
            ))}
            {ticket.comments?.length === 0 && <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No comments yet.</p>}
          </div>

          <form className="mt-5 space-y-3 border-t border-slate-100 pt-5 dark:border-slate-800" onSubmit={handleAddComment}>
            <label className="block">
              <span className="form-label">Add comment</span>
              <textarea
                className="form-input min-h-28"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Share an update, ask a question, or document the next step..."
              />
            </label>
            <div className="flex justify-end">
              <button type="submit" className="btn-primary" disabled={addCommentMutation.isPending || !comment.trim()}>
                {addCommentMutation.isPending ? 'Posting...' : 'Post comment'}
              </button>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="theme-surface rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0f1020]">
            <h2 className="text-lg font-semibold text-ink dark:text-white">Attachments</h2>
            <form className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900" onSubmit={handleUpload}>
              <input
                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                type="file"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />
              <button type="submit" className="btn-primary mt-4 w-full" disabled={!file || uploadMutation.isPending}>
                {uploadMutation.isPending ? 'Uploading...' : 'Upload attachment'}
              </button>
            </form>

            <div className="mt-5 space-y-3">
              {(ticket.attachments || []).map((attachment) => (
                <div key={attachment.id} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{attachment.originalName}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {formatFileSize(attachment.size)} by {attachment.uploadedBy?.name}
                  </p>
                  <button
                    type="button"
                    className="mt-3 inline-flex text-sm font-semibold text-brand-600 hover:text-brand-700"
                    onClick={() => downloadMutation.mutate(attachment)}
                  >
                    Download
                  </button>
                </div>
              ))}
              {ticket.attachments?.length === 0 && <p className="text-sm text-slate-500">No attachments uploaded.</p>}
            </div>
          </section>

          <section className="theme-surface rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0f1020]">
            <h2 className="text-lg font-semibold text-ink dark:text-white">Activity timeline</h2>
            <div className="mt-5 space-y-4">
              {(ticket.activityLogs || []).map((activity) => (
                <div key={activity.id} className="relative border-l-2 border-brand-100 pl-4 dark:border-violet-500/20">
                  <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-brand-600 ring-4 ring-brand-50" />
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{activity.action}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {activity.actor?.name} · {formatDateTime(activity.createdAt)}
                  </p>
                  {activity.metadata && (
                    <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                      {activity.metadata.to ? `${activity.metadata.from || 'None'} -> ${activity.metadata.to}` : activity.metadata.originalName || activity.metadata.title || 'Recorded update'}
                    </p>
                  )}
                </div>
              ))}
              {ticket.activityLogs?.length === 0 && <p className="text-sm text-slate-500">No activity recorded.</p>}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default TicketDetailsPage;
