import { playClick } from './clickSound.js';
import { addSongs } from './playlist.js';

const addSongLocalButton = document.getElementById('addSongLocalButton');
const localFileInput = document.getElementById('localFileInput');

addSongLocalButton.addEventListener('click', playClick);
addSongLocalButton.addEventListener('click', addSongLocal);

function addSongLocal() {
    const songs = Array.from(localFileInput.files)
        .map(file => ({
            path: URL.createObjectURL(file),
            name: file.name.split('.')[0],
        }));

    addSongs(songs);
}