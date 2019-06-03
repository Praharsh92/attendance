const puppeteer = require('puppeteer');
require('dotenv').config();

const args = process.argv;
if (!(args[2] == 'login' || args[2] == 'logout' || args[2] == 'test')) {
  console.log("Invalid Argument");
  process.exit(22);
}

const url = process.env.URL;
const userNameValue = process.env.USER_NAME;
const passwordValue = process.env.PASSWORD;

(async() => {

const browser = await puppeteer.launch(
  {
    headless: false,
    // See flags at https://peter.sh/experiments/chromium-command-line-switches/.
    args: [
      '--disable-infobars', // Removes the butter bar.
      '--start-maximized',
      // '--start-fullscreen',
      // '--window-size=1920,1080',
      // '--kiosk',
    ],
  }
);

const page = await browser.newPage();
await page.setViewport({width: 1920, height: 1080});
// await page.evaluate('document.documentElement.webkitRequestFullscreen()');

await page.goto(url);

const userName = await page.$('#j_username');
await userName.type(userNameValue);
const password = await page.$('#j_password');
await password.type(passwordValue);
const signInBtn = await page.$('#login-button');
await Promise.all([
  await signInBtn.click(),
  page.waitForNavigation({ waitUntil: 'networkidle0' })
]);

const attendanceTab = await page.$('a[href="#home-dashboard-3"]');
await attendanceTab.click();

if (args[2] == 'login') {
  const markSignInBtn = await page.waitForSelector('button.signIn');
  await markSignInBtn.click(),
  // await Promise.all([
  //   page.waitForNavigation({ waitUntil: 'networkidle0' })
  // ]);
} else if (args[2] == 'logout') {
  const markSignOutBtn = await page.waitForSelector('button.signOut');
  await markSignOutBtn.click(),
  // await Promise.all([
  //   page.waitForNavigation({ waitUntil: 'networkidle0' })
  // ]);
}

// await page.waitFor(5000);
await Promise.all([
  await page.evaluate(() => {
    document.querySelector('a[href="/j_spring_security_logout"]').click();
  }),
  page.waitForNavigation({ waitUntil: 'networkidle0' })
]);

// await page.waitFor(5000);
await browser.close();
})();
