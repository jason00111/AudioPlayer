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
import { audioContext, masterGain } from './audio.js';

const volumeIcon = document.getElementById('volumeIcon');
const volumeSlider = document.getElementById('volume');

const VOLUME_FADE_TIME_CONSTANT = 0.05;

const state = {
  mute: false,
  volume: 1,
}

volumeIcon.addEventListener('click', toggleMute);
volumeSlider.addEventListener('input', setVolume);
volumeIcon.addEventListener('click', playClick);

document.addEventListener('keydown', (event) => {
  if (event.code === 'ArrowUp') {
    supportedKeyPressed(event);
    volumeUp();
  } else if (event.code === 'ArrowDown') {
    supportedKeyPressed(event);
    volumeDown();
  }
});

function supportedKeyPressed(event) {
  playClick();
  event.preventDefault();
}

function volumeUp() {
  changeVolumeBy(0.1);
}

function volumeDown() {
  changeVolumeBy(-0.1);
}

function changeVolumeBy(changeAmount) {
  volumeSlider.valueAsNumber += changeAmount;
  setVolume();
}

function toggleMute() {
  if (state.mute) {
    state.mute = false;

    if (state.volume === 0) {
      state.volume = 0.2;
    }

    masterGain.gain.setTargetAtTime(state.volume, audioContext.currentTime, VOLUME_FADE_TIME_CONSTANT);
    volumeSlider.valueAsNumber = state.volume;
    setVolumeIcon(state.volume);
  } else {
    state.mute = true;
    masterGain.gain.setTargetAtTime(0, audioContext.currentTime, VOLUME_FADE_TIME_CONSTANT);
    volumeSlider.valueAsNumber = 0;
    setVolumeIcon(0);
  }
}

function setVolume() {
  state.volume = volumeSlider.valueAsNumber;

  masterGain.gain.setTargetAtTime(state.volume, audioContext.currentTime, VOLUME_FADE_TIME_CONSTANT);

  setVolumeIcon(state.volume);

  state.mute = state.volume === 0;
}

function setVolumeIcon(volume) {
  const normalizedVolume = volume / Number(volumeSlider.max);

  if (normalizedVolume > 0.5) {
    volumeIcon.setAttribute('icon', 'volumeFull');
    volumeIcon.setAttribute('title', 'Mute');
  } else if (normalizedVolume > 0) {
    volumeIcon.setAttribute('icon', 'volumeHalf');
    volumeIcon.setAttribute('title', 'Mute');
  } else {
    volumeIcon.setAttribute('icon', 'mute');
    volumeIcon.setAttribute('title', 'Unmute');
  }
}

setVolume();