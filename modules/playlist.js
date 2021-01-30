import { playClick } from './clickSound.js';
import { setSong, play } from './songControls.js';

const songListElement = document.getElementById('songList');
const songTemplateElement = document.getElementById('songTemplate');

// Music found at freemusicarchive.org is licensed under a creative commons license
// https://creativecommons.org/licenses/by-sa/3.0/us/

export const songs = [
    {
        name: 'Sláinte - Mairi\'s Wedding',
        path: 'audio/Sláinte - Mairi\'s Wedding.mp3',
        id: generateSongId(),
    },
    {
        name: 'Sláinte - Banish',
        path: 'audio/Sláinte - Banish.mp3',
        id: generateSongId(),
    },
    {
        name: 'Oak Ash and Thorn - Geordie',
        path: 'audio/Oak Ash and Thorn - Geordie.mp3',
        id: generateSongId(),
    },
    {
        name: 'Advent Chamber Orchestra - Handel - Entrance to the Queen of Sheba for Two Oboes, Strings, and Continuo allegro',
        path: 'audio/Advent Chamber Orchestra - Handel - Entrance to the Queen of Sheba for Two Oboes%2C Strings%2C and Continuo allegro.mp3',
        id: generateSongId(),
    },
    {
        name: 'Advent Chamber Orchestra - Vivaldi - Credo Crucifixus',
        path: 'audio/Advent Chamber Orchestra - Vivaldi - Credo Crucifixus.mp3',
        id: generateSongId(),
    },
    {
        name: 'John Harrison with the Wichita State University Chamber Players - Vivaldi - Winter Mvt 2 Largo',
        path: 'audio/John Harrison with the Wichita State University Chamber Players - Winter Mvt 2 Largo.mp3',
        id: generateSongId(),
    }
];

function generateSongId() {
    return Math.floor(Math.random() * 1e16).toString();
}

export function addSongs(songsToAdd) {
    songsToAdd.forEach(song => {
        songs.push({
            id: generateSongId(),
            path: song.path,
            name: song.name,
        });
    });

    populatePlayList();
}

function removeSong(songId) {
    const songIndex = songs.findIndex(song => song.id === songId);

    songs.splice(songIndex, 1);
    populatePlayList();
}

function moveSongUp(songId) {
    const songIndex = songs.findIndex(song => song.id === songId);

    const newSongIndex = songIndex === 0 ? songs.length - 1 : songIndex - 1;

    const [removedSong] = songs.splice(songIndex, 1);
    songs.splice(newSongIndex, 0, removedSong);

    populatePlayList();
}

function moveSongDown(songId) {
    const songIndex = songs.findIndex(song => song.id === songId);

    const newSongIndex = (songIndex + 1) % songs.length;

    const [removedSong] = songs.splice(songIndex, 1);
    songs.splice(newSongIndex, 0, removedSong);

    populatePlayList();
}

export function populatePlayList() {
    while (songListElement.firstChild) {
        songListElement.removeChild(songListElement.firstChild);
    }

    songs.forEach((song) => {
        const songElement = songTemplateElement.content.cloneNode(true).firstElementChild;
        const songNameElement = songElement.querySelector('.songName');
        const removeButton = songElement.querySelector('.removeButton');
        const moveUpButton = songElement.querySelector('.moveUpButton');
        const moveDownButton = songElement.querySelector('.moveDownButton');

        songElement.dataset.songId = song.id;
        songNameElement.textContent = song.name;

        songElement.addEventListener('click', () => {
            setSong(song.id);
            play();
        });

        removeButton.addEventListener('click', event => {
            event.stopPropagation();
            removeSong(song.id);
        });

        moveUpButton.addEventListener('click', event => {
            event.stopPropagation();
            moveSongUp(song.id);
        });

        moveDownButton.addEventListener('click', event => {
            event.stopPropagation();
            moveSongDown(song.id);
        });

        [
            removeButton,
            moveUpButton,
            moveDownButton,
        ].forEach(button => button.addEventListener('click', playClick));

        songListElement.append(songElement);
    });
}

export function getPreviousSongInList(currentSongId) {
    const currentSongIndex = songs.findIndex(song => song.id === currentSongId);
    const previousSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;

    return songs[previousSongIndex].id;
}

export function getNextSongInList(currentSongId) {
    const currentSongIndex = songs.findIndex(song => song.id === currentSongId);
    const nextSongIndex = (currentSongIndex + 1) % songs.length;

    return songs[nextSongIndex].id;
}

export function getSong(songId) {
    return songs.find(song => song.id === songId)
}

export function getAllSongs() {
    return songs.map(song => song.id);
}

export function getFirstSong() {
    return songs[0].id;
}

populatePlayList();