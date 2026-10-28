export const GERMAN_SPECIAL_CHARS = [
  { char: 'ä', label: 'ä' },
  { char: 'ö', label: 'ö' },
  { char: 'ü', label: 'ü' },
  { char: 'ß', label: 'ß' },
  { char: 'Ä', label: 'Ä' },
  { char: 'Ö', label: 'Ö' },
  { char: 'Ü', label: 'Ü' },
];

/**
 * Normalize German umlauts and eszett for flexible comparisons
 */
export function normalizeGerman(text = '') {
  return text
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/Ä/g, 'Ae')
    .replace(/Ö/g, 'Oe')
    .replace(/Ü/g, 'Ue');
}

/**
 * Insert a character at current cursor position (pure function or element helper)
 * @param {string|HTMLElement} textOrElement - Current text or textarea/input DOM element
 * @param {number|string} arg2 - Start cursor index (if pure function) OR char to insert (if DOM helper)
 * @param {number|string} arg3 - End cursor index (if pure function) OR currentVal (if DOM helper)
 * @param {string|Function} arg4 - Character to insert (if pure function) OR onChange callback (if DOM helper)
 * @returns {{ newText: string, newCursorPos: number }}
 */
export function insertCharToInput(textOrElement = '', arg2 = 0, arg3 = 0, arg4 = '') {
  // Case A: Pure function: insertCharToInput(currentText, start, end, char)
  if (typeof textOrElement === 'string' || textOrElement === null || textOrElement === undefined) {
    const text = String(textOrElement || '');
    const char = typeof arg4 === 'string' ? arg4 : '';
    const rawStart = typeof arg2 === 'number' ? arg2 : text.length;
    const rawEnd = typeof arg3 === 'number' ? arg3 : rawStart;

    const start = Math.max(0, Math.min(rawStart, text.length));
    const end = Math.max(start, Math.min(rawEnd, text.length));

    const newText = text.substring(0, start) + char + text.substring(end);
    const newCursorPos = start + char.length;
    return { newText, newCursorPos };
  }

  // Case B: DOM element helper: insertCharToInput(inputElement, char, currentVal, onChange)
  const inputElement = textOrElement;
  const char = typeof arg2 === 'string' ? arg2 : '';
  const currentVal = typeof arg3 === 'string' ? arg3 : (inputElement?.value || '');
  const onChange = typeof arg4 === 'function' ? arg4 : null;

  if (!inputElement) {
    return { newText: currentVal, newCursorPos: currentVal.length };
  }

  const start = inputElement.selectionStart ?? currentVal.length;
  const end = inputElement.selectionEnd ?? currentVal.length;
  const newVal = currentVal.substring(0, start) + char + currentVal.substring(end);
  const newCursorPos = start + char.length;

  if (onChange) onChange(newVal);

  setTimeout(() => {
    try {
      inputElement.focus();
      inputElement.setSelectionRange(newCursorPos, newCursorPos);
    } catch (e) {}
  }, 10);

  return { newText: newVal, newCursorPos };
}
