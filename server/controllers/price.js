const amazonController = require('./amazon');
const walmartController = require('./walmart');
const ebayController = require('./ebay');

exports.fetchPrices = async (req, res) => {
  const amazon = await amazonController.fetchData(req.params.id);
  const walmart = await walmartController.fetchData(req.params.id);
  const brickset = { url: `https://brickset.com/sets/${req.params.id}` };
  const camel = { url: `https://camelcamelcamel.com/product/${amazon.asin}` };
  const ebay = await ebayController.fetchData(req.params.id);
  res.status(200).json({ amazon, /* bricklink, */ walmart, brickset, camel, ebay });
};
