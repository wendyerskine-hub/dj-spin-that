# DJ Spin That social loops

Makes the spinning-console loops in `/social` (and the website backdrop in `/media`).
Each loop is 8.4 s (252 frames at 30 fps), has no audio, and repeats seamlessly.

## Make a new city version

Needs Node with Playwright and ffmpeg. From this folder:

```bash
node render.js "$PWD" kaohsiung "city=Kaohsiung&night=Night 1 · Nov 19&songs=Song One|Song Two" 540 960
```

```bash
ffmpeg -framerate 30 -i fr_kaohsiung/f%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 -preset slow -movflags +faststart ../../social/dj-spin-that-kaohsiung.mp4
```

## Options (the quoted query string)

| Option | What it does |
|---|---|
| `w=540&h=960` | Tall 9:16 (TikTok, Reels, Threads). Rendered at 2×, so 1080×1920. |
| `w=540&h=540` | Square for the Instagram grid (1080×1080). |
| `city=…&night=…&songs=A\|B` | City version: shows the city, night and the two surprise songs. |
| `bg=1` | Text-free version used as the website background. |

Every version except `bg=1` includes the line
"Fan-made · Not affiliated with BTS, HYBE or BIGHIT MUSIC".
