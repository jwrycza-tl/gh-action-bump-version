## gh-action-bump-version

GitHub Action for automated npm build version bump.

This action based on 'phips28/gh-action-bump-version' with small changes.

This Action bumps the build version in package.json and push it back to the repo.
It is meant to be used on every successful merge to master but
you'll need to configured that workflow yourself. You can look to the
[`.github/workflows/push.yml`](./.github/workflows/push.yml) file in this project as an example.

**Attention**

Make sure you use the `actions/checkout@v2` action!

### Workflow

* Push the bumped npm version in package.json back into the repo.

### Usage:

**PACKAGEJSON_DIR:** Param to parse the location of the desired package.json (optional). Example:
```yaml
- name:  'Automated Version Bump'
  uses:  ''
  env:
    PACKAGEJSON_DIR:  'frontend'
```
