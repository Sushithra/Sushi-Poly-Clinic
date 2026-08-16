import { test, expect } from '@playwright/test';

const FRONTEND = 'https://sushi-polyclinic.onrender.com';
const BACKEND = 'https://sushi-poly-clinic.onrender.com';
const timestamp = Date.now();
const patient = {
  name: `PW Patient ${timestamp}`,
  email: `pw.patient.${timestamp}@example.com`,
  password: `PwPatient!${timestamp}`,
  age: '32',
};
const doctor = {
  name: `PW Doctor ${timestamp}`,
  email: `pw.doctor.${timestamp}@example.com`,
  password: `PwDoctor!${timestamp}`,
  specializations: ['General Medicine'],
  experienceYears: '7',
  consultationFee: '750',
};

const createMonitor = () => {
  const events = {
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
    apiRequests: [],
    corsErrors: [],
    responses: [],
  };
  return events;
};

async function attachMonitoring(page, events) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      events.consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (error) => {
    events.pageErrors.push(error.message);
  });
  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('/api/') || url.includes('localhost') || url.includes('127.0.0.1')) {
      events.apiRequests.push({ method: request.method(), url });
    }
  });
  page.on('requestfailed', (request) => {
    events.failedRequests.push({ url: request.url(), failure: request.failure()?.errorText || 'failed' });
  });
  page.on('response', (response) => {
    const url = response.url();
    if (url.includes('/api/')) {
      events.responses.push({ status: response.status(), url });
    }
  });
}

async function expectLoginReady(page) {
  if (!/\/login(?:\?.*)?$/.test(page.url())) {
    const loginLink = page.getByRole('link', { name: /^Login$/i });
    if (await loginLink.count()) {
      await loginLink.click();
      await page.waitForLoadState('networkidle');
    }
  }
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  await expect(page.getByRole('textbox').first()).toBeVisible();
  await expect(page.getByRole('textbox').nth(1)).toBeVisible();
}

test.describe.configure({ mode: 'serial' });

test('Test 1 - Frontend availability', async ({ page }) => {
  const events = createMonitor();
  await attachMonitoring(page, events);
  const response = await page.goto(FRONTEND, { waitUntil: 'networkidle' });
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByText(/Sushi Poly Clinic/i)).toBeVisible();
  await expect(page.getByText(/Electropathy\s+–\s+The Future of Herbal Medicine/i)).toBeVisible();
  expect(events.consoleErrors).toEqual([]);
  expect(events.failedRequests).toEqual([]);
});

test('Test 3/4/7/8 - Auth flow and role routing', async ({ page }) => {
  const events = createMonitor();
  await attachMonitoring(page, events);

  await page.goto(FRONTEND, { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: /sign up/i }).click();
  await expect(page.getByText(/Choose your role first/i)).toBeVisible();

  await page.getByRole('button').nth(0).click();
  await expect(page.getByRole('textbox').first()).toBeVisible();
  await page.getByRole('textbox').nth(0).fill(patient.name);
  await page.getByRole('textbox').nth(1).fill(patient.email);
  await page.getByRole('textbox').nth(2).fill(patient.password);
  await page.getByRole('spinbutton').nth(0).fill(patient.age);
  await page.getByRole('button', { name: /create patient account/i }).click();
  await page.waitForURL(/patient\/dashboard/, { timeout: 30000 });
  await expect(page).toHaveURL(/patient\/dashboard/);
  await expect(page.getByText(/Eclinic Patient/i)).toBeVisible();

  await page.getByRole('button', { name: /logout/i }).click();
  await expectLoginReady(page);

  await page.getByRole('textbox').nth(0).fill(patient.email);
  await page.getByRole('textbox').nth(1).fill(patient.password);
  await page.getByRole('button', { name: /^Sign In$/i }).click();
  await page.waitForURL(/patient\/dashboard/, { timeout: 30000 });
  await expect(page.getByText(/Eclinic Patient/i)).toBeVisible();

  await page.getByRole('button', { name: /logout/i }).click();
  await expectLoginReady(page);
  await page.getByRole('textbox').nth(0).fill(`missing.${timestamp}@example.com`);
  await page.getByRole('textbox').nth(1).fill('WrongPass!123');
  await page.getByRole('button', { name: /^Sign In$/i }).click();
  await expect(page.getByText(/Invalid email or password|No account found/i)).toBeVisible();

  await page.getByRole('link', { name: /sign up/i }).click();
  await page.getByRole('button').nth(1).click();
  await expect(page.getByRole('textbox').first()).toBeVisible();
  await page.getByRole('textbox').nth(0).fill(doctor.name);
  await page.getByRole('textbox').nth(1).fill(doctor.email);
  await page.getByRole('textbox').nth(2).fill(doctor.password);
  await page.getByRole('button', { name: /general medicine/i }).click();
  await page.getByRole('spinbutton').nth(0).fill(doctor.experienceYears);
  await page.getByRole('spinbutton').nth(1).fill(doctor.consultationFee);
  await page.getByRole('button', { name: /create doctor account/i }).click();
  await page.waitForURL(/doctor\/dashboard/, { timeout: 30000 });
  await expect(page.getByText(/Doctor Portal/i)).toBeVisible();

  await page.getByRole('button', { name: /sign out/i }).click();
  await page.waitForURL(FRONTEND + '/', { timeout: 30000 });

  await expectLoginReady(page);
  await page.getByRole('textbox').nth(0).fill(doctor.email);
  await page.getByRole('textbox').nth(1).fill(doctor.password);
  await page.getByRole('button', { name: /^Sign In$/i }).click();
  await page.waitForURL(/doctor\/dashboard/, { timeout: 30000 });
  await expect(page.getByText(/Doctor Portal/i)).toBeVisible();

  const unexpectedConsoleErrors = events.consoleErrors.filter((message) => !message.includes('401'));
  expect(unexpectedConsoleErrors).toEqual([]);
  expect(events.pageErrors).toEqual([]);
});

test('Test 2/9/10 - Production API communication and smoke', async ({ page }) => {
  const events = createMonitor();
  await attachMonitoring(page, events);

  await page.goto(FRONTEND, { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: /sign up/i }).click();
  await page.getByRole('button').nth(0).click();
  await page.getByRole('textbox').nth(0).fill(`Smoke Patient ${timestamp}`);
  await page.getByRole('textbox').nth(1).fill(`smoke.patient.${timestamp}@example.com`);
  await page.getByRole('textbox').nth(2).fill(`SmokePatient!${timestamp}`);
  await page.getByRole('spinbutton').nth(0).fill('29');
  await page.getByRole('button', { name: /create patient account/i }).click();
  await page.waitForURL(/patient\/dashboard/, { timeout: 30000 });

  await expect(page.getByText(/Eclinic Patient/i)).toBeVisible();
  await page.getByRole('link', { name: /find doctors/i }).first().click().catch(() => {});

  expect(events.apiRequests.some((entry) => entry.url.includes(BACKEND))).toBeTruthy();
  expect(events.apiRequests.some((entry) => entry.url.includes('localhost') || entry.url.includes('127.0.0.1'))).toBeFalsy();
  const ignoredFailureHosts = [
    'checkout-static-next.razorpay.com',
    'fonts.gstatic.com',
    'play.google.com',
  ];
  const unexpectedFailures = events.failedRequests.filter((entry) => !ignoredFailureHosts.some((host) => entry.url.includes(host)));
  expect(unexpectedFailures).toEqual([]);
  expect(events.consoleErrors).toEqual([]);
});
