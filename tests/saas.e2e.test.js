const fs = require('fs').promises;
const path = require('path');
const fetch = global.fetch || require('node-fetch');
const { PrismaClient } = require('@prisma/client');

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';
const prisma = new PrismaClient();

describe('SaaS onboarding e2e (smoke)', () => {
  jest.setTimeout(20000);

  test('Create tenant (register) and tenant DB file created', async () => {
    const unique = `test_${Date.now()}`;
    const registerRes = await fetch(`${BASE}/api/saas/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test School',
        pathSegment: unique,
        adminName: 'Admin Tester',
        adminEmail: `admin@${unique}.school`,
        adminPassword: 'testpass',
        plan: 'PREMIUM'
      })
    });

    const json = await registerRes.json();
    expect(json.success).toBe(true);
    expect(json.tenant).toBeDefined();

    const dbPath = path.join(process.cwd(), 'prisma', 'tenants', `${unique}.db`);
    const exists = await fs.stat(dbPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);

    // cleanup: remove tenant DB and control record
    await fs.unlink(dbPath).catch(() => {});
    await prisma.tenant.deleteMany({ where: { pathSegment: unique } }).catch(() => {});
  });

  test('SaaS owner login and session', async () => {
    // uses demo credentials in repo
    const loginRes = await fetch(`${BASE}/api/saas/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@eduflow.com', password: 'adminpassword' })
    });

    const cookies = loginRes.headers.get('set-cookie');
    const json = await loginRes.json();
    expect(json.success).toBe(true);
    expect(cookies || '').toContain('saas_owner_email');

    const sessionRes = await fetch(`${BASE}/api/saas/session`, {
      headers: { Cookie: cookies }
    });
    const sessionJson = await sessionRes.json();
    expect(sessionJson.success).toBe(true);
    expect(sessionJson.user.email).toBeDefined();
  });

  test('Tenant login (legacy seed) - create temp tenant then login', async () => {
    const unique = `test_${Date.now()}`;
    // create tenant
    const registerRes = await fetch(`${BASE}/api/saas/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test School 2',
        pathSegment: unique,
        adminName: 'Admin Tester',
        adminEmail: `admin@${unique}.school`,
        adminPassword: 'testpass',
        plan: 'PREMIUM'
      })
    });
    const registerJson = await registerRes.json();
    expect(registerJson.success).toBe(true);

    // tenant login
    const loginRes = await fetch(`${BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `admin@${unique}.school`, password: 'testpass', tenantId: unique })
    });
    const loginJson = await loginRes.json();
    expect(loginJson.success).toBe(true);

    // cleanup
    const dbPath = path.join(process.cwd(), 'prisma', 'tenants', `${unique}.db`);
    await fs.unlink(dbPath).catch(() => {});
    await prisma.tenant.deleteMany({ where: { pathSegment: unique } }).catch(() => {});
  });
});
