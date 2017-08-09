global.fetch = require('node-fetch');

exports.fetchData = (id) => {
  console.log('walmart', id);
  const url = `http://api.walmartlabs.com/v1/search?query=Lego+${id}&format=json&categoryId=4171_4186_1044000&apiKey=${process.env.WALMART_KEY}`;
  return global.fetch(url)
    .then(res => res.json())
    .then(res => ({
      price: res.items[0].salePrice,
      url: res.items[0].productUrl,
    }))
    .catch(err => Error(err));
};
