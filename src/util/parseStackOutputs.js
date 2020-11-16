const cloudFormationOutputNames = ['BucketName', 'DistributionId', 'Domain'];
// const outputParserRegex = new RegExp(cloudFormationOutputNames.reduce((regex, outputName) => {
//   return regex + `.+${outputName}\\s([^\\s]+)\\s`
// }, 'OUTPUTS'));

const parseStackOutputJSON = (stackOutputJSON) => {
  const stackOutput = JSON.parse(stackOutputJSON);

  return stackOutput.Stacks[0].Outputs.reduce((outputs, output) => {
    return { ...outputs, [output.OutputKey]: output.OutputValue };
  }, {});
};

const createStackOutputMessage = (outputs) => {
  return `Put these values into your Github Repository Secrets:
    ----------------------------
    AWS_S3_BUCKET: ${outputs['BucketName']}
    AWS_ACCESS_KEY_ID: ${outputs['AccessKeyId']}
    AWS_SECRET_ACCESS_KEY: ${outputs['AccessKeySecret']}
    AWS_REGION: ${outputs['Region']}
    AWS_CF_DIST_ID: ${outputs['DistributionId']}
    AWS_CF_DOMAIN: ${outputs['Domain']}
    ----------------------------
  `;
};

module.exports = {
  createStackOutputMessage,
  parseStackOutputJSON,
};
