const getCloudFrontConfig = (distribution_id) =>
  `aws cloudfront get-distribution-config --id ${distribution_id} --output json`;

module.exports = {
  getCloudFrontConfig,
};
