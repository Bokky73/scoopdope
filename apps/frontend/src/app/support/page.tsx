'use client';

import { useEffect, useState } from 'react';
import { supportTicketsApi, SupportTicket, TicketReply, TicketStatus } from '@/lib/supportTicketsApi';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const STATUS_COLORS: Record<TicketStatus, string> = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function TicketDetail({
  ticket,
  onClose,
  onReply,
}: {
  ticket: SupportTicket;
  onClose: () => void;
  onReply: (ticketId: string, content: string) => Promise<void>;
}) {
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onReply(ticket.id, replyContent);
      setReplyContent('');
    } catch {
      setError('Failed to send reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-detail-title"
      >
        <div className="flex items-start justify-between p-5 border-b dark:border-gray-800">
          <div>
            <h2 id="ticket-detail-title" className="font-semibold text-gray-900 dark:text-white text-lg">
              {ticket.subject}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={ticket.status} />
              <span className="text-xs text-gray-400">
                {new Date(ticket.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none"
            aria-label="Close ticket detail"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</p>
            <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {ticket.replies && ticket.replies.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Replies</p>
              {ticket.replies.map((reply: TicketReply) => (
                <div key={reply.id} className="border rounded-lg p-3 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {reply.author?.username ?? 'Support'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(reply.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{reply.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
          <form onSubmit={handleReply} className="p-5 border-t dark:border-gray-800 space-y-3">
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              placeholder="Write a reply…"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              maxLength={10000}
              aria-label="Reply content"
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button type="submit" disabled={submitting || !replyContent.trim()}>
              {submitting ? 'Sending…' : 'Send Reply'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function SupportPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function loadTickets() {
    setLoading(true);
    try {
      const result = await supportTicketsApi.getMyTickets({
        status: statusFilter || undefined,
        limit: 50,
      });
      setTickets(result.data);
      setTotal(result.total);
    } catch {
      // error handled by api interceptor
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, statusFilter]);

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const ticket = await supportTicketsApi.createTicket({ subject, description });
      setTickets((prev) => [ticket, ...prev]);
      setTotal((t) => t + 1);
      setSubject('');
      setDescription('');
      setShowNewForm(false);
    } catch {
      setFormError('Failed to create ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReply(ticketId: string, content: string) {
    const reply = await supportTicketsApi.addReply(ticketId, content);
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId ? { ...t, replies: [...(t.replies ?? []), reply] } : t
      )
    );
    setSelectedTicket((prev) =>
      prev?.id === ticketId ? { ...prev, replies: [...(prev.replies ?? []), reply] } : prev
    );
  }

  const activeFilterCount = statusFilter ? 1 : 0;

  if (!user) {
    return (
      <main className="max-w-2xl mx-auto p-8 text-center">
        <p className="text-gray-500">Please log in to view your support tickets.</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {total} ticket{total !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setShowNewForm((v) => !v)}>
          {showNewForm ? 'Cancel' : 'New Ticket'}
        </Button>
      </div>

      {showNewForm && (
        <form
          onSubmit={handleCreateTicket}
          className="border rounded-xl p-5 space-y-4 bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
          aria-label="Create new support ticket"
        >
          <h2 className="font-semibold text-gray-900 dark:text-white">Create a new ticket</h2>
          <div className="space-y-1">
            <label htmlFor="ticket-subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Subject
            </label>
            <input
              id="ticket-subject"
              type="text"
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Briefly describe your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="ticket-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              id="ticket-description"
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={5}
              placeholder="Describe your issue in detail…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={10000}
              required
            />
          </div>
          {formError && <p className="text-red-600 text-sm">{formError}</p>}
          <Button type="submit" disabled={submitting || !subject.trim() || !description.trim()}>
            {submitting ? 'Submitting…' : 'Submit Ticket'}
          </Button>
        </form>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <label htmlFor="status-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold">
              {activeFilterCount}
            </span>
          )}
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TicketStatus | '')}
          className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        {statusFilter && (
          <button
            onClick={() => setStatusFilter('')}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Ticket list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl border animate-pulse bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {statusFilter ? 'No tickets match this status.' : "You haven't submitted any tickets yet."}
        </div>
      ) : (
        <ul className="space-y-3" aria-label="Support tickets">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <button
                onClick={() => setSelectedTicket(ticket)}
                className="w-full text-left border rounded-xl p-4 hover:shadow-sm transition-shadow bg-white dark:bg-gray-900 dark:border-gray-700 space-y-2"
                aria-label={`View ticket: ${ticket.subject}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                    {ticket.subject}
                  </h3>
                  <StatusBadge status={ticket.status} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {ticket.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  {ticket.replies && ticket.replies.length > 0 && (
                    <span>{ticket.replies.length} repl{ticket.replies.length === 1 ? 'y' : 'ies'}</span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedTicket && (
        <TicketDetail
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onReply={handleReply}
        />
      )}
    </main>
  );
}
