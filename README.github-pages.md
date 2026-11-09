# GitHub Pages Deployment

This branch (`github-pages`) contains the configuration for deploying the archives site as a static site on GitHub Pages.

## Setup

1. **Switch to this branch**: `git checkout github-pages`
2. **Run the static generator**: `npm run build:static`
3. **Deploy to GitHub Pages**:
   - Option A: Push the `_site/` directory contents to the `gh-pages` branch
   - Option B: Use GitHub Actions (configured in `.github/workflows/deploy.yml`)

## GitHub Pages Configuration

### Using GitHub Actions (Recommended)

The workflow in `.github/workflows/deploy.yml` automatically:
1. Checks out the code
2. Installs dependencies
3. Runs `npm run build:static` to generate the static site
4. Deploys to GitHub Pages

To enable:
1. Go to your repository Settings > Pages
2. Select "GitHub Actions" as the source
3. Push to the `github-pages` branch to trigger the deployment

### Manual Deployment

If you prefer to deploy manually:

```bash
# Generate static site
npm run build:static

# Create gh-pages branch (if it doesn't exist)
git checkout --orphan gh-pages

# Remove all files from the gh-pages branch
git rm -rf .

# Copy the generated static site
cp -r _site/* .

# Commit and push
git add .
git commit -m "Deploy static site"
git push origin gh-pages --force

# Switch back to your working branch
git checkout github-pages
```

## Important Notes

- The `.nojekyll` file prevents GitHub from processing the site with Jekyll
- All paths are relative to work with GitHub Pages
- The `_site/` directory is ignored in `.gitignore` (don't commit it to the main branch)
- To use a custom domain, add a `CNAME` file to the `_site/` directory

## Differences from Original

The static version preserves all features:
- ✅ Home page with project list grouped by year
- ✅ Individual project pages with media (images/videos)
- ✅ Project descriptions (from index.html files)
- ✅ 404 error page
- ✅ All CSS, fonts, icons, and JavaScript
- ✅ Relative paths for GitHub Pages compatibility

The only difference is that this is now a **fully static** site that doesn't require a Node.js server.
