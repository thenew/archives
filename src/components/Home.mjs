import fs from 'fs'
import path from 'path'
import { beautifyProjectTitle, slugifyProjectTitle } from '../helpers/utils.mjs'
import { projects, getDirectoriesByYear } from '../helpers/config.mjs'

const Home = () => {
  let data = {}

  data.projectsByYears = getDirectoriesByYear()
  data.projectsLength = projects.length
  data.pageClass = 'home'

  return data
}

export default Home
