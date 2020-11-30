const { stagehandLog, stagehandSuccess } = require("./logger");

// ******** help Command ********
const builds = ["next", "hugo", "gatsby", "react"];
const commands = ["help", "init", "list", "destroy", "access", "add"];

const initHelp = `
Run this command from the root of your repostory that is linked to a GitHub repository.
Follow the prompts to create a new Stagehand application.
Provide your GitHub Token (this token only needs to be provided the very first use).
A folder in your home directory /.stagehand will be created to house your configuration and your application data for Stagehand.
Then you will be prompted to provide:
- The name you wish to use.
- The setup command your app uses (ie npm install, brew install hugo).
- The build command your app uses (ie npm run-script build, hugo).
- The directory that your app builds to (ie public, out, build).
This will create a .github/workflow directory in your repo for GitHub Actions.
If you need to alter your GitHub build process look for create_review_app.yml and remove_review_app.yml.
The last step is pushing your ./github folder to your repository.
You are now ready to start using Stagehand.
`;

const listHelp = `
This will show all the Stagehand applications that you currently are involved with.
Once you select a Stagehand application you will be shown a list of current staging environments that exist.
Open them up by selecting and pressing enter.
`;

const destroyHelp = `
First you select which Stagehand application you wish to remove
If you are the owner of the Stagehand application:
This command will remove:
- Stagehand related files and folders from your repository
- AWS infrastructure
- Application data from the local datastore
- AWS Secrets from your GitHub repository
If you are not the owner of the application (it was added using stagehand add):
- This command will just remove application data from the local datastore
`;

const accessHelp = `
Use this command to VIEW, ADD, or REMOVE access to one of your applications
ADD access lets other developers working on the same repository have access to the active staging environments
To ADD access you must have the user's AWS Account Email
The ADD command will return the name of the storage location of the staging environments
`;

const addHelp = `
First you provide a user access to your Stagehand application using stagehand access => ADD
The user you provided access to must input the name of the storage location provided from the previous command
This will give you access to the application when you run stagehand list
`;

const noCommandHelp = `
To see general help, you can run:
  stagehand -h
  stagehand --help
To see help for an individual command, you can run:
  stagehand help
`;

const helpLogs = {
  destroy: destroyHelp,
  list: listHelp,
  init: initHelp,
  help: noCommandHelp,
  access: accessHelp,
  add: addHelp,
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

const welcomeToStagehand = () => {
  return `
      _                   _                     _ 
     | |                 | |                   | |
  ___| |_ __ _  __ _  ___| |__   __ _ _ __   __| |
 / __| __/ _\` |/ _\` |/ _ \\ '_ \\ / _\` | '_ \\ / _\` |
 \\__ \\ || (_| | (_| |  __/ | | | (_| | | | | (_| |
 |___/\\__\\__,_|\\__, |\\___|_| |_|\\__,_|_| |_|\\__,_|
                __/ |                             
               |___/                             


Get started by pushing the "/.github" folder to your Github Repository
To build out a custom dashboard check out the "/.github/stagehand.html" file

Your stagehand environment build process is located at "/.github/workflows/create_review_app".
This file will get triggered on a Pull Request, and on any additional commits to the branch.

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
  commands,
  welcomeToStagehand,
};
