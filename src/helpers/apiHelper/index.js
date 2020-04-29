
const ApiHelper = {
  status400Error: (res, error) => res.status(400).send({
    error,
  }),
  status404Error: (res, error) => res.status(404).send({
    error,
  }),
  status500Error: (res, error) => res.status(500).send({
    error,
  }),
};

module.exports = ApiHelper;
