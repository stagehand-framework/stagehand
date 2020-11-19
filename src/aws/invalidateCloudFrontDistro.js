const deleteCloudFrontDistro = (distribution_id) =>
  `aws cloudfront create-invalidation --distribution-id ${distribution_id} --paths "/*" --output json`;

module.exports = {
  deleteCloudFrontDistro,
};
