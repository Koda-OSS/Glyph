/**
 * Named errors for common GlyphTS failure modes.
 */

export class GlyphSizeMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GlyphSizeMismatchError";
  }
}

export class EmptyGroupError extends Error {
  constructor(message = "Cannot compare empty glyph groups") {
    super(message);
    this.name = "EmptyGroupError";
  }
}

export class InvalidSerializedGlyphError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSerializedGlyphError";
  }
}
