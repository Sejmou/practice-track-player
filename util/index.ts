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

export function addEventListenerWithRemoveCallback<EventType = string>(
  // TODO: figure out how to type that in a generic kind of way
  element: {
    addEventListener: (
      event: EventType,
      listener: (...eventArgs: any) => void,
      ...otherArgs: any
    ) => void;
    removeEventListener: (
      event: EventType,
      listener: (...eventArgs: any) => void,
      ...otherArgs: any
    ) => void;
  },
  event: EventType,
  listener: (event: EventType, removeListenerCallback: () => void) => void,
  ...configArgs: any
) {
  const eventWrapper = (...eventArgs: any) =>
    listener(eventArgs, () =>
      element.removeEventListener(event, eventWrapper, configArgs)
    );
  element.addEventListener(event, eventWrapper, configArgs);
}
