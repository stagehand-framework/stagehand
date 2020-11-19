const { stagehandErr, stagehandHelp, stagehandWarn, stagehandSuccess } = require("../util/logger");
const { helpLogs } = require("../util/consoleMessages");
const { wrapExecCmd } = require("../util/wrapExecCmd");
const { getBucketAcl } = require("../aws/getBucketAcl");
const { putBucketAcl } = require("../aws/putBucketAcl");
const { readDataFile } = require("../util/fs");
const { displayListMessage, noAppFoundMessage } = require('../util/consoleMessages');

const invalidIdMessage = `Please provide a valid id:
          Get stagehand id of user you wish to give access to: "stagehand get-id"
          Use their id in command: "stagehand access --add --stackName <name> --id <id>"`;

const access = (args) => {
  const accessCommands = Object.keys(args);
  let id = args.id;

  try {
    const userApps = readDataFile();
    const stackName = args.stackName;
    
    if (!stackName) return stagehandErr(`Please provide a --stackName flag`);
    if (!userApps[stackName]) return stagehandErr(`Cannot find stack ${stackName}`);

    const bucket = userApps[stackName].s3;

    // Grab current users access
    wrapExecCmd(getBucketAcl(bucket)).then(bucketPolicyJSON => {
      const bucketPolicy = JSON.parse(bucketPolicyJSON);
      const ids = bucketPolicy.Grants.map(grant => grant.Grantee.ID);
      let user = args.userName;

      // Add user access
      if (accessCommands.includes('add')) {

        if (!id) return stagehandErr(invalidIdMessage);
        
        if (ids.includes(id)) {
          user = bucketPolicy.Grants.find(grant => grant.Grantee.ID === id).Grantee.DisplayName;
          return stagehandWarn(`${user} already has access to ${stackName}`);
        }

        stagehandWarn(`Adding access for user ${id} for ${stackName}`);

        wrapExecCmd(putBucketAcl(bucket, [...ids, id]))
          .then(output => stagehandSuccess('added', `Access for user ${id} for ${stackName}:`))
          .catch(err => stagehandErr(`Invalid id provided`));
      // Display users with access
      } else if (accessCommands.includes('view')) {

        const users = bucketPolicy.Grants.map(grant => grant.Grantee.DisplayName);
        
        const filteredUsers = users.filter((user, idx) => {
          return users.indexOf(user, idx+1) === -1;
        });

        displayListMessage(`Users with access to ${stackName}`, filteredUsers);
    
      // Remove user access
      } else if (accessCommands.includes('remove')) {
        if (!id && !user) return stagehandErr(`Please provide a valid --id or --userName`);

        const userNames = bucketPolicy.Grants.map(grant => grant.Grantee.DisplayName);

        if ((id && !ids.includes(id)) || !userNames.includes(user)) {
          return stagehandWarn(`${id || user} doesn't have access to ${stackName}`);
        }

        if (!id) id = bucketPolicy.Grants.find(grant => grant.Grantee.DisplayName === user).Grantee.ID;
        if (!user) user = bucketPolicy.Grants.find(grant => grant.Grantee.ID === id).Grantee.DisplayName;
        const newIds = ids.filter(userId => userId !== id);

        wrapExecCmd(putBucketAcl(bucket, newIds))
          .then(output => stagehandSuccess('removed', `Access for user ${user} for ${stackName}:`))
          .catch(err => stagehandErr(`Invalid id provided`));

      // Missing command flag
      } else {
        stagehandErr(`Please provide one of "add, view, remove" flags: "stagehand access --view --stackName <name>`);
      }
    }).catch(err => stagehandErr(err));
  } catch (err) {
    stagehandErr(`Could not execute access command:\n${err}`);
  }
}

module.exports = { access }