import http from 'http';
const host = 'localhost';
const port = 5001;
const req = http.get({ host, port, path: '/api/health', timeout: 15000 }, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('status=' + res.statusCode);
    console.log(body.slice(0, 200));
    process.exit(res.statusCode === 200 ? 0 : 1);
  });
});
req.on('error', err => { console.error(err.message); process.exit(1); });
req.on('timeout', () => req.destroy(new Error('timeout')));
