// 截图服务 - 基于 Puppeteer 的截图解决方案
import { getScreenshot as getPuppeteerScreenshot } from './chromium';

// 截图选项
export interface ScreenshotOptions {
  width?: number;
  height?: number;
  fullPage?: boolean;
  quality?: number;
  format?: 'png' | 'jpeg';
  timeout?: number;
}

// 截图结果
export interface ScreenshotResult {
  buffer: Buffer;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
    source: 'puppeteer';
  };
}



/**
 * 主截图函数 - 基于 Puppeteer 的截图实现
 */
export async function getReliableScreenshot(
  url: string, 
  isDev: boolean,
  options: ScreenshotOptions = {}
): Promise<ScreenshotResult> {
  try {
    console.log('使用 Puppeteer 进行截图...');
    const buffer = await getPuppeteerScreenshot(url, isDev);
    
    return {
      buffer,
      metadata: {
        width: options.width || 1280,
        height: options.height || 720,
        format: options.format || 'png',
        size: buffer.length,
        source: 'puppeteer'
      }
    };
  } catch (error: any) {
    console.error('Puppeteer 截图失败:', error.message);
    throw new Error(`截图失败: ${error.message}`);
  }
}

/**
 * 检查可用的截图服务
 */
export function getAvailableServices(): string[] {
  return ['puppeteer'];
}