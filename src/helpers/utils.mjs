/**
 * Utilities functions
 */

/**
 * @param  {string} text
 */
export const extractYearFromProjectName = text => {
  const match = text.match(/(^[\d]{4})[-_]/)
  return match ? match[1] : null
}

/**
 * @param  {string} text
 */
export const beautifyProjectTitle = text => {
  return text
    .replace(/^[\d]{4}-/, '') // Remove year
    .replace(/_/g, ' ')
    .replace(/-/, ' ')
    .replace(/:/g, '/') // Revert readdirSync replacing `/` by `:`
}

/**
 * @param  {string} text
 */
export const slugifyProjectTitle = text => {
  const a = '`àáäâãåăæçèéëêǵḧìíïîḿńǹñòóöôœṕŕßśșțùúüûǘẃẍÿź·`/_,:;'
  const b = 'aaaaaaaaceeeeghiiiimnnnoooooprssstuuuuuwxyz------'
  const p = new RegExp(a.split('').join('|'), 'g')

  return text
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

/**
 * Fix specific encoding issues with special characters
 * @param  {string} text
 */
export const normalize = text => {
  return text.replace('e%CC%81', 'é')
}
