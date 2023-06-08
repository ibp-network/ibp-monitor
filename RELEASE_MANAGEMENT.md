# Release Management

## Goals

We need to release our tools and libraries in a way that is easy to use and contribute.
- github.com for issues and pull requests
- git for version control
- Git branching model
- Git Release management\[?]

## Branch vs Release

### Git Branching Model

Branches:

- master
  - production ready, latest stable release
  - default branch for `git clone`
  - merge from hotfix or release branches
  - no PRs?
- hotfix branches
  - r0.1.0\[-hotfix1]
  - bug fixes to master
  - merge from master
- release branches 
  - r0.1.0\[-rc1] - release candidate
  - r0.2.0 - release branch
  - allows for bug fixes to be applied to a release
  - merge from develop
- develop (could be called `next`)
  - latest development changes
  - merge from hotfix (forward-porting)
  - merge from feature branches
  - clone this branch for small changes and bug fixes
- feature branches
  - new features in development **that contain breaking changes**
  - merge bugs from develop (from time to time, prior to merge to develop)

### Git Release

Do we need this? We are not proposing to distribute binaries, so we don't need to tag releases.
We should ship `bootless` binaries (with versions to match upstream)

# Resources

- https://nvie.com/posts/a-successful-git-branching-model/
- https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository?tool=webui
- https://github.com/mobify/branching-strategy/blob/master/release-deployment.md
