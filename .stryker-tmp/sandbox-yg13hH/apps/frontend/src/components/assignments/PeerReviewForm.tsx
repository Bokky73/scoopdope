'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { assignmentsApi } from '@/lib/assignmentsApi';
import { toast } from '@/lib/toast';

interface PeerReviewFormProps {
  submissionId: string;
  rubric: any[];
  onSuccess: () => void;
}

export const PeerReviewForm: React.FC<PeerReviewFormProps> = ({
  submissionId,
  rubric,
  onSuccess,
}) => {
  const [scores, setScores] = useState<any[]>(
    rubric.map((c) => ({ criterionId: c.id, score: 0, feedback: '' }))
  );
  const [overallFeedback, setOverallFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScoreChange = (index: number, field: string, value: any) => {
    const newScores = [...scores];
    newScores[index][field] = value;
    setScores(newScores);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await assignmentsApi.submitReview(submissionId, {
        scores,
        overallFeedback,
      });
      toast.success('Review submitted successfully!');
      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">Peer Review</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        {rubric.map((criterion, index) => (
          <div key={criterion.id} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between font-medium">
              <span>{criterion.title}</span>
              <span className="text-sm text-gray-500">Max: {criterion.maxPoints} pts</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{criterion.description}</p>
            <div className="flex gap-4 items-center">
              <label className="text-sm font-medium">Score:</label>
              <Input
                type="number"
                min={0}
                max={criterion.maxPoints}
                value={scores[index].score}
                onChange={(e) => handleScoreChange(index, 'score', parseInt(e.target.value))}
                className="w-24"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Feedback for this criterion:</label>
              <textarea
                className="w-full p-2 border rounded-md text-sm mt-1"
                rows={2}
                value={scores[index].feedback}
                onChange={(e) => handleScoreChange(index, 'feedback', e.target.value)}
                placeholder="How can they improve?"
              />
            </div>
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium mb-1">Overall Feedback</label>
          <textarea
            className="w-full p-3 border rounded-md"
            rows={4}
            value={overallFeedback}
            onChange={(e) => setOverallFeedback(e.target.value)}
            placeholder="Final thoughts on the submission..."
            required
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Submitting Review...' : 'Submit Peer Review'}
        </Button>
      </form>
    </Card>
  );
};
