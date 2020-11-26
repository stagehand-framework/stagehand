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
const userApps = readDataFile();
const commands = ["ADD", "REMOVE", "VIEW"];

const chooseAccessCommands = async (stackNames) => {
  const questions = [
    {
      type: "select",
      name: "stackName",
      message: `Select a stagehand app to apply access controls`,
      choices: stackNames,
    },
    {
      type: "select",
      name: "access",
      message: `Select access control`,
      choices: commands.concat('GO BACK TO APP LIST'),
    },
  ];

  const result = await prompts(questions);
  const stackName = stackNames[result["stackName"]];
  const command = commands[result["access"]];

  console.log(command);
  if (Object.keys(result).length < 2) return;
  
  return (!command)
    ? await chooseAccessCommands(stackNames) 
    : { stackName, command };
};

const access = async () => {
  try {
    const stackNames = Object.keys(userApps);

    if (stackNames.length === 0) {
      stagehandWarn(
        `No stagehand apps have been created or added\n Start with "stagehand help --init"`
      );
    } else {
      const { stackName, command } = await chooseAccessCommands(stackNames);

      const bucket = userApps[stackName].s3;
      const currUserAccess = await wrapExecCmd(getBucketAcl(bucket));
      const bucketPolicy = JSON.parse(currUserAccess);
      
      const users = bucketPolicy.Grants.map((grant) => grant.Grantee.DisplayName);
      const ids = bucketPolicy.Grants.map((grant) => grant.Grantee.ID);
      const owner = bucketPolicy.Owner.DisplayName;
      const usersWithOwner = users.map(user => user === owner ? `${user} [OWNER]` : user);

      if (command === "VIEW") {
        displayListMessage(`Users with access to ${stackName}`, usersWithOwner);
      
      } else if (command === "ADD") {
        const question = {
          type: 'text',
          name: "email",
          message: "Enter the email associated to the users AWS account:",
          validate: email => !email.match(/[^@]+@[^\.]+\.[^@\.]+/) ? 'Please provide a valid email address' : true,
        }

        const result = await prompts(question);
        const email = result["email"];
        const user = email.split('@')[0];

        if (users.includes(user)) {
          return stagehandWarn(`${user} already has access to ${stackName}`);
        }

        stagehandWarn(`Adding access for ${user} for ${stackName}`);

        await wrapExecCmd(putBucketAcl(bucket, ids, email));
        
        stagehandSuccess("added", `Access for ${user} for ${stackName}:`);
        stagehandSuccess(bucket, `Share this bucket identifier with ${user} to pass to "stagehand add":`);
      
      } else if (command === "REMOVE") {
        const selectList = {
          type: 'select',
          name: 'user',
          message: 'Select the user to remove access:',
          choices: usersWithOwner,
        };

        const result = await prompts(selectList);
        const user = users[result.user].split(' ')[0];
        if (user === owner) return stagehandWarn('Cannot remove access from owner');
        
        const id = bucketPolicy.Grants.find(
            (grant) => grant.Grantee.DisplayName === user
          ).Grantee.ID;

        const newIds = ids.filter((userId) => userId !== id);

        await wrapExecCmd(putBucketAcl(bucket, newIds))
        
        stagehandSuccess("removed", `Access for user ${user} for ${stackName}:`);
      }
    }
  } catch {
    stagehandErr('Could not apply access controls');
  }
};

module.exports = { access };
