#!/usr/bin/env node
import { chromium } from 'playwright-core';
import readline from 'node:readline';

const CHROME = process.platform === 'darwin'
  ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  : '/usr/bin/google-chrome';

const targetRoom = process.argv[2]?.toUpperCase() || 'OPEN53';

async function main() {
  console.log(`[HostBot] Launching headless browser for room: ${targetRoom}...`);
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: [
      '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist',
      ...(process.platform === 'darwin' ? ['--use-angle=metal'] : []),
      '--autoplay-policy=no-user-gesture-required',
    ],
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('[OnlinePeer]') || text.includes('[Multiplayer]')) {
      console.log(`[BrowserConsole] ${text}`);
    }
  });

  console.log('[HostBot] Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Switch to Multiplayer mode
  const mpBtn = page.locator('button:has-text("Multiplayer")').first();
  await mpBtn.click();
  await page.waitForSelector('text=RACE LOBBY', { timeout: 10000 });
  await page.waitForTimeout(500);

  // Fill host credentials & create room with targetRoom code
  await page.evaluate((code) => {
    // Inject room creation directly via multiplayerRoom module
    const w = window;
    const room = w.__room || (window.multiplayerRoom);
  });

  // Click Create Room as Host
  const createBtn = page.locator('button:has-text("Create Room as Host")');
  await createBtn.click();
  await page.waitForSelector('text=Direct Invite Link', { timeout: 10000 });
  await page.waitForTimeout(500);

  const linkEl = page.locator('span.select-all').first();
  const rawUrl = (await linkEl.innerText()).trim();
  const roomCode = rawUrl.split('?room=')[1] || '';

  console.log('\n==================================================');
  console.log(`>>> ROOM CREATED: ${roomCode}`);
  console.log(`>>> LOCAL LINK:   http://localhost:3000/?room=${roomCode}`);
  console.log(`>>> NETWORK LINK: http://10.83.43.161:3000/?room=${roomCode}`);
  console.log('==================================================\n');

  let startTriggered = false;
  let autoStartArmed = true; // Auto-start as soon as challenger is detected!

  async function tryLaunchRace() {
    if (startTriggered) return;
    try {
      const startBtn = page.locator('button:has-text("START RACE")');
      if (await startBtn.isVisible()) {
        startTriggered = true;
        console.log('[HostBot] Clicking START RACE! Launching race...');
        await startBtn.click();

        await page.waitForURL('**/game', { timeout: 15000 });
        console.log('[HostBot] On /game page! Host is live on track with 0 bots.');

        // Accelerate when race starts
        await page.waitForTimeout(4000);
        console.log('[HostBot] Green flag! Host car driving.');
        await page.keyboard.down('ArrowUp');
      }
    } catch (e) {
      console.debug('[HostBot] Waiting for challenger to enable start button...');
    }
  }

  // Poll for entrant count
  setInterval(async () => {
    try {
      const headerText = await page.locator('text=/GRID ENTRANTS/').innerText().catch(() => '');
      const match = headerText.match(/GRID ENTRANTS \((\d+)\//);
      if (match) {
        const count = parseInt(match[1], 10);
        if (count >= 2) {
          console.log(`[HostBot] Challenger detected! (${count} racers in lobby).`);
          if (autoStartArmed) {
            await tryLaunchRace();
          }
        }
      }
    } catch (e) {}
  }, 800);

  // Read stdin
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.on('line', async (line) => {
    const cmd = line.trim().toLowerCase();
    if (cmd === 'start') {
      console.log('[HostBot] Manual "start" command received.');
      autoStartArmed = true;
      await tryLaunchRace();
    }
  });

  // Keep alive
  await new Promise(() => {});
}

main().catch((err) => {
  console.error('[HostBot] Fatal error:', err);
  process.exit(1);
});
