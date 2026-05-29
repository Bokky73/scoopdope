'use client';

import React, { useState, useEffect } from 'react';
import { assignmentsApi } from '@/lib/assignmentsApi';
import { AssignmentDetails } from './AssignmentDetails';
import { SubmissionForm } from './SubmissionForm';
import { PeerReviewList } from './PeerReviewList';
import { PeerReviewForm } from './PeerReviewForm';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

interface AssignmentsTabProps {
  courseId: string;
}

export const AssignmentsTab: React.FC<AssignmentsTabProps> = ({ courseId }) => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'detail' | 'review'>('list');

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await assignmentsApi.getAssignmentsByCourse(courseId);
      setAssignments(data);
      
      const reviews = await assignmentsApi.getMyReviews();
      setMyReviews(reviews);
    } catch (error) {
      console.error('Failed to load assignments', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAssignment = async (assignment: any) => {
    setSelectedAssignment(assignment);
    const sub = await assignmentsApi.getMySubmission(assignment.id);
    setSubmission(sub);
    setView('detail');
  };

  if (loading) return <div className="flex justify-center p-12"><Spinner /></div>;

  return (
    <div className="space-y-8">
      {view === 'list' && (
        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-bold mb-4">Course Assignments</h3>
            {assignments.length === 0 ? (
              <p className="text-gray-500 bg-gray-50 p-6 rounded-lg border border-dashed">
                No assignments posted for this course yet.
              </p>
            ) : (
              <div className="grid gap-4">
                {assignments.map((a) => (
                  <div key={a.id} className="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50 cursor-pointer" onClick={() => handleSelectAssignment(a)}>
                    <div>
                      <h4 className="font-bold">{a.title}</h4>
                      <p className="text-sm text-gray-500">Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                    </div>
                    <Button variant="outline">View</Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4">Pending Peer Reviews</h3>
            {myReviews.filter(r => !r.isSubmitted).length === 0 ? (
              <p className="text-gray-500 bg-gray-50 p-6 rounded-lg border border-dashed">
                You have no pending peer reviews.
              </p>
            ) : (
              <div className="grid gap-4">
                {myReviews.filter(r => !r.isSubmitted).map((review) => (
                  <div key={review.id} className="p-4 border border-orange-200 bg-orange-50 rounded-lg flex justify-between items-center">
                    <div>
                      <h4 className="font-bold">Review for {review.submission.assignment.title}</h4>
                      <p className="text-sm text-orange-700 font-medium">Action Required: Submit your review</p>
                    </div>
                    <Button onClick={() => { setSelectedAssignment(review.submission.assignment); setSubmission(review.submission); setView('review'); }}>
                      Start Review
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {view === 'detail' && selectedAssignment && (
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => setView('list')} className="mb-2">← Back to List</Button>
          <AssignmentDetails assignment={selectedAssignment} />
          
          <div className="grid md:grid-cols-2 gap-6">
            <SubmissionForm 
              assignmentId={selectedAssignment.id} 
              onSuccess={() => handleSelectAssignment(selectedAssignment)} 
              existingSubmission={submission}
            />
            {submission && <PeerReviewList submission={submission} />}
          </div>
        </div>
      )}

      {view === 'review' && selectedAssignment && submission && (
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => setView('list')} className="mb-2">← Back to List</Button>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
            <h3 className="font-bold text-blue-800">Reviewing Peer Submission</h3>
            <p className="text-blue-700 text-sm mb-2">Assignment: {selectedAssignment.title}</p>
            <a href={submission.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">
              Download/View Peer's File
            </a>
          </div>
          <PeerReviewForm 
            submissionId={submission.id} 
            rubric={selectedAssignment.rubric} 
            onSuccess={() => setView('list')} 
          />
        </div>
      )}
    </div>
  );
};
