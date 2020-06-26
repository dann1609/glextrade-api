
const ApiHelper = {
  statusBadRequest: (res, error) => res.status(400).send({
    error,
  }),
  statusUnauthorized: (res, error) => res.status(401).send({
    error,
  }),
  statusNotFound: (res, error) => res.status(404).send({
    error,
  }),
  statusInternalServerError: (res, error) => res.status(500).send({
    error,
  }),
};

module.exports = ApiHelper;
