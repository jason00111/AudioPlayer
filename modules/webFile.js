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
