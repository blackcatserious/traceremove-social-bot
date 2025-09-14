#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

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
