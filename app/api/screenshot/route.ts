import { NextRequest, NextResponse } from 'next/server';
import { getScreenshot } from '../../../lib/chromium';

// 上传截图到图床服务
async function uploadScreenshotToImageBed(buffer: Buffer, url: string): Promise<string> {
  try {
    // 创建 FormData
    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'image/png' });
    
    // 生成文件名（基于URL和时间戳）
    const urlHash = Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    const timestamp = Date.now();
    const fileName = `screenshot_${urlHash}_${timestamp}.png`;
    
    formData.append('file', blob, fileName);
    formData.append('prefix', 'screenshots');

    // 调用图床上传接口
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
  } catch (error: any) {
    console.error('图床上传错误:', error);
    throw new Error(`图片上传失败: ${error.message}`);
  }
}

const isDev = process.env.NODE_ENV !== 'production';

// URL验证函数
function isValidUrl(string: string): boolean {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// 标准化URL
function normalizeUrl(url: string): string {
    // 如果没有协议，默认添加https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
    }
    return url;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const rawUrl = searchParams.get('url');

    if (!rawUrl) {
        return NextResponse.json(
            { error: 'URL parameter is required' },
            { status: 400 }
        );
    }

    const normalizedUrl = normalizeUrl(rawUrl.trim());

    if (!isValidUrl(normalizedUrl)) {
        return NextResponse.json(
            { error: 'Invalid URL format. Please provide a valid HTTP or HTTPS URL.' },
            { status: 400 }
        );
    }

    try {
        console.log(`Generating screenshot for: ${normalizedUrl}`);
        const file = await getScreenshot(normalizedUrl, isDev);

        // 上传截图到图床
        const imageUrl = await uploadScreenshotToImageBed(file, normalizedUrl);

        return NextResponse.json({
            success: true,
            url: imageUrl,
            originalUrl: normalizedUrl
        });
    } catch (e: any) {
        console.error('Screenshot generation failed:', e);
        
        // 提供更详细的错误信息
        let errorMessage = 'Failed to generate screenshot';
        let statusCode = 500;
        
        if (e.message.includes('Chrome browser not found')) {
            errorMessage = 'Chrome browser not found. Please install Google Chrome.';
            statusCode = 503;
        } else if (e.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
            errorMessage = 'Website not found. Please check the URL and try again.';
            statusCode = 404;
        } else if (e.message.includes('net::ERR_CONNECTION_REFUSED')) {
            errorMessage = 'Connection refused. The website may be down or blocking requests.';
            statusCode = 503;
        } else if (e.message.includes('TimeoutError')) {
            errorMessage = 'Request timeout. The website took too long to respond.';
            statusCode = 408;
        }
        
        return NextResponse.json(
            { 
                error: errorMessage,
                details: isDev ? e.message : undefined
            },
            { status: statusCode }
        );
    }
}