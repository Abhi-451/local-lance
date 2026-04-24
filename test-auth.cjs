const http = require('http');

const data = JSON.stringify({
    email: "test4@test.com",
    password: "password123",
    role: "business",
    name: "Testing"
});

const req = http.request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/signup',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
}, res => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log(body));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
