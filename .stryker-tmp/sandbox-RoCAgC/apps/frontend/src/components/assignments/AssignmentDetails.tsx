// @ts-nocheck
'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface AssignmentDetailsProps {
  assignment: {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    maxPoints: number;
    rubric: any[];
  };
}

export const AssignmentDetails: React.FC<AssignmentDetailsProps> = ({ assignment }) => {
  const isPastDue = new Date(assignment.dueDate) < new Date();

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold">{assignment.title}</h2>
          <p className="text-gray-500">Max Points: {assignment.maxPoints}</p>
        </div>
        <Badge variant={isPastDue ? 'destructive' : 'secondary'}>
          Due: {new Date(assignment.dueDate).toLocaleDateString()}
        </Badge>
      </div>
      
      <div className="prose max-w-none mb-6">
        <p>{assignment.description}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Grading Rubric</h3>
        <div className="space-y-3">
          {assignment.rubric.map((criterion: any) => (
            <div key={criterion.id} className="p-3 border rounded-lg">
              <div className="flex justify-between font-medium">
                <span>{criterion.title}</span>
                <span>{criterion.maxPoints} pts</span>
              </div>
              <p className="text-sm text-gray-600">{criterion.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
