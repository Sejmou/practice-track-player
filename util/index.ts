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
