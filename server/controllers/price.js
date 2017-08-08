const amazon = require('./amazon');

exports.fetchPrices = async (req, res) => {
  const amazonPrices = await amazon.fetchPrices(req.params.id);
  res.status(200).json({ prices: amazonPrices });
};
