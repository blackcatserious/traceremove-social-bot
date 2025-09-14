#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🚀 Starting development server with ngrok tunnel...');

const devServer = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

setTimeout(() => {
  console.log('🌐 Starting ngrok tunnel...');
  
  const ngrok = spawn('npx', ['ngrok', 'http', '3000', '--log=stdout'], {
    stdio: 'pipe',
    shell: true
  });

  let ngrokUrl = '';

  ngrok.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('ngrok:', output);
    
    const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.ngrok\.io/);
    if (urlMatch && !ngrokUrl) {
      ngrokUrl = urlMatch[0];
      console.log(`\n✅ Public URL: ${ngrokUrl}`);
      console.log(`📱 Use this URL for webhook testing and external access\n`);
      
      fs.writeFileSync(path.join(__dirname, '../.ngrok-url'), ngrokUrl);
      
      console.log('🔧 Starting webhook testing server on port 3001...');
      const webhookServer = http.createServer((req, res) => {
        if (req.method === 'POST' && req.url === '/webhook/test') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            console.log('📨 Webhook received:', body);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              status: 'received', 
              timestamp: new Date().toISOString(),
              body: body 
            }));
          });
        } else if (req.method === 'GET' && req.url === '/tunnel/status') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            active: true,
            url: ngrokUrl,
            localPort: 3000,
            webhookPort: 3001,
            timestamp: new Date().toISOString()
          }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Not found' }));
        }
      });
      
      webhookServer.listen(3001, () => {
        console.log('🎯 Webhook testing server running on http://localhost:3001');
        console.log(`Webhook Test: http://localhost:3001/webhook/test`);
        console.log(`Tunnel Status: http://localhost:3001/tunnel/status`);
      });
    }
  });

  ngrok.stderr.on('data', (data) => {
    console.error('ngrok error:', data.toString());
  });

  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    devServer.kill();
    ngrok.kill();
    
    const urlFile = path.join(__dirname, '../.ngrok-url');
    if (fs.existsSync(urlFile)) {
      fs.unlinkSync(urlFile);
    }
    
    process.exit(0);
  });

}, 3000);

devServer.on('close', (code) => {
  console.log(`Dev server exited with code ${code}`);
  process.exit(code);
});
