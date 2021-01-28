import { playClick } from './clickSound.js';
import { addSongs } from './playlist.js';

const addSongFromWebButton = document.getElementById('addSongFromWebButton');
const addSongFromWebUrl = document.getElementById('addSongFromWebUrl');
const addSongFromWebName = document.getElementById('addSongFromWebName');

addSongFromWebButton.addEventListener('click', playClick);
addSongFromWebButton.addEventListener('click', addSongFromWeb);

function addSongFromWeb() {
    let name;

    if (addSongFromWebName.value.trim() === '') {
        name = getFileNameFromUrl(addSongFromWebUrl.value);
    } else {
        name = addSongFromWebName.value;
    }

    addSongs([
        {
            path: addSongFromWebUrl.value,
            name: name,
        }
    ]);

    addSongFromWebUrl.value = '';
    addSongFromWebName.value = '';
}

function getFileNameFromUrl(url) {
    return (new URL(url)).pathname.split('/').slice(-1)[0].split('.')[0];
}
