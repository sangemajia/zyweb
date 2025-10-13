const http = require('http');

function testConnection() {
  console.log('测试HTTP连接到localhost:8819...');
  
  const options = {
    hostname: 'localhost',
    port: 8819,
    path: '/',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log('状态码:', res.statusCode);
    console.log('头部:');
    for (const key in res.headers) {
      console.log(`${key}: ${res.headers[key]}`);
    }
    
    res.on('data', (chunk) => {
      console.log('接收到数据块，长度:', chunk.length);
    });
    
    res.on('end', () => {
      console.log('响应接收完成');
    });
  });

  req.on('error', (error) => {
    console.error('请求错误:', error.message);
  });

  req.end();
}

testConnection();