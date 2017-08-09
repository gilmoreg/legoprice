const amazon = require('amazon-affiliate-api');

exports.fetchData = async (id) => {
  const client = amazon.createClient({
    awsId: process.env.AMAZON_ACCESS_KEY,
    awsSecret: process.env.AMAZON_SECRET,
    awsTag: process.env.AMAZON_ASSOCIATE_ID,
  });
  return client.itemSearch({
    searchIndex: 'Toys',
    keywords: `Lego ${id}`,
    title: `${id}`,
    responseGroup: 'OfferSummary,Small',
  })
    .then(results => results.Items.Item[0])
    .then(item => ({
      url: item.DetailPageURL,
      title: item.ItemAttributes.Title,
      price: Number.parseFloat(item.OfferSummary.LowestNewPrice.Amount, 10) / 100,
      asin: item.ASIN,
    }))
    .catch(err => console.error(err));
};
