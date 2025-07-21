// Cloudflare Worker 脚本 - 网页截图服务
// 整合前端界面和截图 API 功能

import puppeteer from '@cloudflare/puppeteer';

// Bark 通知服务
class BarkNotificationService {
    constructor(env) {
        this.barkUrl = env.BARK_URL;
    }

    async sendNotification(title, body, options = {}) {
        if (!this.barkUrl) {
            console.log('Bark URL not configured, skipping notification');
            return;
        }

        try {
            const payload = {
                title: title,
                body: body,
                sound: options.sound || 'default',
                icon: options.icon || 'https://cdn-icons-png.flaticon.com/512/1828/1828833.png',
                group: options.group || 'YoungWebShot',
                url: options.url || '',
                ...options
            };

            const response = await fetch(this.barkUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log('📱 Bark notification sent successfully:', title);
            } else {
                console.warn('⚠️ Bark notification failed:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('❌ Bark notification error:', error.message);
        }
    }

    // 发送部署成功通知
    async sendDeploymentSuccess() {
        await this.sendNotification(
            '🚀 Worker 部署成功',
            'YoungWebShot 截图服务已成功部署并正在运行',
            {
                sound: 'success',
                icon: '🚀',
                group: 'Deployment'
            }
        );
    }

    // 发送服务状态通知
    async sendServiceStatus(status, details = '') {
        const isHealthy = status === 'healthy';
        await this.sendNotification(
            isHealthy ? '✅ 服务运行正常' : '⚠️ 服务异常',
            `YoungWebShot 截图服务状态: ${status}${details ? '\n' + details : ''}`,
            {
                sound: isHealthy ? 'default' : 'alarm',
                icon: isHealthy ? '✅' : '⚠️',
                group: 'ServiceStatus'
            }
        );
    }

    // 发送截图统计通知
    async sendScreenshotStats(count, type = 'single') {
        const emoji = type === 'batch' ? '📊' : '📸';
        const typeText = type === 'batch' ? '批量截图' : '单张截图';
        
        await this.sendNotification(
            `${emoji} ${typeText}完成`,
            `已成功生成 ${count} 张截图`,
            {
                sound: 'default',
                icon: emoji,
                group: 'Screenshots'
            }
        );
    }
}

// HTML 模板 - 完整的前端界面
const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>网页快照工具 - Cloudflare Worker</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <style>
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .card-shadow {
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .loading {
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <div class="container mx-auto p-6 space-y-8">
        <!-- Header -->
        <div class="text-center space-y-2">
            <h1 class="text-4xl font-bold tracking-tight text-slate-900">
                网页快照工具
            </h1>
            <p class="text-lg text-slate-600">
                基于 Cloudflare Worker 的高性能截图服务
            </p>
        </div>

        <!-- Screenshot Generator -->
        <div class="mx-auto max-w-2xl bg-white rounded-lg card-shadow p-6">
            <div class="space-y-4">
                <div class="flex items-center gap-2 mb-4">
                    <i data-lucide="camera" class="h-5 w-5"></i>
                    <h2 class="text-xl font-semibold">生成截图</h2>
                </div>
                
                <div class="space-y-4">
                    <div class="space-y-2">
                        <label for="url" class="block text-sm font-medium text-gray-700">网页地址</label>
                        <div class="flex gap-2">
                            <input
                                id="url"
                                type="url"
                                placeholder="输入网页URL (例如: example.com 或 https://example.com)"
                                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button 
                                id="takeScreenshot"
                                class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <i data-lucide="camera" class="h-4 w-4"></i>
                                <span id="buttonText">截图</span>
                            </button>
                        </div>
                    </div>
                    
                    <div id="error" class="hidden p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        <div class="flex items-center gap-2">
                            <i data-lucide="alert-circle" class="h-4 w-4"></i>
                            <span id="errorText"></span>
                        </div>
                    </div>
                </div>
                
                <div id="result" class="hidden space-y-3">
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-medium text-gray-700">预览结果</label>
                        <button 
                            id="downloadBtn"
                            class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                        >
                            <i data-lucide="download" class="h-4 w-4"></i>
                            下载
                        </button>
                    </div>
                    <div class="border rounded-lg overflow-hidden bg-white">
                        <img 
                            id="screenshot"
                            alt="Website screenshot" 
                            class="w-full h-auto max-h-96 object-contain"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Screenshots History -->
        <div class="bg-white rounded-lg card-shadow p-6">
            <div class="flex items-center gap-2 mb-4">
                <i data-lucide="image" class="h-5 w-5"></i>
                <h2 class="text-xl font-semibold">截图历史</h2>
                <span id="historyCount" class="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">0</span>
            </div>
            
            <div id="historyEmpty" class="text-center py-12 text-gray-500">
                <i data-lucide="image" class="h-12 w-12 mx-auto mb-4 opacity-50"></i>
                <p>暂无截图记录</p>
                <p class="text-sm">生成第一个截图开始使用吧！</p>
            </div>
            
            <div id="historyList" class="hidden space-y-3"></div>
        </div>
    </div>

    <script>
        // 初始化 Lucide 图标
        lucide.createIcons();
        
        // 全局变量
        let screenshots = JSON.parse(localStorage.getItem('screenshots') || '[]');
        
        // DOM 元素
        const urlInput = document.getElementById('url');
        const takeScreenshotBtn = document.getElementById('takeScreenshot');
        const buttonText = document.getElementById('buttonText');
        const errorDiv = document.getElementById('error');
        const errorText = document.getElementById('errorText');
        const resultDiv = document.getElementById('result');
        const screenshotImg = document.getElementById('screenshot');
        const downloadBtn = document.getElementById('downloadBtn');
        const historyCount = document.getElementById('historyCount');
        const historyEmpty = document.getElementById('historyEmpty');
        const historyList = document.getElementById('historyList');
        
        // 工具函数
        function extractDomain(url) {
            try {
                const normalizedUrl = url.startsWith('http') ? url : \`https://\${url}\`;
                return new URL(normalizedUrl).hostname;
            } catch {
                return url.split('/')[0] || 'Unknown';
            }
        }
        
        function formatDate(date) {
            return new Intl.DateTimeFormat('zh-CN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date(date));
        }
        
        function showError(message) {
            errorText.textContent = message;
            errorDiv.classList.remove('hidden');
        }
        
        function hideError() {
            errorDiv.classList.add('hidden');
        }
        
        function setLoading(loading) {
            takeScreenshotBtn.disabled = loading;
            if (loading) {
                buttonText.innerHTML = '<i data-lucide="loader-2" class="h-4 w-4 loading"></i> 生成中...';
            } else {
                buttonText.innerHTML = '<i data-lucide="camera" class="h-4 w-4"></i> 截图';
            }
            lucide.createIcons();
        }
        
        function saveScreenshots() {
            localStorage.setItem('screenshots', JSON.stringify(screenshots));
            updateHistoryDisplay();
        }
        
        function updateHistoryDisplay() {
            historyCount.textContent = screenshots.length;
            
            if (screenshots.length === 0) {
                historyEmpty.classList.remove('hidden');
                historyList.classList.add('hidden');
            } else {
                historyEmpty.classList.add('hidden');
                historyList.classList.remove('hidden');
                
                historyList.innerHTML = screenshots.map(screenshot => \`
                    <div class="flex items-center justify-between p-3 border rounded-lg">
                        <div class="flex items-center gap-3">
                            <i data-lucide="globe" class="h-4 w-4 text-gray-500"></i>
                            <div>
                                <div class="font-medium">\${screenshot.title}</div>
                                <div class="text-sm text-gray-500 truncate max-w-xs">\${screenshot.url}</div>
                                <div class="text-xs text-gray-400">\${formatDate(screenshot.timestamp)}</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="viewScreenshot('\${screenshot.id}')" class="p-1 text-gray-500 hover:text-blue-600">
                                <i data-lucide="eye" class="h-4 w-4"></i>
                            </button>
                            <button onclick="downloadScreenshot('\${screenshot.id}')" class="p-1 text-gray-500 hover:text-green-600">
                                <i data-lucide="download" class="h-4 w-4"></i>
                            </button>
                            <button onclick="deleteScreenshot('\${screenshot.id}')" class="p-1 text-gray-500 hover:text-red-600">
                                <i data-lucide="trash-2" class="h-4 w-4"></i>
                            </button>
                        </div>
                    </div>
                \`).join('');
                
                lucide.createIcons();
            }
        }
        
        // 截图功能
        async function takeScreenshot() {
            const url = urlInput.value.trim();
            if (!url) return;
            
            setLoading(true);
            hideError();
            resultDiv.classList.add('hidden');
            
            try {
                const response = await fetch(\`/api/screenshot?url=\${encodeURIComponent(url)}\`);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.success && data.url) {
                        // 显示结果
                        screenshotImg.src = data.url;
                        resultDiv.classList.remove('hidden');
                        
                        // 保存到历史记录
                        const newScreenshot = {
                            id: Date.now().toString(),
                            url,
                            imageUrl: data.url,
                            timestamp: new Date().toISOString(),
                            title: extractDomain(url)
                        };
                        
                        screenshots.unshift(newScreenshot);
                        saveScreenshots();
                        
                        // 设置下载功能
                        downloadBtn.onclick = () => downloadImage(data.url, \`screenshot-\${newScreenshot.title}-\${new Date().toISOString().split('T')[0]}.png\`);
                    } else {
                        showError(data.error || '截图生成失败');
                    }
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    showError(errorData.error || '截图生成失败，请稍后重试');
                }
            } catch (error) {
                console.error('Error taking screenshot:', error);
                showError('网络错误，请检查网络连接后重试');
            }
            
            setLoading(false);
        }
        
        // 历史记录操作
        function viewScreenshot(id) {
            const screenshot = screenshots.find(s => s.id === id);
            if (screenshot) {
                window.open(screenshot.imageUrl, '_blank');
            }
        }
        
        function downloadScreenshot(id) {
            const screenshot = screenshots.find(s => s.id === id);
            if (screenshot) {
                downloadImage(screenshot.imageUrl, \`screenshot-\${screenshot.title}-\${new Date(screenshot.timestamp).toISOString().split('T')[0]}.png\`);
            }
        }
        
        function deleteScreenshot(id) {
            screenshots = screenshots.filter(s => s.id !== id);
            saveScreenshots();
        }
        
        function downloadImage(url, filename) {
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.target = '_blank';
            link.click();
        }
        
        // 事件监听
        takeScreenshotBtn.addEventListener('click', takeScreenshot);
        
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && urlInput.value.trim() && !takeScreenshotBtn.disabled) {
                takeScreenshot();
            }
        });
        
        urlInput.addEventListener('input', hideError);
        
        // 初始化
        updateHistoryDisplay();
    </script>
</body>
</html>
`;

// 截图服务类
class ScreenshotService {
    constructor(env) {
        this.env = env;
    }

    // 上传截图到图床
    async uploadScreenshotToImageBed(buffer, url) {
        try {
            const formData = new FormData();
            const blob = new Blob([buffer], { type: 'image/png' });
            
            const urlHash = btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
            const timestamp = Date.now();
            const fileName = `screenshot_${urlHash}_${timestamp}.png`;
            
            formData.append('file', blob, fileName);
            formData.append('prefix', 'screenshots');

            const uploadResponse = await fetch('https://image.darkchoco.top/api/r2/upload-url', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error(`图床上传失败: ${uploadResponse.status}`);
            }

            const result = await uploadResponse.json();
            
            if (result.error) {
                throw new Error(result.error);
            }

            return result.url;
        } catch (error) {
            console.error('图床上传错误:', error);
            throw new Error(`图片上传失败: ${error.message}`);
        }
    }

    // URL验证和标准化
    isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
            return false;
        }
    }

    normalizeUrl(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return `https://${url}`;
        }
        return url;
    }

    // 生成截图
    async generateScreenshot(url) {
        const normalizedUrl = this.normalizeUrl(url.trim());

        if (!this.isValidUrl(normalizedUrl)) {
            throw new Error('Invalid URL format. Please provide a valid HTTP or HTTPS URL.');
        }

        console.log(`Generating screenshot for: ${normalizedUrl}`);
        console.log('Browser binding available:', !!this.env.MYBROWSER);
        
        let browser;
        try {
            // 检查浏览器绑定是否可用
            if (!this.env.MYBROWSER) {
                throw new Error('Browser binding not available. Please check wrangler.toml configuration.');
            }
            
            console.log('Launching browser with binding:', typeof this.env.MYBROWSER);
            
            // 启动 Puppeteer 浏览器 - 使用正确的 Cloudflare Workers 方式
            browser = await puppeteer.launch(this.env.MYBROWSER);

            console.log('Browser launched successfully.',browser);

            const page = await browser.newPage();
            
            // 设置视口
            await page.setViewport({ 
                width: 1280, 
                height: 720,
                deviceScaleFactor: 1
            });

            // 设置用户代理
            await page.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            );

            // 导航到目标URL
            await page.goto(normalizedUrl, {
                waitUntil: 'domcontentloaded',
                timeout: 25000
            });

            // 等待页面完全加载
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 截图
            const screenshot = await page.screenshot({
                type: 'png',
                fullPage: false,
            });

            console.log('Screenshot completed, size:', screenshot.byteLength, 'bytes');

            // 尝试上传截图到图床，如果失败则返回 base64 数据
            let imageUrl;
            try {
                imageUrl = await this.uploadScreenshotToImageBed(screenshot, normalizedUrl);
            } catch (uploadError) {
                console.warn('Image upload failed, returning base64 data:', uploadError.message);
                // 如果上传失败，返回 base64 编码的图片数据
                const base64 = btoa(String.fromCharCode(...new Uint8Array(screenshot)));
                imageUrl = `data:image/png;base64,${base64}`;
            }

            return {
                success: true,
                url: imageUrl,
                originalUrl: normalizedUrl,
                metadata: {
                    source: 'puppeteer',
                    size: screenshot.byteLength,
                    format: 'png'
                }
            };
        } catch (error) {
            console.error('Screenshot generation failed:', error);
            
            let errorMessage = 'Failed to generate screenshot';
            
            if (error.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
                errorMessage = 'Website not found. Please check the URL and try again.';
            } else if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
                errorMessage = 'Connection refused. The website may be down or blocking requests.';
            } else if (error.message.includes('TimeoutError')) {
                errorMessage = 'Request timeout. The website took too long to respond.';
            }
            
            throw new Error(errorMessage);
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }

    // 批量生成截图 - 在单次浏览器会话中处理多个页面
    async generateBatchScreenshots(urls) {
        if (!Array.isArray(urls) || urls.length === 0) {
            throw new Error('URLs must be a non-empty array');
        }

        if (urls.length > 10) {
            throw new Error('Maximum 10 URLs allowed per batch request');
        }

        console.log(`Generating batch screenshots for ${urls.length} URLs`);
        console.log('Browser binding available:', !!this.env.MYBROWSER);
        
        let browser;
        const results = [];
        
        try {
            // 检查浏览器绑定是否可用
            if (!this.env.MYBROWSER) {
                throw new Error('Browser binding not available. Please check wrangler.toml configuration.');
            }
            
            // 启动浏览器（只启动一次）
            browser = await puppeteer.launch(this.env.MYBROWSER);
            console.log('Browser launched successfully for batch processing');

            // 为每个 URL 生成截图
            for (let i = 0; i < urls.length; i++) {
                const url = urls[i];
                const normalizedUrl = this.normalizeUrl(url.trim());
                
                try {
                    if (!this.isValidUrl(normalizedUrl)) {
                        results.push({
                            success: false,
                            originalUrl: url,
                            error: 'Invalid URL format'
                        });
                        continue;
                    }

                    console.log(`Processing URL ${i + 1}/${urls.length}: ${normalizedUrl}`);
                    
                    // 创建新页面
                    const page = await browser.newPage();
                    
                    // 设置视口
                    await page.setViewport({ 
                        width: 1280, 
                        height: 720,
                        deviceScaleFactor: 1
                    });

                    // 设置用户代理
                    await page.setUserAgent(
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    );

                    // 导航到目标URL
                    await page.goto(normalizedUrl, {
                        waitUntil: 'domcontentloaded',
                        timeout: 25000
                    });

                    // 等待页面完全加载
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    // 截图
                    const screenshot = await page.screenshot({
                        type: 'png',
                        fullPage: false,
                    });

                    console.log(`Screenshot ${i + 1} completed, size:`, screenshot.byteLength, 'bytes');

                    // 尝试上传截图到图床
                    let imageUrl;
                    try {
                        imageUrl = await this.uploadScreenshotToImageBed(screenshot, normalizedUrl);
                    } catch (uploadError) {
                        console.warn(`Image upload failed for URL ${i + 1}, returning base64 data:`, uploadError.message);
                        const base64 = btoa(String.fromCharCode(...new Uint8Array(screenshot)));
                        imageUrl = `data:image/png;base64,${base64}`;
                    }

                    results.push({
                        success: true,
                        url: imageUrl,
                        originalUrl: normalizedUrl,
                        metadata: {
                            source: 'puppeteer',
                            size: screenshot.byteLength,
                            format: 'png',
                            batchIndex: i + 1
                        }
                    });

                    // 关闭页面释放内存
                    await page.close();
                    
                } catch (error) {
                    console.error(`Screenshot generation failed for URL ${i + 1}:`, error);
                    
                    let errorMessage = 'Failed to generate screenshot';
                    
                    if (error.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
                        errorMessage = 'Website not found. Please check the URL and try again.';
                    } else if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
                        errorMessage = 'Connection refused. The website may be down or blocking requests.';
                    } else if (error.message.includes('TimeoutError')) {
                        errorMessage = 'Request timeout. The website took too long to respond.';
                    }
                    
                    results.push({
                        success: false,
                        originalUrl: url,
                        error: errorMessage
                    });
                }
            }

            return {
                success: true,
                totalRequested: urls.length,
                totalSuccessful: results.filter(r => r.success).length,
                totalFailed: results.filter(r => !r.success).length,
                results: results
            };
            
        } catch (error) {
            console.error('Batch screenshot generation failed:', error);
            throw new Error(`Batch screenshot failed: ${error.message}`);
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}

// 路由处理器
class Router {
    constructor() {
        this.routes = new Map();
    }

    get(path, handler) {
        this.routes.set(`GET:${path}`, handler);
    }

    post(path, handler) {
        this.routes.set(`POST:${path}`, handler);
    }

    async handle(request, env) {
        const url = new URL(request.url);
        const method = request.method;
        const path = url.pathname;
        
        // 精确匹配
        const exactKey = `${method}:${path}`;
        if (this.routes.has(exactKey)) {
            return await this.routes.get(exactKey)(request, env);
        }
        
        // 模式匹配
        for (const [routeKey, handler] of this.routes.entries()) {
            const [routeMethod, routePath] = routeKey.split(':');
            if (routeMethod === method && this.matchPath(routePath, path)) {
                return await handler(request, env);
            }
        }
        
        return new Response('Not Found', { status: 404 });
    }

    matchPath(routePath, requestPath) {
        if (routePath.includes('*')) {
            const pattern = routePath.replace('*', '.*');
            return new RegExp(`^${pattern}$`).test(requestPath);
        }
        return routePath === requestPath;
    }
}

// 主要的 Worker 处理函数
export default {
    async fetch(request, env) {
        const router = new Router();
        const screenshotService = new ScreenshotService(env);
        const barkService = new BarkNotificationService(env);
        
        // 检查是否是首次启动（通过特殊的健康检查请求）
        const url = new URL(request.url);
        if (url.pathname === '/health' && url.searchParams.get('startup') === 'true') {
            // 发送部署成功通知
            await barkService.sendDeploymentSuccess();
        }
        
        // 主页路由
        router.get('/', async () => {
            return new Response(HTML_TEMPLATE, {
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
        });
        
        // 截图 API 路由
        router.get('/api/screenshot', async (request) => {
            const url = new URL(request.url);
            const targetUrl = url.searchParams.get('url');
            
            if (!targetUrl) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'URL parameter is required'
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            try {
                const result = await screenshotService.generateScreenshot(targetUrl);
                
                // 如果截图成功，发送统计通知
                if (result.success) {
                    await barkService.sendScreenshotStats(1, 'single');
                }
                
                return new Response(JSON.stringify(result), {
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (error) {
                console.error('Screenshot API error:', error);
                return new Response(JSON.stringify({
                    success: false,
                    error: error.message
                }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        });
        
        // 批量截图 API 路由
        router.post('/api/screenshots/batch', async (request) => {
            try {
                const requestBody = await request.json();
                const { urls } = requestBody;
                
                if (!urls || !Array.isArray(urls)) {
                    return new Response(JSON.stringify({
                        success: false,
                        error: 'Request body must contain a "urls" array'
                    }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                
                if (urls.length === 0) {
                    return new Response(JSON.stringify({
                        success: false,
                        error: 'URLs array cannot be empty'
                    }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                
                if (urls.length > 10) {
                    return new Response(JSON.stringify({
                        success: false,
                        error: 'Maximum 10 URLs allowed per batch request'
                    }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                
                const result = await screenshotService.generateBatchScreenshots(urls);
                
                // 如果有成功的截图，发送统计通知
                if (result.success && result.totalSuccessful > 0) {
                    await barkService.sendScreenshotStats(result.totalSuccessful, 'batch');
                }
                
                return new Response(JSON.stringify(result), {
                    headers: { 'Content-Type': 'application/json' }
                });
                
            } catch (error) {
                console.error('Batch screenshot API error:', error);
                
                // 处理 JSON 解析错误
                if (error.message.includes('JSON')) {
                    return new Response(JSON.stringify({
                        success: false,
                        error: 'Invalid JSON in request body'
                    }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                
                return new Response(JSON.stringify({
                    success: false,
                    error: error.message
                }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        });
        
        // 健康检查路由
         router.get('/health', async (request) => {
             const url = new URL(request.url);
             const shouldNotify = url.searchParams.get('notify') === 'true';
             const isStartup = url.searchParams.get('startup') === 'true';
             
             const healthData = {
                 status: 'ok',
                 timestamp: new Date().toISOString(),
                 service: 'screenshot-worker',
                 version: '2.0.0',
                 features: ['single-screenshot', 'batch-screenshot', 'bark-notifications']
             };
             
             // 如果需要发送通知
             if (shouldNotify && !isStartup) {
                 await barkService.sendServiceStatus('healthy', '服务运行正常，所有功能可用');
             }
             
             return new Response(JSON.stringify(healthData), {
                 headers: { 'Content-Type': 'application/json' }
             });
         });
        
        // 处理请求
        return await router.handle(request, env);
    }
};