import fs from 'fs'
import path from 'path'
import { projects, projectsPath, domain } from '../helpers/config.mjs'

const Single = request => {
  let data = {}

  // get project from request
  const project = projects.find(project => {
    return project.url && project.url === request.url.replace(/^\//, '')
  })

  if (!project) return

  data.title = project.title
  const dir = projectsPath + project.filename

  // get text
  try {
    const text = fs.readFileSync(`${dir}/index.html`)
    if (text) data.text = text
  } catch (error) {
    console.error(error)
  }

  // get images
  const authorisedExtensions = ['.jpg', '.png', '.webp', '.gif', '.webm', '.mp4']
  const getMedias = srcPath =>
    fs
      .readdirSync(srcPath)
      // filter only media files
      .filter(file => authorisedExtensions.includes(path.extname(file)))
      // build the media object
      .map(file => {
        const media = {
          filename: file,
          url: `${srcPath}/${file}`,
          type: ['.webm', '.mp4'].includes(path.extname(file)) ? 'video' : 'image',
          name: path.basename(file, path.extname(file)),
        }
        return media
      })
      // favor webp
      .sort((a, b) => (a.filename.includes('.webp') ? -1 : b.filename.includes('.webp') ? 1 : 0))
      // sort in alphabetical order
      .sort((a, b) => a.name.localeCompare(b.name))
      // put video items first
      // .sort((x, y) => {
      //   return x.type == 'video' ? -1 : y.type == 'video' ? 1 : 0
      // })
      // group videos items together
      .filter((item, index, array) => {
        const previousItem = array[index - 1]
        if (previousItem && item.type === 'video' && item.name == previousItem.name) {
          if (!previousItem.urls || !previousItem.urls.length) {
            previousItem.urls = [previousItem.url]
          }
          previousItem.urls.push(item.url)
        } else {
          return true
        }
      })
  data.medias = getMedias(dir)

  // Avoid duplicates
  const uniqueNames = new Set(data.medias.map(({ name }) => name))
  data.medias = [...uniqueNames].map((name) => data.medias.find((item) => item.name === name))

  const abosluteImageUrl = data.medias[0].url.replace('./', 'http://' + domain + '/')
  data.image = abosluteImageUrl
  data.pageClass = 'single'

  return data
}

export default Single
