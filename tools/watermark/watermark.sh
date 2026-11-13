#!/usr/bin/env bash
# Watermark a video with the DJ Spin That mark and strip GPS/device metadata.
# Usage: tools/watermark/watermark.sh input.mov output.mp4 [--mute] [--white]
set -euo pipefail
IN="$1"; OUT="$2"; DIR="$(cd "$(dirname "$0")" && pwd)"
AUDIO=(-map 0:a? -c:a aac -b:a 192k); MARK="$DIR/watermark.png"
for a in "${@:3}"; do [ "$a" = "--mute" ] && AUDIO=(-an); [ "$a" = "--white" ] && MARK="$DIR/watermark-white.png"; done
ffmpeg -y -loglevel error -i "$IN" -i "$MARK" \
  -filter_complex "[1]format=rgba,colorchannelmixer=aa=0.8[w];[0:v][w]overlay=(W-w)/2:H*0.635,format=yuv420p[v]" \
  -map "[v]" "${AUDIO[@]}" -map_metadata -1 -map_chapters -1 -metadata:s:v handler_name= -metadata:s:a handler_name= \
  -c:v libx264 -profile:v high -crf 21 -preset medium -movflags +faststart "$OUT"
echo "Wrote $OUT (GPS and device info removed)"
