import http from 'http';
const opts = { host: 'localhost', port: 5001, path: '/api/health', timeout: 5000 };
const req = http.get(opts, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('STATUS', res.statusCode);
    console.log(data);
    process.exit(res.statusCode === 200 ? 0 : 1);
  });
});
req.on('error', (err) => {
  console.error('HEALTH_CHECK_FAILED');
  console.error(err.message);
  process.exit(1);
});
req.on('timeout', () => {
  req.destroy(new Error('timeout'));
});
