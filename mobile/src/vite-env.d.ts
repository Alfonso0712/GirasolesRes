/// <reference types="vite/client" />
/// <reference types="@testing-library/jest-dom/vitest" />

declare const __BUILD_INFO__: {
  mode: string;
  timestamp: string;
};

interface Window {
  webkitAudioContext?: typeof AudioContext;
  __bootStartTime?: number;
}
