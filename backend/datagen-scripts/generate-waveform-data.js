// run this script with Node to generate binary waveform files for peaks.js from mp3 files in the provided folder
// this script uses audiowaveform (https://github.com/bbc/audiowaveform)
// to run this, make sure audiowaveform is installed on your system!
const { exec } = require('child_process');
const { promises: fs } = require('fs');
const path = require('path');

console.log(__dirname);

async function run() {
  const inputFolder = path.join(__dirname, '../../public/mp3');
  const outputFolder = path.join(__dirname, '../../public/waveform-data');

  const mp3Files = await fs.readdir(path.join(__dirname, '../../public/mp3'));
  for (const file of mp3Files) {
    const { name, ext } = path.parse(file);
    if (ext !== '.mp3') {
      console.warn('Skipping', file, '- not MP3!');
    }
    const cmd = `audiowaveform -i ${inputFolder}/${file} -o ${name}.dat -z 256 -b 8`;
    console.log('executing command:', cmd);
    exec(
      `audiowaveform -i ${inputFolder}/${file} -o ${outputFolder}/${name}.dat -z 256 -b 8`
    );
  }
}

run();
