const { BlobServiceClient } = require('@azure/storage-blob');
const crypto = require('crypto');

const DEFAULT_CONTAINER = process.env.CONTAINER_LANDING || 'landing';

function resolveStorageConnection() {
  const directSetting = process.env.BLOB_CONNECTION;
  if (directSetting && directSetting.trim()) {
    return directSetting.trim();
  }

  const legacySetting = process.env.AzureWebJobsStorage || process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (legacySetting && legacySetting.trim()) {
    return legacySetting.trim();
  }

  return null;
}

function buildBlobUrl(endpoint, containerName, blobName) {
  if (!endpoint) return null;
  const trimmed = endpoint.endsWith('/') ? endpoint : `${endpoint}/`;
  return `${trimmed}${containerName}/${blobName}`;
}

function sanitizePathSegment(value, fallback = 'general') {
  if (!value) return fallback;

  const text = String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .trim()
    .toLowerCase();

  const cleaned = text
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return cleaned || fallback;
}

function createBlobPayload(message, containerName, folderName, metadata) {
  return {
    message,
    container: containerName,
    folder: folderName,
    interest: metadata.interest || null,
    subject: metadata.subject || null,
    trigger: metadata.trigger || null,
    createdAt: new Date().toISOString(),
  };
}

module.exports = async function (context, req) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (req.method !== 'POST') {
    context.res = {
      status: 405,
      headers,
      body: JSON.stringify({ ok: false, error: 'Method not allowed. Use POST.' }),
    };
    return;
  }

  const connectionString = resolveStorageConnection();

  if (!connectionString) {
    context.log.error('Missing storage connection setting.');
    context.res = {
      status: 500,
      headers,
      body: JSON.stringify({ ok: false, error: 'Storage connection not configured.' }),
    };
    return;
  }

  const containerName = DEFAULT_CONTAINER;

  const interestInput =
    req.body?.interest ||
    req.query?.interest ||
    req.body?.subject ||
    req.query?.subject ||
    req.body?.trigger ||
    'general';

  const folderName = sanitizePathSegment(interestInput);

  const messageInput =
    typeof req.body?.message === 'string' && req.body.message.trim()
      ? req.body.message.trim()
      : 'Hello from Practx API!';

  const metadata = {
    interest: req.body?.interest || req.query?.interest || null,
    subject: req.body?.subject || req.query?.subject || null,
    trigger: req.body?.trigger || null,
  };

  try {
    const blobService = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobService.getContainerClient(containerName);
    await containerClient.createIfNotExists();

    const blobPayload = createBlobPayload(messageInput, containerName, folderName, metadata);
    const blobContent = JSON.stringify(blobPayload, null, 2);
    const blobName = `${folderName}/hello-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.json`;
    const blockBlob = containerClient.getBlockBlobClient(blobName);

    await blockBlob.upload(blobContent, Buffer.byteLength(blobContent), {
      blobHTTPHeaders: {
        blobContentType: 'application/json',
      },
    });

    const blobUrl = buildBlobUrl(process.env.BLOB_ENDPOINT, containerName, blobName);

    context.res = {
      status: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        container: containerName,
        folder: folderName,
        blobName,
        blobUrl,
        message: blobPayload.message,
      }),
    };
  } catch (error) {
    context.log.error('Failed to write blob', {
      containerName,
      folderName,
      error: error.message,
    });

    context.res = {
      status: 500,
      headers,
      body: JSON.stringify({ ok: false, error: 'Failed to write blob.' }),
    };
  }
};
