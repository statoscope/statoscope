/*
Get from https://github.com/discoveryjs/json-ext/blob/binary/src/binary.js
Thanks to @lahmatiy
*/

/* eslint-disable */
// @ts-nocheck

const MAX_INT_32 = 2147483647;
const MAX_UINT_32 = 4294967295;
const MAX_ADAPTIVE_8 = 0x7f;
const MAX_ADAPTIVE_16 = 0x3fff;
const MAX_ADAPTIVE_32 = 0x1ffffff;
const TYPE = Object.fromEntries([
  'END',
  'NULL',
  'TRUE',
  'FALSE',
  'STRING_EMPTY',
  'STRING',
  'STRING_REF',
  'INT_8',
  'INT_16',
  'INT_32',
  'INT_64',
  'UINT_8',
  'UINT_16',
  'UINT_32',
  'UINT_64',
  'FLOAT_32',
  'FLOAT_64',
  'OBJECT_EMPTY',
  'OBJECT',
  'OBJECT_REF',
  'OBJECT_ENTRY_REF',
  'ARRAY_EMPTY',
  'ARRAY_MIXED',
  'ARRAY_TYPED'
].map((t, idx) => [t, idx << 1]));
const TYPED_ARRAY_TYPE = new Set([
  'STRING',
  'INT_8',
  'INT_16',
  'INT_32',
  'UINT_8',
  'UINT_16',
  'UINT_32',
  'FLOAT_32',
  'FLOAT_64'
].map(t => TYPE[t]));
// const TYPE_NAME = Object.fromEntries(Object.entries(TYPE).map(([k, v]) => [v, k]));
const TEST_FLOAT_32 = new Float32Array(1);

function getType(value) {
  if (value === null || value === undefined) {
    return TYPE.NULL;
  }

  switch (typeof value) {
    case 'boolean':
      return value ? TYPE.TRUE : TYPE.FALSE;

    case 'string':
      return TYPE.STRING;

    case 'number':
      if (!Number.isFinite(value)) {
        return TYPE.NULL;
      }

      if (!Number.isInteger(value)) {
        TEST_FLOAT_32[0] = value;
        return TEST_FLOAT_32[0] === value ? TYPE.FLOAT_32 : TYPE.FLOAT_64;
      }

      if (value > 0) {
        if (value > MAX_UINT_32) {
          return TYPE.UINT_64;
        }

        if (value >> 8) {
          return value >> 16 ? TYPE.UINT_32 : TYPE.UINT_16;
        }

        return TYPE.UINT_8;
      }

      if (-value > MAX_INT_32) {
        return TYPE.INT_64;
      }

      if (-value >> 7) {
        return -value >> 15 ? TYPE.INT_32 : TYPE.INT_16;
      }

      return TYPE.INT_8;

    case 'object':
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return TYPE.ARRAY_EMPTY;
        }

        const elemType = getType(value[0]);

        if (!TYPED_ARRAY_TYPE.has(elemType)) {
          return TYPE.ARRAY_MIXED;
        }

        for (let i = 1; i < value.length; i++) {
          // TODO: determine when we can do an upgrade i.e. int_8 -> int_16 / int_32
          if (getType(value[i]) !== elemType) {
            return TYPE.ARRAY_MIXED;
          }
        }

        return TYPE.ARRAY_TYPED;
      }

      for (const key in value) {
        if (Object.hasOwnProperty.call(value, key)) {
          return TYPE.OBJECT;
        }
      }

      return TYPE.OBJECT_EMPTY;
  }
}

class Writer {
  constructor(chinkSize = 1 * 1024 * 1024 /* 1mb */) {
    this.chunks = [];
    this.totalSize = 0;
    this.stringEncoder = new TextEncoder();
    this.chunkSize = chinkSize;
    this.createChunk();
  }
  get value() {
    if (this.pos > 0) {
      this.flushChunk();
    }

    const resultBuff = new Uint8Array(this.totalSize);
    let pos = 0;

    for (const chunk of this.chunks) {
      resultBuff.set(chunk, pos);
      pos += chunk.length;
    }

    this.chunks = [];
    this.totalSize = 0;
    this.createChunk();

    return resultBuff;
  }
  createChunk() {
    this.bytes = new Uint8Array(this.chunkSize);
    this.view = new DataView(this.bytes.buffer);
    this.pos = 0;
  }
  flushChunk() {
    this.chunks.push(this.bytes.subarray(0, this.pos));
    this.totalSize += this.pos;
  }
  ensureCapacity(bytes) {
    if (this.pos + bytes > this.bytes.length) {
      this.flushChunk();
      this.createChunk();
    }
  }
  writeAdaptiveNumber(num) {
    //  8: num << 1 |   0  –  7 bits data | xxxx xxx0
    // 16: num << 2 |  01  - 14 bits data | xxxx xxxx xxxx xx01
    // 32: num << 3 | 011  – 29 bits data | xxxx xxxx xxxx xxxx xxxx xxxx xxxx x011
    // 64: num << 3 | 111  – 61 bits data | xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx x111
    if (num <= MAX_ADAPTIVE_8) {
      this.writeUint8(num << 1  | 0b0000);
    } else if (num <= MAX_ADAPTIVE_16) {
      this.writeUint16(num << 2 | 0b0001, true);
    } else if (num <= MAX_ADAPTIVE_32) {
      this.writeUint32(num << 3 | 0b0011, true);
    } else {
      this.writeBigUint64((BigInt(num) << 3) | 0b0111, true);
    }
  }
  writeType(type) {
    this.writeUint8(type << 1);
  }
  writeReference(ref) {
    this.writeAdaptiveNumber(ref << 1 | 1);
  }
  writeString(str) {
    const strBuffer = this.stringEncoder.encode(str);

    this.writeAdaptiveNumber(strBuffer.length << 1);

    this.ensureCapacity(strBuffer.length);
    this.bytes.set(strBuffer, this.pos);
    this.pos += strBuffer.length;
  }
  writeInt8(value) {
    this.ensureCapacity(1);
    this.view.setInt8(this.pos, value);
    this.pos += 1;
  }
  writeInt16(value, littleEndian) {
    this.ensureCapacity(2);
    this.view.setInt16(this.pos, value, littleEndian);
    this.pos += 2;
  }
  writeInt32(value, littleEndian) {
    this.ensureCapacity(4);
    this.view.setInt32(this.pos, value, littleEndian);
    this.pos += 4;
  }
  writeBigInt64(value, littleEndian) {
    this.ensureCapacity(8);
    this.view.setBigInt64(this.pos, BigInt(value), littleEndian);
    this.pos += 8;
  }
  writeUint8(value) {
    this.ensureCapacity(1);
    this.view.setUint8(this.pos, value);
    this.pos += 1;
  }
  writeUint16(value, littleEndian) {
    this.ensureCapacity(2);
    this.view.setUint16(this.pos, value, littleEndian);
    this.pos += 2;
  }
  writeUint32(value, littleEndian) {
    this.ensureCapacity(4);
    this.view.setUint32(this.pos, value, littleEndian);
    this.pos += 4;
  }
  writeBigUint64(value, littleEndian) {
    this.ensureCapacity(8);
    this.view.setBigUint64(this.pos, BigInt(value), littleEndian);
    this.pos += 8;
  }
  writeFloat32(value, littleEndian) {
    this.ensureCapacity(4);
    this.view.setFloat32(this.pos, value, littleEndian);
    this.pos += 4;
  }
  writeFloat64(value, littleEndian) {
    this.ensureCapacity(8);
    this.view.setFloat64(this.pos, value, littleEndian);
    this.pos += 8;
  }
}

export function encode(rootValue) {
  function writeValue(type, value) {
    switch (type) {
      case TYPE.STRING:
        if (defs.has(value)) {
          writer.writeReference(defs.get(value).get(0));
        } else {
          defs.set(value, new Map([[0, defCount++]]));
          writer.writeString(value);
        }
        break;

      case TYPE.INT_8:
        writer.writeInt8(value);
        break;

      case TYPE.INT_16:
        writer.writeInt16(value);
        break;

      case TYPE.INT_32:
        writer.writeInt32(value);
        break;

      case TYPE.INT_64:
        writer.writeBigInt64(BigInt(value));
        break;

      case TYPE.UINT_8:
        writer.writeUint8(value);
        break;

      case TYPE.UINT_16:
        writer.writeUint16(value);
        break;

      case TYPE.UINT_32:
        writer.writeUint32(value);
        break;

      case TYPE.UINT_64:
        writer.writeBigUint64(BigInt(value));
        break;

      case TYPE.FLOAT_32:
        writer.writeFloat32(value);
        break;

      case TYPE.FLOAT_64:
        writer.writeFloat64(value);
        break;

      case TYPE.OBJECT:
        for (const key in value) {
          if (Object.hasOwnProperty.call(value, key)) {
            const type = getType(value[key]);

            if (defs.has(key) && defs.get(key).has(type)) {
              // ref
              writer.writeReference(defs.get(key).get(type));
            } else {
              write(key);
              defs.get(key).set(type, defCount++);
              writer.writeType(type);
            }

            writeValue(type, value[key]);
          }
        }

        writer.writeType(TYPE.END);
        break;

      case TYPE.ARRAY_TYPED:
        const elemType = getType(value[0]);

        writer.writeType(elemType);
        writer.writeAdaptiveNumber(value.length, 1);

        for (const elem of value) {
          writeValue(elemType, elem);
        }
        break;

      case TYPE.ARRAY_MIXED:
        for (const elem of value) {
          write(elem);
        }

        writer.writeType(TYPE.END);
        break;
    }
  }

  function write(value) {
    const type = getType(value);

    writer.writeType(type);
    writeValue(type, value);
  }

  const writer = new Writer();
  const defs = new Map();
  let defCount = 0;

  write(rootValue);

  return writer.value;
}

export function decode(bytes) {
  function readAdaptiveNumber() {
    let num = view.getUint8(pos);

    if ((num & 0x01) === 0) {
      num = num >> 1;
      pos += 1;
    } else if ((num & 0x02) === 0) {
      num = view.getUint16(pos, true) >> 2;
      pos += 2;
    } else if ((num & 0x04) === 0) {
      num = view.getUint32(pos, true) >> 3;
      pos += 4;
    } else {
      num = Number(view.getBigInt64(pos, true) >> 3n);
      pos += 8;
    }

    return num;
  }

  function readType() {
    return readAdaptiveNumber();
  }

  function readValue(type) {
    if (type & 1) {
      return defs[type >> 1];
    }

    switch (type) {
      case TYPE.NULL:
        return null;

      case TYPE.TRUE:
        return true;

      case TYPE.FALSE:
        return false;

      case TYPE.STRING: {
        const num = readAdaptiveNumber();
        const isReference = num & 1;

        if (isReference) {
          // reference
          const ref = num >> 1;
          return defs[ref];
        }

        // definition
        const len = num >> 1;
        const value = stringDecoder.decode(bytes.buffer.slice(pos, pos + len));

        pos += len;
        defs.push(value);

        return value;
      }

      case TYPE.INT_8: {
        const value = view.getInt8(pos);
        pos += 1;
        return value;
      }

      case TYPE.INT_16: {
        const value = view.getInt16(pos);
        pos += 2;
        return value;
      }

      case TYPE.INT_32: {
        const value = view.getInt32(pos);
        pos += 4;
        return value;
      }

      case TYPE.INT_64: {
        const value = Number(view.getBigInt64(pos));
        pos += 8;
        return value;
      }

      case TYPE.UINT_8: {
        const value = view.getUint8(pos);
        pos += 1;
        return value;
      }

      case TYPE.UINT_16: {
        const value = view.getUint16(pos);
        pos += 2;
        return value;
      }

      case TYPE.UINT_32: {
        const value = view.getUint32(pos);
        pos += 4;
        return value;
      }

      case TYPE.UINT_64: {
        const value = Number(view.getBigUint64(pos));
        pos += 8;
        return value;
      }

      case TYPE.FLOAT_32: {
        const value = view.getFloat32(pos);
        pos += 4;
        return value;
      }

      case TYPE.FLOAT_64: {
        const value = view.getFloat64(pos);
        pos += 8;
        return value;
      }

      case TYPE.OBJECT_EMPTY:
        return {};

      case TYPE.OBJECT: {
        const value = {};

        while (bytes[pos] !== TYPE.END) {
          const type = readAdaptiveNumber();

          if (type & 1) {
            // reference
            const [key, entryType] = defs[type >> 1];
            value[key] = readValue(entryType);
          } else {
            // definition
            const key = readValue(type);
            const entryType = readType();

            defs.push([key, entryType]);
            value[key] = readValue(entryType);
          }
        }

        pos++;

        return value;
      }

      case TYPE.ARRAY_EMPTY:
        return [];

      case TYPE.ARRAY_TYPED: {
        const elemType = readType();
        const len = readAdaptiveNumber();
        const value = [];

        for (let i = 0; i < len; i++) {
          value.push(readValue(elemType));
        }

        return value;
      }

      case TYPE.ARRAY_MIXED: {
        const value = [];

        while (bytes[pos] !== TYPE.END) {
          value.push(readValue(readType()));
        }

        pos++;

        return value;
      }
    }
  }

  const stringDecoder = new TextDecoder();
  const view = new DataView(bytes.buffer);
  const defs = [];
  let pos = 0;

  return readValue(readType());
}
