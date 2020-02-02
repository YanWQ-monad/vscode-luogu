import _ from 'axios'
import { Cookie, CookieJar } from 'tough-cookie'
import axiosCookieJarSupport from 'axios-cookiejar-support'

export const CSRF_TOKEN_REGEX = /<meta name="csrf-token" content="(.*)">/

export namespace API {
  export const baseURL = 'https://www.luogu.com.cn'
  export const apiURL = '/api'
  export const SEARCH_PROBLEM = (pid: string) => API.apiURL + '/problem/detail' + `/${pid}`
  export const ACCESS_TOKEN = '/OAuth2/accessToken'
  export const cookieDomain = 'luogu.com.cn'
  export const CAPTCHA_IMAGE = `${apiURL}/verify/captcha`
}

export const jar = new CookieJar();

export const axios = (() => {
  const axios = _.create({
    baseURL: API.baseURL,
    withCredentials: true,
    jar
  })

  const defaults = axios.defaults;
  if (!defaults.transformRequest) {
    defaults.transformRequest = []
  } else if (!(defaults.transformRequest instanceof Array)) {
    defaults.transformRequest = [defaults.transformRequest];
  }
  defaults.transformRequest.push((data, headers) => {
    headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36'
    return data
  })

  return axiosCookieJarSupport(axios)
})()

export const setClientID = async (value: string) => new Promise((resolve, reject) => {
  const cookie = new Cookie({
    key: '__client_id',
    value,
    path: '/',
    domain: API.cookieDomain
  })

  jar.setCookie(cookie, API.baseURL, (err, _) => {
    if (err) {
      reject(err)
    } else {
      resolve()
    }
  })
})

export const getClientID = async (): Promise<string | null> => new Promise((resolve, reject) => {
  jar.getCookies(API.baseURL, (err, cookies) => {
    if (err) {
      reject(err);
    } else {
      let cookie = cookies.find((cookie) => cookie.key === '__client_id');
      resolve(cookie ? cookie.value : null)
    }
  })
})

export const csrfToken = async () =>
  axios.get(API.baseURL)
    .then(res => {
      const result = CSRF_TOKEN_REGEX.exec(res.data)
      return result ? result[1].trim() : null
    })

export const captcha = async () =>
  axios.get(API.CAPTCHA_IMAGE, {
    params: {
      '_t': new Date().getTime()
    },
    responseType: 'arraybuffer'
  })
  .then(resp => resp.data ? Buffer.from(resp.data, 'binary') : null)

export const searchProblem = async (pid: string) =>
  axios.get(API.SEARCH_PROBLEM(pid))
    .then(res => res.data.data || null)

export const OAUTH2_INFO = {
  grant_type: 'password',
  client_id: 'luogu-vscode',
  client_secret: 'Asdf1234Excited111'
}

export const login = async (username: string, password: string) =>
  axios.post(API.ACCESS_TOKEN, {
    OAUTH2_INFO,
    username,
    password
  }).then(res => res.data || null)

export default axios
