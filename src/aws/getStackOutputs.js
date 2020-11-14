const getStackOutputs = (stackName) =>
  `aws cloudformation describe-stacks --stack-name ${stackName} --output json`;

module.exports = {
  getStackOutputs,
}