// A reference string in Longrein prose is "file-like" when it names a file with
// an extension, optionally followed by a :line or :line-range suffix. Those can
// be opened in an editor. Identifiers (Class.method), rooted API paths
// (/v1/messages) and bare IDs (EVT-0002) are not files, so they parse to null
// and only offer "copy" — never a broken "open".
export interface ParsedReference {
  file: string;
  line: number | null;
}

const FILE_REFERENCE = /^([^\s:]+\.[A-Za-z]{1,6})(?::(\d+)(?:-\d+)?(?:,\s?\d+(?:-\d+)?)*)?$/;

export function parseReference(value: string): ParsedReference | null {
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return null;
  const match = FILE_REFERENCE.exec(trimmed);
  if (!match) return null;
  return { file: match[1], line: match[2] ? Number(match[2]) : null };
}
