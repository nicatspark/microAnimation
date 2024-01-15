# Workflow

```bash
 pnpm changeset - create a new changeset
```

## Release sequence

```bash
pnpm run build - builds the package
pnpm changeset version - bumps the version in the changeset/package json
pnpm changeset publish - publishes the package to npm
git push --follow-tags origin main
```

## Update permissions

```bash
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```
