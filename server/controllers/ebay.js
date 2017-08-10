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
    .then(res => Number.parseInt(res.Product[0].ProductID[0].Value, 10))
    .catch(() => Error('Could not get Ebay Product ID'));
  // If we dont get a product ID nothing else will work, so bail out
  if (productId instanceof Error) return productId;

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
  const active = await global.fetch(findUrl)
    .then(res => res.json())
    .then(res => res.findItemsByProductResponse[0].searchResult[0].item[0])
    .then(res => ({
      url: res.viewItemURL[0],
      price: Number.parseFloat(res.sellingStatus[0].currentPrice[0].__value__, 10) +
        Number.parseFloat(res.shippingInfo[0].shippingServiceCost[0].__value__, 10),
    }))
    .catch(error => Error({ message: 'Could not get current Ebay sale info', error }));

  const completedParams = {
    'SERVICE-VERSION': '1.0.0',
    'RESPONSE-DATA-FORMAT': 'JSON',
    'OPERATION-NAME': 'findCompletedItems',
    'productId.@type': 'ReferenceID',
    'SECURITY-APPNAME': process.env.EBAY_APPID,
    'itemFilter(0).name': 'Condition',
    'itemFilter(0).value(0)': '1000', // new condition only
    'itemFilter(1).name': 'MinPrice',
    'itemFilter(1).value(0)': `${minPrice}`,
    'itemFilter(2).name': 'SoldItemsOnly',
    'itemFilter(2).value(0)': 'true',
    'itemFilter(3).name': 'LocatedIn',
    'itemFilter(3).value(0)': 'US',
    'paginationInput.entriesPerPage': '5',
    productId,
  };
  let completedUrl = buildURL('http://svcs.ebay.com/services/search/FindingService/v1?', completedParams);
  completedUrl += '&REST-PAYLOAD';
  const completed = await global.fetch(completedUrl)
    .then(res => res.json())
    .then(res => res.findCompletedItemsResponse[0].searchResult[0].item)
    .then(res => res.map(item =>
      Number.parseFloat(item.sellingStatus[0].currentPrice[0].__value__, 10)))
    .catch(error => Error({ message: 'Could not get historical Ebay info', error }));

  return { active, completed };
};
