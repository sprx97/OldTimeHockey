# Setting up the front-end development environment

These instructions are specifically for people who want to work on the frontend -- the html and css of the site. PM SPRX97 on Discord before you start, but changes to this should be relatively easy to make and low risk. This should work on linux or windows environments that have some version of node running.

Without any changes, this will query production data, which may be useful for you if you're trying to troubleshoot a bug with production data.

## Part 1: Fork git repository

- FORK my git repo from the github website.
- Clone your new fork using "git clone"

## Part 2: Get packages needed to run site

All of these commands need to be run within the `react` directory.

- Run `npm install` to grab all needed javascript packages.
- Run `npm start` to run the local server.
- Browse to http://localhost:3000 to see a local version of your website, if it doesn't open automatically in a browser window.

## Part 3: Make your changes

- Try to follow standards the best you can. Prettier and ESLint are your friends!
- [Semantic UI](https://react.semantic-ui.com/) is used, so if you're trying to add an element to the website, see if the UI library has what you're looking for.
- Tests are even better friends. The test suite is small but growing. You can run `npm test` in order to make sure you haven't broken anything.

## Part 4: Commit

- Make a minor change and commit/push to your fork of the project
- On github, create a new pull request fore your change
- Contact SPRX to review/merge the pull request
