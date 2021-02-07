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