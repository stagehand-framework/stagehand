const { stagehandLog, stagehandSuccess } = require("./logger");

// ******** help Command ********
const builds = ["next", "hugo", "gatsby", "react"];
const commands = ["help", "init", "list", "destroy", "access", "add", "getId"];

const initHelp = `
usage: stagehand init --build buildOption [--stackName name]

Make sure you have configured the AWS CLI first.
Must be called from the root of your git repository.
If no name is provided a random one will be generated.

Available build options: ${builds.join(", ")}
Check here for config details for builds: <TODO: insert README website>

Examples: stagehand init --build gatsby --stackName myName
          stagehand init --build react
`;

const listHelp = `
usage: stagehand list [--stackName myName]

List with no name will return a list of all your stacks.
List with a name will return all available review apps for specific stack.

Examples: stagehand list
          stagehand list --stackName myName 
`;

const destroyHelp = `
usage: stagehand destroy --stackName myName

This will tear down the AWS infrastructure associated with the app.
It will also remove associated github action files in your repo.
Make sure to push changes to your repo so the actions won't be triggered on GitHub.

Example: stagehand destroy --stackName myName 
`;

const accessHelp = `
usage: stagehand access --[add|view|remove|] --stackName <name> --id <id>

This will add to, remove from, or view the access control of a stagehand app.

For adding:
- First the user you want to add has to provide their AWS canonical id (see stagehand help --getId).
- Then when you run the following command with their id, they will have access to the app's S3 bucket.
- This will allow the user to add this app to their own set of apps (see stagehand help --add).
For removing:
- The same rules apply as adding. You can use the canonical id to remove a user.
- However you can also remove based on a username (usually up to the @ in the user's email).
For viewing:
- This will output all users who have access to a specified stagehand app.
- Note the usernames are provided (hence making it easier to determine who to remove).

Example: stagehand access --add --stackName stackName --id 1234567890
Example: stagehand access --remove --stackName stackName --id 1234567890
Example: stagehand access --remove --stackName stackName --userName john.smith
Example: stagehand access --view --stackName stackName
`;

const addHelp = `
usage: stagehand add --bucket <bucket>

This will add an existing stagehand app to your data file.
A S3 bucket name will need to be provided by the owner of the stagehand app.
Note that the owner will need to be give you permission to access this app (see stagehand help --access).
For them to do this, you should provide them your AWS canonical id (see stagehand help --getId).
Once this is done, you should be able to run commands with that stagehand app. 

Example: stagehand add --bucket bucketName
`;

const getIdHelp = `
usage: stagehand getId

This will return your AWS canonical id which serves as your unique identifier.
A valid AWS account will auto create this.
This id can be provided to another user of stagehand so they can add you to their application (see stagehand help --access).

Example: stagehand getId
`;

const noCommandHelp = `
usage: stagehand <command> [parameters, ...]

To see help text, you can run:
  stagehand help --<command>
  available commands: ${commands.join(", ")}

Example: stagehand help --init
`;

const helpLogs = {
  destroy: destroyHelp,
  list: listHelp,
  init: initHelp,
  help: noCommandHelp,
  access: accessHelp,
  add: addHelp,
  getId: getIdHelp,
};

const lambdaDeleteErrorMessage = (lambda) => {
  return `
The lambda ${lambda} failed to delete. 
Please ensure the related stack has finished deleting first.
Once this is done, please wait 30 minutes for the replicated function to fully be removed from cloudfront.
Then run stagehand cleanup again.`;
};

// ******** init Command ********
const stackOutputMessage = (outputs) => {
  return `Put these values into your Github Repository Secrets:
    ----------------------------
    AWS_S3_BUCKET: ${outputs["BucketName"]}
    AWS_ACCESS_KEY_ID: ${outputs["AccessKeyId"]}
    AWS_SECRET_ACCESS_KEY: ${outputs["AccessKeySecret"]}
    AWS_REGION: ${outputs["Region"]}
    AWS_CF_DIST_ID: ${outputs["DistributionId"]}
    AWS_CF_DOMAIN: ${outputs["Domain"]}
    ----------------------------
  `;
};

// ******** list Command ********
const displayListMessage = (title, list) => {
  let currentMatch;
  let previousMatch;
  const isDomainsList = list[0].match(/cloudfront\.net/);
  stagehandLog(`\n\t${title}\n\t---------------------------`);

  list.forEach((entry, idx) => {
    if (isDomainsList) {
      currentMatch = entry.match(/\.net\/[^\/]+/)[0];
      if (currentMatch !== previousMatch && idx !== 0) console.log("");
      stagehandSuccess(`${entry}`, "\t---");
      previousMatch = currentMatch;
    } else if (entry !== "to_delete") {
      stagehandSuccess(`${entry}`, "\t---");
    }
  });

  stagehandLog("\t---------------------------\n");
};

const noAppFoundMessage = (appName) =>
  ` No stagehand with name ${appName} found`;

module.exports = {
  stackOutputMessage,
  displayListMessage,
  noAppFoundMessage,
  lambdaDeleteErrorMessage,
  helpLogs,
};
