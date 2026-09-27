import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VideoPlayer } from '@/components/courses/VideoPlayer';

// Mock the progress hook to avoid API calls in tests
vi.mock('@/hooks/useVideoProgress', () => ({
  useVideoProgress: () => ({
    handleTimeUpdate: vi.fn(),
    handlePause: vi.fn(),
    handleEnded: vi.fn(),
  }),
}));

// Mock api to avoid real network requests
vi.mock('@/lib/api', () => ({
  default: { post: vi.fn().mockResolvedValue({}) },
}));

const defaultProps = {
  courseId: 'course-1',
  lessonId: 'lesson-1',
  src: 'https://example.com/video.mp4',
};

describe('VideoPlayer', () => {
  beforeEach(() => {
    localStorage.clear();
    // PiP is not available in jsdom
    Object.defineProperty(document, 'pictureInPictureEnabled', {
      get: () => false,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders a video element with valid src', () => {
    render(<VideoPlayer {...defaultProps} />);
    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
  });

  it('renders error state when src is empty string', () => {
    render(<VideoPlayer {...defaultProps} src="" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/no video source provided/i)).toBeInTheDocument();
  });

  it('container has aria-label describing keyboard shortcuts', () => {
    render(<VideoPlayer {...defaultProps} />);
    const container = screen.getByLabelText(/video player/i);
    expect(container).toBeInTheDocument();
  });

  it('renders playback speed selector with all speed options', () => {
    render(<VideoPlayer {...defaultProps} />);
    const select = screen.getByLabelText(/playback speed/i);
    expect(select).toBeInTheDocument();
    const options = Array.from(select.querySelectorAll('option'));
    expect(options.map((o) => o.value)).toEqual(['0.5', '0.75', '1', '1.25', '1.5', '2']);
  });

  it('PiP button is NOT shown when pictureInPictureEnabled is false', () => {
    render(<VideoPlayer {...defaultProps} />);
    expect(screen.queryByLabelText(/picture-in-picture/i)).not.toBeInTheDocument();
  });

  it('PiP button IS shown when pictureInPictureEnabled is true', () => {
    Object.defineProperty(document, 'pictureInPictureEnabled', {
      get: () => true,
      configurable: true,
    });
    render(<VideoPlayer {...defaultProps} />);
    expect(screen.getByLabelText(/enter picture-in-picture/i)).toBeInTheDocument();
  });

  it('shows CC indicator when captions prop is provided', () => {
    render(
      <VideoPlayer
        {...defaultProps}
        captions={[{ src: '/sub.vtt', srclang: 'en', label: 'English' }]}
      />
    );
    expect(screen.getByLabelText(/captions available/i)).toBeInTheDocument();
  });

  it('does NOT show CC indicator when captions prop is absent', () => {
    render(<VideoPlayer {...defaultProps} />);
    expect(screen.queryByLabelText(/captions available/i)).not.toBeInTheDocument();
  });

  it('toggles keyboard shortcuts popover when help button is clicked', async () => {
    const user = userEvent.setup();
    render(<VideoPlayer {...defaultProps} />);
    const helpBtn = screen.getByLabelText(/keyboard shortcuts help/i);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    await user.click(helpBtn);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();
  });

  it('all interactive controls have ARIA labels', () => {
    render(<VideoPlayer {...defaultProps} />);
    // The container
    expect(screen.getByLabelText(/video player/i)).toBeInTheDocument();
    // Playback speed
    expect(screen.getByLabelText(/playback speed/i)).toBeInTheDocument();
    // Help button
    expect(screen.getByLabelText(/keyboard shortcuts help/i)).toBeInTheDocument();
  });

  it('renders poster attribute on video when provided', () => {
    render(<VideoPlayer {...defaultProps} poster="https://example.com/thumb.jpg" />);
    const video = document.querySelector('video');
    expect(video).toHaveAttribute('poster', 'https://example.com/thumb.jpg');
  });

  it('restores speed from localStorage', () => {
    localStorage.setItem('videoPlayer.playbackSpeed', '1.5');
    render(<VideoPlayer {...defaultProps} />);
    const select = screen.getByLabelText(/playback speed/i) as HTMLSelectElement;
    expect(select.value).toBe('1.5');
  });
});
