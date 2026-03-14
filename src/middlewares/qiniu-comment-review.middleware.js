const crypto = require('crypto');
const https = require('https');
const config = require('../config');

function getQiniuToken(host, path, body, method) {
  const accessKey = config.qiniu && config.qiniu.accessKey;
  const secretKey = config.qiniu && config.qiniu.secretKey;

  if (!accessKey || !secretKey) {
    return null;
  }

  let access = `${method.toUpperCase()} ${path}`;
  access += `\nHost: ${host}`;
  access += '\nContent-Type: application/json';
  access += '\n\n';
  access += body;

  const hmac = crypto.createHmac('sha1', secretKey);
  hmac.update(access);
  const digest = hmac.digest('base64');
  const safeDigest = digest.replace(/\//g, '_').replace(/\+/g, '-');

  return `Qiniu ${accessKey}:${safeDigest}`;
}

function sendCommentToQiniu(commentText) {
  const host = 'ai.qiniuapi.com';
  const path = '/v3/text/censor';
  const method = 'POST';
  const body = JSON.stringify({
    data: {
      text: commentText
    },
    params: {
      scenes: ['antispam']
    }
  });

  const token = getQiniuToken(host, path, body, method);

  if (!token) {
    return Promise.resolve({
      skipped: true
    });
  }

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
            const err = new Error('七牛内容审核请求失败');
            err.status = 502;
            return reject(err);
          }

          try {
            const parsed = JSON.parse(responseBody || '{}');
            return resolve(parsed);
          } catch (err) {
            const parseErr = new Error('七牛内容审核响应解析失败');
            parseErr.status = 502;
            return reject(parseErr);
          }
        });
      }
    );

    req.on('error', (err) => {
      err.status = 502;
      reject(err);
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

async function qiniuCommentReviewMiddleware(req, res, next) {
  try {
    const text = ((req.body && req.body.text) || '').trim();

    if (!text) {
      return res.fail('评论内容不能为空', 400);
    }

    const result = await sendCommentToQiniu(text);
    if (result.skipped) {
      return next();
    }

    const suggestion = pickSuggestion(result);

    if (suggestion === 'pass') {
      return next();
    }

    if (suggestion === 'review') {
      return res.fail('评论包含敏感内容，待审核后发布', 403, {
        suggestion
      });
    }

    return res.fail('评论包含违规内容，发布失败', 403, {
      suggestion: suggestion || 'block'
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = qiniuCommentReviewMiddleware;
