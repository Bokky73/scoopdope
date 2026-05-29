import api from './api';

export const assignmentsApi = {
  getAssignmentsByCourse: (courseId: string) => api.get(`/assignments/course/${courseId}`).then((res) => res.data),

  getAssignment: (id: string) => api.get(`/assignments/${id}`).then((res) => res.data),
  
  submitAssignment: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/assignments/${id}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data);
  },

  getMySubmission: (id: string) => api.get(`/assignments/${id}/my-submission`).then((res) => res.data),

  getMyReviews: () => api.get('/assignments/my-reviews').then((res) => res.data),

  submitReview: (submissionId: string, data: { scores: any[]; overallFeedback: string }) =>
    api.post(`/assignments/reviews/${submissionId}`, data).then((res) => res.data),

  assignReviewers: (id: string) => api.post(`/assignments/${id}/assign-reviewers`).then((res) => res.data),

  instructorOverride: (submissionId: string, data: { grade: number; feedback: string }) =>
    api.patch(`/assignments/submissions/${submissionId}/override`, data).then((res) => res.data),
};
