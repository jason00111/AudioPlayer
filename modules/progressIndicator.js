import { playClick } from './clickSound.js';

const progressBarContainer = document.getElementById('progressBarContainer');
const progressBar = document.getElementById('progressBar');
const progressBufferBar = document.getElementById('progressBufferBar');
const currentTimeElement = document.getElementById('currentTime');
const audioElement = document.getElementById('audio');

audioElement.addEventListener('timeupdate', setProgressIndicator);
audioElement.addEventListener('timeupdate', setProgressBufferBar);

progressBarContainer.addEventListener('click', playClick);
progressBarContainer.addEventListener('click', handleProgressClick);

function handleProgressClick(event) {
  const box = progressBarContainer.getBoundingClientRect();

  audioElement.currentTime = ((event.x - box.left) / box.width) * audioElement.duration;
}

function setProgressIndicator() {
  if (!Number.isNaN(audioElement.duration)) {
    currentTimeElement.textContent = `${getTimeString(audioElement.currentTime)} / ${getTimeString(audioElement.duration)}`;

    progressBar.style.setProperty(
      'width',
      `${progressBarContainer.clientWidth * audioElement.currentTime / audioElement.duration}px`
    );
  }
}

function setProgressBufferBar() {
  if (audioElement.buffered.length) {
    progressBufferBar.style.setProperty(
      'width',
      `${progressBarContainer.clientWidth * audioElement.buffered.end(audioElement.seekable.length - 1) / audioElement.duration}px`
    );
  }
}

function getTimeString(secondsInput) {
  const minutes = Math.floor(secondsInput / 60);
  const seconds = Math.floor(secondsInput % 60);

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}