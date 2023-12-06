// Create the audio context
let audioWorld;

function createAudioWorld() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let oscillator;
  let gainNode;

  return {
    audioCtx,
    playTone(frequency) {
      if (!oscillator) {
        oscillator = audioCtx.createOscillator();
        oscillator.type = "sawtooth";

        gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);

        oscillator.connect(gainNode);
        const lowpass = audioCtx.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.value = 1000;
        gainNode.connect(lowpass);
        lowpass.connect(audioCtx.destination);
        oscillator.start();
      }
      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    },
    stopTone() {
      if (!oscillator) return;
      playing = false;
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + 0.5
      );
      oscillator.stop(audioCtx.currentTime + 0.5);
      oscillator = null;
      gainNode = null;
    },
  };
}

function getAudioWorld() {
  if (!audioWorld) {
    audioWorld = createAudioWorld();
  }
  return audioWorld;
}

const stringFrequenciesMap = {
  "string-A": 65.4, // A3
  "string-D": 98, // D3
  "string-G": 146, // G3
  "string-C": 220, // C3
};
const semitonesMap = {
  "semitone-1": 1,
  "semitone-2": 2,
  "semitone-3": 3,
  "semitone-4": 4,
  "semitone-5": 5,
  "semitone-6": 6,
};

// const touches = {};

// let stringHz = null;
// let semitoneNumber = 0;

function getFrequencyFromTouches(touches) {
  const stringTouch = touches.find((x) => x.target.id.startsWith("string-"));
  if (!stringTouch) return null;
  const stringElement = document.elementFromPoint(
    stringTouch.clientX,
    stringTouch.clientY
  );
  const elementHz = stringFrequenciesMap[stringElement?.id];
  if (!elementHz) return null;

  // Play the highest held semitone touch
  const semitoneTouch = touches
    .filter((x) => x.target.id.startsWith("semitone-"))
    .sort((a, b) => b.clientY - a.clientY)[0];
  let semitoneNumber = 0;

  if (semitoneTouch) {
    const semitoneTouchElement = document.elementFromPoint(
      semitoneTouch.clientX,
      semitoneTouch.clientY
    );
    semitoneNumber = semitonesMap[semitoneTouchElement?.id] ?? 0;
  }

  const tone = elementHz * Math.pow(2, semitoneNumber / 12);
  return tone;
}

function handleTouch(event) {
  //   event.preventDefault();
  const tone = getFrequencyFromTouches(Array.from(event.touches));
  if (tone) {
    getAudioWorld().playTone(tone);
  } else {
    getAudioWorld().stopTone();
  }
}

const strings = document.querySelector("#strings");
const semitones = document.querySelector("#semitones");

strings.addEventListener("touchstart", handleTouch);
semitones.addEventListener("touchstart", handleTouch);
document.addEventListener("touchmove", handleTouch);
document.addEventListener("touchend", handleTouch);
document.addEventListener("touchcancel", handleTouch);
// document.addEventListener("mousedown", handleTouch);
// document.addEventListener("mouseup", handleTouch);

document.querySelector("#start").addEventListener("click", () => {
  getAudioWorld().audioCtx.resume();
  document.querySelector("#start").classList.add("hidden");
  document.querySelector("#strings").classList.remove("hidden");
  document.querySelector("#semitones").classList.remove("hidden");
});

// strings.addEventListener("touchstart", stringTouchStart);
// semitones.addEventListener("touchstart", semitoneTouchStart);
// document.addEventListener("touchmove", touchMove);
// document.addEventListener("touchend", touchEnd);
// document.addEventListener("touchcancel", touchEnd);

// function playStringTouch(touch) {
//   const element = document.elementFromPoint(touch.clientX, touch.clientY);
//   if (!element) return;
//   const elementHz = stringFrequenciesMap[element.id];
//   if (!elementHz) return;
//   stringHz = elementHz;
//   const tone = stringHz * Math.pow(2, semitoneNumber / 12);

//   getAudioWorld().playTone(tone);
// }

// function playSemitoneTouch(touch) {
//   const element = document.elementFromPoint(touch.clientX, touch.clientY);
//   if (!element) return;
//   const semitoneNumber = semitonesMap[element.id];
//   if (semitoneNumber === undefined || stringHz === null) return;
//   const tone = stringHz * Math.pow(2, semitoneNumber / 12);
//   getAudioWorld().playTone(tone);
// }

// function stringTouchStart(event) {
//   event.preventDefault();
//   for (const touch of event.touches) {
//     touches[touch.identifier] = "string";
//     playStringTouch(touch);
//   }
// }

// function semitoneTouchStart(event) {
//   event.preventDefault();
//   for (const touch of event.touches) {
//     touches[touch.identifier] = "semitone";
//     playSemitoneTouch(touch);
//   }
// }

// function touchMove(event) {
//   document.getElementById("debug").innerHTML = JSON.stringify(
//     Array.from(event.touches).map((x) => ({
//       identifier: x.identifier,
//       clientX: x.clientX,
//       clientY: x.clientY,
//     })),
//     null,
//     2
//   );
//   for (const touch of event.touches) {
//     if (touches[touch.identifier] === "string") {
//       playStringTouch(touch);
//     }
//     if (touches[touch.identifier] === "semitone") {
//       playSemitoneTouch(touch);
//     }
//   }
// }

// function touchEnd(event) {
//   document.getElementById("debug").innerHTML = JSON.stringify(
//     Array.from(event.touches).map((x) => ({
//       identifier: x.identifier,
//       clientX: x.clientX,
//       clientY: x.clientY,
//     })),
//     null,
//     2
//   );
//   for (const touch of event.changedTouches) {
//     if (touches[touch.identifier] === "string") {
//       getAudioWorld().stopTone();
//       delete touches[touch.identifier];
//       stringHz = null;
//     }
//     if (touches[touch.identifier] === "semitone") {
//       // TODO: play the highest held semitone touch
//       semitoneNumber = 0;
//       delete touches[touch.identifier];
//       if (stringHz !== null) {
//         getAudioWorld().playTone(stringHz);
//       }
//     }
//   }
// }

// strings.addEventListener("touchstart", stringTouchStart);
// semitones.addEventListener("touchstart", semitoneTouchStart);
// document.addEventListener("touchmove", touchMove);
// document.addEventListener("touchend", touchEnd);
// document.addEventListener("touchcancel", touchEnd);
