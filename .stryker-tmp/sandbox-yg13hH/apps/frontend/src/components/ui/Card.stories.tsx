import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Card Title</h3>
        <p className="text-gray-600 dark:text-gray-400">This is a card component with content.</p>
      </div>
    ),
  },
};

export const WithContent: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold mb-4">Course Information</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Learn blockchain development with Stellar and Soroban smart contracts.
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Enroll Now
        </button>
      </div>
    ),
  },
};
