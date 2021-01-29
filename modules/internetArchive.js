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
const previousPageButton = document.getElementById('previousPage');
const nextPageButton = document.getElementById('nextPage');
const pageIndicator = document.getElementById('pageIndicator');
const pageControlsElement = document.getElementById('pageControls');
const pageLoadingElement = document.getElementById('pageLoading');
const pageSearchError = document.getElementById('pageSearchError');
const internetArchiveNoResults = document.getElementById('internetArchiveNoResults');

const CORS_PROXY_PREFIX = 'http://api.allorigins.win/get?url=';
const INTERNET_ARCHIVE_DOWNLOAD_PREFIX = 'https://archive.org/download/'

const state = {
    currentPage: 1,
    searchTerms: '',
}

internetArchiveSearchButton.addEventListener('click', searchButtonHandler);
internetArchiveSearchInput.addEventListener('keyup', (event) => {
    if (event.code === 'Enter') {
        playClick();
        searchButtonHandler();
    }
});

internetArchiveSearchButton.addEventListener('click', playClick);
previousPageButton.addEventListener('click', previousPage)
nextPageButton.addEventListener('click', nextPage)

function searchButtonHandler() {
    state.searchTerms = internetArchiveSearchInput.value;

    searchHandler({
        page: 1,
        loadingIndicator: internetArchiveSearchLoading,
        errorIndicator: internetArchiveSearchError,
    });
}

function searchHandler({ page, loadingIndicator, errorIndicator }) {
    if (!loadingIndicator.classList.contains('hidden')) {
        return;
    }

    loadingIndicator.classList.remove('hidden');

    searchInternetArchive({
        page,
        searchTerms: state.searchTerms,
    })
        .then(({ items, numberOfPages }) => {
            errorIndicator.classList.add('hidden');
            loadingIndicator.classList.add('hidden');

            populateIAList({ page, items, numberOfPages });
        })
        .catch(error => {
            console.error('There was a problem searching the Internet Archive');
            console.error(error);

            errorIndicator.classList.remove('hidden');
            loadingIndicator.classList.add('hidden');
        });
}

function nextPage() {
    goToPage(state.currentPage + 1);
}

function previousPage() {
    if (state.currentPage === 1) {
        return;
    }

    goToPage(state.currentPage - 1);
}

function goToPage(page) {
    searchHandler({
        page,
        loadingIndicator: pageLoadingElement,
        errorIndicator: pageSearchError,
    });
}

function searchInternetArchive({ searchTerms, page }) {
    const resultsPerPage = 20;
    const searchTermsString = searchTerms.split(' ').join('+');
    const searchUrl = `https://archive.org/advancedsearch.php?q=`
        + `format(VBR+MP3)+${searchTermsString}`
        + `&fl[]=identifier`
        + `&fl[]=title`
        + `&sort[]=avg_rating+desc`
        + `&sort[]=reviewdate+desc`
        + `&sort[]=`
        + `&rows=${resultsPerPage}`
        + `&page=${page}`
        + `&output=json`;

    return fetch(searchUrl)
        .then(response => {
            if (!response.ok) {
                throw Error(response.statusText);
            }

            return response.json();
        })
        .then(json => {
            return {
                items: json.response.docs,
                numberOfPages: Math.ceil(json.response.numFound / resultsPerPage),
            }
        })
}

function findIAFiles(identifier) {
    const url = `${INTERNET_ARCHIVE_DOWNLOAD_PREFIX}${identifier}/${identifier}_files.xml`;

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

            return files.sort();
        })
}

function populateIAList({ items, page, numberOfPages }) {
    while (internetArchiveList.firstChild) {
        internetArchiveList.removeChild(internetArchiveList.firstChild);
    }

    if (!items.length) {
        internetArchiveNoResults.classList.remove('hidden');
        return;
    }

    internetArchiveNoResults.classList.add('hidden');

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

    setPageNumbers({ page, numberOfPages });
}

function setPageNumbers({ page, numberOfPages }) {
    pageControlsElement.classList.remove('hidden');
    previousPageButton.classList.remove('hidden');
    nextPageButton.classList.remove('hidden');

    state.currentPage = page;
    pageIndicator.textContent = `Page ${page} of ${numberOfPages}`;

    if (page === 1) {
        previousPageButton.classList.add('hidden');
    }

    if (page === numberOfPages) {
        nextPageButton.classList.add('hidden');
    }
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

        const url = `${INTERNET_ARCHIVE_DOWNLOAD_PREFIX}${item.identifier}/${file}`;
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
