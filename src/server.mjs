/**
 * Entry
 * Create a HTTP server with Node.js
 */

import http from 'http'
import serveStatic from 'serve-static'
import ejs from 'ejs'
import { normalize } from './helpers/utils.mjs'
import { projects, domain } from './helpers/config.mjs'

import Home from './components/Home.mjs'
import Single from './components/Single.mjs'

// Handle client request and send server response
const requestListener = (request, response) => {
  const url = normalize(request.url)

  /**
   * Controller renders the view
   * @param  {string} view Template filename
   * @param  {} component
   */
  const render = (view, component = null, code = 200) => {
    ejs.renderFile(`./views/${view}.ejs`, { data: component, domain: domain }, {}, (error, str) => {
      if (error) console.log(error)
      response.writeHead(code, { 'Content-Type': 'text/html' })
      response.end(str)
    })
  }

  // Serve up static files
  const serve = serveStatic('.')

  serve(request, response, () => {
    /**
     * Routes
     */

    // home
    if (url === '/') {
      render('home', Home())
    }

    // single
    else if (/^\/[\d]{4}-[\w]*/.test(url) && projects.some(e => `/${e.url}` == url)) {
      render('single', Single(request))
    }

    // 404
    else {
      render('404', null, 404)
    }
  })
}

const server = http.createServer(requestListener)

server.listen(process.env.PORT || 4100, error => {
  if (error) console.log(error)
  console.log(`Server running on PORT ${server.address().port}`)
})
