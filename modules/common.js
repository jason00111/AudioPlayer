const CORS_PROXY_PREFIX = 'http://api.allorigins.win/get?url=';

export function fetchThroughProxy(url) {
  const encodedUrl = encodeURIComponent(url)

  return fetch(`${CORS_PROXY_PREFIX}${encodedUrl}`)
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