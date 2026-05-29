// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { assignmentsApi } from '@/lib/assignmentsApi';
import { toast } from '@/lib/toast';

interface SubmissionFormProps {
  assignmentId: string;
  onSuccess: () => void;
  existingSubmission?: any;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({
  assignmentId,
  onSuccess,
  existingSubmission,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      await assignmentsApi.submitAssignment(assignmentId, file);
      toast.success('Assignment submitted successfully!');
      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">
        {existingSubmission ? 'Resubmit Assignment' : 'Submit Assignment'}
      </h3>
      
      {existingSubmission && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
          You already submitted a file: <a href={existingSubmission.fileUrl} className="underline" target="_blank" rel="noreferrer">View Submission</a>
          <p className="mt-1">Submitted on: {new Date(existingSubmission.submittedAt).toLocaleString()}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Select File (PDF, ZIP, etc.)</label>
          <Input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required={!existingSubmission}
          />
        </div>
        <Button type="submit" disabled={!file || loading} className="w-full">
          {loading ? 'Submitting...' : existingSubmission ? 'Update Submission' : 'Submit'}
        </Button>
      </form>
    </Card>
  );
};
