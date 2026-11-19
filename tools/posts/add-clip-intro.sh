#!/bin/bash
# Put a short clip (e.g. a creator's live mashup, used with permission) before a post video.
# The clip is shown whole and centered (never cropped, so a watermark stays visible) on the purple intro background.
# Usage: add-clip-intro.sh <clip.mp4> <start-seconds> <end-seconds> <post-9x16.mp4> <post-4x5.mp4> <out-prefix>
# Needs ffmpeg. Writes <out-prefix>.mp4 (1080x1920) and <out-prefix>-4x5.mp4 (1080x1350).
set -e
CLIP="$1"; SS="$2"; TO="$3"; P916="$4"; P45="$5"; OUT="$6"; DIR="$(cd "$(dirname "$0")" && pwd)"
LEN=$(echo "$TO - $SS" | bc)
make(){ # bg post W H out
ffmpeg -loglevel error -y -loop 1 -t "$LEN" -i "$1" -ss "$SS" -t "$LEN" -i "$CLIP" -i "$2" -filter_complex \
"[0:v]fps=30,scale=$3:$4,setsar=1[bg];[1:v]fps=30,scale=1000:1000:force_original_aspect_ratio=decrease,setsar=1[c];[bg][c]overlay=(W-w)/2:(H-h)/2,format=yuv420p,fade=t=out:st=$(echo "$LEN - 0.3" | bc):d=0.3[intro];[2:v]fps=30,scale=$3:$4,setsar=1,format=yuv420p[post];[intro][post]concat=n=2:v=1:a=0[v]" \
-map "[v]" -c:v libx264 -profile:v high -crf 19 -preset medium -movflags +faststart "$5"
}
make "$DIR/clip-intro-bg-9x16.png" "$P916" 1080 1920 "$OUT.mp4"
make "$DIR/clip-intro-bg-4x5.png" "$P45" 1080 1350 "$OUT-4x5.mp4"
echo "made $OUT.mp4 and $OUT-4x5.mp4"
