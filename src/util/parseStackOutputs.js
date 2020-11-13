const cloudFormationOutputNames = ['BucketName', 'DistributionId', 'Domain'];
const outputParserRegex = new RegExp(cloudFormationOutputNames.reduce((regex, outputName) => {
  return regex + `.+${outputName}\\s([^\\s]+)\\s`
}, 'OUTPUTS'));

module.exports = function parseStackOutputs(outputString) {
  return outputString.match(outputParserRegex)[0].replace(outputParserRegex, (_, bucketName, distId, domainName) => {
    return `Put these values into your Github Repository Secrets:
    ----------------------------
    AWS_S3_BUCKET: ${bucketName}
    AWS_CF_DIST_ID: ${distId}
    AWS_CF_DOMAIN: ${domainName}
    ----------------------------
    `
  });
}