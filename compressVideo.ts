import { $, file } from "bun"
import path from "path"




const sourceVidName = Bun.argv[2]
assert(sourceVidName !== undefined, "No source video provided. Please provide one as an argument. Example: bun compressVideo.ts promoVid.mp4")
const publicUrl = "/res/vid"
const publicDir = path.join("public", publicUrl)





const videoResolutionP = [720, 480, 360, 240]; // [2160, 1440, 1080, 720, 480, 360, 240];
const hslSegmentLengthInS = 5
const frameCount = 40
const columns = 5 // Number of thumbnails per row
const thumbWidth = 320 // Scale width for thumbnails
const distVideoName = "video.m3u8"
const distSpriteName = "prev.png"


const sourceVidWithoutExt = (() => {
  const a = sourceVidName.split(".")
  a.pop()
  return a.join(".")
})()
const distDirName = sourceVidWithoutExt

const sourceVideo = path.join(publicDir, sourceVidName)
const distVideoDir = path.join(publicDir, distDirName)
const outputDir = distVideoDir // # Output directory for the sprite
const spriteUrl = path.join(publicUrl, distDirName, distSpriteName)
const vvtOutputFile = path.join(outputDir, "prev.vtt")






const videoWidth = +await $`ffprobe -v error -select_streams v:0 -show_entries stream=width -of default=noprint_wrappers=1:nokey=1 ${sourceVideo}`.text()
const videoHeight = +await $`ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=noprint_wrappers=1:nokey=1 ${sourceVideo}`.text()
const aspectRatio = videoWidth / videoHeight

assert(!isNaN(aspectRatio))





// Generate the HLS video
await makeDir(distVideoDir)

// Example: ffmpeg -i source.mp4 -profile:v baseline -level 3.0 -s 1280x720 -start_number 0 -hls_time 10 -hls_list_size 0 -f hls output/720p.m3u8

const vidRes = videoResolutionP.map((res) => {
  const height = res
  let width = Math.round(height * aspectRatio)
  if (width % 2 !== 0) { // must be even
    width += 1
  }
  return { 
    width, 
    height, 
    name: `${res}p`, 
    estimatedBandwidth: 800000 
  }
})

for (const { res, width, height, name } of vidRes) {
  const resolutionDir = path.join(distVideoDir, name)
  await makeDir(resolutionDir)
  console.log(`ffmpeg -i ${sourceVideo} -profile:v baseline -level 3.0 -s ${width}x${height} -start_number 0 -hls_time ${hslSegmentLengthInS} -hls_list_size 0 -f hls ${path.join(resolutionDir, distVideoName)}`)
  await $`ffmpeg -i ${sourceVideo} -profile:v baseline -level 3.0 -s ${width}x${height} -start_number 0 -hls_time ${hslSegmentLengthInS} -hls_list_size 0 -f hls ${path.join(resolutionDir, distVideoName)}`.quiet()
}

let playList = "#EXTM3U\n"
for (const { name, width, height, estimatedBandwidth } of vidRes) {
  playList += `#EXT-X-STREAM-INF:BANDWIDTH=${estimatedBandwidth},RESOLUTION=${width}x${height}\n${name}/${distVideoName}\n`
}

await Bun.write(path.join(distVideoDir, distVideoName), playList)





const thumbHeight = thumbWidth / aspectRatio

// Calculate the total number of thumbnails
const duration = await $`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${sourceVideo}`.text()
const durationOfAFrame = duration / frameCount
const fps = `1/${durationOfAFrame}`

const thumbnails = duration / durationOfAFrame
const rows = Math.floor((thumbnails + columns - 1) / columns)

// Create the output directory if it doesn't exist
await makeDir(outputDir)


console.log(`ffmpeg -i ${sourceVideo} -vf "fps=${fps},scale=${thumbWidth}:${thumbHeight},tile=${columns}x${rows}" ${outputDir}/prev.png`)

// Generate the sprite
await $`ffmpeg -i ${sourceVideo} -vf "fps=${fps},scale=${thumbWidth}:${thumbHeight},tile=${columns}x${rows}" ${outputDir}/prev.png`


// make WEBVVT file
const totalThumbs = rows * columns; // Total number of thumbnails

function secondsToHMS(seconds) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}.000`;
}

let vttContent = "WEBVTT\n\n";

for (let i = 0; i < totalThumbs; i++) {
  const startTime = secondsToHMS(i * durationOfAFrame);
  const endTime = secondsToHMS((i + 1) * durationOfAFrame);
  const x = (i % columns) * thumbWidth;
  const y = Math.floor(i / columns) * thumbHeight; // Correctly using thumbHeight here
  vttContent += `${startTime} --> ${endTime}\n${spriteUrl}#xywh=${x},${y},${thumbWidth},${thumbHeight}\n\n`;
}

await Bun.write(vvtOutputFile, vttContent)




function assert(condition, message = "Assertion failed") {
  if (!condition) {
    throw new Error(message);
  }
}


async function makeDir(dir: string) {
  await $`mkdir -p ${path.resolve(dir)}`
}