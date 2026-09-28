const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

(async () => {
  console.log('--- PlaceX /brag Video Render Starting ---');
  const startTime = Date.now();

  const outputDir = path.resolve('brag-output');
  const workDir = path.join(outputDir, 'work');
  if (!fs.existsSync(workDir)) fs.mkdirSync(workDir, { recursive: true });

  const ffmpegPath = 'C:\\Users\\asus\\AppData\\Local\\Programs\\Python\\Python311\\Lib\\site-packages\\imageio_ffmpeg\\binaries\\ffmpeg-win-x86_64-v7.1.exe';
  const audioPath = path.resolve('.agents/skills/brag/assets/music/happy-beats-business-moves-vol-11-by-ende-dot-app.mp3');
  const finalVideoPath = path.join(outputDir, 'brag.mp4');
  const posterPath = path.join(outputDir, 'brag.jpg');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1920,1080'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  await page.evaluateOnNewDocument(() => {
    window.isHeadlessCapture = true;
  });

  const htmlPath = path.join(outputDir, 'brag-animation.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);

  // Capture settled poster frame (Scene 2 Brand Reveal at 4200ms)
  console.log('Capturing poster frame (brag.jpg)...');
  await page.evaluate(() => window.seekTo(4200));
  const posterBuffer = await page.screenshot({ type: 'jpeg', quality: 95 });
  fs.writeFileSync(posterPath, posterBuffer);
  console.log(`Saved poster to ${posterPath}`);

  // Set up FFmpeg process
  const fps = 30;
  const durationSec = 22;
  const totalFrames = fps * durationSec; // 660 frames

  console.log(`Starting FFmpeg stream: 1920x1080 @ ${fps}fps, ${totalFrames} frames...`);

  const ffmpegArgs = [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-framerate', String(fps),
    '-i', 'pipe:0',
    '-i', audioPath,
    '-filter_complex', '[1:a]atrim=0:22,afade=t=out:st=20.5:d=1.5[a]',
    '-map', '0:v',
    '-map', '[a]',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    finalVideoPath
  ];

  const ffmpeg = spawn(ffmpegPath, ffmpegArgs, { stdio: ['pipe', 'pipe', 'pipe'] });

  ffmpeg.stderr.on('data', (d) => {
    // console.log(d.toString());
  });

  const ffmpegExitPromise = new Promise((resolve, reject) => {
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
    ffmpeg.on('error', reject);
  });

  console.log(`Rendering ${totalFrames} frames directly into FFmpeg...`);

  for (let frame = 0; frame < totalFrames; frame++) {
    // Frame 0 is the baked poster thumbnail; subsequent frames follow timeline
    let tMs = (frame / fps) * 1000;
    if (frame === 0) {
      // Bake poster frame as frame 0 so it serves as the universal platform thumbnail
      tMs = 4200;
    }

    await page.evaluate((t) => window.seekTo(t), tMs);
    const frameBuffer = await page.screenshot({ type: 'jpeg', quality: 92 });

    const ok = ffmpeg.stdin.write(frameBuffer);
    if (!ok) {
      await new Promise(resolve => ffmpeg.stdin.once('drain', resolve));
    }

    if (frame % 60 === 0 || frame === totalFrames - 1) {
      const pct = Math.round((frame / (totalFrames - 1)) * 100);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`Progress: frame ${frame}/${totalFrames} (${pct}%) — ${elapsed}s elapsed`);
    }
  }

  ffmpeg.stdin.end();
  await ffmpegExitPromise;

  await browser.close();

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  const stats = fs.statSync(finalVideoPath);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

  console.log(`\n🎉 Success! Rendered ${finalVideoPath}`);
  console.log(`Video size: ${sizeMb} MB | Total render time: ${totalTime}s`);
})();
