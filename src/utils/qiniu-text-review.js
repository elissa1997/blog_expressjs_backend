const crypto = require('crypto');
const https = require('https');
const config = require('../config');

function getQiniuToken(host, path, body, method) {
  const accessKey = config.qiniu && config.qiniu.accessKey;
  const secretKey = config.qiniu && config.qiniu.secretKey;

  if (!accessKey || !secretKey) return null;

  let access = `${method.toUpperCase()} ${path}`;
  access += `\nHost: ${host}`;
  access += '\nContent-Type: application/json';
  access += '\n\n';
  access += body;

  const digest = crypto.createHmac('sha1', secretKey).update(access).digest('base64');
  const safeDigest = digest.replace(/\//g, '_').replace(/\+/g, '-');
  return `Qiniu ${accessKey}:${safeDigest}`;
}

function reviewText(text) {
  const host = 'ai.qiniuapi.com';
  const path = '/v3/text/censor';
  const method = 'POST';
  const body = JSON.stringify({
    data: { text },
    params: { scenes: ['antispam'] }
  });
  const token = getQiniuToken(host, path, body, method);

  if (!token) return Promise.resolve({ skipped: true });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host,
        path,
        method,
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => {
          responseBody += chunk.toString();
        });
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            const error = new Error('七牛内容审核请求失败');
            error.status = 502;
            return reject(error);
          }

          try {
            return resolve(JSON.parse(responseBody || '{}'));
          } catch (err) {
            const error = new Error('七牛内容审核响应解析失败');
            error.status = 502;
            return reject(error);
          }
        });
      }
    );

    req.on('error', (error) => {
      error.status = 502;
      reject(error);
    });
    req.setTimeout(10000, () => {
      const error = new Error('七牛内容审核请求超时');
      error.status = 502;
      req.destroy(error);
    });
    req.write(body);
    req.end();
  });
}

function pickSuggestion(data) {
  return (
    (data &&
      data.result &&
      data.result.scenes &&
      data.result.scenes.antispam &&
      data.result.scenes.antispam.suggestion) ||
    (data && data.result && data.result.suggestion) ||
    ''
  );
}

module.exports = { reviewText, pickSuggestion };
