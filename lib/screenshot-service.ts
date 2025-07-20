// 截图服务 - 支持多种实现方式的可靠截图解决方案
import { getScreenshot as getPuppeteerScreenshot } from './chromium';

// 第三方截图服务配置
interface ScreenshotServiceConfig {
  apiKey?: string;
  baseUrl: string;
  timeout: number;
}

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
    source: 'puppeteer' | 'htmlcsstoimage' | 'screenshotapi';
  };
}

/**
 * 使用 htmlcsstoimage.com API 进行截图
 * 免费计划：50 张截图/月
 */
async function screenshotWithHtmlCssToImage(
  url: string, 
  options: ScreenshotOptions = {}
): Promise<ScreenshotResult> {
  const apiUrl = 'https://hcti.io/v1/image';
  
  const params = {
    url: url,
    viewport_width: options.width || 1280,
    viewport_height: options.height || 720,
    device_scale: 1,
    format: options.format || 'png',
    quality: options.quality || 90,
    full_page: options.fullPage || false,
    selector: null,
    ms_delay: 2000, // 等待页面加载
    google_fonts: 'Roboto',
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 注意：这里需要配置 API 密钥
      // 'Authorization': `Bearer ${process.env.HCTI_API_KEY}`,
    },
    body: JSON.stringify(params),
    signal: controller.signal,
  });
  
  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`htmlcsstoimage API 错误: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  
  if (!result.url) {
    throw new Error('htmlcsstoimage API 未返回图片 URL');
  }

  // 下载生成的图片
  const imageResponse = await fetch(result.url);
  if (!imageResponse.ok) {
    throw new Error(`下载截图失败: ${imageResponse.status}`);
  }

  const buffer = Buffer.from(await imageResponse.arrayBuffer());
  
  return {
    buffer,
    metadata: {
      width: params.viewport_width,
      height: params.viewport_height,
      format: params.format,
      size: buffer.length,
      source: 'htmlcsstoimage'
    }
  };
}

/**
 * 使用 screenshotapi.net 进行截图
 * 免费计划：100 张截图/月
 */
async function screenshotWithScreenshotApi(
  url: string, 
  options: ScreenshotOptions = {}
): Promise<ScreenshotResult> {
  const apiUrl = 'https://screenshotapi.net/api/v1/screenshot';
  
  const params = new URLSearchParams({
    url: url,
    width: (options.width || 1280).toString(),
    height: (options.height || 720).toString(),
    output: 'json',
    file_type: options.format || 'png',
    wait_for_event: 'load',
    delay: '2000', // 等待 2 秒
    full_page: options.fullPage ? 'true' : 'false',
    fresh: 'true', // 不使用缓存
    // token: process.env.SCREENSHOTAPI_TOKEN, // 需要配置 API token
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);
  
  const response = await fetch(`${apiUrl}?${params}`, {
    method: 'GET',
    signal: controller.signal,
  });
  
  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`screenshotapi 错误: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  
  if (!result.screenshot) {
    throw new Error('screenshotapi 未返回截图数据');
  }

  // 下载生成的图片
  const imageResponse = await fetch(result.screenshot);
  if (!imageResponse.ok) {
    throw new Error(`下载截图失败: ${imageResponse.status}`);
  }

  const buffer = Buffer.from(await imageResponse.arrayBuffer());
  
  return {
    buffer,
    metadata: {
      width: options.width || 1280,
      height: options.height || 720,
      format: options.format || 'png',
      size: buffer.length,
      source: 'screenshotapi'
    }
  };
}

/**
 * 主截图函数 - 支持多种后备方案
 */
export async function getReliableScreenshot(
  url: string, 
  isDev: boolean,
  options: ScreenshotOptions = {}
): Promise<ScreenshotResult> {
  const errors: string[] = [];
  
  // 方案 1: 尝试使用 Puppeteer (主要方案)
  try {
    console.log('尝试使用 Puppeteer 截图...');
    const buffer = await getPuppeteerScreenshot(url, isDev);
    
    return {
      buffer,
      metadata: {
        width: 1280,
        height: 720,
        format: 'png',
        size: buffer.length,
        source: 'puppeteer'
      }
    };
  } catch (error: any) {
    const errorMsg = `Puppeteer 失败: ${error.message}`;
    console.error(errorMsg);
    errors.push(errorMsg);
    
    // 如果是开发环境，直接抛出错误
    if (isDev) {
      throw new Error(`开发环境 Puppeteer 错误: ${error.message}`);
    }
  }
  
  // 方案 2: 尝试使用 htmlcsstoimage (仅生产环境)
  if (!isDev && process.env.HCTI_API_KEY) {
    try {
      console.log('尝试使用 htmlcsstoimage 截图...');
      return await screenshotWithHtmlCssToImage(url, options);
    } catch (error: any) {
      const errorMsg = `htmlcsstoimage 失败: ${error.message}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }
  }
  
  // 方案 3: 尝试使用 screenshotapi (仅生产环境)
  if (!isDev && process.env.SCREENSHOTAPI_TOKEN) {
    try {
      console.log('尝试使用 screenshotapi 截图...');
      return await screenshotWithScreenshotApi(url, options);
    } catch (error: any) {
      const errorMsg = `screenshotapi 失败: ${error.message}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }
  }
  
  // 所有方案都失败
  throw new Error(
    `所有截图方案都失败了:\n${errors.join('\n')}\n\n` +
    `建议解决方案:\n` +
    `1. 检查 Vercel 环境配置\n` +
    `2. 配置第三方截图服务 API 密钥\n` +
    `3. 升级到 Vercel Pro 计划以获得更多资源`
  );
}

/**
 * 检查可用的截图服务
 */
export function getAvailableServices(): string[] {
  const services = ['puppeteer'];
  
  if (process.env.HCTI_API_KEY) {
    services.push('htmlcsstoimage');
  }
  
  if (process.env.SCREENSHOTAPI_TOKEN) {
    services.push('screenshotapi');
  }
  
  return services;
}