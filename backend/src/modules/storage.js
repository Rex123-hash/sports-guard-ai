const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');

const storage = new Storage({ projectId: process.env.GCP_PROJECT_ID });
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

/**
 * Uploads an image buffer to Cloud Storage and returns the public URL.
 * @param {Buffer} buffer
 * @param {string} mimeType
 * @param {string} folder - 'originals' | 'suspected'
 * @returns {Promise<{storagePath: string, imageUrl: string}>}
 */
async function uploadImage(buffer, mimeType, folder = 'originals') {
  const ext = mimeType.split('/')[1] || 'jpg';
  const filename = `${folder}/${uuidv4()}.${ext}`;
  const file = bucket.file(filename);

  await file.save(buffer, {
    metadata: { contentType: mimeType },
    resumable: false,
  });

  const imageUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${filename}`;
  return { storagePath: filename, imageUrl };
}

module.exports = { uploadImage };
