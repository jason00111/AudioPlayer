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

import { audioContext, masterGain } from './audio.js';

const audioElement = document.getElementById('audio');
const visualization = document.getElementById('visualization');

const songAudioSource = audioContext.createMediaElementSource(audioElement);
const analyser = audioContext.createAnalyser();

songAudioSource.connect(analyser);
analyser.connect(masterGain);

analyser.fftSize = 64;
const freqData = new Uint8Array(analyser.frequencyBinCount);
analyser.getByteFrequencyData(freqData);

for (let i = 0; i < analyser.frequencyBinCount; i++) {
  const band = document.createElement('div');
  const bandClasses = 'h-4 w-4 rounded-full';
  band.classList.add(...bandClasses.split(' '));
  visualization.append(band);
}

draw();

function draw() {
  analyser.getByteFrequencyData(freqData);

  visualization.childNodes.forEach((bandElement, index) => {
    setBand(bandElement, freqData[index] / 255);
  });

  requestAnimationFrame(draw);
}

function setBand(bandElement, intensity) {
  bandElement.style.setProperty('background-color', `rgba(245, 158, 11, ${intensity})`);
  bandElement.style.setProperty('height', `${intensity * visualization.clientHeight}px`);
}