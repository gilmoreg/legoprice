const amazonController = require('./amazon');
// const bricklinkController = require('./bricklink');
const walmartController = require('./walmart');
const ebayController = require('./ebay');

exports.fetchPrices = async (req, res) => {
  const amazon = await amazonController.fetchData(req.params.id);
  // Without an Amazon ASIN too much of the rest will fail, so bail out
  if (!amazon.asin) {
    res.status(200).json({ error: 'Could not find that set' });
  }
  // const bricklink = await bricklinkController.fetchData(req.params.id);
  const walmart = await walmartController.fetchData(req.params.id);
  const brickset = { url: `https://brickset.com/sets/${req.params.id}` };
  const camel = { url: `https://camelcamelcamel.com/product/${amazon.asin}` };
  // Keep ebay price high enough to eliminate incomplete sets
  const minPrice = Math.min(amazon.price, walmart.price) * 0.8;
  const ebay = await ebayController.fetchData(req.params.id, minPrice);
  res.status(200).json({ amazon, /* bricklink, */ walmart, brickset, camel, ebay });
};
