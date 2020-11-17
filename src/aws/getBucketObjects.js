// const getS3Branches = (stackName) => `aws s3 ls s3://${stackName}`;
// const getAppsForBranch = (stackName, branch) => `aws s3 ls s3://${stackName}/${branch}`;

const getAppPathsForS3Bucket =  (bucketName) => {
  // DO NOT remove --dryrun from command
  return `aws s3 rm s3://${bucketName} --dryrun --recursive --exclude '*' --include '*index.html'`
};

module.exports = {
  getAppPathsForS3Bucket,
}