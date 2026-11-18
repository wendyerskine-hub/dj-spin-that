# Holiday TikToks

`holiday.html` is the animated scene (snow, fairy lights, DJ deck, snowman, credits card). `render.js` turns it into a 1080x1920 30 fps MP4 with no audio.

```bash
node tools/holiday/render.js out.mp4            # combined 21s version
node tools/holiday/render.js out.mp4 "nojin=1"  # Snowman SUGA story, drawn snowman (18s)
node tools/holiday/render.js out.mp4 "only=jin" # Jin Mixed This?! (12s)
node tools/holiday/render.js out.mp4 "only=suga" # base for the real-footage version (20.5s)
```

`base-snowman-suga.mp4` (the "only=suga" render) has two empty framed windows that are filled on Wendy's Mac with ffmpeg, so the broadcast footage never goes into this public repo:

- Snowman SUGA clip: 944x944 at x=68, y=528, shown 3.2s to 9.1s
- Weverse screenshot: 984x342 at x=48, y=768, shown 12.4s to 15.9s
