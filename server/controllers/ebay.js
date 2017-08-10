/* eslint-disable no-underscore-dangle */
global.fetch = require('node-fetch');

const buildURL = (gateway, params) => {
  let url = gateway;
  Object.keys(params).forEach((key) => {
    url += `${key}=${params[key]}&`;
  });
  return url.slice(0, -1);
};

exports.fetchData = async (id) => {
  // Use Shopping API to get product ID
  const shoppingParams = {
    appid: process.env.EBAY_APPID,
    version: '517',
    siteid: '0', // US
    responseencoding: 'JSON',
    callname: 'FindProducts',
    // CategoryID: '19006',
    QueryKeywords: encodeURIComponent(`Lego ${id}`),
  };

  const shopUrl = buildURL('http://open.api.ebay.com/shopping?', shoppingParams);
  const productId = await global.fetch(shopUrl)
    .then(res => res.json())
    .then(res => (res.Product[0].Title.includes(id) ? res : null))
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
    'itemFilter(1).name': 'SortOrder',
    'itemFilter(1).value(0)': 'CurrentPriceLowest',
    'itemFilter(2).name': 'LocatedIn',
    'itemFilter(2).value(0)': 'US',
  };
  let findUrl = buildURL('http://svcs.ebay.com/services/search/FindingService/v1?', findingParams);
  findUrl += '&REST-PAYLOAD';
  const active = await global.fetch(findUrl)
    .then(res => res.json())
    .then(res => res.findItemsByProductResponse[0].searchResult[0].item[0])
    .then((res) => {
      let price = 0;
      try {
        price += Number.parseFloat(res.shippingInfo[0].shippingServiceCost[0].__value__, 10);
      } catch (err) {
        console.log('No shipping info');
      }
      price += Number.parseFloat(res.sellingStatus[0].currentPrice[0].__value__, 10);
      return {
        price,
        url: res.viewItemURL[0],
      };
    })
    .catch(error => Error({ message: 'Could not get current Ebay sale info', error }));

  const completedParams = {
    'SERVICE-VERSION': '1.0.0',
    'RESPONSE-DATA-FORMAT': 'JSON',
    'OPERATION-NAME': 'findCompletedItems',
    'productId.@type': 'ReferenceID',
    'SECURITY-APPNAME': process.env.EBAY_APPID,
    'itemFilter(0).name': 'Condition',
    'itemFilter(0).value(0)': '1000', // new condition only
    'itemFilter(1).name': 'SoldItemsOnly',
    'itemFilter(1).value(0)': 'true',
    'itemFilter(2).name': 'LocatedIn',
    'itemFilter(2).value(0)': 'US',
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
