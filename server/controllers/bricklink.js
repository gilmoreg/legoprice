global.fetch = require('node-fetch');
const nonce = require('nonce')();
const oauthSignature = require('oauth-signature');

exports.fetchData = async (id) => {
  console.log('bricklink', id);

  const url = `https://api.bricklink.com/api/store/v1/items/SET/${id}/price`;
  const oauthHeaders = {
    oauth_consumer_key: process.env.BRICKLINK_KEY,
    oauth_token: process.env.BRICKLINK_TOKEN,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: `${Date.now()}`,
    oauth_nonce: `${nonce()}`,
    oauth_version: '1.0',
  };

  console.log(oauthHeaders);

  oauthHeaders.oauth_signature = oauthSignature
    .generate('GET', url, oauthHeaders, process.env.BRICKLINK_SECRET, process.env.BRICKLINK_TOKEN_SECRET);

  const results = await global.fetch(`${url}?Authorization=${JSON.stringify(oauthHeaders)}`)
    .then(res => res.json());
  console.log(results);
  return results;
};
