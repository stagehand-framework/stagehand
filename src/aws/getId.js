const getCanonicalId = `aws s3api list-buckets --query Owner.ID --output text`;

module.exports = { getCanonicalId };