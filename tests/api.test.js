const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const PORT = 3001;

let server;
let baseUrl;

test.before(async () => {
  // Clean db
  await prisma.link.deleteMany();
  
  // Start server
  await new Promise((resolve) => {
    server = app.listen(PORT, () => {
      baseUrl = `http://localhost:${PORT}`;
      resolve();
    });
  });
});

test.after(async () => {
  await prisma.$disconnect();
  server.close();
});

test('GET /healthz returns 200', async () => {
  const res = await fetch(`${baseUrl}/healthz`);
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.ok, true);
});

test('POST /api/links creates a link', async () => {
  const res = await fetch(`${baseUrl}/api/links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.com' })
  });
  
  assert.strictEqual(res.status, 201);
  const data = await res.json();
  assert.ok(data.code);
  assert.strictEqual(data.originalUrl, 'https://example.com');
});

test('POST /api/links creates a link with custom code', async () => {
  const customCode = 'Google';
  const res = await fetch(`${baseUrl}/api/links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://google.com', code: customCode })
  });
  
  assert.strictEqual(res.status, 201);
  const data = await res.json();
  assert.strictEqual(data.code, customCode);
});

test('POST /api/links prevents duplicate codes', async () => {
  const customCode = 'duptest1';
  
  // First create
  await fetch(`${baseUrl}/api/links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://google.com', code: customCode })
  });

  // Second create
  const res = await fetch(`${baseUrl}/api/links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://bing.com', code: customCode })
  });
  
  assert.strictEqual(res.status, 409);
});

test('GET /:code redirects', async () => {
  // Create link
  const resCreate = await fetch(`${baseUrl}/api/links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.com' })
  });
  const { code } = await resCreate.json();

  // Access link (disable auto redirect to check status)
  const res = await fetch(`${baseUrl}/${code}`, { redirect: 'manual' });
  assert.strictEqual(res.status, 302);
  assert.strictEqual(res.headers.get('location'), 'https://example.com');
});

test('DELETE /api/links/:code deletes link', async () => {
  // Create
  const resCreate = await fetch(`${baseUrl}/api/links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.com' })
  });
  const { code } = await resCreate.json();

  // Delete
  const resDelete = await fetch(`${baseUrl}/api/links/${code}`, {
    method: 'DELETE'
  });
  assert.strictEqual(resDelete.status, 204);

  // Verify gone
  const resGet = await fetch(`${baseUrl}/api/links/${code}`);
  assert.strictEqual(resGet.status, 404);
});
