const CORS_PROXY_PREFIX = 'http://api.allorigins.win/get?url=';

export function fetchThroughProxy(url) {
  return fetch(`${CORS_PROXY_PREFIX}${url}`)
    .then(response => {
      if (!response.ok) {
        throw Error(response.statusText);
      }

      return response.json();
    })
    .then(json => {
      return json.contents;
    })
}