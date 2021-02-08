const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
// Icon from https://material-ui.com/components/material-icons/
const SPINNER_PATH = 'M12 6v1.79c0 .45.54.67.85.35l2.79-2.79c.2-.2.2-.51 0-.71l-2.79-2.79c-.31-.31-.85-.09-.85.36V4c-4.42 0-8 3.58-8 8 0 1.04.2 2.04.57 2.95.27.67 1.13.85 1.64.34.27-.27.38-.68.23-1.04C6.15 13.56 6 12.79 6 12c0-3.31 2.69-6 6-6zm5.79 2.71c-.27.27-.38.69-.23 1.04.28.7.44 1.46.44 2.25 0 3.31-2.69 6-6 6v-1.79c0-.45-.54-.67-.85-.35l-2.79 2.79c-.2.2-.2.51 0 .71l2.79 2.79c.31.31.85.09.85-.35V20c4.42 0 8-3.58 8-8 0-1.04-.2-2.04-.57-2.95-.27-.67-1.13-.85-1.64-.34z';

class LoadingSpinner extends HTMLElement {
  static get observedAttributes() {
    return ['active'];
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

    this._setActive(newValue);
  }

  _render() {
    const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
    svg.setAttribute('class', 'animate-spin');
    svg.setAttribute('viewBox', '0 0 24 24');

    const path = document.createElementNS(SVG_NAMESPACE, 'path');
    path.setAttribute('d', SPINNER_PATH);

    svg.appendChild(path);
    this.appendChild(svg);

    this._setActive(this.getAttribute('active'));
  }

  _setActive(value) {
    if (value === 'true' || value === '') {
      this.classList.remove('hidden');
    } else {
      this.classList.add('hidden');
    }
  }
}

customElements.define('loading-spinner', LoadingSpinner);