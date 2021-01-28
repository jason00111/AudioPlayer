import { playClick } from './clickSound.js';

const webFileTabButton = document.getElementById('webFileTabButton');
const localFileTabButton = document.getElementById('localFileTabButton');
const internetArchiveTabButton = document.getElementById('internetArchiveTabButton');

const webFileTab = document.getElementById('webFileTab');
const localFileTab = document.getElementById('localFileTab');
const internetArchiveTab = document.getElementById('internetArchiveTab');

[
    webFileTabButton,
    localFileTabButton,
    internetArchiveTabButton,
].forEach(button => button.addEventListener('click', playClick));

webFileTabButton.addEventListener('click', () => openTab('web'));
localFileTabButton.addEventListener('click', () => openTab('local'));
internetArchiveTabButton.addEventListener('click', () => openTab('internetArchive'));

function openTab(tab) {
    const selectedClass = 'bg-blue-200';

    if (tab === 'web') {
        webFileTab.classList.remove('hidden');
        localFileTab.classList.add('hidden');
        internetArchiveTab.classList.add('hidden');

        webFileTabButton.classList.add(selectedClass);
        localFileTabButton.classList.remove(selectedClass);
        internetArchiveTabButton.classList.remove(selectedClass);
    } else if (tab === 'local') {
        webFileTab.classList.add('hidden');
        localFileTab.classList.remove('hidden');
        internetArchiveTab.classList.add('hidden');

        webFileTabButton.classList.remove(selectedClass);
        localFileTabButton.classList.add(selectedClass);
        internetArchiveTabButton.classList.remove(selectedClass);
    } else if (tab === 'internetArchive') {
        webFileTab.classList.add('hidden');
        localFileTab.classList.add('hidden');
        internetArchiveTab.classList.remove('hidden');

        webFileTabButton.classList.remove(selectedClass);
        localFileTabButton.classList.remove(selectedClass);
        internetArchiveTabButton.classList.add(selectedClass);
    }
}