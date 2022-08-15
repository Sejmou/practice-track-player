/**
 * When we want to forward a KeyboardEvent to another element, we cannot just call
 * dispatchEvent() on the other element with the same event. Instead we need to copy
 * the relevant props and dispatch manually.
 *
 * That's what this function does :)
 *
 * Note: the 'isTrusted' prop of the created KeyboardEvent will be false,
 * telling the browser that the KeyboardEvent was "artificially generated"
 * and not caused directly by a keypress. Might be a problem in some cases
 * (e.g. if existing event handlers check the isTrusted prop)
 *
 * See also: https://stackoverflow.com/a/54679215/13727176
 */
export function copyAndDispatchKeyboardEvent(
  event: KeyboardEvent,
  element: HTMLElement
) {
  const { key, shiftKey, altKey, metaKey, ctrlKey } = event;
  element.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      shiftKey,
      altKey,
      metaKey,
      ctrlKey,
    })
  );
}
