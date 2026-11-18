# Holiday TikToks

`holiday.html` is the animated scene (snow, fairy lights, DJ deck, snowman, credits card). `render.js` turns it into a 1080x1920 30 fps MP4 with no audio.

```bash
node tools/holiday/render.js out.mp4            # combined 21s version
node tools/holiday/render.js out.mp4 "nojin=1"  # Snowman SUGA story, drawn snowman (18s)
node tools/holiday/render.js out.mp4 "only=jin" # Jin Mixed This?! (12s)
node tools/holiday/render.js out.mp4 "only=suga" # base for the real-footage version (20.5s)
node tools/holiday/render.js out.mp4 "only=bg"   # background only: snow + fairy lights, no text (10s)
```

`base-snowman-suga.mp4` (the "only=suga" render) has two empty framed windows that are filled on Wendy's Mac with ffmpeg, so the broadcast footage never goes into this public repo:

- Snowman SUGA clip: 944x944 at x=68, y=528, shown 3.2s to 9.1s
- Weverse screenshot: 984x342 at x=48, y=768, shown 12.4s to 15.9s

## Website holiday theme (draft)

The same snow and fairy lights are built into the site as a draft theme. Preview it at
https://djspinthat.net/?holiday=1 (add a tab, e.g. https://djspinthat.net/?holiday=1#freebies).
Visitors don't see it. To switch it on for everyone every December, set `HOLIDAY_AUTO=true` in index.html
(search for "Holiday theme"). `?holiday=0` turns it off for testing.
