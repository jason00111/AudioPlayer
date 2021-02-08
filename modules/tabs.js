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

const tabs = [
  {
    name: 'webFile',
  },
  {
    name: 'localFile',
  },
  {
    name: 'internetArchive',
  },
  {
    name: 'fma',
  },
]

tabs.forEach(tab => {
  tab.button = document.getElementById(`${tab.name}TabButton`);
  tab.tab = document.getElementById(`${tab.name}Tab`);
  tab.button.addEventListener('click', () => openTab(tab));
});

tabs.forEach(tab => tab.button.addEventListener('click', playClick));

function openTab(tab) {
  const selectedClass = 'bg-blue-200';

  tabs.forEach(tab => {
    tab.tab.classList.add('hidden');
    tab.button.classList.remove(selectedClass);
  });

  tab.tab.classList.remove('hidden');
  tab.button.classList.add(selectedClass);
}