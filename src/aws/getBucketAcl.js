const getBucketAcl = (bucket) => `aws s3api get-bucket-acl --bucket ${bucket}`;

module.exports = { getBucketAcl }