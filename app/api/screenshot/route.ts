import { NextRequest, NextResponse } from 'next/server';
import { getScreenshot } from '../../../lib/chromium';

const isDev = process.env.NODE_ENV !== 'production';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
        return new NextResponse('URL is required', { status: 400 });
    }

    try {
        const file = await getScreenshot(url, isDev);

        return new NextResponse(file, {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, immutable, no-transform, s-maxage=31536000, max-age=31536000',
            },
        });
    } catch (e: any) {
        console.error(e);
        return new NextResponse('Failed to generate screenshot', { status: 500 });
    }
}