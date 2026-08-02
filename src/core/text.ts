const FILTER_REGEX = /[^a-z0-9!@#$%^&*()_\-+=~`<>,.?/"':;}{\[\] ]/g;
const STRIP_REGEX = /[^a-z0-9]/g;

export function TextFilter(text: string): string {
  return text.toLowerCase().replace(FILTER_REGEX, "");
}

export function TextStrip(text: string): string {
  return TextFilter(text).replace(STRIP_REGEX, "");
}
