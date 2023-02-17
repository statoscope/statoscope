/*
Get from https://github.com/discoveryjs/json-ext/blob/binary/src/binary.js
Thanks to @lahmatiy
*/

/* eslint-disable */
// @ts-nocheck

const hasOwnProperty = Object.hasOwnProperty;
const MAX_UINT_8  = 0x0000_00ff;
const MAX_UINT_16 = 0x0000_ffff;
const MAX_UINT_24 = 0x00ff_ffff;
const MAX_UINT_28 = 0x0fff_ffff;
const MAX_UINT_32 = 0xffff_ffff;
const MAX_VLQ_8   = 0x0000_007f;
const MAX_VLQ_16  = 0x0000_3fff;
const MAX_VLQ_24  = 0x001f_ffff;

const ARRAY_ENCODING_DEFAULT = 0;
const ARRAY_ENCODING_VLQ2 = 1;
const ARRAY_ENCODING_SINGLE_VALUE = 2;
const ARRAY_ENCODING_ENUM = 3;

// 1st byte of type bitmap (most common types)
const TYPE_TRUE = 0;         // value-containing type
const TYPE_FALSE = 1;        // value-containing type
const TYPE_STRING = 2;
const TYPE_UINT_8 = 3;       // [0 ... 255 (0xff)]
const TYPE_UINT_16 = 4;      // [0 ... 65535 (0xffff)]
const TYPE_UINT_24 = 5;      // [0 ... 16777215 (0xff_ffff)]
const TYPE_UINT_32 = 6;      // [0 ... 4294967295 (0xffff_ffff)]
const TYPE_UINT_32_VAR = 7;  // [4294967296 ... ]
// 2nd byte of type bitmap
const TYPE_NEG_INT = 8;
const TYPE_FLOAT_32 = 9;
const TYPE_FLOAT_64 = 10;
const TYPE_OBJECT = 11;
const TYPE_ARRAY = 12;
const TYPE_NULL = 13;        // value-containing type
// type 14 is reserved
// type 15 is reserved
// array non-storable types (out of 2-bytes type bitmap)
const TYPE_UNDEF = 16;       // array non-storable & value-containing type

const STORABLE_TYPES = 0xffff;
const VALUE_CONTAINING_TYPE =
  (1 << TYPE_TRUE) |
  (1 << TYPE_FALSE) |
  (1 << TYPE_NULL) |
  (1 << TYPE_UNDEF);
const ARRAY_NON_WRITABLE_TYPE =
  VALUE_CONTAINING_TYPE |
  (1 << TYPE_OBJECT);

const TEST_FLOAT_32 = new Float32Array(1);
const EMPTY_MAP = new Map();
const LOW_BITS_TYPE = 0;
const LOW_BITS_FLAGS = 1;
const MIN_CHUNK_SIZE = 8;
const DEFAULT_CHUNK_SIZE = 64 * 1024;
const typeIndex = new Uint8Array(32);

// vlq4
// ----
// encode a number up to uint29, effective for a seria of numbers
// .... .... | .... .... | .... .... | .... !xxx
// lower 3bits are used to encode number of 4-bits groups needed to encode a number (0 - 4bits (0 or 1), 1 - 12bits ...)
//
// vlq4_36
// ----
// encode a number up to uint33, effective for a seria of numbers
// .... | .... .... | .... .... | .... .... | !!!! !xxx
// lower 3bits are used to encode number of 4-bits groups needed to encode a number (0 - 8bits, 1 - 12bits, ...)
//
// vlq4_24
// -------
// encode a number up to uint21 (+uint7), effective for a seria of numbers
// !!!! !!!0
// uint7 (0...127, 1 byte)
// .... .... | .... !!!! | !!!! !xx1
// uint8-uint21 (128...2_097_279, 1-3bytes, step 4bits)
//
// vlq4_16x2
// -------
// encode a number up to uint31 (+uint7 +uint17), effective for a seria of ...
// !!!! !!!0
// uint7 (0...127, 1 byte)
// .... | .... !!!! | !!!! !xx1
// uint8-uint21 (128...131_199, 1-2.5bytes, step 4bits)
// .... | .... .... | !!!! !!!! | !!!! !!!! | !!!x x111
// uint8-uint21 (131_200...2_147_614_847, 3-5.5bytes, step 4bits)
//
// vlq4_16x2_3
// -------
// encode a number up to uint27 (+uint3 +uint13), effective for a seria of ...
// !!!0
// uint7 (0...7, 0.5 byte)
// .... .... | !!!! !xx1
// uint8-uint21 (8...8_199, 1-2bytes, step 4bits)
// .... .... | .... !!!! | !!!! !!!! | !!!x x111
// uint8-uint21 (8_200...134_225_927, 2.5-4bytes, step 4bits)
//
// vlq8_4
// -------
// encode a number up to uint30, effective for a seria of numbers when uint17+ are dominates
// .... .... | .... .... | .... .... | !!!! !!xx
// uint8-uint21 (0...1_073_741_823, 1-4bytes, step 8bits)
//
// vlq8_small_big
// --------------
// encode a number up to uint37, good for a seria of numbers when most numbers are uint7 and uint32+
// !!!! !!!0
// uint7 (0...127, 1 byte)
// .... .... | .... .... | .... .... | !!!! !!!! | !!!! !xx1
// uint8-uint37 (0...137_438_953_471, 2-5bytes, step 8bits)
//
// vlq8_32
// --------------
// encode a number up to uint62, good to encode big numbers
// .... .... | .... .... | .... .... | !!!! !!!! | !!!! !!!! | !!!! !!!! | !!!! !!!! | !!!! !!xx
// (5-8bytes, step 8bits)

// const TYPE_NAME = Object.fromEntries(Object.entries({
//     TYPE_TRUE, TYPE_FALSE,
//     TYPE_STRING,
//     TYPE_UINT_8, TYPE_UINT_16, TYPE_UINT_24, TYPE_UINT_32,
//     TYPE_UINT_32_VAR, TYPE_NEG_INT,
//     TYPE_FLOAT_32, TYPE_FLOAT_64,
//     TYPE_OBJECT,
//     TYPE_ARRAY,
//     TYPE_NULL,
//     TYPE_UNDEF,
//     INLINED: 18,
//     COLUMN: 19
// }).map(([k, v]) => [v, k]));

function getType(value) {
  switch (typeof value) {
    case 'undefined':
      return TYPE_UNDEF;

    case 'boolean':
      return value ? TYPE_TRUE : TYPE_FALSE;

    case 'string':
      return TYPE_STRING;

    case 'number':
      if (!Number.isFinite(value)) {
        return TYPE_NULL;
      }

      if (!Number.isInteger(value)) {
        TEST_FLOAT_32[0] = value;
        return TEST_FLOAT_32[0] === value ? TYPE_FLOAT_32 : TYPE_FLOAT_64;
      }

      if (value < 0) {
        return TYPE_NEG_INT;
      }

      // The return expression is written so that only 2 or 3 comparisons
      // are needed to choose a type
      return (
        value > MAX_UINT_16
          ? value > MAX_UINT_24
            ? value > MAX_UINT_32
              ? TYPE_UINT_32_VAR
              : TYPE_UINT_32
            : TYPE_UINT_24
          : value > MAX_UINT_8
            ? TYPE_UINT_16
            : TYPE_UINT_8
      );

    case 'object':
      return Array.isArray(value)
        ? TYPE_ARRAY
        : value !== null
          ? TYPE_OBJECT
          : TYPE_NULL;
  }
}

class Writer {
  constructor(chunkSize = DEFAULT_CHUNK_SIZE) {
    this.chunks = [];
    this.stringEncoder = new TextEncoder();
    this.chunkSize = chunkSize > MIN_CHUNK_SIZE ? chunkSize : MIN_CHUNK_SIZE;
    this.createChunk();
  }
  get value() {
    this.flushChunk();

    const resultBuffer = Buffer.concat(this.chunks);
    this.chunks = null;

    return resultBuffer;
  }
  createChunk() {
    this.bytes = new Uint8Array(this.chunkSize);
    this.view = new DataView(this.bytes.buffer);
    this.pos = 0;
  }
  flushChunk() {
    this.chunks.push(this.bytes.subarray(0, this.pos));
    this.bytes = this.view = null;
    this.pos = 0;
  }
  ensureCapacity(bytes) {
    if (this.pos + bytes > this.bytes.length) {
      this.flushChunk();
      this.createChunk();
    }
  }
  writeVlq(num) {
    //   8: num << 1 |   0  –   7 bits data | xxxx xxx0
    //  16: num << 2 |  01  -  14 bits data | xxxx xx01 xxxx xxxx
    //  24: num << 3 | 011  –  21 bits data | xxxx x011 xxxx xxxx xxxx xxxx
    // 24+: num << 3 | 111  – 28+ bits data | xxxx x111 xxxx xxxx xxxx xxxx 0xxx xxxx
    //                                      | xxxx x111 xxxx xxxx xxxx xxxx 1xxx xxxx var
    if (num <= MAX_VLQ_8) {
      this.writeUint8(num << 1  | 0b0000);
    } else if (num <= MAX_VLQ_16) {
      this.writeUint16(num << 2 | 0b0001);
    } else if (num <= MAX_VLQ_24) {
      this.writeUint24(num << 3 | 0b0011);
    } else {
      const lowBits = num & MAX_UINT_28;

      this.writeUint32(((num > lowBits) << 31) | (lowBits << 3) | 0b0111);

      if (num > lowBits) {
        this.writeUintVar((num - lowBits) / (1 << 29));
      }
    }
  }
  writeReference(ref) {
    this.writeVlq((ref << 1) | 1);
  }
  writeString(str, shift = 1) {
    this.writeVlq(Buffer.byteLength(str) << shift);

    let strPos = 0;
    while (strPos < str.length) {
      const { read, written } = this.stringEncoder.encodeInto(
        strPos > 0 ? str.slice(strPos) : str,
        this.pos > 0 ? this.bytes.subarray(this.pos) : this.bytes
      );

      strPos += read;
      this.pos += written;

      if (strPos < str.length) {
        this.flushChunk();
        this.createChunk();
      } else {
        break;
      }
    }
  }
  writeTypeIndex(types, bitmap) {
    let typeIdx = 0;
    let typeCount = 0;

    while (bitmap > 0) {
      if (bitmap & 1) {
        typeIndex[typeIdx] = typeCount++;
      }

      typeIdx++;
      bitmap >>= 1;
    }

    const bitsPerType = 32 - Math.clz32(typeCount - 1);
    let shift = 0;
    let chunk = 0;

    for (let i = 0; i < types.length; i++) {
      chunk |= typeIndex[types[i]] << shift;
      shift += bitsPerType;

      if (shift >= 8) {
        this.writeUint8(chunk);
        shift -= 8;
        chunk >>= 8;
      }
    }

    if (shift > 0) {
      this.writeUint8(chunk);
    }
  }
  writeUint8(value) {
    this.ensureCapacity(1);
    this.view.setUint8(this.pos, value);
    this.pos += 1;
  }
  writeUint16(value) {
    this.ensureCapacity(2);
    this.view.setUint16(this.pos, value, true);
    this.pos += 2;
  }
  writeUint24(value) {
    this.ensureCapacity(3);
    this.view.setUint16(this.pos, value, true);
    this.view.setUint8(this.pos + 2, value >> 16);
    this.pos += 3;
  }
  writeUint32(value) {
    this.ensureCapacity(4);
    this.view.setUint32(this.pos, value, true);
    this.pos += 4;
  }
  writeUint64(value) {
    this.ensureCapacity(8);
    this.view.setBigUint64(this.pos, BigInt(value), true);
    this.pos += 8;
  }
  // The number is stored byte by byte, using 7 bits of each byte
  // to store the number bits and 1 continuation bit
  writeUintVar(value) {
    if (value === 0) {
      return this.writeUint8(0);
    }

    let bytesNeeded = 0;
    let n = value;

    while (n > 0) {
      bytesNeeded += n <= MAX_UINT_28 // 28bits
        ? Math.ceil((32 - Math.clz32(n)) / 7)
        : 4;

      n = (n - (n & MAX_UINT_28)) / 0x10000000;
    }

    this.ensureCapacity(bytesNeeded);
    for (let i = 0; i < bytesNeeded - 1; i++) {
      this.view.setUint8(this.pos++, 0x80 | (value & 0x7f));

      value = value > MAX_UINT_32
        ? (value - (value & 0x7f)) / 0x80
        : value >>> 7;
    }

    this.view.setUint8(this.pos++, value & 0x7f);
  }
  writeFloat32(value) {
    this.ensureCapacity(4);
    this.view.setFloat32(this.pos, value);
    this.pos += 4;
  }
  writeFloat64(value) {
    this.ensureCapacity(8);
    this.view.setFloat64(this.pos, value);
    this.pos += 8;
  }
  get written() {
    return this.chunks.reduce((s, c) => s + c.byteLength, 0) + this.pos;
  }
}

function encode(input, options = {}) {
  function findCommonSubstring(prev, value) {
    const maxLength = Math.max(prev.length, value.length);

    if (maxLength > 4) {
      for (let i = 0; i < maxLength; i++) {
        if (prev[i] !== value[i]) {
          if (i > 4) {
            return i;
          }
          break;
        }
      }
    }

    return 0;
  }

  function writeStringReference(str) {
    const ref = strings.get(str);

    if (ref !== undefined) {
      writer.writeReference(ref);

      return true;
    }

    return false;
  }

  function writeString(value) {
    if (value === '') {
      writer.writeReference(0); // empty string reference
      return;
    }

    if (!writeStringReference(value)) {
      const prevStringCommonLength = findCommonSubstring(prevString, value);

      if (prevStringCommonLength > 0) {
        writer.writeUint8(0);
        writer.writeVlq(prevStringCommonLength);
        writer.writeString(value.slice(prevStringCommonLength), 0);
      } else {
        writer.writeString(value);
      }

      strings.set(value, stringIdx++);
      prevString = value;
    }
  }

  function writeObject(object, ignoreFields = EMPTY_MAP) {
    let entryIdx = 0;

    for (const key in object) {
      if (hasOwnProperty.call(object, key) && !ignoreFields.has(key)) {
        const entryValue = object[key];

        if (entryValue === undefined) {
          continue;
        }

        const entryType = getType(entryValue);
        let keyId = objectKeys.get(key);

        if (keyId === undefined) {
          objectKeys.set(key, keyId = objectKeys.size);
        }

        if (entryIdx >= objectEntryDefs.length) {
          objectEntryDefs[entryIdx] = new Map();
        }

        const defId = (keyId << 4) | entryType;
        const refId = objectEntryDefs[entryIdx].get(defId);

        if (refId !== undefined) {
          // def reference
          writer.writeReference(refId);
        } else {
          writer.writeVlq(2);
          writeString(key);
          writer.writeUint8(entryType);
          objectEntryDefs[entryIdx].set(defId, objectEntryDefs[entryIdx].size);
        }

        x(entryType, object[key]);
        entryIdx++;
      }
    }

    writer.writeUint8(0);
  }

  function arrayTypeCount(elemTypes, type) {
    let count = 0;

    for (let i = 0; i < elemTypes.length; i++) {
      if (elemTypes[i] === type) {
        count++;
      }
    }

    return count;
  }

  function collectArrayObjectInfo(array, elemTypes, typeBitmap) {
    let hasInlinedObjectKeys = false;
    let objectKeyColumns = EMPTY_MAP;

    if (typeBitmap & (1 << TYPE_OBJECT)) {
      hasInlinedObjectKeys = true;

      // count objects
      let objectCount = typeBitmap === (1 << TYPE_OBJECT)
        ? array.length // when TYPE_OBJECT is a single type in an array
        : arrayTypeCount(elemTypes, TYPE_OBJECT);

      if (objectCount > 1) {
        hasInlinedObjectKeys = false;
        objectKeyColumns = new Map();

        // collect a condidate keys for a column representation
        for (let i = 0, objIdx = 0; i < elemTypes.length; i++) {
          if (elemTypes[i] === TYPE_OBJECT) {
            const object = array[i];

            for (const key of Object.keys(object)) {
              const value = object[key];

              if (value === undefined) {
                continue;
              }

              let column = objectKeyColumns.get(key);
              const valueType = getType(value);
              const valueTypeBit = 1 << valueType;

              if (column === undefined) {
                column = {
                  key,
                  values: new Array(objectCount),
                  types: new Uint8Array(objectCount).fill(TYPE_UNDEF),
                  typeBitmap: 0,
                  typeCount: 0,
                  valueCount: 0,
                  valueContainedCount: 0
                };
                objectKeyColumns.set(key, column);
              }

              if ((column.typeBitmap & valueTypeBit) === 0) {
                column.typeBitmap |= valueTypeBit;
                column.typeCount++;
              }

              column.values[objIdx] = value;
              column.types[objIdx] = valueType;
              column.valueCount++;

              if (valueTypeBit & VALUE_CONTAINING_TYPE) {
                column.valueContainedCount++;
              }
            }

            objIdx++;
          }
        }

        // exclude keys for which the column representation is not byte efficient
        for (const column of objectKeyColumns.values()) {
          const hasUndef = column.valueCount !== array.length;
          const typeCount = column.typeCount + hasUndef;

          if (typeCount > 1) {
            const bitsPerType = 32 - Math.clz32(typeCount - 1);
            const typeBitmapIndexSize = Math.ceil((bitsPerType * array.length) / 8);

            const valueCount = column.valueCount - column.valueContainedCount;
            const columnSize =
              1 + /* min key reprentation size */
              1 + /* min array header size */
              typeBitmapIndexSize +
              valueCount;
            const rawObjectSize = column.valueCount * (1 + !hasInlinedObjectKeys) + valueCount;

            if (columnSize <= rawObjectSize) {
              // use column representation
              if (hasUndef) {
                column.typeBitmap |= 1 << TYPE_UNDEF;
                column.typeCount++;
              }
            } else {
              // drop
              hasInlinedObjectKeys = true;
              objectKeyColumns.delete(column.key);
            }
          }
        }
      }
    }

    return {
      objectKeyColumns,
      hasInlinedObjectKeys
    };
  }

  function writeArray(array, column = null) {
    // an empty array
    if (array.length === 0) {
      writer.writeUint8(0);
      return;
    }

    // collect array element types
    let elemTypes = null;
    let typeBitmap = 0;
    let typeCount = 0;
    let encoding = ARRAY_ENCODING_DEFAULT;
    let values = null;

    if (column !== null) {
      elemTypes = column.types;
      typeBitmap = column.typeBitmap;
      typeCount = column.typeCount;
    } else {
      elemTypes = new Uint8Array(array.length);
      for (let i = 0; i < array.length; i++) {
        const elem = array[i];
        const elemType = elem === undefined
          ? TYPE_NULL
          : getType(elem);
        const elemTypeBit = 1 << elemType;

        elemTypes[i] = elemType;

        if ((typeBitmap & elemTypeBit) === 0) {
          typeCount++;
          typeBitmap |= elemTypeBit;
        }
      }
    }

    // try to apply column representation for objects
    const {
      objectKeyColumns,
      hasInlinedObjectKeys
    } = collectArrayObjectInfo(array, elemTypes, typeBitmap);

    // array header prelude (1 byte)
    // =====================
    //
    //  [vlq((len << 2) | encoding)] [header-prelude]? [type-list | type-bitmap]? [encoding-params]?
    //   ─┬────────────────────────   ─┬────────────    ─┬─────────────────────    ─┬─────────────
    //    └ 1-9 bytes                  └ 1 byte          └ 1-2 bytes                └ 1 byte
    //
    // Encoding:
    //
    //   7 65 4 3210
    //   ─ ── ─ ────
    //   a bb c dddd
    //   ┬ ─┬ ┬ ─┬──
    //   │  │ │  └ lowBitsType (lowBitsKind=0) or lowBitsFlags (lowBitsKind=1)
    //   │  │ └ lowBitsKind
    //   │  └ extraTypesBits
    //   └ hasUndef
    //
    // (b) extraTypesBits:
    //   00 – no extra bytes
    //   01 – list of types (1 byte = 2 types)
    //   10 – bitmap 1 byte
    //   11 – bitmap 2 bytes
    //
    // (c) lowBitsKind:
    //   0 – type (highest bit in typeBitmap)
    //   1 – flags
    //
    // (d) lowBitsFlags:
    //   x xx 1 e f g h
    //          ┬ ┬ ┬ ┬
    //          │ │ │ └ hasNulls (TYPE_NULL is used, omitted in a type list/bitmap)
    //          │ │ └ encodedArrays (TYPE_ARRAY is used, omitted in a type list/bitmap)
    //          │ └ hasObjectInlineKeys (TYPE_OBJECT is used, omitted in a type list/bitmap)
    //          └ hasObjectColumnKeys (TYPE_OBJECT is used, omitted in a type list/bitmap)
    //
    // special cases:
    //   1) 0 xx 0 xxxx
    //             ─┬──
    //              └ TYPE_OBJECT or TYPE_NULL or TYPE_ARRAY? - can be reserved for a special cases
    //                since having these types can be represented with "0 00 1 flags" notation
    //                - TYPE_NULL - ARRAY_ENCODING_VLQ2
    //                - TYPE_OBJECT - other encodings
    //
    //   2) 0 01 0 xxxx
    //        ┬─   ─┬──
    //        │     └ type0
    //        └ 1 extra byte for 1-2 extra types:
    //            1 type  -> type byte: type1 | type1
    //            2 types -> type byte: type2 | type1
    //
    //   3) 0 01 1 xxxx
    //        ┬─   ─┬──
    //        │     └ flags
    //        └ 1 extra byte for 1-2 types:
    //            1 type  -> type byte: type0 | type0
    //            2 types -> type byte: type1 | type0
    //
    const hasUndef = (typeBitmap >> TYPE_UNDEF) & 1;
    const hasNulls = (typeBitmap >> TYPE_NULL) & 1;
    const hasArrays = (typeBitmap >> TYPE_ARRAY) & 1;
    const hasObjectColumnKeys = objectKeyColumns.size !== 0;
    const lowBitsFlags =
      (hasObjectColumnKeys << 3) |
      (hasInlinedObjectKeys << 2) |
      (hasArrays << 1) |
      (hasNulls << 0);
    const lowBitsKind = lowBitsFlags !== 0 || (typeCount === 1 && hasUndef) // has any flag or all elements are undefined (an object key column)
      ? LOW_BITS_FLAGS // flags
      : LOW_BITS_TYPE; // type
    const lowBitsType = lowBitsKind === LOW_BITS_TYPE
      ? encoding === ARRAY_ENCODING_DEFAULT
        ? 31 - Math.clz32(typeBitmap & STORABLE_TYPES)
        : TYPE_NULL // special case
      : 0;
    const headerTypeBitmap =
      typeBitmap & (STORABLE_TYPES ^ // switch off type bits used in lowBitsFlags
        (lowBitsKind === LOW_BITS_TYPE ? 1 << lowBitsType : 0) ^
        ((hasObjectColumnKeys || hasInlinedObjectKeys) << TYPE_OBJECT) ^
        (hasArrays << TYPE_ARRAY) ^
        (hasNulls << TYPE_NULL)
      );
    const extraTypeCount = typeCount - hasUndef - (
      lowBitsKind === LOW_BITS_TYPE
        ? 1
        : (hasObjectColumnKeys || hasInlinedObjectKeys) + hasArrays + hasNulls
    );
    const extraTypesBits =
      extraTypeCount <= 0
        ? 0b00 // no extra bytes
        : extraTypeCount <= 2
          ? 0b01 // list of types, 1 byte for extra 1-2 types
          : headerTypeBitmap <= 0xff
            ? 0b10  // bitmap, 1 byte
            : 0b11; // bitmap, 2 bytes

    // write header
    const header =
      // a
      (hasUndef << 7) |
      // bb
      (extraTypesBits << 5) |
      // c
      (lowBitsKind << 4) |
      // dddd
      (lowBitsKind === LOW_BITS_TYPE ? lowBitsType : lowBitsFlags);

    if (column === null) {
      writer.writeVlq(array.length);
    }

    writer.writeUint8(header);

    // console.log(
    //     'header:', header.toString(2).padStart(8, 0),
    //     'typeBitmap:', typeBitmap.toString(2).padStart(8, 0),
    //     'headerTypeBitmap:', headerTypeBitmap.toString(2).padStart(8, 0),
    //     'columns:', [...objectColumnKeys.keys()],
    //     value
    // );

    // extra types
    switch (extraTypesBits) {
      case 0b01: {
        const type1 = 31 - Math.clz32(headerTypeBitmap);
        const type2 = 31 - Math.clz32(headerTypeBitmap ^ (1 << type1));

        writer.writeUint8(
          type2 === -1
            ? (type1 << 4) | type1
            : (type2 << 4) | type1
        );

        break;
      }

      case 0b10:
        writer.writeUint8(headerTypeBitmap);
        break;

      case 0b11:
        writer.writeUint16(headerTypeBitmap);
        break;
    }

    switch (encoding) {
      case ARRAY_ENCODING_SINGLE_VALUE:
        writer.writeUint8(elemTypes[0]);
        x(elemTypes[0], array[0]);
        break;

      case ARRAY_ENCODING_ENUM: {
        const map = new Map();

        if (typeBitmap & (1 << TYPE_TRUE)) {
          map.set(true, map.size);
        }
        if (typeBitmap & (1 << TYPE_FALSE)) {
          map.set(false, map.size);
        }
        if (typeBitmap & (1 << TYPE_NULL)) {
          map.set(null, map.size);
        }
        if (typeBitmap & (1 << TYPE_UNDEF)) {
          map.set(undefined, map.size);
        }
        for (const val of values) {
          map.set(val, map.size);
        }

        const bitsPerValue = 32 - Math.clz32((values.size + typeCount) - 1);
        let shift = 0;
        let chunk = 0;

        for (let i = 0, maxRef = map.size - values.size; i < array.length; i++) {
          let x = map.get(array[i]);

          if (x > maxRef) {
            maxRef++;
            x = getType(array[i]);
          }

          chunk |= x << shift;
          shift += bitsPerValue;

          if (shift >= 8) {
            writer.writeUint8(chunk);
            shift -= 8;
            chunk >>= 8;
          }
        }

        if (shift > 0) {
          writer.writeUint8(chunk);
        }

        for (const val of values) {
          x(getType(val), val);
        }
        break;
      }

      case ARRAY_ENCODING_VLQ2:
        // const t = performance.now();
        // write index
        for (let i = 0; i < array.length; i += 2) {
          writer.writeUint8(
            (array[i] > 0x07 ? 0x08 : 0x00) | (array[i] & 0x07) |
            (array[i + 1] > 0x07 ? 0x80 : 0x00) | ((array[i + 1] & 0x07) << 4)
          );
        }

        // write values
        for (let i = 0; i < array.length; i++) {
          if (array[i] > 0x07) {
            writer.writeUintVar((array[i] - (array[i] & 0x07)) / 8);
          }
        }
        // tt += performance.now() - t;
        break;

      default:
        // write array's element values depending on type's number
        if (typeCount > 1) {
          // an array with multi-type values
          // write element's type index
          // const x1 = writer.written;
          writer.writeTypeIndex(elemTypes, typeBitmap);
          // console.log('index', writer.written - x1);

          // write elements
          // const x2 = writer.written;
          if ((typeBitmap & ARRAY_NON_WRITABLE_TYPE) !== typeBitmap) {
            for (let i = 0; i < array.length; i++) {
              const elemType = elemTypes[i];

              if (elemType !== TYPE_OBJECT) {
                x(elemType, array[i]);
              }
            }
          }
          // console.log('values', writer.written - x2);
        } else {
          // an array with a single type
          if ((typeBitmap & ARRAY_NON_WRITABLE_TYPE) !== typeBitmap) {
            const writeValue = writeTypedValue[elemTypes[0]];

            for (const elem of array) {
              writeValue(elem);
            }
          }
        }

        // write object column keys
        if (hasObjectColumnKeys) {
          // write column keys
          writer.writeVlq(objectKeyColumns.size);
          for (const key of objectKeyColumns.keys()) {
            writeString(key);
          }

          // write column values
          for (const column of objectKeyColumns.values()) {
            writeArray(column.values, column);
          }
        }

        // write objects
        if (hasInlinedObjectKeys) {
          for (let i = 0; i < array.length; i++) {
            if (elemTypes[i] === TYPE_OBJECT) {
              writeObject(array[i], objectKeyColumns);
            }
          }
        }
    }
  }

  function x(elemType, value) {
    switch (elemType) {
      case TYPE_STRING:      writeTypedValue[elemType](value); break;
      case TYPE_UINT_8:      writeTypedValue[elemType](value); break;
      case TYPE_UINT_16:     writeTypedValue[elemType](value); break;
      case TYPE_UINT_24:     writeTypedValue[elemType](value); break;
      case TYPE_UINT_32:     writeTypedValue[elemType](value); break;
      case TYPE_UINT_32_VAR: writeTypedValue[elemType](value); break;
      case TYPE_NEG_INT:     writeTypedValue[elemType](value); break;
      case TYPE_FLOAT_32:    writeTypedValue[elemType](value); break;
      case TYPE_FLOAT_64:    writeTypedValue[elemType](value); break;
      case TYPE_OBJECT:      writeTypedValue[elemType](value); break;
      case TYPE_ARRAY:       writeTypedValue[elemType](value); break;
    }
  }

  const writer = new Writer(options.chunkSize);
  const strings = new Map();
  let prevString = '';
  let stringIdx = 1;
  const objectKeys = new Map();
  const objectEntryDefs = [];
  const inputType = getType(input);

  const noop = () => {};
  const writeTypedValue = {
    [TYPE_TRUE]: noop,
    [TYPE_FALSE]: noop,
    [TYPE_NULL]: noop,
    [TYPE_UNDEF]: noop,
    [TYPE_STRING]: writeString,
    [TYPE_UINT_8]: writer.writeUint8.bind(writer),
    [TYPE_UINT_16]: writer.writeUint16.bind(writer),
    [TYPE_UINT_24]: writer.writeUint24.bind(writer),
    [TYPE_UINT_32]: writer.writeUint32.bind(writer),
    [TYPE_UINT_32_VAR]: writer.writeUintVar.bind(writer),
    [TYPE_NEG_INT]: (value) => writer.writeUintVar(-value),
    [TYPE_FLOAT_32]: writer.writeFloat32.bind(writer),
    [TYPE_FLOAT_64]: writer.writeFloat64.bind(writer),
    [TYPE_OBJECT]: writeObject,
    [TYPE_ARRAY]: writeArray
  };

  writer.writeUint8(inputType);
  writeTypedValue[inputType](input);

  return writer.value;
}

function decode(bytes) {
  function readVlq() {
    let num = view.getUint8(pos);

    if ((num & 0x01) === 0) {
      num = num >> 1;
      pos += 1;
    } else if ((num & 0x02) === 0) {
      num = view.getUint16(pos, true) >> 2;
      pos += 2;
    } else if ((num & 0x04) === 0) {
      num = (view.getUint8(pos + 2) << 13) | (view.getUint16(pos, true) >> 3);
      pos += 3;
    } else {
      const low32 = view.getUint32(pos, true);

      num = (low32 >> 3) & MAX_UINT_28;
      pos += 4;

      if (low32 & 0x8000_0000) {
        num += readVarNum() * (1 << 29);
      }
    }

    return num;
  }

  function readVarNum() {
    let base = 0x80;
    let byte = view.getUint8(pos++);
    let value = byte & 0x7f;

    while (byte & 0x80) {
      byte = view.getUint8(pos++);
      value += (byte & 0x7f) * base;
      base *= 0x80;
    }

    return value;
  }

  function readType() {
    const type = view.getUint8(pos);
    pos += 1;
    return type;
  }

  function readString() {
    const num = readVlq();
    const isReference = num & 1;

    if (isReference) {
      // reference
      return strings[num >> 1];
    }

    // definition
    const prevStringLen = num === 0 ? readVlq() : 0;
    const len = num === 0 ? readVlq() : num >> 1;
    let value = stringDecoder.decode(bytes.subarray(pos, pos + len));

    if (num === 0) {
      value = prevString.slice(0, prevStringLen) + value;
    }

    pos += len;
    strings.push(value);
    prevString = value;

    return value;
  }

  function readObject(object = {}) {
    let entryIdx = 0;

    while (true) {
      const type = readVlq();

      // zero reference is end of the list
      if (type === 0) {
        break;
      }

      if (entryIdx >= objectEntryDefs.length) {
        objectEntryDefs[entryIdx] = [];
      }

      if (type & 1) {
        // reference
        const [key, entryType] = objectEntryDefs[entryIdx][type >> 1];
        object[key] = readValue(entryType);
      } else {
        // definition
        const key = readString();
        const entryType = readType();

        objectEntryDefs[entryIdx].push([key, entryType]);
        object[key] = readValue(entryType);
      }

      entryIdx++;
    }

    return object;
  }

  function readArray(flags) {
    const arrayLength = typeof flags === 'number' ? flags : readVlq();

    if (arrayLength === 0) {
      return [];
    }

    const result = new Array(arrayLength);
    const header = view.getUint8(pos);
    const hasUndef = (header >> 7) & 1;                  // a
    const extraTypes = (header >> 5) & 0b11;             // bb
    const lowBitsKind = (header >> 4) & 1;               // c
    const lowBits = header & 0x0f;                       // dddd
    const lowBitsFlags = lowBitsKind === LOW_BITS_FLAGS
      ? lowBits
      : 0x00;
    const specialEncoding = lowBitsKind === LOW_BITS_TYPE && lowBits === TYPE_NULL
      ? ARRAY_ENCODING_VLQ2
      : ARRAY_ENCODING_DEFAULT;
    const lowBitsType = lowBitsKind === LOW_BITS_TYPE
      ? specialEncoding === ARRAY_ENCODING_DEFAULT
        ? lowBits
        : TYPE_UINT_32_VAR
      : 0x00;
    const hasObjectColumnKeys = (lowBitsFlags >> 3) & 1; // e
    const hasObjectInlineKeys = (lowBitsFlags >> 2) & 1; // f
    const escapedArrays = (lowBitsFlags >> 1) & 1;       // g
    const hasNulls = (lowBitsFlags >> 0) & 1;            // h
    const extraTypesList = extraTypes === 0b01 ? view.getUint8(pos + 1) : 0;
    let typeBitmap =
      (lowBitsKind === LOW_BITS_TYPE ? 1 << lowBitsType : 0) |
      (extraTypes === 0b01
        ? (1 << (extraTypesList & 0x0f)) | (1 << (extraTypesList >> 4))
        : extraTypes === 0b10
          ? view.getUint8(pos + 1)
          : extraTypes === 0b11
            ? view.getUint16(pos + 1, true)
            : 0) |
      (hasUndef << TYPE_UNDEF) |
      (hasNulls << TYPE_NULL) |
      (escapedArrays << TYPE_ARRAY) |
      ((hasObjectColumnKeys || hasObjectInlineKeys) << TYPE_OBJECT);

    pos += 1 + (extraTypes === 0b00 ? 0 : extraTypes === 0b11 ? 2 : 1);

    // console.log(arrayLength,
    //     'header:', header.toString(2).padStart(8, 0),
    //     'typeBitmap:', typeBitmap.toString(2).padStart(8, 0),
    //     { specialEncoding, extraTypes, hasObjectColumnKeys, hasObjectInlineKeys }
    // );

    switch (specialEncoding) {
      case ARRAY_ENCODING_VLQ2: {
        let indexPos = pos;

        pos += Math.ceil(arrayLength / 2);

        for (let i = 0, indexByte = 0; i < arrayLength; i++) {
          if ((i & 1) === 0) {
            indexByte = view.getUint8(indexPos++);
          }

          const n = indexByte & 0x0f;

          if (n <= 0x07) {
            result[i] = n;
          } else {
            result[i] = readVarNum() * 8 + (n & 0x07);
          }

          indexByte = indexByte >> 4;
        }
        break;
      }

      default: {
        let typeCount = 0;
        let typeIdx = 0;
        const needOwnTypeIndex = typeBitmap & ((1 << TYPE_OBJECT) | (1 << TYPE_ARRAY));
        while (typeBitmap > 0) {
          if (typeBitmap & 1) {
            typeIndex[typeCount++] = typeIdx;
          }

          typeIdx++;
          typeBitmap >>= 1;
        }

        let objects;
        if (typeCount > 1) {
          const bitsPerType = 32 - Math.clz32(typeCount - 1);
          const mask = (1 << bitsPerType) - 1;
          const typeMapping = needOwnTypeIndex
            ? typeIndex.slice(0, typeCount)
            : typeIndex;
          let indexPos = pos;
          let left = 0;
          let byte = 0;

          objects = [];
          pos += Math.ceil(bitsPerType * arrayLength / 8);

          for (let i = 0; i < arrayLength; i++) {
            if (left < bitsPerType) {
              byte |= view.getUint8(indexPos) << left;
              left += 8;
              indexPos++;
            }

            const elemType = typeMapping[byte & mask];

            if (elemType !== TYPE_OBJECT) {
              result[i] = readValue(elemType);
            } else {
              objects.push(result[i] = {});
            }

            byte >>= bitsPerType;
            left -= bitsPerType;
          }
        } else {
          const elemType = typeIndex[0];

          if (elemType === TYPE_OBJECT) {
            objects = result;
            for (let i = 0; i < arrayLength; i++) {
              objects[i] = {};
            }
          } else {
            for (let i = 0; i < arrayLength; i++) {
              result[i] = readValue(elemType);
            }
          }
        }

        if (hasObjectColumnKeys) {
          const keysLength = readVlq();
          const keys = new Array(keysLength);

          // read keys
          for (let i = 0; i < keysLength; i++) {
            keys[i] = readString();
          }

          // read column values
          for (let i = 0; i < keysLength; i++) {
            const key = keys[i];
            const vals = readArray(objects.length);

            for (let j = 0; j < objects.length; j++) {
              if (vals[j] !== undefined) {
                objects[j][key] = vals[j];
              }
            }
          }
        }

        if (hasObjectInlineKeys) {
          for (const object of objects) {
            readObject(object);
          }
        }
      }
    }

    return result;
  }

  function readValue(type) {
    switch (type) {
      case TYPE_NULL:
        return null;

      case TYPE_TRUE:
        return true;

      case TYPE_FALSE:
        return false;

      case TYPE_UNDEF:
        return undefined;

      case TYPE_STRING:
        return readString();

      case TYPE_UINT_8: {
        const value = view.getUint8(pos);
        pos += 1;
        return value;
      }

      case TYPE_UINT_16: {
        const value = view.getUint16(pos, true);
        pos += 2;
        return value;
      }

      case TYPE_UINT_24: {
        const value = view.getUint16(pos, true) + (view.getUint8(pos + 2) << 16);
        pos += 3;
        return value;
      }

      case TYPE_UINT_32: {
        const value = view.getUint32(pos, true);
        pos += 4;
        return value;
      }

      case TYPE_UINT_32_VAR: {
        return readVarNum();
      }

      case TYPE_NEG_INT: {
        return -readVarNum();
      }

      case TYPE_FLOAT_32: {
        const value = view.getFloat32(pos);
        pos += 4;
        return value;
      }

      case TYPE_FLOAT_64: {
        const value = view.getFloat64(pos);
        pos += 8;
        return value;
      }

      case TYPE_OBJECT:
        return readObject();

      case TYPE_ARRAY:
        return readArray();
    }
  }

  const stringDecoder = new TextDecoder('utf8', { ignoreBOM: true });
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const objectEntryDefs = [];
  const strings = [''];
  let prevString = '';
  let pos = 0;

  const ret = readValue(readType());

  return ret;
}

export {
  Writer,
  encode,
  decode
};
