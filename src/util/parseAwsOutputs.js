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

// const parseBranchesOutput = (output) => {
//   return output.split('PRE').map(branch => branch.trim()).slice(1);
// }

const parseReviewAppPaths = (output, domain) => {
  const parseAppsRegex = /(s3:\/\/[^\/]+)(\/[^\/]+)(\/[^\/]+)/g;
  
  return output.match(parseAppsRegex).map(path => {
    return path.replace(parseAppsRegex, (_, origin, branch, commit) => {
      return `https://${domain}${branch}${commit}`;
    })
  });
};

module.exports = {
  parseStackOutputJSON,
  parseReviewAppPaths,
};
