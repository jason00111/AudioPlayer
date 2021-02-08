//     Web Audio Player
//     Copyright (C) 2021
//
//     This program is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.
//
//     This program is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.
//
//     You should have received a copy of the GNU General Public License
//     along with this program.  If not, see <https://www.gnu.org/licenses/>.

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