const amazonController = require('./amazon');
const bricklinkController = require('./bricklink');
const walmartController = require('./walmart');

exports.fetchPrices = async (req, res) => {
  const amazon = await amazonController.fetchData(req.params.id);
  const bricklink = await bricklinkController.fetchData(req.params.id);
  const walmart = await walmartController.fetchData(req.params.id);
  res.status(200).json({ amazon, bricklink, walmart });
};
