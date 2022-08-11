# Why does this folder exist?

This folder is meant to be used for regular NodeJS scripts that are used to generate static files required by the app.

For now, the only thing that has to be generated are the precomputed waveform data files used by the WaveformView component of the Web App (or rather, the peaks.js library that this component uses). The script that creates those files is `generate-waveform-data.js`.
