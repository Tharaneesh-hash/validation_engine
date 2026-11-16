import http from 'http';
const port = process.env.PORT || 5001;
const req = http.get({ host: 'localhost', port, path: '/api/health', timeout: 10000 }, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('status=' + res.statusCode);
    console.log(body);
    process.exit(res.statusCode === 200 ? 0 : 1);
  });
});
req.on('error', (err) => { console.error(err.message); process.exit(1); });
req.on('timeout', () => req.destroy(new Error('timeout')));
