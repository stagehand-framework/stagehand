const deleteStack = (stackName) => {
  return `aws cloudformation delete-stack --stack-name ${stackName}`;
};

module.exports = { deleteStack };
