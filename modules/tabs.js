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