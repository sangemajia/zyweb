const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// 设置静态文件目录
app.use(express.static(path.join('/workspace/dist/client/web-final')));

// 所有路由都返回index.html
app.get(/.*/, (req, res) => {
  res.sendFile(path.join('/workspace/dist/client/web-final/index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`ZyWeb服务器正在运行在 http://0.0.0.0:${port}`);
  console.log(`请在浏览器中打开 http://localhost:${port} 来查看应用`);
});