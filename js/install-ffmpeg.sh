#!/usr/bin/bash
curl -L "https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz" \
 | tar xJ -C /usr/local/bin --wildcards --strip-components=1 \
   ffmpeg-*-static/ffmpeg ffmpeg-*-static/ffprobe
