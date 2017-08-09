/* eslint-disable no-underscore-dangle */
global.fetch = require('node-fetch');

const buildURL = (gateway, params) => {
  let url = gateway;
  Object.keys(params).forEach((key) => {
    url += `${key}=${params[key]}&`;
  });
  return url.slice(0, -1);
};

exports.fetchData = async (id, minPrice) => {
  // Use Shopping API to get product ID
  const shoppingParams = {
    appid: process.env.EBAY_APPID,
    version: '517',
    siteid: '0', // US
    responseencoding: 'JSON',
    callname: 'FindProducts',
    QueryKeywords: encodeURIComponent(`Lego ${id}`),
  };

  const shopUrl = buildURL('http://open.api.ebay.com/shopping?', shoppingParams);
  const productId = await global.fetch(shopUrl)
    .then(res => res.json())
    .then(res => Number.parseInt(res.Product[0].ProductID[0].Value, 10));

  // Use Finding API to get listings
  const findingParams = {
    'SERVICE-VERSION': '1.0.0',
    'RESPONSE-DATA-FORMAT': 'JSON',
    'OPERATION-NAME': 'findItemsByProduct',
    'productId.@type': 'ReferenceID',
    'SECURITY-APPNAME': process.env.EBAY_APPID,
    productId,
    'itemFilter(0).name': 'Condition',
    'itemFilter(0).value(0)': '1000', // new condition only
    'itemFilter(1).name': 'MinPrice',
    'itemFilter(1).value(0)': `${minPrice}`,
    'itemFilter(2).name': 'SortOrder',
    'itemFilter(2).value(0)': 'CurrentPriceLowest',
    'itemFilter(3).name': 'LocatedIn',
    'itemFilter(3).value(0)': 'US',
  };
  let findUrl = buildURL('http://svcs.ebay.com/services/search/FindingService/v1?', findingParams);
  findUrl += '&REST-PAYLOAD';
  const data = await global.fetch(findUrl)
    .then(res => res.json())
    .then((res) => {
      console.log('ebay', res.findItemsByProductResponse[0].searchResult[0]);
      return res;
    })
    .then(res => res.findItemsByProductResponse[0].searchResult[0].item[0])
    .then(res => ({
      url: res.viewItemURL[0],
      price: Number.parseFloat(res.sellingStatus[0].currentPrice[0].__value__, 10),
    }));

  // http://svcs.ebay.com/services/search/FindingService/v1?SERVICE-VERSION=1.0.0&RESPONSE-DATA-FORMAT=JSON&OPERATION-NAME=findItemsByProduct&productId.@type=ReferenceID&SECURITY-APPNAME=GraysonG-Legopric-PRD-68e01d5e3-80be1545&productId=238331572&REST-PAYLOAD

  /* 
    Params:
    appid=${process.env.EBAY_APPID}
    version=517
    siteid=0
    responseencoding=json
    callname= <FindPopularItems>

    First need to call FindProducts to get the ebay ID - want the reference ID
    QueryKeywords

    batman set: 238331572
  */
  return data;
};
