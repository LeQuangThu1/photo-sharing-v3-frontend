/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 * @returns {Promise}       A promise that resolves with the fetched data.
 */
const BASE_URL = "http://localhost:8080/api";

function fetchModel(url) {
  return fetch(BASE_URL + url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("HTTP error! status: " + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      return { data: data };
    });
}

export default fetchModel;
