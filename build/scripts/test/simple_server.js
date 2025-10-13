const http = require('http');
const fs = require('fs');
const path = require('path');

// 创建一个简单的服务器来提供文件
const server = http.createServer((req, res) => {
  console.log('请求:', req.url);
  
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  let filePath = req.url;
  if (filePath === '/') {
    filePath = '/ui/index.html';
  }
  
  // 添加/ui前缀
  if (!filePath.startsWith('/ui/')) {
    filePath = '/ui' + filePath;
  }
  
  const absolutePath = path.join('/workspace/zyweb/dist/app', filePath);
  console.log('文件路径:', absolutePath);
  
  fs.readFile(absolutePath, (err, content) => {
    if (err) {
      console.error('文件读取错误:', err);
      res.writeHead(404);
      res.end('文件未找到');
      return;
    }
    
    // 设置Content-Type
    if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    
    res.writeHead(200);
    res.end(content);
  });
});

server.listen(8819, () => {
  console.log('服务器运行在 http://localhost:8819');
});