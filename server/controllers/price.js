const amazon = require('./amazon');

exports.fetchPrices = async (req, res) => {
  const amazonPrices = await amazon.fetchData(req.params.id);
  res.status(200).json({ amazon: amazonPrices });
};
