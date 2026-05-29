'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface PeerReviewListProps {
  submission: {
    peerReviews: any[];
    finalGrade: number | null;
    instructorGrade: number | null;
    instructorFeedback: string | null;
  };
}

export const PeerReviewList: React.FC<PeerReviewListProps> = ({ submission }) => {
  const completedReviews = submission.peerReviews.filter((r) => r.isSubmitted);

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-green-50 border-green-200">
        <h3 className="text-xl font-bold text-green-800 mb-2">Your Grade</h3>
        {submission.finalGrade !== null ? (
          <div>
            <span className="text-3xl font-bold text-green-600">{submission.finalGrade.toFixed(1)}</span>
            <span className="text-gray-500 ml-2">pts</span>
            {submission.instructorGrade !== null && (
              <Badge className="ml-3" variant="secondary">Instructor Override</Badge>
            )}
          </div>
        ) : (
          <p className="text-green-700">Grading in progress...</p>
        )}
      </Card>

      {submission.instructorFeedback && (
        <Card className="p-6 border-blue-200 bg-blue-50">
          <h4 className="font-bold text-blue-800 mb-2">Instructor Feedback</h4>
          <p className="text-blue-700 italic">"{submission.instructorFeedback}"</p>
        </Card>
      )}

      <div>
        <h3 className="text-xl font-bold mb-4">Peer Feedback ({completedReviews.length})</h3>
        <div className="space-y-4">
          {completedReviews.length === 0 ? (
            <p className="text-gray-500">No peer reviews submitted yet.</p>
          ) : (
            completedReviews.map((review, i) => (
              <Card key={review.id} className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-gray-700">Reviewer #{i + 1}</span>
                  <Badge variant="outline">
                    Score: {review.scores.reduce((sum: number, s: any) => sum + s.score, 0)} pts
                  </Badge>
                </div>
                <div className="space-y-3">
                  {review.scores.map((s: any) => (
                    <div key={s.criterionId} className="text-sm">
                      <span className="font-semibold text-gray-600">{s.criterionId}: </span>
                      <span className="text-gray-700">{s.feedback}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t mt-2">
                    <p className="text-gray-800 italic">"{review.overallFeedback}"</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
