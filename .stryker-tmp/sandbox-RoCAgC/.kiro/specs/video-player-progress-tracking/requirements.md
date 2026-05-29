# Requirements Document

## Introduction

This feature adds a custom video player to lesson content pages in the scoopdope learning platform. The player integrates with the existing progress tracking backend (`POST /progress`) to automatically record watch progress per lesson. It also provides playback speed controls, picture-in-picture mode, and keyboard shortcuts to improve the learner experience.

The player is built on top of Plyr (a lightweight, accessible HTML5 video wrapper) and integrates with the existing Zustand progress store and the `api` Axios client.

## Glossary

- **VideoPlayer**: The React component that wraps Plyr and exposes playback controls, progress events, and keyboard shortcuts.
- **ProgressTracker**: The logic layer (custom hook) responsible for debouncing watch-time events and sending `progressPct` updates to the backend via `POST /progress`.
- **Lesson**: A single unit of course content identified by a `lessonId` UUID and associated with a `courseId` UUID.
- **progressPct**: An integer 0–100 representing the percentage of a lesson video that has been watched, derived from `currentTime / duration * 100`.
- **Plyr**: The open-source HTML5 media player library used as the underlying player engine.
- **PiP**: Picture-in-Picture — a browser API that allows a video to float in a small overlay window outside the browser tab.
- **Debounce**: A technique to limit how frequently a function fires; progress updates are debounced to avoid excessive API calls.

---

## Requirements

### Requirement 1: Video Playback

**User Story:** As a student, I want to watch lesson videos inside the course page, so that I can consume course content without leaving the platform.

#### Acceptance Criteria

1. WHEN a lesson page loads with a valid video URL, THE VideoPlayer SHALL render a playable video element using Plyr.
2. WHEN the video URL is absent or invalid, THE VideoPlayer SHALL display a descriptive error message in place of the player.
3. THE VideoPlayer SHALL support MP4 and HLS (`.m3u8`) video sources.
4. WHILE the video is loading, THE VideoPlayer SHALL display a loading indicator.
5. WHEN the video finishes playing, THE VideoPlayer SHALL emit an `onComplete` callback.

---

### Requirement 2: Automatic Progress Tracking

**User Story:** As a student, I want my watch progress saved automatically, so that I can resume lessons where I left off and earn course completion credentials.

#### Acceptance Criteria

1. WHILE a video is playing, THE ProgressTracker SHALL compute `progressPct` as `Math.round(currentTime / duration * 100)` and send it to `POST /progress` no more than once every 10 seconds.
2. WHEN the video is paused or the component unmounts, THE ProgressTracker SHALL immediately flush any pending progress update to `POST /progress`.
3. WHEN `progressPct` reaches 100, THE ProgressTracker SHALL send a final update with `progressPct: 100` and invoke the `onComplete` callback.
4. WHEN the backend returns a non-2xx response, THE ProgressTracker SHALL retry the request up to 2 additional times with a 2-second delay before silently failing.
5. THE ProgressTracker SHALL update the Zustand `useProgressStore` with the latest `progressPct` after each successful backend response.
6. WHEN a user revisits a lesson with existing progress, THE VideoPlayer SHALL seek to the position corresponding to the stored `progressPct` on initial load.

---

### Requirement 3: Playback Speed Controls

**User Story:** As a student, I want to adjust the playback speed, so that I can watch content at a pace that suits my learning style.

#### Acceptance Criteria

1. THE VideoPlayer SHALL offer playback speed options: 0.5×, 0.75×, 1×, 1.25×, 1.5×, 2×.
2. WHEN a user selects a playback speed, THE VideoPlayer SHALL apply the selected speed immediately without interrupting playback.
3. THE VideoPlayer SHALL default to 1× playback speed on initial load.
4. WHEN a user changes the playback speed, THE VideoPlayer SHALL persist the selected speed to `localStorage` under the key `videoPlayer.playbackSpeed`.
5. WHEN the VideoPlayer mounts, THE VideoPlayer SHALL restore the playback speed from `localStorage` if a previously saved value exists.

---

### Requirement 4: Picture-in-Picture Mode

**User Story:** As a student, I want to pop the video into a floating window, so that I can take notes or browse other content while watching.

#### Acceptance Criteria

1. WHERE the browser supports the Picture-in-Picture API, THE VideoPlayer SHALL display a PiP toggle button in the player controls.
2. WHEN a user activates PiP mode, THE VideoPlayer SHALL enter Picture-in-Picture mode using the browser's `requestPictureInPicture()` API.
3. WHEN a user deactivates PiP mode, THE VideoPlayer SHALL exit Picture-in-Picture mode and restore the inline player.
4. WHERE the browser does not support the Picture-in-Picture API, THE VideoPlayer SHALL hide the PiP toggle button.
5. WHEN PiP mode is active, THE ProgressTracker SHALL continue tracking and reporting progress.

---

### Requirement 5: Keyboard Shortcuts

**User Story:** As a student, I want to control the video player with keyboard shortcuts, so that I can navigate lessons efficiently without using the mouse.

#### Acceptance Criteria

1. WHEN the VideoPlayer is focused and the user presses the Space key, THE VideoPlayer SHALL toggle play/pause.
2. WHEN the VideoPlayer is focused and the user presses the ArrowRight key, THE VideoPlayer SHALL seek forward 10 seconds.
3. WHEN the VideoPlayer is focused and the user presses the ArrowLeft key, THE VideoPlayer SHALL seek backward 10 seconds.
4. WHEN the VideoPlayer is focused and the user presses the ArrowUp key, THE VideoPlayer SHALL increase volume by 10%, up to a maximum of 100%.
5. WHEN the VideoPlayer is focused and the user presses the ArrowDown key, THE VideoPlayer SHALL decrease volume by 10%, down to a minimum of 0%.
6. WHEN the VideoPlayer is focused and the user presses the `f` key, THE VideoPlayer SHALL toggle fullscreen mode.
7. WHEN the VideoPlayer is focused and the user presses the `m` key, THE VideoPlayer SHALL toggle mute.
8. THE VideoPlayer SHALL display a visible keyboard shortcut reference accessible via a help icon in the player controls.

---

### Requirement 6: Accessibility

**User Story:** As a student using assistive technology, I want the video player to be accessible, so that I can use it with a keyboard or screen reader.

#### Acceptance Criteria

1. THE VideoPlayer SHALL provide ARIA labels for all interactive controls (play/pause, seek, volume, speed, PiP, fullscreen).
2. THE VideoPlayer SHALL be fully operable using keyboard navigation alone.
3. WHEN captions or subtitles are provided with the video source, THE VideoPlayer SHALL display a captions toggle button.
4. THE VideoPlayer SHALL maintain a visible focus indicator on all interactive controls.
