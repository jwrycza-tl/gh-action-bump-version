const { Toolkit } = require('actions-toolkit')
const { execSync } = require('child_process')

// Run your GitHub Action!
Toolkit.run(async tools => {

  const pkg = tools.getPackageJSON()
  const commitMessage = 'version bump to'
  let version = 'patch'
  tools.outputs.update = 'true'

  try {
    const current = pkg.version.toString()
    // set git user
    await tools.exec('git', ['config', 'user.name', `"${process.env.GITHUB_USER || 'Automated Version Bump'}"`])
    await tools.exec('git', ['config', 'user.email', `"${process.env.GITHUB_EMAIL || 'gh-action-bump-version@users.noreply.github.com'}"`])

    const currentBranch = /refs\/[a-zA-Z]+\/(.*)/.exec(process.env.GITHUB_REF)[1]
    tools.log.info('currentBranch:', currentBranch)

    // do it in the current checked out github branch (DETACHED HEAD)
    // important for further usage of the package.json version
    await tools.exec('npm',
      ['version', '--allow-same-version=true', '--git-tag-version=false', current])
    tools.log.info('current:', current, '/', 'version:', version)
    let newVersion = execSync(`npm version --git-tag-version=false ${version}`).toString().trim()
    await tools.exec('git', ['commit', '-a', '-m', `ci: ${commitMessage} ${newVersion}`])

    // now go to the actual branch to perform the same versioning
    await tools.exec('git', ['checkout', currentBranch])
    await tools.exec('npm',
      ['version', '--allow-same-version=true', '--git-tag-version=false', current])
    tools.log.info('current:', current, '/', 'version:', version)
    newVersion = execSync(`npm version --git-tag-version=false ${version}`).toString().trim()
    newVersion = `${process.env['INPUT_TAG-PREFIX']}${newVersion}`
    tools.log.info('new version:', newVersion)
    try {
      // to support "actions/checkout@v1"
      await tools.exec('git', ['commit', '-a', '-m', `ci: ${commitMessage} ${newVersion}`])
    } catch (e) {
      tools.log.warning('git commit failed because you are using "actions/checkout@v2"; ' +
        'but that doesnt matter because you dont need that git commit, thats only for "actions/checkout@v1"')
    }

    const remoteRepo = `https://${process.env.GITHUB_ACTOR}:${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`
    await tools.exec('git', ['push', remoteRepo, '--follow-tags'])
    await tools.exec('git', ['push', remoteRepo, '--tags'])
  } catch (e) {
    tools.log.fatal(e)
    tools.exit.failure('Failed to bump version')
  }
  tools.exit.success('Version bumped!')
})
