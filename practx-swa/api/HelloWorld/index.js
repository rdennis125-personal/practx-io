const { BlobServiceClient } = require('@azure/storage-blob');
const crypto = require('crypto');

const CONTAINER_MAP = {
  landing: process.env.CONTAINER_LANDING || 'landing',
  practice: process.env.CONTAINER_PRACTICE || 'practice',
  patient: process.env.CONTAINER_PATIENT || 'patient',
  equipment: process.env.CONTAINER_EQUIPMENT || 'equipment',
  service: process.env.CONTAINER_SERVICE || 'service',
};

function normalizeContainerKey(input) {
  if (!input) return null;
  return String(input).trim().toLowerCase();
}

function buildBlobUrl(endpoint, containerName, blobName) {
  if (!endpoint) return null;
  const trimmed = endpoint.endsWith('/') ? endpoint : `${endpoint}/`;
  return `${trimmed}${containerName}/${blobName}`;
}

function createBlobPayload(message, containerName) {
  return {
    message,
    container: containerName,
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

  if (!process.env.BLOB_CONNECTION) {
    context.log.error('Missing BLOB_CONNECTION setting.');
    context.res = {
      status: 500,
      headers,
      body: JSON.stringify({ ok: false, error: 'Storage connection not configured.' }),
    };
    return;
  }

  const containerKey =
    normalizeContainerKey(req.query?.container) ||
    normalizeContainerKey(req.body?.container) ||
    'landing';

  const containerName = CONTAINER_MAP[containerKey];
  if (!containerName) {
    context.log.warn('Invalid container requested', { containerKey });
    context.res = {
      status: 400,
      headers,
      body: JSON.stringify({ ok: false, error: 'Unknown container requested.' }),
    };
    return;
  }

  const messageInput =
    typeof req.body?.message === 'string' && req.body.message.trim()
      ? req.body.message.trim()
      : 'Hello from Practx API!';

  try {
    const blobService = BlobServiceClient.fromConnectionString(process.env.BLOB_CONNECTION);
    const containerClient = blobService.getContainerClient(containerName);
    await containerClient.createIfNotExists();

    const blobPayload = createBlobPayload(messageInput, containerName);
    const blobContent = JSON.stringify(blobPayload, null, 2);
    const blobName = `hello-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.json`;
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
        blobName,
        blobUrl,
        message: blobPayload.message,
      }),
    };
  } catch (error) {
    context.log.error('Failed to write blob', {
      containerKey,
      containerName,
      error: error.message,
    });

    context.res = {
      status: 500,
      headers,
      body: JSON.stringify({ ok: false, error: 'Failed to write blob.' }),
    };
  }
};
