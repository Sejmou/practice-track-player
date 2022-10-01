export function secondsToMinutesAndSecondsStr(secs: number) {
  let minutes = Math.floor(secs / 60);
  let seconds = Math.round(secs % 60);
  if (seconds == 60) {
    minutes++;
    seconds = 0;
  }
  return `${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`;
}

function padTo2Digits(num: number) {
  return num.toString().padStart(2, '0');
}
