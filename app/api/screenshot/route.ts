import { NextRequest, NextResponse } from 'next/server';
import { getScreenshot } from '../../../lib/chromium';

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

        return new NextResponse(file, {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, immutable, no-transform, s-maxage=31536000, max-age=31536000',
            },
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