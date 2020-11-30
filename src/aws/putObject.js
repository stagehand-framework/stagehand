const putObject = (bucket, localPath, destPath) =>
  `aws s3api put-object --bucket ${bucket} --body ${localPath} --key ${destPath}`;

module.exports = { putObject };
