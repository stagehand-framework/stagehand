const addDomainFileToS3 = (path, bucket) => `aws s3 mv ${path} s3://${bucket}/`;

module.exports = { addDomainFileToS3 };