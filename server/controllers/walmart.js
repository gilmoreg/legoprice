global.fetch = require('node-fetch');

exports.fetchData = (id) => {
  const url = `http://api.walmartlabs.com/v1/search?query=Lego+${id}&format=json&categoryId=4171_4186_1044000&apiKey=${process.env.WALMART_KEY}&numItems=25`;
  return global.fetch(url)
    .then(res => res.json())
    .then(res => res.items.filter(item => (item.name.includes(id) || item.productUrl.includes(id))))
    .then(res => ({
      price: res[0].salePrice,
      url: res[0].productUrl,
    }))
    .catch(err => Error(err));
};


// http://c.affil.walmart.com/t/api02?l=https%3A%2F%2Fwww.walmart.com%2Fip%2FLEGO-DC-Super-Hero-Girls-Eclipso-Dark-Palace-41239%2F507356910%3Faffp1%3D_BXe4OaA84ugzZA0aiFiGK9NuvzDB7MPBsbuXUm2XI4%26affilsrc%3Dapi%26veh%3Daff%26wmlspartner%3Dreadonlyapi