/**
 * Configuration variables
 */
export const domain = 'archives.thenew.fr'
export const projectsPath = './public/projects/'

const emptyProjects = [
  '2012-Fastlease',
  '2012-Yves_Pollak',
  '2013-20minutes',
  '2013-Actus_des_marques',
  '2013-Billet_Rouge',
  '2013-FactorsFrance',
  '2013-Glowing',
  '2013-La_boite_à_slides',
  '2013-The_Sartorialust',
  '2013-The_Sartorialust_shop',
  '2014-Un_Beau_Jour_Boutique',
  '2014-Ventech',
  '2015-CTGK',
  '2015-Pharmaflex',
  '2021-Moooi-POS',
]

/**
 * Functions
 */
import fs from 'fs'
import path from 'path'
import {
  beautifyProjectTitle,
  slugifyProjectTitle,
  extractYearFromProjectName,
} from './utils.mjs'

/**
 * getDirectories
 */
const isDirectory = source => lstatSync(source).isDirectory()
const getDirectories = srcPath =>
  fs
    .readdirSync(srcPath)
    .filter(file => fs.statSync(path.join(srcPath, file)).isDirectory())
    .map(file => {
      let project = {
        filename: file,
        url: slugifyProjectTitle(file),
        title: beautifyProjectTitle(file),
        year: extractYearFromProjectName(file),
        disabled: emptyProjects.includes(file),
      }

      return project
    })
    .reverse()

export const projects = getDirectories(projectsPath)

/**
 * getDirectoriesByYear
 */
export const getDirectoriesByYear = () => {
  const projects = getDirectories(projectsPath)
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
