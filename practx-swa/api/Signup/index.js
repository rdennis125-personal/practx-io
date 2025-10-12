const { TableClient } = require('@azure/data-tables');
const { customAlphabet } = require('nanoid');
const crypto = require('crypto');

const randomId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeText(value = '', max = 200) {
  return String(value || '')
    .trim()
    .replace(/[\r\n\t]+/g, ' ')
    .slice(0, max);
}

function getIpHash(headers) {
  const forwarded = headers['x-forwarded-for'] || headers['X-Forwarded-For'];
  if (!forwarded) return null;
  const first = forwarded.split(',')[0].trim();
  if (!first) return null;
  let segment;
  if (first.includes('.')) {
    const parts = first.split('.');
    segment = parts.slice(-2).join('.');
  } else if (first.includes(':')) {
    const parts = first.split(':');
    segment = parts.slice(-4).join(':');
  }
  if (!segment) return null;
  return crypto.createHash('sha256').update(segment).digest('hex');
}

function buildCors(origin) {
  const allowedOrigins = (process.env.ALLOWED_ORIGIN || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (allowedOrigins.length === 0) {
    headers['Access-Control-Allow-Origin'] = '*';
    return { headers, allowed: true };
  }

  if (!origin) {
    return { headers, allowed: true };
  }

  if (allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    return { headers, allowed: true };
  }

  return { headers, allowed: false };
}

module.exports = async function (context, req) {
  const { headers: corsHeaders, allowed: originAllowed } = buildCors(
    req.headers.origin || req.headers.Origin
  );

  if (req.method === 'OPTIONS') {
    context.res = {
      status: 204,
      headers: corsHeaders,
    };
    return;
  }

  if (!originAllowed) {
    context.res = {
      status: 403,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: 'Origin not allowed' }),
    };
    return;
  }

  if (req.method !== 'POST') {
    context.res = {
      status: 405,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: 'Method not allowed' }),
    };
    return;
  }

  if (!process.env.PRACTX_WEBJOB_STORAGE && !process.env.AZURE_STORAGE_CONNECTION_STRING) {
    context.log.error('Missing PRACTX_WEBJOB_STORAGE configuration');
    context.res = {
      status: 500,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: 'Server configuration error' }),
    };
    return;
  }

  let payload;
  try {
    payload = typeof req.body === 'object' && req.body !== null ? req.body : JSON.parse(req.rawBody || '{}');
  } catch (err) {
    context.log.warn('Invalid JSON payload');
    context.res = {
      status: 400,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: 'Invalid request body' }),
    };
    return;
  }

  const { name, email, company, interest, website } = payload || {};

  if (typeof website === 'string' && website.trim() !== '') {
    context.log.warn('Honeypot triggered');
    context.res = {
      status: 400,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: 'Unable to process request' }),
    };
    return;
  }

  const safeName = sanitizeText(name, 100);
  const safeEmail = sanitizeText(email, 200).toLowerCase();
  const safeCompany = sanitizeText(company, 200);
  const safeInterest = sanitizeText(interest, 50) || 'Other';

  if (safeName.length < 3) {
    context.res = {
      status: 400,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: 'Name is required.' }),
    };
    return;
  }

  if (!EMAIL_REGEX.test(safeEmail)) {
    context.res = {
      status: 400,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: 'Valid email is required.' }),
    };
    return;
  }

  const tableName = process.env.STORAGE_TABLE_NAME || 'Leads';

  const connectionString =
    process.env.PRACTX_WEBJOB_STORAGE || process.env.AZURE_STORAGE_CONNECTION_STRING;

  const tableClient = TableClient.fromConnectionString(connectionString, tableName);

  try {
    await tableClient.createTable();
  } catch (err) {
    if (err.statusCode !== 409) {
      context.log.error('Failed to ensure table exists', { code: err.code });
      context.res = {
        status: 500,
        headers: corsHeaders,
        body: JSON.stringify({ ok: false, error: 'Server error' }),
      };
      return;
    }
  }

  const timestamp = new Date().toISOString();
  const entity = {
    partitionKey: 'web',
    rowKey: `${timestamp}_${randomId()}`,
    Name: safeName,
    Email: safeEmail,
    Company: safeCompany,
    Interest: safeInterest,
    UserAgent: sanitizeText(req.headers['user-agent'], 400),
    IpHash: getIpHash(req.headers),
    CreatedUtc: timestamp,
  };

  try {
    await tableClient.createEntity(entity);
  } catch (err) {
    context.log.error('Failed to store lead', { code: err.code });
    context.res = {
      status: 500,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: 'Unable to save lead' }),
    };
    return;
  }

  context.res = {
    status: 200,
    headers: corsHeaders,
    body: JSON.stringify({ ok: true }),
  };
};
