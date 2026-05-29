'use client';
import { useEffect, useState } from 'react';
import { reviewsApi, Review, SortCriterion } from '@/lib/reviewsApi';
import { StarRating } from './StarRating';
import { InstructorReply } from './InstructorReply';

interface ReviewListProps {
  courseId: string;
  currentUserId?: string;
  isInstructor?: boolean;
}

const SORT_OPTIONS: { value: SortCriterion; label: string }[] = [
  { value: 'helpful', label: 'Most Helpful' },
  { value: 'recent', label: 'Most Recent' },
  { value: 'highest', label: 'Highest Rating' },
];

export function ReviewList({ courseId, currentUserId, isInstructor = false }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [sort, setSort] = useState<SortCriterion>('recent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    reviewsApi.getReviews(courseId, sort).then((data) => {
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setTotalCount(data.totalCount);
      setLoading(false);
    });
  }, [courseId, sort]);

  return (
    <section aria-label="Course reviews">
      <div className="flex items-center justify-between mb-4">
        <div>
          {averageRating !== null ? (
            <span className="text-2xl font-bold">
              {averageRating.toFixed(1)} <span className="text-yellow-400">★</span>
              <span className="text-sm text-gray-500 ml-2">({totalCount} reviews)</span>
            </span>
          ) : (
            <span className="text-gray-500">No reviews yet</span>
          )}
        </div>
        <select
          className="border rounded px-2 py-1 text-sm"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortCriterion)}
          aria-label="Sort reviews"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse border rounded-lg p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500">No reviews yet</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{review.authorName}</span>
                <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <StarRating value={review.rating} readOnly />
              <p className="mt-2 text-sm text-gray-700">{review.text}</p>
              <InstructorReply
                courseId={courseId}
                reviewId={review.id}
                existingReply={review.instructorReply}
                isInstructor={isInstructor}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
