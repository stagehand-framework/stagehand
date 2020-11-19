const putBucketAcl = (bucket, ids) => {
  const idsStr = ids.map(id => `id=${id}`).join(',');
  
  return `aws s3api put-bucket-acl --bucket ${bucket} --grant-full-control ${idsStr}`;
}

module.exports = {
  putBucketAcl,
}