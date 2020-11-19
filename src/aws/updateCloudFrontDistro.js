const deleteCloudFrontDistro = (distribution_id, e_tag_id) =>
  `aws cloudfront update-distribution --id ${distribution_id} --output json --if-match ${e_tag_id} --distribution-config file:///tmp/disable-distribution-${distribution_id}`;

module.exports = {
  deleteCloudFrontDistro,
};
