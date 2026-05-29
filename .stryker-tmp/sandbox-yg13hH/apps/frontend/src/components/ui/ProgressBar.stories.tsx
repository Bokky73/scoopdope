import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from './ProgressBar';

const meta = {
  title: 'UI/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    value: 0,
    label: 'Course Progress',
  },
};

export const Partial: Story = {
  args: {
    value: 50,
    label: 'Course Progress',
  },
};

export const Complete: Story = {
  args: {
    value: 100,
    label: 'Course Progress',
  },
};

export const NoLabel: Story = {
  args: {
    value: 75,
  },
};
