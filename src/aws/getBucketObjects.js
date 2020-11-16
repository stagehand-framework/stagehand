const getS3Branches = (stackName) => `aws s3 ls s3://${stackName}`;
const getAppsForBranch = (stackName, branch) => `aws s3 ls s3://${stackName}/${branch}`;

module.exports = {
  getS3Branches,
  getAppsForBranch
}