const getBucketRoot = (bucket) => `aws s3 ls s3://${bucket}`;

module.exports = { getBucketRoot };