const putBucketAcl = (bucket, ids, email) => {
  const idsStr = ids.map(id => `id=${id}`).join(',');
  let newAccessStr;

  if (email) newAccessStr = idsStr.concat(`,emailaddress=${email}`);

  return `aws s3api put-bucket-acl --bucket ${bucket} --grant-full-control ${newAccessStr || idsStr}`;
}

module.exports = {
  putBucketAcl,
}