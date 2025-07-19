import chromium from '@sparticuz/chromium';

const exePath =
  process.platform === 'win32'
    ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    : process.platform === 'linux'
    ? '/usr/bin/google-chrome'
    : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

export async function getOptions(isDev: boolean) {
    let options;

    if (isDev) {
        options = {
            args: [],
            executablePath: exePath,
            headless: true,
        };
    } else {
        options = {
            args: chromium.args,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        };
    }

    return options;
}