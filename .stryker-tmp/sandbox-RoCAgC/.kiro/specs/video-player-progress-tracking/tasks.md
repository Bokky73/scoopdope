# Implementation Plan: Video Player with Progress Tracking

## Overview

Implement a Plyr-based video player component with automatic progress tracking, playback speed controls, Picture-in-Picture support, and keyboard shortcuts. Uses the existing `POST /progress` backend API, Zustand progress store, and Vitest + fast-check for testing.

## Tasks

- [ ] 1. Install dependencies and extend the progress store
  - Install `plyr`, `@types/plyr`, and `fast-check` via npm in `apps/frontend`
  - Extend `LessonProgress` interface in `apps/frontend/src/store/progress.store.ts` to add `progressPct?: number`
  - Update the `markLesson` action to accept and persist an optional `progressPct` argument
  - _Requirements: 2.5_

- [ ] 2. Implement the `computeProgressPct` utility and `useVideoProgress` hook
  - [ ] 2.1 Create `apps/frontend/src/lib/videoProgress.ts` with a pure `computeProgressPct(currentTime: number, duration: number): number` function
    - Returns `Math.round(currentTime / duration * 100)` clamped to `[0, 100]`
    - Returns `0` when `duration` is `0` or `NaN`
    - _Requirements: 2.1_

  - [ ]* 2.2 Write property test for `computeProgressPct`
    - **Property 1: progressPct computation is correct for all valid inputs**
    - **Validates: Requirements 2.1**
    - Use `fc.float` for `currentTime` and `duration`; assert result equals formula and is in `[0, 100]`
    - Tag: `Feature: video-player-progress-tracking, Property 1`

  - [ ] 2.3 Create `apps/frontend/src/hooks/useVideoProgress.ts`
    - Accepts `{ courseId, lessonId, onComplete }`
    - Exposes `handleTimeUpdate(currentTime, duration)`, `handlePause(currentTime, duration)`, `handleEnded()`
    - Debounces `POST /progress` calls to at most once per 10 seconds using `setInterval`
    - Flushes immediately on `handlePause` and `handleEnded`
    - Calls `onComplete` and sends `progressPct: 100` when video ends
    - Updates `useProgressStore.markLesson` after each successful response
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [ ]* 2.4 Write property test: store updated with correct progressPct
    - **Property 3: Store is updated with latest progressPct after successful response**
    - **Validates: Requirements 2.5**
    - Use `fc.integer({min:0, max:100})` for progressPct; mock API success; assert store entry matches
    - Tag: `Feature: video-player-progress-tracking, Property 3`

  - [ ]* 2.5 Write property test: retry count on persistent failure
    - **Property 2: Retry count is exactly 3 total attempts on persistent failure**
    - **Validates: Requirements 2.4**
    - Mock API to always return 500; assert total call count === 3
    - Tag: `Feature: video-player-progress-tracking, Property 2`

  - [ ]* 2.6 Write unit tests for `useVideoProgress`
    - Test flush on pause
    - Test flush on unmount
    - Test `onComplete` fires when `progressPct` reaches 100
    - _Requirements: 2.2, 2.3_

- [ ] 3. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement the `usePlaybackSpeed` hook
  - [ ] 4.1 Create `apps/frontend/src/hooks/usePlaybackSpeed.ts`
    - Exports `SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const`
    - Reads initial speed from `localStorage["videoPlayer.playbackSpeed"]`; defaults to `1`
    - `setSpeed` writes to `localStorage` and updates state
    - Wraps `localStorage` access in try/catch; falls back to `1` on error
    - _Requirements: 3.1, 3.3, 3.4, 3.5_

  - [ ]* 4.2 Write property test: playback speed localStorage round-trip
    - **Property 7: Playback speed localStorage round-trip**
    - **Validates: Requirements 3.4, 3.5**
    - Use `fc.constantFrom(...SPEED_OPTIONS)`; set speed, remount hook, assert restored speed matches
    - Tag: `Feature: video-player-progress-tracking, Property 7`

- [ ] 5. Implement keyboard shortcut pure functions
  - [ ] 5.1 Create `apps/frontend/src/lib/videoKeyboard.ts` with pure functions:
    - `seekForward(currentTime: number, duration: number): number` → `min(duration, currentTime + 10)`
    - `seekBackward(currentTime: number, duration: number): number` → `max(0, currentTime - 10)`
    - `volumeUp(volume: number): number` → `min(1, Math.round((volume + 0.1) * 10) / 10)`
    - `volumeDown(volume: number): number` → `max(0, Math.round((volume - 0.1) * 10) / 10)`
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

  - [ ]* 5.2 Write property tests for keyboard shortcut functions
    - **Property 5: Seek keyboard shortcuts clamp to valid range**
    - **Validates: Requirements 5.2, 5.3**
    - Use `fc.float` for currentTime/duration; assert clamped results
    - **Property 6: Volume keyboard shortcuts clamp to [0, 1]**
    - **Validates: Requirements 5.4, 5.5**
    - Use `fc.float({min:0, max:1})` for volume; assert clamped results
    - Tag: `Feature: video-player-progress-tracking, Property 5`
    - Tag: `Feature: video-player-progress-tracking, Property 6`

- [ ] 6. Implement the `VideoPlayer` component
  - [ ] 6.1 Create `apps/frontend/src/components/courses/VideoPlayer.tsx`
    - Mount Plyr on a `<video>` ref via `useEffect`; destroy on unmount
    - Accept `VideoPlayerProps`: `courseId`, `lessonId`, `src`, `type`, `poster`, `captions`, `initialProgressPct`, `onComplete`
    - Render error state (`role="alert"`) when `src` is empty
    - Render loading indicator while Plyr initialises
    - Wire Plyr `timeupdate`, `pause`, and `ended` events to `useVideoProgress` handlers
    - On mount, seek to `(initialProgressPct / 100) * duration` after Plyr is ready
    - Integrate `usePlaybackSpeed`; apply speed to `plyr.speed` and render speed selector in controls
    - Add PiP toggle button; show/hide based on `document.pictureInPictureEnabled`
    - Add keyboard event listener on the container for Space, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, `f`, `m`
    - Add help icon that toggles a keyboard shortcut reference popover
    - Add ARIA labels to all interactive controls
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.6, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 5.1–5.8, 6.1, 6.3, 6.4_

  - [ ]* 6.2 Write property test: initial seek position matches stored progressPct
    - **Property 4: Initial seek position matches stored progressPct**
    - **Validates: Requirements 2.6**
    - Use `fc.integer({min:0, max:100})` for progressPct and `fc.float` for duration; assert `currentTime` set correctly
    - Tag: `Feature: video-player-progress-tracking, Property 4`

  - [ ]* 6.3 Write property test: all interactive controls have ARIA labels
    - **Property 8: All interactive controls have ARIA labels**
    - **Validates: Requirements 6.1**
    - Render VideoPlayer; query all buttons/inputs; assert each has non-empty `aria-label` or `aria-labelledby`
    - Tag: `Feature: video-player-progress-tracking, Property 8`

  - [ ]* 6.4 Write property test: invalid URL always shows error state
    - **Property 9: Invalid video URL always shows error state**
    - **Validates: Requirements 1.2**
    - Use `fc.string()` filtered to non-URL strings; assert `role="alert"` element is rendered
    - Tag: `Feature: video-player-progress-tracking, Property 9`

  - [ ]* 6.5 Write unit tests for VideoPlayer
    - Test renders with valid `src`
    - Test PiP button visibility based on `document.pictureInPictureEnabled`
    - Test captions toggle button present when `captions` prop provided
    - Test Space/f/m key handlers call correct Plyr methods
    - Test `onComplete` callback fires on `ended` event
    - _Requirements: 1.1, 1.5, 4.1, 4.4, 5.1, 5.6, 5.7, 6.3_

- [ ] 7. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Wire VideoPlayer into the lesson page
  - [ ] 8.1 Create `apps/frontend/src/app/courses/[id]/lessons/[lessonId]/page.tsx`
    - Fetch lesson data (video URL, title, courseId) from the API
    - Read `initialProgressPct` from `useProgressStore` for the current lesson
    - Render `<VideoPlayer>` with all required props
    - On `onComplete`, call `useProgressStore.markLesson` and optionally navigate to the next lesson
    - _Requirements: 1.1, 2.3, 2.6_

  - [ ]* 8.2 Write unit test for lesson page
    - Mock API response and progress store; assert VideoPlayer receives correct props
    - _Requirements: 1.1, 2.6_

- [ ] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- `fast-check` property tests run a minimum of 100 iterations each
- Plyr must be imported dynamically (`next/dynamic` with `ssr: false`) since it accesses `window`
- The `useVideoProgress` hook uses `useRef` for the interval ID to avoid stale closure issues
- HLS support requires `hls.js` as a peer dependency of Plyr; install alongside Plyr
