import { playClick } from './clickSound.js';
import { addSongs } from './playlist.js';
import { setSongName, play } from './songControls.js';

const internetArchiveList = document.getElementById('internetArchiveList');
const internetArchiveItemTemplate = document.getElementById('internetArchiveItemTemplate');
const internetArchiveSearchInput = document.getElementById('internetArchiveSearchInput');
const internetArchiveSearchButton = document.getElementById('internetArchiveSearchButton');
const fileTemplate = document.getElementById('fileTemplate');
const internetArchiveSearchLoading = document.getElementById('internetArchiveSearchLoading');
const internetArchiveSearchError = document.getElementById('internetArchiveSearchError');
const audioElement = document.getElementById('audio');

const CORS_PROXY_PREFIX = 'http://api.allorigins.win/get?url=';

internetArchiveSearchButton.addEventListener('click', searchInternetArchiveHandler);
internetArchiveSearchInput.addEventListener('keyup', (event) => {
    if (event.code === 'Enter') {
        playClick();
        searchInternetArchiveHandler();
    }
});

internetArchiveSearchButton.addEventListener('click', playClick);

function searchInternetArchiveHandler() {
    if (!internetArchiveSearchLoading.classList.contains('hidden')) {
        return;
    }

    const searchTerms = internetArchiveSearchInput.value;
    internetArchiveSearchLoading.classList.remove('hidden');

    searchInternetArchive(searchTerms)
        .then(items => {
            internetArchiveSearchError.classList.add('hidden');
            internetArchiveSearchLoading.classList.add('hidden');
            populateIAList(items);
        })
        .catch(error => {
            console.error('There was a problem searching the Internet Archive');
            console.error(error);

            internetArchiveSearchError.classList.remove('hidden');
            internetArchiveSearchLoading.classList.add('hidden');
        });
}

function searchInternetArchive(searchTerms) {
    const searchTermsString = searchTerms.split(' ').join('+');
    const searchUrl = `https://archive.org/advancedsearch.php?q=format%3A%28VBR+MP3%29+${searchTermsString}&fl%5B%5D=identifier&fl%5B%5D=title&sort%5B%5D=avg_rating+desc&sort%5B%5D=reviewdate+desc&sort%5B%5D=&rows=20&page=1&output=json`;

    return fetch(searchUrl)
        .then(response => {
            if (!response.ok) {
                throw Error(response.statusText);
            }

            return response.json();
        })
        .then(json => {
            return json.response.docs;
        })
}

function findIAFiles(identifier) {
    const url = `https://ia800605.us.archive.org/29/items/${identifier}/${identifier}_files.xml`;

    return fetch(CORS_PROXY_PREFIX + url)
        .then(response => {
            if (!response.ok) {
                throw Error(response.statusText);
            }

            return response.json();
        })
        .then(json => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(json.contents, 'text/xml');

            const files = [];
            for (let file of xml.getElementsByTagName('file')) {
                const fileName = file.getAttribute('name');

                if (fileName.endsWith('.mp3')) {
                    files.push(fileName);
                }
            }

            return files;
        })
}

function populateIAList(items) {
    while (internetArchiveList.firstChild) {
        internetArchiveList.removeChild(internetArchiveList.firstChild);
    }

    items.forEach((item) => {
        const itemElement = internetArchiveItemTemplate.cloneNode(true);
        const itemNameElement = itemElement.getElementsByClassName('itemName')[0];
        const filesContainerElement = itemElement.getElementsByClassName('filesContainer')[0];
        const fileListElement = itemElement.getElementsByClassName('files')[0];
        const loadingElement = itemElement.getElementsByClassName('loading')[0];
        const filesErrorElement = itemElement.getElementsByClassName('filesError')[0];

        itemElement.id = '';
        itemElement.classList.remove('hidden');
        itemElement.dataset.itemId = item.identifier;
        itemNameElement.textContent = item.title;

        itemNameElement.addEventListener('click', () => {
            if (!loadingElement.classList.contains('hidden')) {
                return;
            }

            if (filesContainerElement.classList.contains('hidden')) {
                filesContainerElement.classList.remove('hidden');

                if (!fileListElement.childElementCount) {
                    loadingElement.classList.remove('hidden');

                    findIAFiles(item.identifier)
                        .then(files => {
                            filesErrorElement.classList.add('hidden');
                            loadingElement.classList.add('hidden');

                            populateIAFiles({
                                itemElement,
                                item,
                                files,
                            });
                        })
                        .catch(error => {
                            console.error('There was a problem listing files from the Internet Archive');
                            console.error(error);

                            loadingElement.classList.add('hidden');
                            filesErrorElement.classList.remove('hidden');
                        });
                }
            } else {
                filesContainerElement.classList.add('hidden');
            }
        });

        [
            itemNameElement,
        ].forEach(button => button.addEventListener('click', playClick));

        internetArchiveList.append(itemElement);
    });
}

function playFile({ url, name }) {
    setSongName(name);
    audioElement.src = url;

    play();
}

function populateIAFiles({ itemElement, item, files }) {
    const fileListElement = itemElement.getElementsByClassName('files')[0];
    const noFilesElement = itemElement.getElementsByClassName('noFiles')[0];

    while (fileListElement.firstChild) {
        fileListElement.removeChild(fileListElement.firstChild);
    }

    if (!files.length) {
        noFilesElement.classList.remove('hidden');
    }

    files.forEach((file) => {
        const fileElement = fileTemplate.cloneNode(true);
        const fileNameElement = fileElement.getElementsByClassName('fileName')[0];
        const filePlayButton = fileElement.getElementsByClassName('filePlayButton')[0];
        const fileAddButton = fileElement.getElementsByClassName('fileAddButton')[0];

        const url = `https://archive.org/download/${item.identifier}/${file}`;
        const name = file.slice(0, -4);

        fileElement.id = '';
        fileElement.classList.remove('hidden');
        fileNameElement.textContent = file;

        fileNameElement.addEventListener('click', () => playFile({
            url,
            name,
        }));

        filePlayButton.addEventListener('click', () => playFile({
            url,
            name,
        }));

        fileAddButton.addEventListener('click', () => {
            addSongs([
                {
                    path: url,
                    name,
                }
            ]);
        });

        [
            fileElement,
            filePlayButton,
            fileAddButton,
        ].forEach(button => button.addEventListener('click', playClick));

        fileListElement.append(fileElement);
    });
}
