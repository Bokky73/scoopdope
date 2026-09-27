'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supportTicketsApi, SupportTicket, TicketStatus } from '@/lib/supportTicketsApi';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

const STATUS_COLORS: Record<TicketStatus, string> = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
};

export default function AdminSupportTicketsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user, router]);

  async function loadTickets() {
    setLoading(true);
    try {
      const result = await supportTicketsApi.getAllTickets({
        status: statusFilter || undefined,
        limit: 100,
      });
      setTickets(result.data);
      setTotal(result.total);
    } catch {
      // handled by api interceptor
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, statusFilter]);

  async function handleStatusUpdate(ticketId: string, status: TicketStatus) {
    const updated = await supportTicketsApi.updateStatus(ticketId, status);
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: updated.status } : t)));
    if (selectedTicket?.id === ticketId) setSelectedTicket((prev) => prev ? { ...prev, status: updated.status } : prev);
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTicket || !replyContent.trim()) return;
    setSubmitting(true);
    try {
      const reply = await supportTicketsApi.addReply(selectedTicket.id, replyContent);
      setSelectedTicket((prev) =>
        prev ? { ...prev, replies: [...(prev.replies ?? []), reply] } : prev
      );
      setReplyContent('');
    } finally {
      setSubmitting(false);
    }
  }

  async function openTicket(ticket: SupportTicket) {
    try {
      const full = await supportTicketsApi.getTicket(ticket.id);
      setSelectedTicket(full);
    } catch {
      setSelectedTicket(ticket);
    }
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Support Tickets
        <span className="ml-2 text-base font-normal text-gray-400">({total})</span>
      </h1>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TicketStatus | '')}
          className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-sm"
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
            className="text-xs text-gray-500 underline hover:text-gray-700"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket list */}
        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
            ))
          ) : tickets.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 py-8 text-center">No tickets found.</p>
          ) : (
            tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => openTicket(ticket)}
                className={`w-full text-left border rounded-lg p-4 transition-shadow hover:shadow-sm space-y-1 ${
                  selectedTicket?.id === ticket.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'bg-white dark:bg-gray-900 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">
                    {ticket.subject}
                  </span>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[ticket.status]}`}>
                    {ticket.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {ticket.student?.username ?? ticket.student?.email ?? 'Unknown student'} ·{' '}
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Ticket detail */}
        {selectedTicket ? (
          <div className="border rounded-xl p-5 space-y-4 bg-white dark:bg-gray-900 dark:border-gray-700">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">{selectedTicket.subject}</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedTicket.student?.username ?? selectedTicket.student?.email ?? 'Student'} ·{' '}
                  {new Date(selectedTicket.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
                aria-label="Close detail"
              >
                &times;
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                {selectedTicket.description}
              </p>
            </div>

            {/* Status update */}
            <div className="flex items-center gap-3">
              <label htmlFor="status-update" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Status:
              </label>
              <select
                id="status-update"
                value={selectedTicket.status}
                onChange={(e) => handleStatusUpdate(selectedTicket.id, e.target.value as TicketStatus)}
                className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm bg-white dark:bg-gray-800"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Replies */}
            {selectedTicket.replies && selectedTicket.replies.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Replies</p>
                {selectedTicket.replies.map((reply) => (
                  <div key={reply.id} className="border rounded-lg p-3 dark:border-gray-700 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {reply.author?.username ?? 'Support'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(reply.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply form */}
            <form onSubmit={handleReply} className="space-y-2 border-t pt-4 dark:border-gray-700">
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder="Write a reply to the student…"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                maxLength={10000}
                aria-label="Reply to ticket"
              />
              <Button type="submit" disabled={submitting || !replyContent.trim()}>
                {submitting ? 'Sending…' : 'Send Reply'}
              </Button>
            </form>
          </div>
        ) : (
          <div className="border rounded-xl p-8 text-center text-gray-400 dark:border-gray-700">
            Select a ticket to view details
          </div>
        )}
      </div>
    </main>
  );
}
