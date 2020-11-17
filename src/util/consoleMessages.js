// ******** init Command ********
const stackOutputMessage = (outputs) => {
  return `Put these values into your Github Repository Secrets:
    ----------------------------
    AWS_S3_BUCKET: ${outputs['BucketName']}
    AWS_ACCESS_KEY_ID: ${outputs['AccessKeyId']}
    AWS_SECRET_ACCESS_KEY: ${outputs['AccessKeySecret']}
    AWS_REGION: ${outputs['Region']}
    AWS_CF_DIST_ID: ${outputs['DistributionId']}
    AWS_CF_DOMAIN: ${outputs['Domain']}
    ----------------------------
  `;
};

// ******** list Command ********
const listMessage = (title, list) => {
  const listStr = list.map((entry) => `--- ${entry}`).join("\n\t");

  return`
    ${title}
\t---------------------------
\t${listStr}
\t---------------------------
  `;
}

const noAppFoundMessage = (appName) => `\nNo stagehand with name ${appName} found\n`;

module.exports = {
  stackOutputMessage,
  listMessage,
  noAppFoundMessage,

}