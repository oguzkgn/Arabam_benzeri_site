const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

let gridBucket = null;

function getBucket() {
  if (!gridBucket && mongoose.connection.readyState === 1) {
    gridBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
  }
  return gridBucket;
}

function buildFilename(originalname) {
  return `${Date.now()}-${originalname.replace(/\s+/g, '-')}`;
}

function saveLocalFile(filename, buffer, uploadsDir) {
  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, buffer);
}

async function saveToGridFS(filename, buffer, mimetype) {
  const bucket = getBucket();
  if (!bucket) return;

  return new Promise((resolve, reject) => {
    const stream = bucket.openUploadStream(filename, { contentType: mimetype || 'image/jpeg' });
    stream.on('finish', resolve);
    stream.on('error', reject);
    stream.end(buffer);
  });
}

async function saveUploadedFiles(files, uploadsDir) {
  const filenames = [];
  for (const file of files) {
    const filename = buildFilename(file.originalname);
    saveLocalFile(filename, file.buffer, uploadsDir);
    await saveToGridFS(filename, file.buffer, file.mimetype);
    filenames.push(filename);
  }
  return filenames;
}

async function streamFile(filename, uploadsDir, res) {
  const localPath = path.join(uploadsDir, filename);
  if (fs.existsSync(localPath)) {
    return res.sendFile(localPath);
  }

  const bucket = getBucket();
  if (!bucket) {
    return sendPlaceholder(res);
  }

  try {
    const files = await bucket.find({ filename }).limit(1).toArray();
    if (!files.length) {
      return sendPlaceholder(res);
    }
    res.set('Content-Type', files[0].contentType || 'image/jpeg');
    bucket.openDownloadStreamByName(filename).pipe(res);
  } catch (error) {
    console.error('Dosya okuma hatası:', error.message);
    sendPlaceholder(res);
  }
}

async function deleteStoredFiles(filenames, uploadsDir) {
  if (!filenames?.length) return;

  const bucket = getBucket();
  for (const filename of filenames) {
    const localPath = path.join(uploadsDir, filename);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
    if (bucket) {
      try {
        const files = await bucket.find({ filename }).toArray();
        for (const file of files) {
          await bucket.delete(file._id);
        }
      } catch (error) {
        console.warn('GridFS silme hatası:', filename, error.message);
      }
    }
  }
}

function sendPlaceholder(res) {
  res.status(200);
  res.set('Content-Type', 'image/svg+xml');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
    <rect width="640" height="480" fill="#e5e7eb"/>
    <text x="320" y="240" text-anchor="middle" fill="#6b7280" font-family="Arial" font-size="24">Fotoğraf Yok</text>
  </svg>`);
}

module.exports = {
  saveUploadedFiles,
  streamFile,
  deleteStoredFiles,
  sendPlaceholder
};
