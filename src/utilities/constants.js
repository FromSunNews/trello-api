import { env } from '*/config/environtment'

export const HttpStatusCode = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER: 500
}

export const WHITELIST_DOMAINS = [
  'http://localhost:3000',
  'https://trello-trungquandev-web.web.app'
]

let websiteDomain = 'http://localhost:3000'
if(env.BUILD_MODE === 'production') {
  websiteDomain = 'https://trungquandev.com'
}
export const WEBSITE_DOMAIN = websiteDomain