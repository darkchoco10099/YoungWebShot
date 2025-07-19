import puppeteer, { Browser, Page } from 'puppeteer-core';
import { getOptions, checkBrowserAvailability } from './chromium-options';

// 在Vercel等无服务器环境中，不应该复用页面实例
// 每次请求都应该创建新的浏览器实例以避免内存泄漏

export async function getScreenshot(url: string, isDev: boolean) {
    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
        // 在开发环境下检查浏览器可用性
        if (isDev) {
            const availability = checkBrowserAvailability();
            if (!availability.available) {
                throw new Error(`浏览器检查失败: ${availability.message}`);
            }
            console.log(`浏览器状态: ${availability.message}`);
        }

        const options = await getOptions(isDev);
        browser = await puppeteer.launch(options);
        page = await browser.newPage();

        // 设置更长的超时时间，适应网络延迟
        await page.setDefaultTimeout(30000);
        await page.setDefaultNavigationTimeout(30000);

        // 设置视口
        await page.setViewport({ 
            width: 1280, 
            height: 720,
            deviceScaleFactor: 1
        });

        // 设置用户代理，避免被网站阻止
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        // 导航到目标URL，等待网络空闲
        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // 等待页面完全加载
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 截图配置 - PNG 格式不支持 quality 参数
        const screenshotOptions: any = {
            type: 'png',
            fullPage: false, // 只截取视口内容，避免过大的图片
        };

        // 只有 JPEG 格式才支持 quality 参数
        if (screenshotOptions.type === 'jpeg') {
            screenshotOptions.quality = 90;
        }

        const screenshot = await page.screenshot(screenshotOptions);

        return screenshot;
    } catch (error) {
        console.error('Screenshot generation failed:', error);
        throw error;
    } finally {
        // 确保资源被正确释放
        try {
            if (page) {
                await page.close();
            }
            if (browser) {
                await browser.close();
            }
        } catch (cleanupError) {
            console.error('Error during cleanup:', cleanupError);
        }
    }
}