const emptyBucket = (bucketName) => {
  return `aws s3 rm s3://${bucketName} --recursive`;
};

module.exports = { emptyBucket };
