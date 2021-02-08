import { playClick } from './clickSound.js';
import { addSongs } from './playlist.js';
import { setSongName, play } from './songControls.js';
import { fetchThroughProxy } from './common.js';

const internetArchiveList = document.getElementById('internetArchiveList');
const internetArchiveItemTemplate = document.getElementById('internetArchiveItemTemplate');
const internetArchiveSearchInput = document.getElementById('internetArchiveSearchInput');
const internetArchiveSearchButton = document.getElementById('internetArchiveSearchButton');
const fileTemplate = document.getElementById('fileTemplate');
const internetArchiveSearchLoading = document.getElementById('internetArchiveSearchLoading');
const internetArchiveSearchError = document.getElementById('internetArchiveSearchError');
const audioElement = document.getElementById('audio');
const previousPageButton = document.getElementById('iaPreviousPage');
const nextPageButton = document.getElementById('iaNextPage');
const pageIndicator = document.getElementById('iaPageIndicator');
const pageControlsElement = document.getElementById('iaPageControls');
const pageLoadingElement = document.getElementById('iaPageLoading');
const pageSearchError = document.getElementById('iaPageSearchError');
const internetArchiveNoResults = document.getElementById('internetArchiveNoResults');

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
    if (loadingIndicator.getAttribute('active') !== null) {
        return;
    }

    loadingIndicator.setAttribute('active', '');
    internetArchiveSearchButton.classList.add('hidden');

    searchInternetArchive({
        page,
        searchTerms: state.searchTerms,
    })
        .then(({ items, numberOfPages }) => {
            errorIndicator.classList.add('hidden');

            populateIAList({ page, items, numberOfPages });
        })
        .catch(error => {
            console.error('There was a problem searching the Internet Archive');
            console.error(error);

            errorIndicator.classList.remove('hidden');
        })
        .finally(() => {
            loadingIndicator.removeAttribute('active');
            internetArchiveSearchButton.classList.remove('hidden');
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

    return fetchThroughProxy(url)
        .then(result => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(result, 'text/xml');

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
        const itemElement = internetArchiveItemTemplate.content.cloneNode(true).firstElementChild;
        const itemNameElement = itemElement.querySelector('.itemName');
        const filesContainerElement = itemElement.querySelector('.filesContainer');
        const fileListElement = itemElement.querySelector('.files');
        const filesLoadingElement = itemElement.querySelector('.filesLoading');
        const filesErrorElement = itemElement.querySelector('.filesError');

        itemElement.dataset.itemId = item.identifier;
        itemNameElement.textContent = item.title;

        itemNameElement.addEventListener('click', () => {
            if (filesLoadingElement.getAttribute('active') !== null) {
                return;
            }

            if (filesContainerElement.classList.contains('hidden')) {
                filesContainerElement.classList.remove('hidden');

                if (!fileListElement.childElementCount) {
                    filesLoadingElement.setAttribute('active', '');

                    findIAFiles(item.identifier)
                        .then(files => {
                            filesErrorElement.classList.add('hidden');

                            populateIAFiles({
                                itemElement,
                                item,
                                files,
                            });
                        })
                        .catch(error => {
                            console.error('There was a problem listing files from the Internet Archive');
                            console.error(error);

                            filesErrorElement.classList.remove('hidden');
                        })
                        .finally(() => {
                            filesLoadingElement.removeAttribute('active');
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
        const fileElement = fileTemplate.content.cloneNode(true).firstElementChild;
        const fileNameElement = fileElement.querySelector('.fileName');
        const filePlayButton = fileElement.querySelector('.filePlayButton');
        const fileAddButton = fileElement.querySelector('.fileAddButton');

        function playFile() {
            setSongName(name);
            audioElement.src = url;

            play();
        }

        const url = `${INTERNET_ARCHIVE_DOWNLOAD_PREFIX}${item.identifier}/${file}`;
        const name = file.slice(0, -4);

        fileNameElement.textContent = name;

        fileNameElement.addEventListener('click', playFile);
        filePlayButton.addEventListener('click', playFile);

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
