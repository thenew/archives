/**
 * Static Site Generator for GitHub Pages
 */

import fs from 'fs'
import path from 'path'
import ejs from 'ejs'

const PROJECTS_PATH = './public/projects/'
const VIEWS_PATH = './views/'
const OUTPUT_DIR = './_site/'
const PUBLIC_DIR = './public/'
const DOMAIN = 'archives.thenew.fr'

const emptyProjects = [
  '2012-Fastlease', '2012-Yves_Pollak', '2013-20minutes',
  '2013-Actus_des_marques', '2013-Billet_Rouge', '2013-FactorsFrance',
  '2013-Glowing', '2013-La_boite_à_slides', '2013-The_Sartorialust',
  '2013-The_Sartorialust_shop', '2014-Un_Beau_Jour_Boutique',
  '2014-Ventech', '2015-CTGK', '2015-Pharmaflex', '2021-Moooi-POS',
]

const extractYearFromProjectName = text => {
  const match = text.match(/(^[\d]{4})[-_]/)
  return match ? match[1] : null
}

const beautifyProjectTitle = text => {
  return text
    .replace(/^[\d]{4}-/, '')
    .replace(/_/g, ' ')
    .replace(/-/, ' ')
    .replace(/:/g, '/')
}

const slugifyProjectTitle = text => {
  const a = '`àáäâãåăæçèéëêǵḧìíïîḿńǹñòóöôœṕŕßśșțùúüûǘẃẍÿź·`/_,:;'
  const b = 'aaaaaaaaceeeeghiiiimnnnoooooprssstuuuuuwxyz------'
  const p = new RegExp(a.split('').join('|'), 'g')
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(p, c => b.charAt(a.indexOf(c)))
    .replace(/[^\w\-]+/g, '')
    .replace(/\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

const getProjects = () => {
  if (!fs.existsSync(PROJECTS_PATH)) return []
  return fs.readdirSync(PROJECTS_PATH)
    .filter(file => fs.statSync(path.join(PROJECTS_PATH, file)).isDirectory())
    .map(file => ({
      filename: file,
      url: slugifyProjectTitle(file),
      title: beautifyProjectTitle(file),
      year: extractYearFromProjectName(file),
      disabled: emptyProjects.includes(file),
      path: path.join(PROJECTS_PATH, file)
    }))
    .sort((a, b) => {
      if (a.year && b.year && a.year !== b.year) return b.year.localeCompare(a.year)
      return b.filename.localeCompare(a.filename)
    })
}

const getProjectsByYear = projects => {
  let projectsByYears = []
  let yearIndex = -1
  projects.forEach(item => {
    if (yearIndex < 0 || projectsByYears[yearIndex].year !== item.year) {
      projectsByYears.push({ year: item.year, projects: [] })
      yearIndex++
    }
    projectsByYears[yearIndex].projects.push(item)
  })
  return projectsByYears
}

const getProjectMedias = projectPath => {
  if (!fs.existsSync(projectPath)) return []
  const authorisedExtensions = ['.jpg', '.png', '.webp', '.gif', '.webm', '.mp4']
  return fs.readdirSync(projectPath)
    .filter(file => authorisedExtensions.includes(path.extname(file)))
    .map(file => ({
      filename: file,
      url: `projects/${path.basename(projectPath)}/${file}`,
      type: ['.webm', '.mp4'].includes(path.extname(file)) ? 'video' : 'image',
      name: path.basename(file, path.extname(file)),
    }))
    .sort((a, b) => a.filename.includes('.webp') ? -1 : b.filename.includes('.webp') ? 1 : 0)
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((item, index, array) => {
      const previousItem = array[index - 1]
      if (previousItem && item.type === 'video' && item.name == previousItem.name) {
        if (!previousItem.urls) previousItem.urls = [previousItem.url]
        previousItem.urls.push(item.url)
      } else {
        return true
      }
    })
}

const getProjectDescription = projectPath => {
  try {
    const indexHtmlPath = path.join(projectPath, 'index.html')
    if (fs.existsSync(indexHtmlPath)) return fs.readFileSync(indexHtmlPath, 'utf8')
    return null
  } catch (error) {
    return null
  }
}

const ensureDir = dirPath => {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true })
}

const copyDirectoryRecursive = (src, dest) => {
  ensureDir(dest)
  fs.readdirSync(src).forEach(entry => {
    const srcPath = path.join(src, entry)
    const destPath = path.join(dest, entry)
    const stat = fs.statSync(srcPath)
    if (stat.isDirectory()) copyDirectoryRecursive(srcPath, destPath)
    else fs.copyFileSync(srcPath, destPath)
  })
}

const copyStaticAssets = () => {
  const staticDirs = ['css', 'fonts', 'images', 'app-icons', 'js']
  staticDirs.forEach(dir => {
    const src = path.join(PUBLIC_DIR, dir)
    const dest = path.join(OUTPUT_DIR, dir)
    if (fs.existsSync(src)) copyDirectoryRecursive(src, dest)
  })
}

const copyProjectMedias = projects => {
  projects.forEach(project => {
    if (project.disabled) return
    const src = project.path
    const dest = path.join(OUTPUT_DIR, 'projects', project.filename)
    ensureDir(dest)
    copyDirectoryRecursive(src, dest)
  })
}

const renderTemplate = (templateName, data) => {
  const templatePath = path.join(VIEWS_PATH, `${templateName}.ejs`)
  if (!fs.existsSync(templatePath)) throw new Error(`Template not found: ${templatePath}`)
  return ejs.renderFile(templatePath, data, { root: VIEWS_PATH })
}

async function main() {
  console.log('Starting static site generation for GitHub Pages...\n')

  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true })
  }
  ensureDir(OUTPUT_DIR)

  console.log('Scanning projects...')
  const projects = getProjects()
  console.log(`Found ${projects.length} projects (${projects.filter(p => !p.disabled).length} enabled)\n`)

  const projectsByYear = getProjectsByYear(projects)

  console.log('Copying static assets...')
  copyStaticAssets()
  console.log('  Static assets copied\n')

  console.log('Copying project media...')
  copyProjectMedias(projects)
  console.log('  Project media copied\n')

  console.log('Generating HTML pages...')

  // Generate home page
  const homeData = {
    data: {
      projectsByYears: projectsByYear,
      projectsLength: projects.filter(p => !p.disabled).length,
      pageClass: 'home'
    },
    domain: DOMAIN
  }
  let homeHtml = await renderTemplate('home', homeData)
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), homeHtml)
  console.log('  Generated: index.html')

  // Generate single pages
  for (const project of projects) {
    if (project.disabled) continue

    const text = getProjectDescription(project.path)
    let medias = getProjectMedias(project.path)
    const uniqueNames = new Set(medias.map(({ name }) => name))
    medias = [...uniqueNames].map(name => medias.find(item => item.name === name))

    const singleData = {
      data: {
        title: project.title,
        text: text || null,
        medias: medias,
        image: medias.length > 0 ? `projects/${project.filename}/${medias[0].filename}` : null,
        pageClass: 'single'
      },
      domain: DOMAIN
    }
    const html = await renderTemplate('single', singleData)
    ensureDir(path.join(OUTPUT_DIR, project.url))
    fs.writeFileSync(path.join(OUTPUT_DIR, project.url, 'index.html'), html)
    console.log(`  Generated: ${project.url}/index.html`)
  }

  // Generate 404 page
  const errorData = { 
    data: { pageClass: '404' }, 
    domain: DOMAIN 
  }
  const errorHtml = await renderTemplate('404', errorData)
  fs.writeFileSync(path.join(OUTPUT_DIR, '404.html'), errorHtml)
  console.log('  Generated: 404.html')

  // Copy screenshot
  const screenshotSrc = path.join('.', 'screenshot.jpg')
  const screenshotDest = path.join(OUTPUT_DIR, 'screenshot.jpg')
  if (fs.existsSync(screenshotSrc)) {
    fs.copyFileSync(screenshotSrc, screenshotDest)
    console.log('  Copied: screenshot.jpg')
  }

  // Copy .nojekyll file
  const noJekyllSrc = path.join('.', '.nojekyll')
  const noJekyllDest = path.join(OUTPUT_DIR, '.nojekyll')
  if (fs.existsSync(noJekyllSrc)) {
    fs.copyFileSync(noJekyllSrc, noJekyllDest)
    console.log('  Copied: .nojekyll')
  }

  // Fix asset paths for GitHub Pages
  console.log('\nFixing asset paths for GitHub Pages...')
  
  const walkDir = dir => {
    fs.readdirSync(dir).forEach(entry => {
      const fullPath = path.join(dir, entry)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
        walkDir(fullPath)
      } else if (entry.endsWith('.html')) {
        let content = fs.readFileSync(fullPath, 'utf8')
        const relativePath = path.relative(OUTPUT_DIR, fullPath)
        const isRoot = !relativePath.includes(path.sep)
        const depth = relativePath.split(path.sep).length - 1
        const prefix = '../'.repeat(depth)

        if (isRoot) {
          content = content.replace(/href="\.\/public\//g, 'href="')
          content = content.replace(/src="\.\/public\//g, 'src="')
          content = content.replace(/content="http:\/\/archives\.thenew\.fr\//g, 'content="')
          content = content.replace(/content="public\//g, 'content="')
          content = content.replace(/href="public\//g, 'href="')
        } else {
          content = content.replace(/href="\.\/public\//g, `href="${prefix}`)
          content = content.replace(/src="\.\/public\//g, `src="${prefix}`)
          content = content.replace(/content="http:\/\/archives\.thenew\.fr\//g, `content="${prefix}`)
          content = content.replace(/content="public\//g, `content="${prefix}`)
          content = content.replace(/href="public\//g, `href="${prefix}`)
          content = content.replace(/content="projects\//g, `content="${prefix}projects/`)
        }

        content = content.replace(/href="http:\/\/thenew\.fr"/g, 'href="https://thenew.fr"')
        content = content.replace(/href="https:\/\/archive\.area17\.com"/g, 'href="https://archive.area17.com"')

        fs.writeFileSync(fullPath, content)
      }
    })
  }
  walkDir(OUTPUT_DIR)

  console.log('\n✅ Static site generation complete!')
  console.log(`Output directory: ${OUTPUT_DIR}`)
  console.log('\nTo deploy to GitHub Pages:')
  console.log('  1. Commit and push the _site/ directory contents to the gh-pages branch')
  console.log('  2. Or add a GitHub Actions workflow to deploy from this branch')
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
