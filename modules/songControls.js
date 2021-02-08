import { playClick } from './clickSound.js';
import {
  getPreviousSongInList,
  getNextSongInList,
  getSong,
  getAllSongs,
  getFirstSong,
} from './playlist.js'

const audioElement = document.getElementById('audio');
const playPauseButton = document.getElementById('playPauseButton');
const previousButton = document.getElementById('previousButton');
const nextButton = document.getElementById('nextButton');
const shuffleButton = document.getElementById('shuffleButton');
const mainSongNameElement = document.getElementById('songName');

const SELECTED_SONG_CLASS = 'bg-yellow-500';

const state = {
  playing: false,
  shuffle: false,
  playedSongs: [],
}

playPauseButton.addEventListener('click', togglePlay);
previousButton.addEventListener('click', playPreviousSong);
nextButton.addEventListener('click', playNextSong);
audioElement.addEventListener('ended', playNextSong);
shuffleButton.addEventListener('click', toggleShuffle);

// document.addEventListener('keydown', (event) => {
//     if (event.code === 'Space') {
//         supportedKeyPressed(event);
//         togglePlay();
//     } else if (event.code === 'ArrowLeft') {
//         supportedKeyPressed(event);
//         jumpBack();
//     } else if (event.code === 'ArrowRight') {
//         supportedKeyPressed(event);
//         jumpForward();
//     }
// });

[
  playPauseButton,
  previousButton,
  nextButton,
  shuffleButton,
].forEach(button => button.addEventListener('click', playClick));

function supportedKeyPressed(event) {
  playClick();
  event.preventDefault();
}

function jumpBack() {
  jump(-5);
}

function jumpForward() {
  jump(5);
}

function jump(jumpTime) {
  audioElement.currentTime = audioElement.currentTime + jumpTime;
}

function togglePlay() {
  if (state.playing) {
    pause();
  } else {
    play();
  }
}

export function play() {
  state.playing = true;
  audioElement.play();

  playPauseButton.setAttribute('playing', 'true');
}

export function pause() {
  state.playing = false;
  audioElement.pause();

  playPauseButton.setAttribute('playing', 'false');
}

function playNextSong() {
  if (state.shuffle) {
    setSong(getNextShuffleSong());
  } else {
    playNextSongInList();
  }

  play();
}

function playPreviousSong() {
  if (state.shuffle) {
    playPreviouslyPlayedSong();
  } else {
    playPreviousSongInList();
  }

  play();
}

function playNextSongInList() {
  const currentSongId = state.playedSongs[state.playedSongs.length - 1];
  const nextSongId = getNextSongInList(currentSongId);

  setSong(nextSongId);
}

function playPreviousSongInList() {
  const currentSongId = state.playedSongs[state.playedSongs.length - 1];
  const previousSongId = getPreviousSongInList(currentSongId);

  setSong(previousSongId);
}

function playPreviouslyPlayedSong() {
  if (state.playedSongs.length === 1) {
    return;
  }

  const previousSongId = state.playedSongs[state.playedSongs.length - 2];

  state.playedSongs.pop();
  state.playedSongs.pop();

  setSong(previousSongId);
}

function toggleShuffle() {
  if (state.shuffle) {
    state.shuffle = false;
    shuffleButton.removeAttribute('active');
  } else {
    state.shuffle = true;
    shuffleButton.setAttribute('active', '');
  }
}

function getNextShuffleSong() {
  const allSongs = getAllSongs();

  const recentlyPlayedSongs = state.playedSongs.slice(-allSongs.length / 2);
  const possibleNextSongs = allSongs.filter(songId => !recentlyPlayedSongs.includes(songId));

  const randomIndex = Math.floor(Math.random() * possibleNextSongs.length);

  return possibleNextSongs[randomIndex];
}

export function setSong(songId) {
  const song = getSong(songId);

  if (!song) {
    console.log(`Could not find song ${songId}`);

    playPreviouslyPlayedSong();
    return;
  }

  state.playedSongs.push(songId);
  audioElement.src = song.path;
  setSongName(song.name);
  highlightSelectedSong();
}

export function setSongName(name) {
  mainSongNameElement.textContent = name;
  document.title = name;
}

function highlightSelectedSong() {
  const songListElement = document.getElementById('songList');

  songListElement.childNodes.forEach(songElement => {
    if (songElement.dataset.songId === state.playedSongs[state.playedSongs.length - 1]) {
      songElement.classList.add(SELECTED_SONG_CLASS);
    } else {
      songElement.classList.remove(SELECTED_SONG_CLASS);
    }
  });
}

setSong(getFirstSong());