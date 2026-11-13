# "How to use djspinthat.net" TikTok video

`record.js` opens the site inside a phone frame (`stage.html`), taps through each tab with step captions,
and captures frames. Run from the repo root:

```bash
node tools/tutorial/record.js "$PWD/tools/tutorial/stage.html" /tmp/tut-frames
```

Then turn the frames into a 30 fps MP4 using the timestamps in `/tmp/tut-frames/ts.json`
(an ffmpeg concat list with each frame's duration). Output: `social/how-to-use-djspinthat.mp4`.
