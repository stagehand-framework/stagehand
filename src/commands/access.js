const prompts = require("prompts");
const {
  stagehandErr,
  stagehandHelp,
  stagehandWarn,
  stagehandSuccess,
} = require("../util/logger");
const { helpLogs } = require("../util/consoleMessages");
const { wrapExecCmd } = require("../util/wrapExecCmd");
const { getBucketAcl } = require("../aws/getBucketAcl");
const { putBucketAcl } = require("../aws/putBucketAcl");
const { readDataFile } = require("../util/fs");
const {
  displayListMessage,
  noAppFoundMessage,
} = require("../util/consoleMessages");

const invalidIdMessage = `Please provide a valid id:
          Get stagehand id of user you wish to give access to: "stagehand get-id"
          Use their id in command: "stagehand access --add --stackName <name> --id <id>"`;

const access = async () => {
  const userApps = readDataFile();
  const stackNames = Object.keys(userApps);
  stackNames.splice(stackNames.indexOf("to_delete"), 1);
  const commands = ["add", "remove", "view"];
  if (stackNames.length === 0) {
    stagehandWarn(
      `No stagehand apps have been created or added\n Start with "stagehand help --init"`
    );
  } else {
    const questions = [
      {
        type: "select",
        name: "stackName",
        message: `Please enter the stack name for which access is being applied:`,
        choices: stackNames,
      },
      {
        type: "select",
        name: "access",
        message: `What do you want to do with the stagehand access:`,
        choices: commands,
      },
      {
        type: (command_idx) =>
          commands[command_idx] === "view" ? null : "text",
        name: "person",
        message: "Please enter the AWS canonical id or an AWS username:",
      },
    ];

    const result = await prompts(questions);
    console.log(result);
    const stackName = stackNames[result["stackName"]];
    const command = commands[result["access"]];

    const bucket = userApps[stackName].s3;
    const currUserAccess = await wrapExecCmd(getBucketAcl(bucket));
    const bucketPolicy = JSON.parse(currUserAccess);
    const ids = bucketPolicy.Grants.map((grant) => grant.Grantee.ID);

    if (command === "view") {
      const users = bucketPolicy.Grants.map(
        (grant) => grant.Grantee.DisplayName
      );

      const filteredUsers = users.filter((user, idx) => {
        return users.indexOf(user, idx + 1) === -1;
      });

      displayListMessage(`Users with access to ${stackName}`, filteredUsers);
    } else if (command === "add") {
      if (!id) return stagehandErr(invalidIdMessage);

      if (ids.includes(id)) {
        user = bucketPolicy.Grants.find((grant) => grant.Grantee.ID === id)
          .Grantee.DisplayName;
        return stagehandWarn(`${user} already has access to ${stackName}`);
      }

      stagehandWarn(`Adding access for user ${id} for ${stackName}`);

      wrapExecCmd(putBucketAcl(bucket, [...ids, id]))
        .then((output) => {
          stagehandSuccess("added", `Access for user ${id} for ${stackName}:`);
          const addCmd = `stagehand add --bucket ${bucket}`;
          stagehandSuccess(
            addCmd,
            "Copy this command and pass to user to add stagehand stack locally:"
          );
        })
        .catch((err) => stagehandErr(`Invalid id provided`));
    } else if (command === "remove") {
      if (!id && !user)
        return stagehandErr(`Please provide a valid --id or --userName`);

      const userNames = bucketPolicy.Grants.map(
        (grant) => grant.Grantee.DisplayName
      );

      if ((id && !ids.includes(id)) || !userNames.includes(user)) {
        return stagehandWarn(
          `${id || user} doesn't have access to ${stackName}`
        );
      }

      if (!id)
        id = bucketPolicy.Grants.find(
          (grant) => grant.Grantee.DisplayName === user
        ).Grantee.ID;
      if (!user)
        user = bucketPolicy.Grants.find((grant) => grant.Grantee.ID === id)
          .Grantee.DisplayName;
      const newIds = ids.filter((userId) => userId !== id);

      wrapExecCmd(putBucketAcl(bucket, newIds))
        .then((output) =>
          stagehandSuccess(
            "removed",
            `Access for user ${user} for ${stackName}:`
          )
        )
        .catch((err) => stagehandErr(`Invalid id provided`));
    }
  }
};

module.exports = { access };
