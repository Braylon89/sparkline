# Sparkline ✦

A late-night beat station with pink and purple sparkle branding, cosmic NYC subway artwork, and a one-click original synth music generator.

## Use it

Pick **Hazy indie**, **Night swim**, or **Velvet soul**, choose a length from 2–3 minutes, and press the glowing button. Every press uses a fresh 128-bit cryptographic seed to compose original chords, bass, drums, and melodies with intro, ride, lift, drift, and outro sections.

Play/pause or scrub through the beat. Edit track volumes, mute instruments, adjust tempo, warmth and reverb, or generate a new melody while keeping the groove. Tap the heart to save a project in this browser. Download a full stereo 44.1 kHz / 16-bit WAV including the current mix and effects.

The subway foreground moves toward the cosmic tunnel on a 28-second cycle while the platform stays still. Use the NYC / Outer Space control to pause the animation. Reduced-motion preferences disable animated effects.

The moods are broad creative references to hazy indie, atmospheric R&B, and warm neo-soul. All audio is procedurally synthesized; no artist recordings, samples, or existing songs are used. Random seeds make repeats extraordinarily unlikely, rather than promising mathematically guaranteed global uniqueness.

## Run locally

No dependencies or build step are required. Serve the `dist` folder over HTTP:

```sh
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080`. Audio starts after a button click. Use a modern browser with Web Audio, OfflineAudioContext, ES modules, and Web Workers. Export constructs and renders the full song locally; it can take a moment on phones. There is no API key, external music service, subscription, or server-side audio processing.

## Files

- `dist/index.html` and `dist/style.css`: responsive studio interface.
- `dist/engine.js`: seeded composition, synthesis, live scheduling, effects, and offline rendering.
- `dist/app.js`: controls, transport, collection, and download flow.
- `dist/wav-worker.js`: stereo PCM WAV encoding off the main UI thread.
- `dist/assets/`: custom generated subway artwork, a stationary empty platform, and a transparent animated train layer.

## Hosting

Deploy `dist` to any static web host. For GitHub Pages, enable deployment from the `main` branch and `/(root)` folder. The root index redirects to the studio in `dist`, and `.nojekyll` enables direct static serving. No secret configuration is needed. Public Pages hosting on this account requires a public repository.

Collections are stored in localStorage on the current browser and origin. Download a WAV before clearing browser data. Export snapshots your current settings when you click Download; the master-volume setting is included.
