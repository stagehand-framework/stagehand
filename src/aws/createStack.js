const createStack = (templatePath, stackName) => {
  return `aws cloudformation deploy --template-file ${templatePath} --stack-name ${stackName} --capabilities CAPABILITY_IAM`;
};

module.exports = {
  createStack,
}