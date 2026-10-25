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
 * Insert a character at current cursor position in a textarea or input element
 */
export function insertCharToInput(inputElement, char, currentVal, onChange) {
  if (!inputElement) return;
  const start = inputElement.selectionStart ?? currentVal.length;
  const end = inputElement.selectionEnd ?? currentVal.length;

  const newVal = currentVal.substring(0, start) + char + currentVal.substring(end);
  onChange(newVal);

  setTimeout(() => {
    inputElement.focus();
    inputElement.setSelectionRange(start + char.length, start + char.length);
  }, 10);
}
