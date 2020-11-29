# stagehand

# Prerequisites

- AWS Account
- AWS CLI figured to your AWS Account
  - For help, see this article: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html
- GitHub Token
  - Log into your GitHub Account
  - Settings => Developer Settings => Personal Access Tokens => Generate new Token => Only provide access to Repositories
- Node
- NPM
- Repository for static front-end application (ie Gatsby, Hugo, NextJS, React)


# Installation

- Run the install command: `npm install -g stagehand-framework`


# Your First Stagehand Application

- Navigate to the root of your local git repository, make sure that it is connected with a GitHub repository
- Run `stagehand init`
- Provide your GitHub Token (this token only needs to be provided the very first use)
- A folder in your home directory `./stagehand` will be created to house your configuration and your application data for Stagehand

## Setting Up your Github Actions

- You will be prompted to provide:
  - The name you wish to use
  - The setup command your app uses (ie npm install, brew install hugo)
  - The build command your app uses  (ie npm run-script build, hugo)
  - The directory that your app builds to (ie public, out, build)
- This will create a `.github/workflow` directory in your repo for GitHub Actions.
  - If you need to alter your GitHub build process look for `create_review_app.yml` and `remove_review_app.yml`

### Setting Up Your Stagehand Dashboard

- Stagehand needs two additional pieces of information to know how to handle routing:
- If you app is a Single Page Application (ie React)
- Or if you app has all of its static routes served from `path/index.html` as opposed to just `path.html`
  - Gatsby uses this routing out of the box
  - You can check your build folder (public, out, build) to see how your application handles routing
- This will create the `.github/stagehand` folder where the html, javascript, and service worker files will live
- We provide a basic dashboard overlay that will be visible from every page of your stagehand application
  - It is an HTML wrapper around your entire application
  - We provide a banner at the top of your page containing some metadata (Creation Time, branch that the PR was opened on, and owner of the repository)
- If you wish to add to this dashboard you can alter the html and javascript that we provide out of the box.

### Adding environment variables

- If you navigate to `.github/workflows/create_review_app` you will come across this code on line 35
```
####### Uncomment below to add env variables to use during build process #######
####### Add \n\ to the end of each secret to start a new line #######
####### EXCEPT DO NOT add to the end of the last secret #######
      # - name: create .env
      #   run: echo -e "\
      #     SECRET1=${{ secrets.YOUR_SECRET1 }}\n\
      #     SECRET2=${{ secrets.YOUR_SECRET2 }}" > .env
```
- If you uncomment the last 4 lines you can add in your own secrets there to provide to a `.env` file at build time.

##### _Some Examples:_

One secret named `API_KEY` and want to use a `.env.development` file:

```
- name: create .env
  run: echo -e "\
    API_KEY=${{ secrets.API_KEY }}" > .env.development
```

An `API_KEY` and a `DB_PASSWORD` secret for a `.env` file:

```
- name: create .env
  run: echo -e "\
    DB_PASSWORD=${{ secrets.DB_PASSWORD }}\n\
    API_KEY=${{ secrets.API_KEY }}" > .env
```

An `API_KEY`, `DB_PASSWORD`, and `API_URL` secrets for a `.env.staging` file

```
- name: create .env
  run: echo -e "\
    DB_PASSWORD=${{ secrets.DB_PASSWORD }}\n\
    API_URL=${{ secrets.API_URL }}\n\
    API_KEY=${{ secrets.API_KEY }}" > .env.staging
```

### Pushing Your `./github` folder to your GitHub Repostory

- The last step is pushing your `./github` folder to your repository
- You are now ready to start using Stagehand


# Workflow

- For every Pull Request you create, Stagehand will build and create a staging environment for you
- Stagehand will also build additional staging environments for every commit or change you make to the existing Pull Request
- You can compare multiple versions of your application to each other
- When the Pull request is closed or merged Stagehand will destroy all the staging environments that existed from that Pull Request


# Stagehand Commands


### `stagehand list`

- This will show all the Stagehand applications that you currently are involved with
- Once you select a Stagehand application you will be shown a list of current staging environments that exist
- Open them up by selecting and pressing enter.

### `stagehand access`

- Use this command to `VIEW`, `ADD`, or `REMOVE` access to one of your applications
- To `ADD` access you must have the user's AWS Account Email
- The `ADD` command will return the name of the storage location of the staging environments

### `stagehand add`

- First you provide a user access to your Stagehand application using `stagehand access` => `ADD`
- The user you provided access to must input the name of the storage location provided from the previous command
- This will give you access to the application when you run `stagehand list`

### `stagehand destroy`

- First you select which Stagehand application you wish to remove
- If you are the owner of the Stagehand application:
  - This command will remove:
    - Stagehand related files and folders from your repository
    - AWS infrastructure
    - Application data from the local datastore
    - AWS Secrets from your GitHub repository
- If you are not the owner of the application (it was added using `stagehand add`):
  - This command will just remove application data from the local datastore
