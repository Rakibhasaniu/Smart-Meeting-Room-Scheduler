# CI/CD Pipeline Documentation

## 📋 Overview

This project uses GitHub Actions for automated testing, building, and Docker image publishing. The pipeline ensures code quality by running all tests before building and pushing Docker images.

## 🔄 Pipeline Workflow

```
┌─────────────────────────────────────────────────────────┐
│              Push to main / Pull Request                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Job 1: Test (Required ✅)                              │
│  ├─ Checkout code                                        │
│  ├─ Setup Node.js 18                                     │
│  ├─ Start MongoDB service container                      │
│  ├─ Install dependencies (npm ci)                        │
│  ├─ Run ESLint (linting)                                 │
│  ├─ Run Jest tests (45 integration tests)               │
│  ├─ Upload coverage report to Codecov                    │
│  └─ Archive test results                                 │
└────────────────────┬────────────────────────────────────┘
                     │ ✅ Tests MUST pass
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Job 2: Build Docker Image (Only on main push)          │
│  ├─ Checkout code                                        │
│  ├─ Setup Docker Buildx                                  │
│  ├─ Login to Docker Hub                                  │
│  ├─ Extract metadata (tags, labels)                      │
│  ├─ Build multi-stage Docker image                       │
│  ├─ Push to Docker Hub with tags:                       │
│  │   • latest                                            │
│  │   • main-{commit-sha}                                 │
│  └─ Cache layers for faster builds                       │
└────────────────────┬────────────────────────────────────┘
                     │ ✅ Build MUST succeed
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Job 3: Docker Compose Test                             │
│  ├─ Checkout code                                        │
│  ├─ Create .env file                                     │
│  ├─ Start services with docker-compose                   │
│  ├─ Wait for MongoDB to be ready                        │
│  ├─ Wait for app to start                               │
│  ├─ Test API health endpoint                            │
│  ├─ View logs                                            │
│  └─ Cleanup containers                                   │
└────────────────────┬────────────────────────────────────┘
                     │ ✅ All checks passed
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Job 4: Notify Status                                   │
│  └─ Report overall pipeline status                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Pipeline Features

### ✅ Automated Testing
- Runs on **every push** and **pull request**
- Uses MongoDB service container (version 6.0)
- Executes all 45 integration tests
- Runs ESLint for code quality
- Generates code coverage report
- **Blocks Docker build if tests fail**

### 🐳 Docker Image Building
- Only runs on **push to main branch**
- Only runs if **all tests pass**
- Multi-stage build for optimized images
- Pushes to Docker Hub with multiple tags
- Layer caching for faster builds
- Supports linux/amd64 platform

### 🧪 Docker Compose Testing
- Verifies docker-compose.yml works correctly
- Tests full stack (app + MongoDB)
- Validates API health endpoint
- Runs after successful Docker build

### 📊 Status Notification
- Reports overall pipeline status
- Shows which jobs passed/failed
- Easy to see at a glance

---

## 🔐 Required GitHub Secrets

You need to configure these secrets in your GitHub repository:

### Go to: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `DOCKER_HUB_USERNAME` | Your Docker Hub username | Your Docker Hub account name |
| `DOCKER_HUB_ACCESS_TOKEN` | Docker Hub access token | Create at [Docker Hub → Account Settings → Security](https://hub.docker.com/settings/security) |

### How to Create Docker Hub Access Token:

1. Go to [Docker Hub](https://hub.docker.com/)
2. Sign up or login
3. Click your username → **Account Settings**
4. Go to **Security** tab
5. Click **New Access Token**
6. Give it a name: `github-actions-ci-cd`
7. Select permissions: **Read & Write**
8. Click **Generate**
9. **Copy the token** (you won't see it again!)
10. Add it to GitHub Secrets as `DOCKER_HUB_ACCESS_TOKEN`

---

## 📦 Docker Image Tags

After successful build, your images are tagged as:

```bash
# Latest version (main branch)
your-dockerhub-username/meeting-room-scheduler:latest

# Branch-specific
your-dockerhub-username/meeting-room-scheduler:main

# Commit-specific (for rollback)
your-dockerhub-username/meeting-room-scheduler:main-abc1234
```

---

## 🚀 How to Use

### 1. First Time Setup

**Step 1: Create Docker Hub Account**
```bash
# Go to https://hub.docker.com/
# Sign up for a free account
```

**Step 2: Create Access Token**
```bash
# Docker Hub → Account Settings → Security → New Access Token
# Name: github-actions-ci-cd
# Permissions: Read & Write
# Copy the generated token
```

**Step 3: Add GitHub Secrets**
```bash
# Go to your GitHub repo
# Settings → Secrets and variables → Actions
# Add:
#   - DOCKER_HUB_USERNAME (your Docker Hub username)
#   - DOCKER_HUB_ACCESS_TOKEN (the token you just created)
```

**Step 4: Push to GitHub**
```bash
git add .github/
git commit -m "ci: Add CI/CD pipeline with testing and Docker build"
git push origin main
```

### 2. Monitoring Pipeline

**View Pipeline Status:**
1. Go to your GitHub repository
2. Click **Actions** tab
3. See running/completed workflows

**Check Test Results:**
- Green ✅ = All tests passed
- Red ❌ = Tests failed (build blocked)

**View Coverage:**
- Click on workflow run
- Download "test-results" artifact
- Open `coverage/index.html` in browser

### 3. Pull Docker Image

After successful pipeline:

```bash
# Pull latest version
docker pull your-dockerhub-username/meeting-room-scheduler:latest

# Run the container
docker run -d \
  -p 5005:5005 \
  -e DATABASE_URL="mongodb://your-mongo-url" \
  -e JWT_ACCESS_SECRET="your-secret" \
  -e JWT_REFRESH_SECRET="your-refresh-secret" \
  your-dockerhub-username/meeting-room-scheduler:latest
```

---

## 🔧 Pipeline Configuration

### When Does It Run?

```yaml
on:
  push:
    branches:
      - main           # Runs on push to main
  pull_request:
    branches:
      - main           # Runs on PR to main
```

### Job Dependencies

```
test → build → docker-compose-test → notify
  ↓      ↓            ↓                  ↓
Must   Only on    After build      Always
Pass   main push  succeeds         runs
```

### Test Environment Variables

```bash
NODE_ENV=test
DATABASE_URL=mongodb://localhost:27017/meeting-room-test
JWT_ACCESS_SECRET=test-jwt-access-secret-key-for-ci
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_SECRET=test-jwt-refresh-secret-key-for-ci
JWT_REFRESH_EXPIRES_IN=30d
BCRYPT_SALT_ROUNDS=10
SUPER_ADMIN_PASSWORD=test-admin-password
```

---

## 📊 Success Criteria

### ✅ Pipeline Passes When:
1. All 45 tests pass (100% success rate)
2. ESLint shows no critical errors
3. Docker image builds successfully
4. Image pushes to Docker Hub
5. Docker Compose test passes
6. API health check responds

### ❌ Pipeline Fails When:
1. Any test fails
2. TypeScript compilation fails
3. Docker build fails
4. Docker Hub push fails
5. Docker Compose doesn't start
6. API health check fails

---

## 🐛 Troubleshooting

### Tests Fail in CI but Pass Locally

**Problem:** Different Node.js versions or missing dependencies

**Solution:**
```bash
# Check Node.js version locally
node --version  # Should be 18.x

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm test
```

### Docker Build Fails

**Problem:** tsconfig.json missing or Dockerfile issue

**Solution:**
- Check `.dockerignore` doesn't exclude `tsconfig.json`
- Verify `Dockerfile` syntax
- Test build locally:
  ```bash
  docker build -t test-build .
  ```

### Docker Hub Push Fails

**Problem:** Invalid credentials or permissions

**Solution:**
1. Verify `DOCKER_HUB_USERNAME` is correct (not email)
2. Regenerate `DOCKER_HUB_ACCESS_TOKEN`
3. Check token has **Read & Write** permissions
4. Update GitHub secrets

### Docker Compose Test Fails

**Problem:** Services not starting or health checks failing

**Solution:**
1. Check logs in Actions workflow
2. Verify .env variables are correct
3. Test locally:
   ```bash
   npm run docker:dev:build
   curl http://localhost:5005/
   ```

---

## 📈 Code Coverage

Coverage reports are uploaded to Codecov (optional):

```bash
# View coverage locally
npm test
open coverage/index.html

# Current coverage: 56.48%
# Goal: 70%+
```

To enable Codecov:
1. Go to [codecov.io](https://codecov.io)
2. Sign up with GitHub
3. Enable your repository
4. Badge will show in PR checks

---

## 🔄 Workflow Customization

### Run Tests on Different Branches

```yaml
on:
  push:
    branches:
      - main
      - develop      # Add more branches
      - staging
```

### Build on Tags/Releases

```yaml
on:
  push:
    tags:
      - 'v*'         # Triggers on v1.0.0, v2.1.3, etc.
```

### Skip CI for Specific Commits

Add to commit message:
```bash
git commit -m "docs: Update README [skip ci]"
```

---

## 📝 Best Practices

### ✅ Do's
- ✅ Always run tests locally before pushing
- ✅ Keep secrets secure (never commit .env)
- ✅ Review failed pipeline logs
- ✅ Update dependencies regularly
- ✅ Maintain high test coverage
- ✅ Use meaningful commit messages

### ❌ Don'ts
- ❌ Don't push directly to main without PR
- ❌ Don't skip tests with `[skip ci]` regularly
- ❌ Don't commit Docker Hub tokens
- ❌ Don't ignore failing tests
- ❌ Don't build without testing first

---

## 🚀 Next Steps

### Future Enhancements:

1. **Add Deployment Stage**
   - Deploy to cloud platforms (AWS, DigitalOcean, etc.)
   - Use Docker Compose on VPS
   - Implement blue-green deployment

2. **Add More Checks**
   - Security scanning (Snyk, Trivy)
   - Dependency vulnerability checks
   - Performance testing
   - API integration tests

3. **Improve Notifications**
   - Slack/Discord notifications
   - Email alerts on failure
   - GitHub status badges

4. **Multi-Environment Support**
   - Development environment
   - Staging environment
   - Production environment

---

## 📞 Support

If the pipeline fails:

1. Check the **Actions** tab in GitHub
2. Click on the failed workflow
3. Review the logs for each job
4. Common issues are in the Troubleshooting section above

For questions:
- Review this documentation
- Check GitHub Actions logs
- Verify Docker Hub credentials

---

**Happy CI/CD! 🎉**
