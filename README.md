# YouTube Clone

This is a Next.js project that implements a pixel-perfect YouTube clone with a "Smart Feed" vertical scrolling feature for horizontal videos.

## Getting Started
First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features
- **Smart Feed**: A TikTok-style vertical scrolling feed optimized for horizontal videos.
- **YouTube API Integration**: Auto-playing short clips and highlight reels utilizing real YouTube videos via IFrames.
- **Responsive Navigation**: A clean sidebar and bottom navigation depending on screen size.

## Troubleshooting

### Port 3000 Already in Use (`EADDRINUSE`)
If the Next.js server fails to start because port `3000` is occupied by a background Zombie Node process, you can free it by running:
- **Windows**: `netstat -ano | findstr :3000` to find the PID, then `taskkill /PID <PID> /F`.

### Hydration Error with Scroll Lock
If you're running this in an embedded preview environment, the environment might inject an `antigravity-scroll-lock` class into the `<body>` tag, causing a React Hydration Error. This is mitigated by the `suppressHydrationWarning` attribute in `src/app/layout.tsx`.

### YouTube API Cross-Origin Error
When using `react-youtube`, you might encounter a `postMessage` error: *"The target origin provided does not match the recipient window's origin"*. This has been fixed by passing the explicit `origin` parameter to `playerVars` in `SmartVideoPlayer.tsx`.
