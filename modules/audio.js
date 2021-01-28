export const audioContext = new AudioContext();
export const masterGain = audioContext.createGain();

masterGain.connect(audioContext.destination);