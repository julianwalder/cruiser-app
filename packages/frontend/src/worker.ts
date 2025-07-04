import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

/**
 * The DEBUG flag will do two things that help during development:
 * 1. we will skip caching on the edge, which makes it easier to
 *    debug.
 * 2. we will return an error message on exception in your Response,
 *    rather than the default 404.html page.
 */
const DEBUG = false

addEventListener('fetch', event => {
  try {
    event.respondWith(handleEvent(event))
  } catch (e) {
    if (DEBUG) {
      return event.respondWith(
        new Response(e.message || e.toString(), {
          status: 500,
        }),
      )
    }
    event.respondWith(new Response('Internal Error', { status: 500 }))
  }
})

async function handleEvent(event: FetchEvent): Promise<Response> {
  const url = new URL(event.request.url)
  let options = {}

  /**
   * You can add custom logic to how we fetch your assets
   * by configuring the function `mapRequestToAsset`
   */
  // options.mapRequestToAsset = req => new Request(`${new URL(req.url).origin}/index.html`, req)

  try {
    if (DEBUG) {
      // customize caching
      options.cacheControl = {
        bypassCache: true,
      }
    }
    
    // Check if the request is for a static asset
    const asset = await getAssetFromKV(event, options)
    
    // Add cache headers for static assets
    const response = new Response(asset.body, asset)
    
    // Cache static assets for 1 year
    if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    } else {
      // Cache HTML and other files for 1 hour
      response.headers.set('Cache-Control', 'public, max-age=3600')
    }
    
    return response

  } catch (e) {
    // if an error is thrown try to serve the asset at 404.html
    if (!DEBUG) {
      try {
        let notFoundResponse = await getAssetFromKV(event, {
          mapRequestToAsset: req => new Request(`${new URL(req.url).origin}/index.html`, req),
        })

        return new Response(notFoundResponse.body, { ...notFoundResponse, status: 200 })
      } catch (e) {}
    }

    return new Response(`Not found: ${url.pathname}`, { status: 404 })
  }
}

/**
 * Here's one example of how to modify a request to
 * allow you to serve a single page app while being
 * able to cache your assets at the edge.
 */
function mapRequestToAsset(req: Request): Request {
  const url = new URL(req.url)
  
  // If the request is for a file that doesn't exist, serve index.html
  if (!url.pathname.includes('.')) {
    return new Request(`${url.origin}/index.html`, req)
  }
  
  return req
} 