# Build and Commit Scripts

This project includes automated build and commit scripts to streamline the deployment workflow.

## Scripts Available

### 1. Interactive Build & Commit (`build-and-commit.sh`)

Runs the build, commits changes, and asks if you want to push.

**Usage:**
```bash
# With default commit message
./build-and-commit.sh

# With custom commit message
./build-and-commit.sh "Your custom commit message"
```

**Or via npm:**
```bash
npm run build:commit
npm run build:commit "Your custom commit message"
```

### 2. Automated Build & Commit (`build-and-commit-auto.sh`)

Non-interactive version - commits without asking for push confirmation.

**Usage:**
```bash
# Commit only (no push)
./build-and-commit-auto.sh

# Commit and push
./build-and-commit-auto.sh "Your message" push

# Or via npm:
npm run build:commit:auto
```

## What It Does

1. ✅ Runs `npm run build` (builds Next.js and copies output to root)
2. ✅ Checks for changes in git
3. ✅ Stages all changes (`git add -A`)
4. ✅ Commits with a message
5. ✅ Optionally pushes to remote

## Examples

```bash
# Interactive (will ask about push)
./build-and-commit.sh "Update homepage design"

# Auto commit without push
./build-and-commit-auto.sh "Update homepage design"

# Auto commit and push
./build-and-commit-auto.sh "Update homepage design" push
```

## Notes

- If build fails, the script exits and no commit is made
- If there are no changes, the script exits gracefully
- The scripts are safe to run multiple times

