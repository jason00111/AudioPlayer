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

const clickDuration = 0.005;
const clickAttackConstant = 0.001;
const clickReleaseConstant = 0.01;
const clickMinGain = 0;
const clickMaxGain = 3.5;

const clickFilter = audioContext.createBiquadFilter();
const clickGain = audioContext.createGain();
clickFilter.connect(clickGain);
clickGain.connect(masterGain);

clickFilter.type = 'bandpass';
clickFilter.frequency.value = 440;
clickFilter.Q.value = 8;

clickGain.gain.value = clickMinGain;

export function playClick() {
  const buffer = audioContext.createBuffer(1, 0.2 * audioContext.sampleRate, audioContext.sampleRate);
  const bufferData = buffer.getChannelData(0);
  for (let i = 0; i < buffer.length; i++) {
    bufferData[i] = Math.random() * 2 - 1;
  }

  const bufferSource = audioContext.createBufferSource();
  bufferSource.buffer = buffer;

  bufferSource.connect(clickFilter);
  // bufferSource.connect(clickGain);
  bufferSource.start();

  const currentTime = audioContext.currentTime;

  clickGain.gain.setValueAtTime(clickMinGain, currentTime);
  clickGain.gain.setTargetAtTime(clickMaxGain, currentTime, clickAttackConstant);
  clickGain.gain.setValueAtTime(clickMaxGain, currentTime + clickDuration);
  clickGain.gain.setTargetAtTime(clickMinGain, currentTime + clickDuration, clickReleaseConstant);
}