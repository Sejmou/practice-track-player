import { Timestamp } from '@models';
import moment from 'moment';

export function getSubstringAfterFirstSubstringOccurence(
  input: string,
  substring: string
) {
  const substrIdx = input.indexOf(substring);
  if (substrIdx === -1) {
    throw Error(
      `Provided substring '${substring}' not found in input string '${input}'`
    );
  }
  return input.slice(substrIdx + substring.length);
}

export function clamp(number: number, min: number, max: number) {
  return Math.min(Math.max(number, min), max);
}

export function extractTimestamps(input: string): Timestamp[] {
  const timestamps: Timestamp[] = [];
  input.split('\n').forEach(line => {
    const timeStampData = extractTimestamp(line);
    if (timeStampData) {
      const { seconds, restOfLine } = timeStampData;
      const firstLetterIdx = restOfLine.match('[a-zA-Z0-9]')?.index; // https://stackoverflow.com/a/59575890/13727176

      timestamps.push({
        seconds,
        label: firstLetterIdx
          ? restOfLine.substring(firstLetterIdx, restOfLine.length)
          : (timestamps.length + 1).toString(),
      });
    }
  });
  return timestamps;
}

export function extractTimestamp(line: string) {
  // remove whitespace at beginning and end of line, replace any repeated whitespace with single space
  const str = line.trim().replaceAll(/\s+/g, ' ');
  const hmsDurationRegex = /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)/;
  // regex that should match HH:MM:SS duration string: https://stackoverflow.com/a/8318367/13727176
  const match = str.match(hmsDurationRegex);
  if (match) {
    const timestampStr = match[0];
    return {
      timeStampString: timestampStr,
      seconds: moment.duration(timestampStr).asSeconds(),
      restOfLine: getSubstringAfterFirstSubstringOccurence(line, timestampStr),
    };
  }
}
