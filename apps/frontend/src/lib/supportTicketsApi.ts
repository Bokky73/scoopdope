import api from './api';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface TicketReply {
  id: string;
  ticketId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author?: { id: string; username?: string; email?: string };
}

export interface SupportTicket {
  id: string;
  studentId: string;
  subject: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  replies?: TicketReply[];
  student?: { id: string; username?: string; email?: string };
}

export interface PaginatedTickets {
  data: SupportTicket[];
  total: number;
  page: number;
  limit: number;
}

export const supportTicketsApi = {
  createTicket: (data: { subject: string; description: string }) =>
    api.post<SupportTicket>('/support-tickets', data).then((r) => r.data),

  getMyTickets: (params?: { status?: TicketStatus; page?: number; limit?: number }) =>
    api.get<PaginatedTickets>('/support-tickets', { params }).then((r) => r.data),

  getTicket: (id: string) =>
    api.get<SupportTicket>(`/support-tickets/${id}`).then((r) => r.data),

  addReply: (ticketId: string, content: string) =>
    api.post<TicketReply>(`/support-tickets/${ticketId}/replies`, { content }).then((r) => r.data),

  updateStatus: (id: string, status: TicketStatus) =>
    api.patch<SupportTicket>(`/support-tickets/${id}/status`, { status }).then((r) => r.data),

  // Admin
  getAllTickets: (params?: { status?: TicketStatus; page?: number; limit?: number }) =>
    api.get<PaginatedTickets>('/admin/support-tickets', { params }).then((r) => r.data),
};
