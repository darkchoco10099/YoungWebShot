import puppeteer, { Browser, Page } from 'puppeteer-core';
import { getOptions, checkBrowserAvailability } from './chromium-options';

// 在Vercel等无服务器环境中，不应该复用页面实例
// 每次请求都应该创建新的浏览器实例以避免内存泄漏

export async function getScreenshot(url: string, isDev: boolean) {
    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
        // 环境信息日志
        console.log('Screenshot request:', {
            url,
            isDev,
            nodeEnv: process.env.NODE_ENV,
            platform: process.platform
        });

        // 在开发环境下检查浏览器可用性
        if (isDev) {
            const availability = checkBrowserAvailability();
            if (!availability.available) {
                throw new Error(`浏览器检查失败: ${availability.message}`);
            }
            console.log(`浏览器状态: ${availability.message}`);
        }

        const options = await getOptions(isDev);
        console.log('Browser options:', {
            executablePath: options.executablePath,
            argsCount: options.args?.length || 0,
            headless: options.headless
        });
        browser = await puppeteer.launch(options);
        console.log('Browser launched successfully');
        
        page = await browser.newPage();
        console.log('New page created');

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
        console.log('Navigating to URL:', url);
        await page.goto(url, {
            waitUntil: isDev ? 'networkidle0' : 'domcontentloaded',
            timeout: isDev ? 30000 : 25000
        });
        console.log('Page loaded successfully');

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

        console.log('Taking screenshot...');
        const screenshot = await page.screenshot(screenshotOptions);
        console.log('Screenshot completed, size:', screenshot.length, 'bytes');

        return screenshot;
    } catch (error: any) {
        console.error('Screenshot error details:', {
            message: error?.message || 'Unknown error',
            stack: error?.stack,
            url,
            isDev,
            timestamp: new Date().toISOString()
        });
        
        const errorMessage = error?.message || '';
        
        // 针对 Vercel 部署的特殊错误处理
        if (!isDev && errorMessage.includes('does not exist')) {
            throw new Error(`Vercel 部署错误: Chromium 可执行文件未找到。请检查 @sparticuz/chromium 包是否正确安装和配置。原始错误: ${errorMessage}`);
        }
        
        if (errorMessage.includes('Navigation timeout')) {
            throw new Error(`页面加载超时: ${url}。请检查网址是否可访问或尝试增加超时时间。`);
        }
        
        if (errorMessage.includes('net::ERR_')) {
            throw new Error(`网络错误: 无法访问 ${url}。请检查网址是否正确。`);
        }
        
        throw error;
    } finally {
        // 确保资源被正确释放
        try {
            if (page) {
                await page.close();
                console.log('Page closed');
            }
            if (browser) {
                await browser.close();
                console.log('Browser closed');
            }
        } catch (cleanupError) {
            console.error('Error during cleanup:', cleanupError);
        }
    }
}