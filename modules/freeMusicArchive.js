import { fetchThroughProxy } from './common.js';
import { playClick } from './clickSound.js';
import { addSongs } from './playlist.js';
import { play, setSongName } from './songControls.js';

const fmaSearchInput = document.getElementById('fmaSearchInput');
const fmaSearchButton = document.getElementById('fmaSearchButton');
const fmaSearchLoading = document.getElementById('fmaSearchLoading');
const fmaSearchError = document.getElementById('fmaSearchError');
const fmaList = document.getElementById('fmaList');
const fmaNoResults = document.getElementById('fmaNoResults');
const fileTemplate = document.getElementById('fileTemplate');
const audioElement = document.getElementById('audio');
const previousPageButton = document.getElementById('fmaPreviousPage');
const nextPageButton = document.getElementById('fmaNextPage');
const pageIndicator = document.getElementById('fmaPageIndicator');
const pageControlsElement = document.getElementById('fmaPageControls');
const pageLoadingElement = document.getElementById('fmaPageLoading');
const pageSearchError = document.getElementById('fmaPageSearchError');

const state = {
    currentPage: 1,
    searchTerms: '',
}

fmaSearchButton.addEventListener('click', searchButtonHandler);
fmaSearchInput.addEventListener('keyup', (event) => {
    if (event.code === 'Enter') {
        playClick();
        searchButtonHandler();
    }
});

fmaSearchButton.addEventListener('click', playClick);
previousPageButton.addEventListener('click', previousPage)
nextPageButton.addEventListener('click', nextPage)

function searchButtonHandler() {
    state.searchTerms = fmaSearchInput.value;

    searchHandler({
        page: 1,
        loadingIndicator: fmaSearchLoading,
        errorIndicator: fmaSearchError,
    });
}


function searchHandler({ page, loadingIndicator, errorIndicator }) {
    if (loadingIndicator.getAttribute('active') !== null) {
        return;
    }

    loadingIndicator.setAttribute('active', '');
    fmaSearchButton.classList.add('hidden');

    searchFMA({
        page,
        searchTerms: state.searchTerms,
    })
        .then(({ songs, numberOfPages }) => {
            errorIndicator.classList.add('hidden');

            populateFMAList({ page, songs, numberOfPages });
        })
        .catch(error => {
            console.error('There was a problem searching the Free Music Archive');
            console.error(error);

            errorIndicator.classList.remove('hidden');
        })
        .finally(() => {
            loadingIndicator.removeAttribute('active');
            fmaSearchButton.classList.remove('hidden');
        });
}

function searchFMA({ searchTerms, page }) {
    const searchUrl = `https://freemusicarchive.org/search/?adv=1`
        + `&quicksearch=${searchTerms}`
        + `&page=${page}`;

    return fetchThroughProxy(searchUrl)
        .then(result => {
            const parser = new DOMParser();
            const fmaDocument = parser.parseFromString(result, 'text/html');

            const songs = Array.from(fmaDocument.getElementsByClassName('playtxt'))
                .map(songDiv => {
                    const anchor = songDiv.getElementsByClassName('ptxt-track')[0].firstElementChild;
                    const pageUrl = anchor.getAttribute('href');
                    const name = anchor.textContent;

                    return {
                        pageUrl,
                        name,
                    }
                });

            const pagesElement = Array.from(
                fmaDocument.getElementsByClassName('pagination-full')[0]
                    .getElementsByTagName('b')
            )[2];

            const numberOfPages = Number(pagesElement.textContent);

            return {
                songs,
                numberOfPages,
            }
        });
}

function getFileUrl(pageUrl) {
    return fetchThroughProxy(pageUrl)
        .then(result => {
            const parser = new DOMParser();
            const fmaDocument = parser.parseFromString(result, 'text/html');

            const trackInfoString = fmaDocument.getElementsByClassName('play-item')[0]
                .getAttribute('data-track-info');

            return JSON.parse(trackInfoString).fileUrl;
        });
}

function playFile({ song, fileElement }) {
    if (!fileElement.dataset.fileUrl) {
        getFileUrl(song.pageUrl)
            .then(fileUrl => {
                fileElement.dataset.fileUrl = fileUrl;

                playFile({ song, fileElement });
            })

        return;
    }

    setSongName(song.name);
    audioElement.src = fileElement.dataset.fileUrl;

    play();
}

function addFile({ song, fileElement }) {
    if (!fileElement.dataset.fileUrl) {
        getFileUrl(song.pageUrl)
            .then(fileUrl => {
                fileElement.dataset.fileUrl = fileUrl;

                addFile({ song, fileElement });
            })

        return;
    }

    addSongs([
        {
            path: fileElement.dataset.fileUrl,
            name: song.name,
        }
    ]);
}

function populateFMAList({ songs, page, numberOfPages }) {
    while (fmaList.firstChild) {
        fmaList.removeChild(fmaList.firstChild);
    }

    if (!songs.length) {
        fmaNoResults.classList.remove('hidden');
        return;
    }

    fmaNoResults.classList.add('hidden');

    songs.forEach((song) => {
        const fileElement = fileTemplate.content.cloneNode(true).firstElementChild;
        const fileNameElement = fileElement.querySelector('.fileName');
        const filePlayButton = fileElement.querySelector('.filePlayButton');
        const fileAddButton = fileElement.querySelector('.fileAddButton');

        fileNameElement.textContent = song.name;

        fileNameElement.addEventListener('click', () => playFile({
            song,
            fileElement,
        }));

        filePlayButton.addEventListener('click', () => playFile({
            song,
            fileElement,
        }));

        fileAddButton.addEventListener('click', () => addFile({
            song,
            fileElement,
        }));

        [
            fileElement,
            filePlayButton,
            fileAddButton,
        ].forEach(button => button.addEventListener('click', playClick));

        fmaList.append(fileElement);
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