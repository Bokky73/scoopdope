import api from './api';

export interface Review {
  id: string;
  courseId: string;
  authorId: string;
  authorName: string;
  rating: number;
  text: string;
  createdAt: string;
  upvotes: number;
  instructorReply?: { text: string; createdAt: string };
}

export interface ReviewsResponse {
  reviews: Review[];
  averageRating: number | null;
  totalCount: number;
}

export type SortCriterion = 'helpful' | 'recent' | 'highest';

export const reviewsApi = {
  getReviews: (courseId: string, sort: SortCriterion = 'recent') =>
    api.get<ReviewsResponse>(`/courses/${courseId}/reviews`, { params: { sort } }).then((r) => r.data),

  submitReview: (courseId: string, rating: number, text: string) =>
    api.post<Review>(`/courses/${courseId}/reviews`, { rating, text }).then((r) => r.data),

  submitInstructorReply: (courseId: string, reviewId: string, text: string) =>
    api.post(`/courses/${courseId}/reviews/${reviewId}/reply`, { text }).then((r) => r.data),
};
