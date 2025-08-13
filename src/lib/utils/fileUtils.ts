/**
 * Removes invalid characters from a string to create a valid file name for S3.
 * @param fileName - The original file name.
 * @returns The sanitized file name.
 */
export function sanitizeFileName(fileName: string): string {
  // Define a regex to match invalid characters
  const invalidCharacters = /[\\{}^%~#[\]|<>"]/g;
  // Define a regex to match control characters
  const controlCharacters = /[\x00-\x1F\x7F]/g;

  // Remove invalid characters
  let sanitizedFileName = fileName.replace(invalidCharacters, '');

  // Remove control characters
  sanitizedFileName = sanitizedFileName.replace(controlCharacters, '');

  // Trim leading and trailing whitespace
  sanitizedFileName = sanitizedFileName.trim();

  // Ensure the file name length does not exceed 1024 bytes
  while (Buffer.byteLength(sanitizedFileName, 'utf8') > 1024) {
    sanitizedFileName = sanitizedFileName.slice(0, -1);
  }

  return sanitizedFileName;
}