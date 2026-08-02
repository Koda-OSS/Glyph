import type { Glyph, GlyphRecord, GlyphSignature } from "../types";
import { isGlyph } from "./glyph";

const FORMAT_VERSION = 1;

/**
 * Serialize a glyph, signature, or record to a portable string.
 */
export function Serialize(
  value: Glyph | GlyphSignature | GlyphRecord,
): string {
  if (isGlyph(value)) {
    return `g${FORMAT_VERSION}.${encodeGlyph(value)}`;
  }

  if (isRecord(value)) {
    return `r${FORMAT_VERSION}.${value.version}.${value.createdAt}.${encodeGlyph(value.glyph)}`;
  }

  return `s${FORMAT_VERSION}.${value.version}.${encodeGlyph(value.glyph)}`;
}

/**
 * Deserialize a serialized string back into a glyph.
 */
export function Deserialize(value: string): Glyph {
  const parts = value.split(".");

  if (parts.length < 2) {
    throw new Error("Invalid serialized glyph: missing parts");
  }

  const kind = parts[0]!;
  const prefix = kind[0];
  const formatVersion = Number(kind.slice(1));

  if (formatVersion !== FORMAT_VERSION) {
    throw new Error(
      `Unsupported serialized glyph version: ${formatVersion}`,
    );
  }

  if (prefix === "g") {
    if (parts.length !== 2) {
      throw new Error("Invalid serialized glyph");
    }
    return decodeGlyph(parts[1]!);
  }

  if (prefix === "s") {
    if (parts.length !== 3) {
      throw new Error("Invalid serialized glyph signature");
    }
    return decodeGlyph(parts[2]!);
  }

  if (prefix === "r") {
    if (parts.length !== 4) {
      throw new Error("Invalid serialized glyph record");
    }
    return decodeGlyph(parts[3]!);
  }

  throw new Error(`Unknown serialized glyph kind: ${kind}`);
}

function isRecord(
  value: GlyphSignature | GlyphRecord,
): value is GlyphRecord {
  return "createdAt" in value;
}

function asGlyph(signature: Uint32Array): Glyph {
  return signature as Glyph;
}

function encodeGlyph(glyph: Glyph): string {
  const bytes = new Uint8Array(
    glyph.buffer,
    glyph.byteOffset,
    glyph.byteLength,
  );

  return Buffer.from(bytes).toString("base64url");
}

function decodeGlyph(encoded: string): Glyph {
  const bytes = Buffer.from(encoded, "base64url");

  if (bytes.byteLength === 0 || bytes.byteLength % 4 !== 0) {
    throw new Error("Invalid serialized glyph payload");
  }

  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);

  return asGlyph(new Uint32Array(copy.buffer));
}
