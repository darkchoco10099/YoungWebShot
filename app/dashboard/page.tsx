'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Camera, Download, Eye, MoreHorizontal, Trash2, Globe, Clock, Image as ImageIcon, AlertCircle, Loader2 } from 'lucide-react';

interface Screenshot {
  id: string;
  url: string;
  imageUrl: string;
  timestamp: Date;
  title?: string;
}

export default function Dashboard() {
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);

  // 提取域名函数
  const extractDomain = (url: string): string => {
    try {
      // 标准化URL
      const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
      return new URL(normalizedUrl).hostname;
    } catch {
      return url.split('/')[0] || 'Unknown';
    }
  };

  // 从localStorage加载已保存的截图
  useEffect(() => {
    const saved = localStorage.getItem('screenshots');
    if (saved) {
      setScreenshots(JSON.parse(saved));
    }
  }, []);

  // 保存截图到localStorage
  const saveScreenshots = (newScreenshots: Screenshot[]) => {
    setScreenshots(newScreenshots);
    localStorage.setItem('screenshots', JSON.stringify(newScreenshots));
  };

  const takeScreenshot = async () => {
    if (!url) return;
    setLoading(true);
    setImageUrl('');
    setError('');
    
    try {
      const res = await fetch(`/api/screenshot?url=${encodeURIComponent(url)}`);
      
      if (res.ok) {
        const blob = await res.blob();
        const newImageUrl = URL.createObjectURL(blob);
        setImageUrl(newImageUrl);
        
        // 自动保存到历史记录
        const newScreenshot: Screenshot = {
          id: Date.now().toString(),
          url,
          imageUrl: newImageUrl,
          timestamp: new Date(),
          title: extractDomain(url)
        };
        
        const updatedScreenshots = [newScreenshot, ...screenshots];
        saveScreenshots(updatedScreenshots);
      } else {
        // 处理API错误响应
        try {
          const errorData = await res.json();
          setError(errorData.error || '截图生成失败');
        } catch {
          setError('截图生成失败，请稍后重试');
        }
      }
    } catch (error) {
      console.error('Error taking screenshot:', error);
      setError('网络错误，请检查网络连接后重试');
    }
    
    setLoading(false);
  };

  const deleteScreenshot = (id: string) => {
    const updatedScreenshots = screenshots.filter(s => s.id !== id);
    saveScreenshots(updatedScreenshots);
  };

  const downloadScreenshot = (screenshot: Screenshot) => {
    const link = document.createElement('a');
    link.href = screenshot.imageUrl;
    link.download = `screenshot-${screenshot.title}-${screenshot.timestamp.toISOString().split('T')[0]}.png`;
    link.click();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            网页快照工具
          </h1>
          <p className="text-lg text-muted-foreground">
            快速生成和管理网页截图，简洁高效的可视化工具
          </p>
        </div>

        {/* Screenshot Generator */}
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              生成截图
            </CardTitle>
            <CardDescription>
              输入网页URL，一键生成高质量截图
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">网页地址</Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (error) setError(''); // 清除错误信息
                    }}
                    placeholder="输入网页URL (例如: example.com 或 https://example.com)"
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && url && !loading) {
                        takeScreenshot();
                      }
                    }}
                  />
                  <Button 
                    onClick={takeScreenshot} 
                    disabled={loading || !url}
                    className="px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        生成中...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        截图
                      </div>
                    )}
                  </Button>
                </div>
              </div>
              
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>
            
            {imageUrl && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>预览结果</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadScreenshot({
                      id: 'current',
                      url,
                      imageUrl,
                      timestamp: new Date()
                    })}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    下载
                  </Button>
                </div>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <img 
                    src={imageUrl} 
                    alt="Website screenshot" 
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Screenshots History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              截图历史
              <Badge variant="secondary" className="ml-2">
                {screenshots.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              管理您的所有网页截图记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            {screenshots.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>暂无截图记录</p>
                <p className="text-sm">生成第一个截图开始使用吧！</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>网站</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {screenshots.map((screenshot) => (
                    <TableRow key={screenshot.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          {screenshot.title || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {screenshot.url}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(screenshot.timestamp)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => setSelectedScreenshot(screenshot)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              查看
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => downloadScreenshot(screenshot)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              下载
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteScreenshot(screenshot.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Screenshot Preview Dialog */}
        <Dialog open={!!selectedScreenshot} onOpenChange={() => setSelectedScreenshot(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {selectedScreenshot?.title}
              </DialogTitle>
              <DialogDescription>
                {selectedScreenshot?.url}
              </DialogDescription>
            </DialogHeader>
            {selectedScreenshot && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatDate(selectedScreenshot.timestamp)}
                  </div>
                  <Button 
                    onClick={() => downloadScreenshot(selectedScreenshot)}
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    下载图片
                  </Button>
                </div>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <img 
                    src={selectedScreenshot.imageUrl} 
                    alt="Screenshot preview" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}