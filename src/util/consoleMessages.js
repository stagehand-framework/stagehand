// ******** help Command ********
const builds = ["next", "hugo", "gatsby", "react"];
const commands = ["help", "init", "list", "destroy"];

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
const listMessage = (title, list) => {
  const listStr = list.map((entry) => `--- ${entry}`).join("\n\t");

  return `
    ${title}
\t---------------------------
\t${listStr}
\t---------------------------
  `;
};

const noAppFoundMessage = (appName) =>
  `\nNo stagehand with name ${appName} found\n`;

module.exports = {
  stackOutputMessage,
  listMessage,
  noAppFoundMessage,
  helpLogs,
};
