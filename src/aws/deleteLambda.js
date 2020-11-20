const deleteLambda = (lambda) => {
  return `aws lambda delete-function --function-name ${lambda}`;
};

module.exports = {
  deleteLambda,
};
