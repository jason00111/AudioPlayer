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

import { IconButton } from './iconButton.js';

class PlayPauseButton extends HTMLElement {
  static get observedAttributes() {
    return ['playing'];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    if (!this._rendered) {
      this._render();
      this._rendered = true;
    }
  }

  attributeChangedCallback(attributeName, oldValue, newValue) {
    if (!this._rendered) {
      return;
    }

    this._setPlaying(newValue);
  }

  _render() {
    this._button = new IconButton();
    this.appendChild(this._button);

    this._setPlaying(this.getAttribute('playing'));
  }

  _setPlaying(value) {
    if (value === 'true' || value === '') {
      this._button.setAttribute('icon', 'pause');
      this.setAttribute('title', 'Pause');
    } else {
      this._button.setAttribute('icon', 'play');
      this.setAttribute('title', 'Play');
    }
  }
}

customElements.define('play-pause-button', PlayPauseButton);