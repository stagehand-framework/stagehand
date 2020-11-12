# stagehand

## Getting Started

### Prerequisites

- AWS Account
  - You will need to have your `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`. For help, see this article: https://aws.amazon.com/blogs/security/wheres-my-secret-access-key/
- AWS CLI
  - For help, see this article: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html
- Node
- NPM
- Repo for an application for one of our supported static site generators: Gatsby, Next, or Hugo

### Installation

- Run the install command: `npm install -g stagehand-framework`

### SSG Configuration

- Gatsby
- Next
- Hugo

### Setting Up Your Local Git Repository

- Navigate to the root of your repo.
- Run the `init` command with the flag for your chosen SSG:
  - `stagehand init --gatsby`
  - `stagehand init --next`
  - `stagehand init --hugo`
- This will create a `.github/workflow` directory in your repo for GitHub Actions.
- This will also run the AWS CloudFormation template for your chosen SSG, provisioning the appropriate AWS resources for your review app.
- When this process finishes, you will need to note the following outputs for the next step:
  - `AWS_S3_BUCKET`
  - `AWS_CF_DOMAIN`
  - `AWS_REGION`
  - `DISTRIBUTION_ID`

### Setting Up Your GitHub Secrets

- You will need to configure your secrets in your GitHub repo's settings.
- For help, see this article: https://docs.github.com/en/free-pro-team@latest/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository
- Navigate to your GitHub repo and click on the 'Settings' tab.
- Then you can click the 'Secrets' tab in order to configure your GitHub secrets.
- You will need to create six secrets with the information you retrieved from the previous steps:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_S3_BUCKET`
  - `AWS_CF_DOMAIN`
  - `AWS_REGION`
  - `DISTRIBUTION_ID`
- You are now ready to begin using Stagehand.

## Using Stagehand
