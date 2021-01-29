import { playClick } from './clickSound.js';
import { audioContext, masterGain } from './audio.js';

const volumeIcon = document.getElementById('volumeIcon');
const volumeSlider = document.getElementById('volume');
const volumeMutePath = document.getElementById('volumeMutePath');
const volumeHalfPath = document.getElementById('volumeHalfPath');
const volumeFullPath = document.getElementById('volumeFullPath');

const VOLUME_FADE_TIME_CONSTANT = 0.05;

const state = {
    mute: false,
    volume: 1,
    volumeIcon: undefined,
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
        if (state.volumeIcon !== 0) {
            state.volumeIcon = 0;
            volumeMutePath.classList.add('hidden');
            volumeHalfPath.classList.add('hidden');
            volumeFullPath.classList.remove('hidden');
        }
    } else if (normalizedVolume > 0) {
        if (state.volumeIcon !== 1) {
            state.volumeIcon = 1;
            volumeMutePath.classList.add('hidden');
            volumeHalfPath.classList.remove('hidden');
            volumeFullPath.classList.add('hidden');
        }
    } else {
        if (state.volumeIcon !== 2) {
            state.volumeIcon = 2;
            volumeMutePath.classList.remove('hidden');
            volumeHalfPath.classList.add('hidden');
            volumeFullPath.classList.add('hidden');
        }
    }
}

setVolume();