import chromium from '@sparticuz/chromium';
import { existsSync } from 'fs';

// 浏览器类型定义
type BrowserType = 'chrome' | 'chromium' | 'edge' | 'safari';

interface BrowserInfo {
  path: string;
  type: BrowserType;
  name: string;
}

// 获取所有可用浏览器路径
function getAllBrowserPaths(): BrowserInfo[] {
  const browserPaths: BrowserInfo[] = [];
  
  const possiblePaths = {
    win32: [
      // Chrome
      { path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', type: 'chrome' as BrowserType, name: 'Google Chrome' },
      { path: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', type: 'chrome' as BrowserType, name: 'Google Chrome' },
      // Chromium
      { path: 'C:\\Program Files\\Chromium\\Application\\chromium.exe', type: 'chromium' as BrowserType, name: 'Chromium' },
      { path: 'C:\\Program Files (x86)\\Chromium\\Application\\chromium.exe', type: 'chromium' as BrowserType, name: 'Chromium' },
      // Edge
      { path: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', type: 'edge' as BrowserType, name: 'Microsoft Edge' },
      { path: 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe', type: 'edge' as BrowserType, name: 'Microsoft Edge' },
    ],
    darwin: [
      // Chrome
      { path: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', type: 'chrome' as BrowserType, name: 'Google Chrome' },
      { path: '/usr/local/bin/chrome', type: 'chrome' as BrowserType, name: 'Google Chrome' },
      // Chromium
      { path: '/Applications/Chromium.app/Contents/MacOS/Chromium', type: 'chromium' as BrowserType, name: 'Chromium' },
      { path: '/usr/local/bin/chromium', type: 'chromium' as BrowserType, name: 'Chromium' },
      { path: '/opt/homebrew/bin/chromium', type: 'chromium' as BrowserType, name: 'Chromium' },
      { path: '/usr/local/Caskroom/chromium/latest/Chromium.app/Contents/MacOS/Chromium', type: 'chromium' as BrowserType, name: 'Chromium' },
      // Edge
      { path: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', type: 'edge' as BrowserType, name: 'Microsoft Edge' },
      // Safari (注意：Safari 需要特殊处理，因为它不支持 headless 模式)
      { path: '/Applications/Safari.app/Contents/MacOS/Safari', type: 'safari' as BrowserType, name: 'Safari' },
    ],
    linux: [
      // Chrome
      { path: '/usr/bin/google-chrome-stable', type: 'chrome' as BrowserType, name: 'Google Chrome' },
      { path: '/usr/bin/google-chrome', type: 'chrome' as BrowserType, name: 'Google Chrome' },
      // Chromium
      { path: '/usr/bin/chromium-browser', type: 'chromium' as BrowserType, name: 'Chromium' },
      { path: '/usr/bin/chromium', type: 'chromium' as BrowserType, name: 'Chromium' },
      { path: '/snap/bin/chromium', type: 'chromium' as BrowserType, name: 'Chromium' },
      // Edge
      { path: '/usr/bin/microsoft-edge', type: 'edge' as BrowserType, name: 'Microsoft Edge' },
    ],
  };

  const platform = process.platform as keyof typeof possiblePaths;
  const paths = possiblePaths[platform] || possiblePaths.linux;

  for (const browserInfo of paths) {
    if (existsSync(browserInfo.path)) {
      browserPaths.push(browserInfo);
    }
  }

  return browserPaths;
}

// 获取首选浏览器路径（优先级：Chrome > Chromium > Edge > Safari）
function getPreferredBrowser(): BrowserInfo | null {
  const availableBrowsers = getAllBrowserPaths();
  
  if (availableBrowsers.length === 0) {
    return null;
  }

  // 按优先级排序
  const priority: BrowserType[] = ['chrome', 'chromium', 'edge', 'safari'];
  
  for (const type of priority) {
    const browser = availableBrowsers.find(b => b.type === type);
    if (browser) {
      return browser;
    }
  }

  return availableBrowsers[0];
}

// 兼容性函数：保持原有接口
function getLocalChromePath(): string | null {
  const browser = getPreferredBrowser();
  return browser ? browser.path : null;
}

// 检查浏览器可用性
export function checkBrowserAvailability(): { available: boolean; message: string; browsers: BrowserInfo[] } {
  const availableBrowsers = getAllBrowserPaths();
  const preferredBrowser = getPreferredBrowser();
  
  if (availableBrowsers.length === 0) {
    return {
      available: false,
      message: '未找到支持的浏览器。请安装 Chrome、Chromium、Edge 或 Safari 浏览器',
      browsers: []
    };
  }
  
  const browserNames = availableBrowsers.map(b => b.name).join('、');
  return {
    available: true,
    message: `找到可用浏览器：${browserNames}。当前使用：${preferredBrowser?.name || '未知'}`,
    browsers: availableBrowsers
  };
}

// 获取特定浏览器的启动参数
function getBrowserArgs(browserType: BrowserType): string[] {
  const commonArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-web-security',
  ];

  switch (browserType) {
    case 'chrome':
    case 'chromium':
      return [
        ...commonArgs,
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-features=VizDisplayCompositor',
      ];
    case 'edge':
      return [
        ...commonArgs,
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
      ];
    case 'safari':
      // Safari 不支持大部分 Chromium 参数
      return [
        '--no-sandbox',
      ];
    default:
      return commonArgs;
  }
}

export async function getOptions(isDev: boolean) {
    if (isDev) {
        // 开发环境：使用本地浏览器
        const preferredBrowser = getPreferredBrowser();
        if (!preferredBrowser) {
            throw new Error('未找到可用的浏览器。请安装 Chrome、Chromium 或 Edge。');
        }
        
        console.log(`使用浏览器: ${preferredBrowser.name} (${preferredBrowser.path})`);
        
        return {
            executablePath: preferredBrowser.path,
            headless: true,
            args: getBrowserArgs(preferredBrowser.type),
        };
    } else {
        // 生产环境：使用 @sparticuz/chromium
        return {
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            args: [
                ...chromium.args,
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-setuid-sandbox',
                '--no-sandbox',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-ipc-flooding-protection',
                '--disable-extensions',
                '--disable-default-apps',
                '--disable-sync',
                '--disable-translate',
                '--hide-scrollbars',
                '--mute-audio',
                '--no-first-run',
                '--disable-background-networking',
                '--single-process',
                '--disable-features=site-per-process'
            ],
        };
    }
}