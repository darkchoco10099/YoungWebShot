import core from 'puppeteer-core';
import { getOptions } from './chromium-options';

let _page: core.Page | null;

async function getPage(isDev: boolean): Promise<core.Page> {
    if (_page) {
        return _page;
    }

    const options = await getOptions(isDev);
    const browser = await core.launch(options);

    _page = await browser.newPage();

    return _page;
}

export async function getScreenshot(url: string, isDev: boolean) {
    const page = await getPage(isDev);

    await page.goto(url);
    await page.setViewport({ width: 1280, height: 720 });

    const file = await page.screenshot({ type: 'png' });

    return file;
}