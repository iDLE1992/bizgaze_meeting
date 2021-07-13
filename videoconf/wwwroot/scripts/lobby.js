(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/..\\..\\node_modules\\base64-js\\lib\\b64.js","/..\\..\\node_modules\\base64-js\\lib")
},{"buffer":2,"e/U+97":4}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/..\\..\\node_modules\\buffer\\index.js","/..\\..\\node_modules\\buffer")
},{"base64-js":1,"buffer":2,"e/U+97":4,"ieee754":3}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/..\\..\\node_modules\\ieee754\\index.js","/..\\..\\node_modules\\ieee754")
},{"buffer":2,"e/U+97":4}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/..\\..\\node_modules\\process\\browser.js","/..\\..\\node_modules\\process")
},{"buffer":2,"e/U+97":4}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaType = void 0;
var MediaType;
(function (MediaType) {
    MediaType["VIDEO"] = "video";
    MediaType["AUDIO"] = "audio";
    MediaType["PRESENTER"] = "presenter";
})(MediaType = exports.MediaType || (exports.MediaType = {}));
//# sourceMappingURL=MediaType.js.map
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/enum\\MediaType.js","/enum")
},{"buffer":2,"e/U+97":4}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantType = void 0;
var ParticipantType;
(function (ParticipantType) {
    ParticipantType["Normal"] = "Normal";
    ParticipantType["Host"] = "Host";
})(ParticipantType = exports.ParticipantType || (exports.ParticipantType = {}));
//# sourceMappingURL=ParticipantType.js.map
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/enum\\ParticipantType.js","/enum")
},{"buffer":2,"e/U+97":4}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lobby = void 0;
var MediaType_1 = require("./enum/MediaType");
var snippet_1 = require("./util/snippet");
var ParticipantType_1 = require("./enum/ParticipantType");
var LobbySeetings = /** @class */ (function () {
    function LobbySeetings() {
    }
    return LobbySeetings;
}());
var Lobby = /** @class */ (function () {
    function Lobby() {
        this.JitsiMeetJS = window.JitsiMeetJS;
        this.audioTrackError = null;
        this.videoTrackError = null;
        this.activeCameraDeviceId = null;
        this.activeMicDeviceId = null;
        this.activeSpeakerDeviceId = null;
        this.conferenceId = window.conferenceId;
        this.userId = window.userId;
        this.localVideoTrack = null;
        this.localAudioTrack = null;
        this.videoPreviewElem = document.getElementById("camera-preview");
        this.audioPreviewElem = document.getElementById("mic-preview");
        this.cameraListElem = document.getElementById("camera-list");
        this.micListElem = document.getElementById("mic-list");
        this.speakerListElem = document.getElementById("speaker-list");
        this.videoMuteElem = document.getElementById("videoMute");
        this.audioMuteElem = document.getElementById("audioMute");
        this.anonymousNameFiled = document.getElementById("anonymous-name");
        this.startSessionButton = document.getElementById("start-session");
    }
    Lobby.prototype.start = function () {
        var _this_1 = this;
        var initOptions = {
            disableAudioLevels: true
        };
        this.JitsiMeetJS.init(initOptions);
        $(document).ready(function () {
            _this_1.resizeCameraView();
            _this_1.attachEventHandlers();
            _this_1.refreshDeviceList();
            $(_this_1.startSessionButton).prop('disabled', true);
            _this_1.videoMuteElem.checked = false;
            _this_1.audioMuteElem.checked = false;
            _this_1.videoMuteElem.disabled = true;
            _this_1.audioMuteElem.disabled = true;
            $.ajax({
                url: "/api/Meeting/" + _this_1.conferenceId,
                type: "GET",
                data: "",
                dataType: 'json',
                success: function (res) {
                    _this_1.onMeetingResult(res);
                },
                error: function (xhr, status, error) {
                    _this_1.onMeetingErrorResult(error);
                }
            });
        });
    };
    Lobby.prototype.attachEventHandlers = function () {
        var _this_1 = this;
        var _this = this;
        $(this.cameraListElem).on('change', function () {
            _this.onCameraChanged($(this).val());
        });
        $(this.micListElem).on('change', function () {
            _this.onMicChanged($(this).val());
        });
        $(this.speakerListElem).on('change', function () {
            _this.onSpeakerChanged($(this).val());
        });
        $(this.startSessionButton).on('click', function () {
            _this_1.startSession();
        });
        $(window).resize(function () {
            _this_1.resizeCameraView();
        });
        $(this.videoMuteElem).on('change', function () {
            _this.onEnableVideo(this.checked);
        });
        $(this.audioMuteElem).on('change', function () {
            _this.onEnableAudio(this.checked);
        });
    };
    Lobby.prototype.refreshDeviceList = function () {
        var _this_1 = this;
        this.JitsiMeetJS.mediaDevices.enumerateDevices(function (devices) {
            _this_1.cameraList = devices.filter(function (d) { return d.kind === 'videoinput'; });
            _this_1.micList = devices.filter(function (d) { return d.kind === 'audioinput'; });
            _this_1.speakerList = devices.filter(function (d) { return d.kind === 'audiooutput'; });
            _this_1.renderDevices();
        });
    };
    Lobby.prototype.renderDevices = function () {
        var _this_1 = this;
        this.clearDOMElement(this.cameraListElem);
        this.cameraList.forEach(function (camera) {
            $(_this_1.cameraListElem).append("<option value=\"" + camera.deviceId + "\">" + camera.label + "</option>");
        });
        this.clearDOMElement(this.micListElem);
        this.micList.forEach(function (mic) {
            $(_this_1.micListElem).append("<option value=\"" + mic.deviceId + "\">" + mic.label + "</option>");
        });
        this.clearDOMElement(this.speakerListElem);
        this.speakerList.forEach(function (speaker) {
            $(_this_1.speakerListElem).append("<option value=\"" + speaker.deviceId + "\">" + speaker.label + "</option>");
        });
        this.activeCameraDeviceId = this.cameraList.length > 0 ? this.cameraList[0].deviceId : null;
        this.activeMicDeviceId = this.micList.length > 0 ? this.micList[0].deviceId : null;
        this.activeSpeakerDeviceId = this.speakerList.length > 0 ? this.speakerList[0].deviceId : null;
        this.createLocalTracks(this.activeCameraDeviceId, this.activeMicDeviceId)
            .then(function (tracks) {
            _this_1.initOnTracks(tracks);
        });
    };
    Lobby.prototype.initOnTracks = function (tracks) {
        var _this_1 = this;
        tracks.forEach(function (t) {
            if (t.getType() === MediaType_1.MediaType.VIDEO) {
                _this_1.localVideoTrack = t;
                _this_1.attachVideoTrackToElem(t, _this_1.videoPreviewElem);
                _this_1.showCamera(true);
            }
            else if (t.getType() === MediaType_1.MediaType.AUDIO) {
                _this_1.localAudioTrack = t;
                t.attach(_this_1.audioPreviewElem);
            }
        });
        if (this.activeCameraDeviceId === null) {
            this.showCamera(false);
            this.videoMuteElem.disabled = true;
            this.videoMuteElem.checked = false;
            this.cameraListElem.disabled = true;
        }
        else {
            this.showCamera(true);
            this.videoMuteElem.disabled = false;
            this.videoMuteElem.checked = true;
            this.cameraListElem.disabled = false;
        }
        if (this.activeMicDeviceId === null) {
            this.audioMuteElem.disabled = true;
            this.audioMuteElem.checked = false;
            this.micListElem.disabled = true;
        }
        else {
            this.audioMuteElem.disabled = false;
            this.audioMuteElem.checked = true;
            this.micListElem.disabled = false;
        }
    };
    Lobby.prototype.clearDOMElement = function (elem) {
        while (elem.firstChild) {
            elem.removeChild(elem.firstChild);
        }
    };
    Lobby.prototype.createLocalTracks = function (cameraDeviceId, micDeviceId) {
        var _this_1 = this;
        this.videoTrackError = null;
        this.audioTrackError = null;
        if (cameraDeviceId != null && micDeviceId != null) {
            return this.JitsiMeetJS.createLocalTracks({
                devices: ['audio', 'video'],
                cameraDeviceId: cameraDeviceId,
                micDeviceId: micDeviceId
            }).catch(function () { return Promise.all([
                _this_1.createAudioTrack(micDeviceId).then(function (_a) {
                    var stream = _a[0];
                    return stream;
                }),
                _this_1.createVideoTrack(cameraDeviceId).then(function (_a) {
                    var stream = _a[0];
                    return stream;
                })
            ]); }).then(function (tracks) {
                if (_this_1.audioTrackError) {
                    //display error
                }
                if (_this_1.videoTrackError) {
                    //display error
                }
                return tracks.filter(function (t) { return typeof t !== 'undefined'; });
            });
        }
        else if (cameraDeviceId != null) {
            return this.createVideoTrack(cameraDeviceId);
        }
        else if (micDeviceId != null) {
            return this.createAudioTrack(micDeviceId);
        }
        return Promise.resolve([]);
    };
    Lobby.prototype.createVideoTrack = function (cameraDeviceId) {
        var _this_1 = this;
        return this.JitsiMeetJS.createLocalTracks({
            devices: ['video'],
            cameraDeviceId: cameraDeviceId,
            micDeviceId: null
        })
            .catch(function (error) {
            _this_1.videoTrackError = error;
            return Promise.resolve([]);
        });
    };
    Lobby.prototype.createAudioTrack = function (micDeviceId) {
        var _this_1 = this;
        return (this.JitsiMeetJS.createLocalTracks({
            devices: ['audio'],
            cameraDeviceId: null,
            micDeviceId: micDeviceId
        })
            .catch(function (error) {
            _this_1.audioTrackError = error;
            return Promise.resolve([]);
        }));
    };
    Lobby.prototype.onCameraChanged = function (cameraDeviceId) {
        var _this_1 = this;
        this.activeCameraDeviceId = cameraDeviceId;
        this.removeVideoTrack();
        this.createLocalTracks(this.activeCameraDeviceId, null)
            .then(function (tracks) {
            tracks.forEach(function (t) {
                if (t.getType() === MediaType_1.MediaType.VIDEO) {
                    _this_1.localVideoTrack = t;
                    _this_1.attachVideoTrackToElem(t, _this_1.videoPreviewElem);
                    _this_1.showCamera(true);
                }
            });
        });
    };
    Lobby.prototype.onMicChanged = function (micDeviceId) {
        var _this_1 = this;
        this.activeMicDeviceId = micDeviceId;
        this.removeAudioTrack();
        this.createLocalTracks(null, this.activeMicDeviceId)
            .then(function (tracks) {
            tracks.forEach(function (t) {
                if (t.getType() === MediaType_1.MediaType.AUDIO) {
                    _this_1.localAudioTrack = t;
                    t.attach(_this_1.audioPreviewElem);
                }
            });
        });
    };
    Lobby.prototype.removeVideoTrack = function () {
        if (this.localVideoTrack) {
            this.localVideoTrack.dispose();
            this.localVideoTrack = null;
        }
    };
    Lobby.prototype.removeAudioTrack = function () {
        if (this.localAudioTrack) {
            this.localAudioTrack.dispose();
            this.localAudioTrack = null;
        }
    };
    Lobby.prototype.onSpeakerChanged = function (speakerDeviceId) {
        this.activeSpeakerDeviceId = speakerDeviceId;
        if (this.activeSpeakerDeviceId && this.JitsiMeetJS.mediaDevices.isDeviceChangeAvailable('output')) {
            this.JitsiMeetJS.mediaDevices.setAudioOutputDevice(this.activeSpeakerDeviceId);
        }
        ;
    };
    Lobby.prototype.onEnableVideo = function (enable) {
        if (enable) {
            this.onCameraChanged(this.activeCameraDeviceId);
            this.cameraListElem.disabled = false;
        }
        else {
            this.removeVideoTrack();
            this.showCamera(false);
            this.cameraListElem.disabled = true;
        }
    };
    Lobby.prototype.onEnableAudio = function (enable) {
        if (enable) {
            this.onMicChanged(this.activeMicDeviceId);
            this.micListElem.disabled = false;
        }
        else {
            this.removeAudioTrack();
            this.micListElem.disabled = true;
        }
    };
    Lobby.prototype.showCamera = function (show) {
        if (show) {
            $(this.videoPreviewElem).removeClass("d-none");
            $("#no-camera-icon").addClass("d-none");
        }
        else {
            $(this.videoPreviewElem).addClass("d-none");
            $("#no-camera-icon").removeClass("d-none");
        }
    };
    Lobby.prototype.attachVideoTrackToElem = function (track, elem) {
        track.attach(elem);
        this.resizeCameraView();
    };
    Lobby.prototype.resizeCameraView = function () {
        var _a;
        var $container = $("#camera-preview-container");
        var w = $container.width();
        var h = w * 9 / 16;
        if (this.localVideoTrack) {
            var rawTrack = this.localVideoTrack.getTrack();
            var _b = (_a = rawTrack.getSettings()) !== null && _a !== void 0 ? _a : rawTrack.getConstraints(), height = _b.height, width = _b.width;
            var Height = height;
            var Width = width;
            if (width && height) {
                h = w * Height / Width;
            }
        }
        $container.css("height", h);
        $container.css("min-height", h);
    };
    Lobby.prototype.startSession = function () {
        if (this.isAnonymousUser() && this.anonymousNameFiled.value.trim().length <= 0)
            return;
        $("[name=cameraId]").val(this.activeCameraDeviceId);
        $("[name=micId]").val(this.activeMicDeviceId);
        $("[name=speakerId]").val(this.activeSpeakerDeviceId);
        $("[name=anonymousUserName]").val(this.anonymousNameFiled.value.trim());
        $("[name=videoMute]").val(this.videoMuteElem.checked + "");
        $("[name=audioMute]").val(this.audioMuteElem.checked + "");
        $("form").submit();
    };
    Lobby.prototype.validateUser = function (meeting) {
        var _this_1 = this;
        if (this.isAnonymousUser()) {
            return meeting.IsOpened === true;
        }
        else {
            var user = meeting.Participants.filter(function (p) { return p.ParticipantId.toString() === _this_1.userId; });
            return user.length > 0;
        }
    };
    Lobby.prototype.onMeetingResult = function (meeting) {
        var _this_1 = this;
        if (!this.validateUser(meeting)) {
            location.href = "/noaccess";
            return;
        }
        var hosts = meeting.Participants.filter(function (p) { return p.ParticipantType === ParticipantType_1.ParticipantType.Host; });
        if (hosts.length === 1)
            this.setOrganizerName(hosts[0].ParticipantName);
        else
            this.setOrganizerName("No organizer");
        //anonymous
        if (this.isAnonymousUser()) {
            $(this.anonymousNameFiled)
                .show()
                .focus()
                .keyup(function (_) {
                $(_this_1.startSessionButton).prop('disabled', _this_1.anonymousNameFiled.value.trim().length <= 0);
            }).keypress(function (e) {
                if ((e.keyCode || e.which) == 13) { //Enter keycode
                    e.preventDefault();
                    _this_1.startSession();
                }
            });
        }
        else {
            $(this.anonymousNameFiled).hide();
            $(this.startSessionButton).prop('disabled', false);
        }
        this.hidePreloader();
    };
    Lobby.prototype.onMeetingErrorResult = function (err) {
        location.href = "/";
    };
    Lobby.prototype.isAnonymousUser = function () {
        return !this.userId || !parseInt(this.userId);
    };
    /***********************************************************************************
    
                    Lobby UI methods
          (not introduced seperate UI class as this is simple class)
                           
    ************************************************************************************/
    Lobby.prototype.setOrganizerName = function (name) {
        $("#host-name").html(snippet_1.stripHTMLTags(name));
    };
    Lobby.prototype.hidePreloader = function () {
        $("#preloader").css("display", "none");
        $("#main-wrapper").addClass("show");
    };
    return Lobby;
}());
exports.Lobby = Lobby;
var lobby = new Lobby();
lobby.start();
//# sourceMappingURL=lobby.js.map
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_285b58c.js","/")
},{"./enum/MediaType":5,"./enum/ParticipantType":6,"./util/snippet":8,"buffer":2,"e/U+97":4}],8:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCapacityLabel = exports.random = exports.avatarName = exports.stripHTMLTags = void 0;
function stripHTMLTags(text) {
    return text.replace(/(<([^>]+)>)/gi, "");
}
exports.stripHTMLTags = stripHTMLTags;
/*
 ajax example
 $.ajax({
        url: "http://localhost/myproject/ajax_url",
        type: "POST",
        data: $("#my-form").serialize(),
        dataType: 'json', // lowercase is always preferered though jQuery does it, too.
        success: function(){}
});
 
 
 */
function avatarName(name) {
    var unknown = "?";
    if (!name || name.length <= 0)
        return unknown;
    var nameParts = name.split(" ");
    var res = "";
    nameParts.forEach(function (p) {
        if (p.length > 0)
            res += p[0];
    });
    if (res.length <= 0)
        unknown;
    return res.toUpperCase().substr(0, 2);
}
exports.avatarName = avatarName;
var random = function (min, max) { return Math.floor(Math.random() * (max - min)) + min; };
exports.random = random;
function getCapacityLabel(bytes) {
    if (bytes < 1024)
        return bytes + " bytes";
    else if (bytes < 1024 * 1024) {
        var kb = bytes / 1024;
        return kb.toFixed(2) + " KB";
    }
    else {
        var mb = bytes / (1024 * 1024);
        return mb.toFixed(2) + " MB";
    }
}
exports.getCapacityLabel = getCapacityLabel;
//# sourceMappingURL=snippet.js.map
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/util\\snippet.js","/util")
},{"buffer":2,"e/U+97":4}]},{},[7])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkY6XFxQcm9qZWN0XFxHaXRIdWJcXGJpemdhemVfbWVldGluZ1xcdmlkZW9jb25mXFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJGOi9Qcm9qZWN0L0dpdEh1Yi9iaXpnYXplX21lZXRpbmcvdmlkZW9jb25mL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliL2I2NC5qcyIsIkY6L1Byb2plY3QvR2l0SHViL2JpemdhemVfbWVldGluZy92aWRlb2NvbmYvbm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qcyIsIkY6L1Byb2plY3QvR2l0SHViL2JpemdhemVfbWVldGluZy92aWRlb2NvbmYvbm9kZV9tb2R1bGVzL2llZWU3NTQvaW5kZXguanMiLCJGOi9Qcm9qZWN0L0dpdEh1Yi9iaXpnYXplX21lZXRpbmcvdmlkZW9jb25mL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJGOi9Qcm9qZWN0L0dpdEh1Yi9iaXpnYXplX21lZXRpbmcvdmlkZW9jb25mL3NjcmlwdHMvYnVpbGQvZW51bS9NZWRpYVR5cGUuanMiLCJGOi9Qcm9qZWN0L0dpdEh1Yi9iaXpnYXplX21lZXRpbmcvdmlkZW9jb25mL3NjcmlwdHMvYnVpbGQvZW51bS9QYXJ0aWNpcGFudFR5cGUuanMiLCJGOi9Qcm9qZWN0L0dpdEh1Yi9iaXpnYXplX21lZXRpbmcvdmlkZW9jb25mL3NjcmlwdHMvYnVpbGQvZmFrZV8yODViNThjLmpzIiwiRjovUHJvamVjdC9HaXRIdWIvYml6Z2F6ZV9tZWV0aW5nL3ZpZGVvY29uZi9zY3JpcHRzL2J1aWxkL3V0aWwvc25pcHBldC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBsb29rdXAgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7XHJcblxyXG47KGZ1bmN0aW9uIChleHBvcnRzKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuICB2YXIgQXJyID0gKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJylcclxuICAgID8gVWludDhBcnJheVxyXG4gICAgOiBBcnJheVxyXG5cclxuXHR2YXIgUExVUyAgID0gJysnLmNoYXJDb2RlQXQoMClcclxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcclxuXHR2YXIgTlVNQkVSID0gJzAnLmNoYXJDb2RlQXQoMClcclxuXHR2YXIgTE9XRVIgID0gJ2EnLmNoYXJDb2RlQXQoMClcclxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcclxuXHR2YXIgUExVU19VUkxfU0FGRSA9ICctJy5jaGFyQ29kZUF0KDApXHJcblx0dmFyIFNMQVNIX1VSTF9TQUZFID0gJ18nLmNoYXJDb2RlQXQoMClcclxuXHJcblx0ZnVuY3Rpb24gZGVjb2RlIChlbHQpIHtcclxuXHRcdHZhciBjb2RlID0gZWx0LmNoYXJDb2RlQXQoMClcclxuXHRcdGlmIChjb2RlID09PSBQTFVTIHx8XHJcblx0XHQgICAgY29kZSA9PT0gUExVU19VUkxfU0FGRSlcclxuXHRcdFx0cmV0dXJuIDYyIC8vICcrJ1xyXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIIHx8XHJcblx0XHQgICAgY29kZSA9PT0gU0xBU0hfVVJMX1NBRkUpXHJcblx0XHRcdHJldHVybiA2MyAvLyAnLydcclxuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxyXG5cdFx0XHRyZXR1cm4gLTEgLy9ubyBtYXRjaFxyXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIgKyAxMClcclxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XHJcblx0XHRpZiAoY29kZSA8IFVQUEVSICsgMjYpXHJcblx0XHRcdHJldHVybiBjb2RlIC0gVVBQRVJcclxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcclxuXHRcdFx0cmV0dXJuIGNvZGUgLSBMT1dFUiArIDI2XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBiNjRUb0J5dGVBcnJheSAoYjY0KSB7XHJcblx0XHR2YXIgaSwgaiwgbCwgdG1wLCBwbGFjZUhvbGRlcnMsIGFyclxyXG5cclxuXHRcdGlmIChiNjQubGVuZ3RoICUgNCA+IDApIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN0cmluZy4gTGVuZ3RoIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA0JylcclxuXHRcdH1cclxuXHJcblx0XHQvLyB0aGUgbnVtYmVyIG9mIGVxdWFsIHNpZ25zIChwbGFjZSBob2xkZXJzKVxyXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxyXG5cdFx0Ly8gcmVwcmVzZW50IG9uZSBieXRlXHJcblx0XHQvLyBpZiB0aGVyZSBpcyBvbmx5IG9uZSwgdGhlbiB0aGUgdGhyZWUgY2hhcmFjdGVycyBiZWZvcmUgaXQgcmVwcmVzZW50IDIgYnl0ZXNcclxuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2VcclxuXHRcdHZhciBsZW4gPSBiNjQubGVuZ3RoXHJcblx0XHRwbGFjZUhvbGRlcnMgPSAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMikgPyAyIDogJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDEpID8gMSA6IDBcclxuXHJcblx0XHQvLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcclxuXHRcdGFyciA9IG5ldyBBcnIoYjY0Lmxlbmd0aCAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzKVxyXG5cclxuXHRcdC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcclxuXHRcdGwgPSBwbGFjZUhvbGRlcnMgPiAwID8gYjY0Lmxlbmd0aCAtIDQgOiBiNjQubGVuZ3RoXHJcblxyXG5cdFx0dmFyIEwgPSAwXHJcblxyXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xyXG5cdFx0XHRhcnJbTCsrXSA9IHZcclxuXHRcdH1cclxuXHJcblx0XHRmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XHJcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTgpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgMTIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPDwgNikgfCBkZWNvZGUoYjY0LmNoYXJBdChpICsgMykpXHJcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcclxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwKSA+PiA4KVxyXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHBsYWNlSG9sZGVycyA9PT0gMikge1xyXG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcclxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxyXG5cdFx0fSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcclxuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXHJcblx0XHRcdHB1c2goKHRtcCA+PiA4KSAmIDB4RkYpXHJcblx0XHRcdHB1c2godG1wICYgMHhGRilcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gYXJyXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB1aW50OFRvQmFzZTY0ICh1aW50OCkge1xyXG5cdFx0dmFyIGksXHJcblx0XHRcdGV4dHJhQnl0ZXMgPSB1aW50OC5sZW5ndGggJSAzLCAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xyXG5cdFx0XHRvdXRwdXQgPSBcIlwiLFxyXG5cdFx0XHR0ZW1wLCBsZW5ndGhcclxuXHJcblx0XHRmdW5jdGlvbiBlbmNvZGUgKG51bSkge1xyXG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcclxuXHRcdFx0cmV0dXJuIGVuY29kZShudW0gPj4gMTggJiAweDNGKSArIGVuY29kZShudW0gPj4gMTIgJiAweDNGKSArIGVuY29kZShudW0gPj4gNiAmIDB4M0YpICsgZW5jb2RlKG51bSAmIDB4M0YpXHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxyXG5cdFx0Zm9yIChpID0gMCwgbGVuZ3RoID0gdWludDgubGVuZ3RoIC0gZXh0cmFCeXRlczsgaSA8IGxlbmd0aDsgaSArPSAzKSB7XHJcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXHJcblx0XHRcdG91dHB1dCArPSB0cmlwbGV0VG9CYXNlNjQodGVtcClcclxuXHRcdH1cclxuXHJcblx0XHQvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXHJcblx0XHRzd2l0Y2ggKGV4dHJhQnl0ZXMpIHtcclxuXHRcdFx0Y2FzZSAxOlxyXG5cdFx0XHRcdHRlbXAgPSB1aW50OFt1aW50OC5sZW5ndGggLSAxXVxyXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAyKVxyXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxyXG5cdFx0XHRcdG91dHB1dCArPSAnPT0nXHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSAyOlxyXG5cdFx0XHRcdHRlbXAgPSAodWludDhbdWludDgubGVuZ3RoIC0gMl0gPDwgOCkgKyAodWludDhbdWludDgubGVuZ3RoIC0gMV0pXHJcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDEwKVxyXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxyXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgMikgJiAweDNGKVxyXG5cdFx0XHRcdG91dHB1dCArPSAnPSdcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvdXRwdXRcclxuXHR9XHJcblxyXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxyXG5cdGV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IHVpbnQ4VG9CYXNlNjRcclxufSh0eXBlb2YgZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcgPyAodGhpcy5iYXNlNjRqcyA9IHt9KSA6IGV4cG9ydHMpKVxyXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJhc2U2NC1qc1xcXFxsaWJcXFxcYjY0LmpzXCIsXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJhc2U2NC1qc1xcXFxsaWJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKiFcclxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXHJcbiAqXHJcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxyXG4gKiBAbGljZW5zZSAgTUlUXHJcbiAqL1xyXG5cclxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXHJcbnZhciBpZWVlNzU0ID0gcmVxdWlyZSgnaWVlZTc1NCcpXHJcblxyXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxyXG5leHBvcnRzLlNsb3dCdWZmZXIgPSBCdWZmZXJcclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXHJcbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTJcclxuXHJcbi8qKlxyXG4gKiBJZiBgQnVmZmVyLl91c2VUeXBlZEFycmF5c2A6XHJcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXHJcbiAqICAgPT09IGZhbHNlICAgVXNlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiAoY29tcGF0aWJsZSBkb3duIHRvIElFNilcclxuICovXHJcbkJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgPSAoZnVuY3Rpb24gKCkge1xyXG4gIC8vIERldGVjdCBpZiBicm93c2VyIHN1cHBvcnRzIFR5cGVkIEFycmF5cy4gU3VwcG9ydGVkIGJyb3dzZXJzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssXHJcbiAgLy8gQ2hyb21lIDcrLCBTYWZhcmkgNS4xKywgT3BlcmEgMTEuNissIGlPUyA0LjIrLiBJZiB0aGUgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGFkZGluZ1xyXG4gIC8vIHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgIGluc3RhbmNlcywgdGhlbiB0aGF0J3MgdGhlIHNhbWUgYXMgbm8gYFVpbnQ4QXJyYXlgIHN1cHBvcnRcclxuICAvLyBiZWNhdXNlIHdlIG5lZWQgdG8gYmUgYWJsZSB0byBhZGQgYWxsIHRoZSBub2RlIEJ1ZmZlciBBUEkgbWV0aG9kcy4gVGhpcyBpcyBhbiBpc3N1ZVxyXG4gIC8vIGluIEZpcmVmb3ggNC0yOS4gTm93IGZpeGVkOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzhcclxuICB0cnkge1xyXG4gICAgdmFyIGJ1ZiA9IG5ldyBBcnJheUJ1ZmZlcigwKVxyXG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KGJ1ZilcclxuICAgIGFyci5mb28gPSBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9XHJcbiAgICByZXR1cm4gNDIgPT09IGFyci5mb28oKSAmJlxyXG4gICAgICAgIHR5cGVvZiBhcnIuc3ViYXJyYXkgPT09ICdmdW5jdGlvbicgLy8gQ2hyb21lIDktMTAgbGFjayBgc3ViYXJyYXlgXHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG59KSgpXHJcblxyXG4vKipcclxuICogQ2xhc3M6IEJ1ZmZlclxyXG4gKiA9PT09PT09PT09PT09XHJcbiAqXHJcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgYXJlIGF1Z21lbnRlZFxyXG4gKiB3aXRoIGZ1bmN0aW9uIHByb3BlcnRpZXMgZm9yIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBBUEkgZnVuY3Rpb25zLiBXZSB1c2VcclxuICogYFVpbnQ4QXJyYXlgIHNvIHRoYXQgc3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXQgcmV0dXJuc1xyXG4gKiBhIHNpbmdsZSBvY3RldC5cclxuICpcclxuICogQnkgYXVnbWVudGluZyB0aGUgaW5zdGFuY2VzLCB3ZSBjYW4gYXZvaWQgbW9kaWZ5aW5nIHRoZSBgVWludDhBcnJheWBcclxuICogcHJvdG90eXBlLlxyXG4gKi9cclxuZnVuY3Rpb24gQnVmZmVyIChzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKSB7XHJcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEJ1ZmZlcikpXHJcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKVxyXG5cclxuICB2YXIgdHlwZSA9IHR5cGVvZiBzdWJqZWN0XHJcblxyXG4gIC8vIFdvcmthcm91bmQ6IG5vZGUncyBiYXNlNjQgaW1wbGVtZW50YXRpb24gYWxsb3dzIGZvciBub24tcGFkZGVkIHN0cmluZ3NcclxuICAvLyB3aGlsZSBiYXNlNjQtanMgZG9lcyBub3QuXHJcbiAgaWYgKGVuY29kaW5nID09PSAnYmFzZTY0JyAmJiB0eXBlID09PSAnc3RyaW5nJykge1xyXG4gICAgc3ViamVjdCA9IHN0cmluZ3RyaW0oc3ViamVjdClcclxuICAgIHdoaWxlIChzdWJqZWN0Lmxlbmd0aCAlIDQgIT09IDApIHtcclxuICAgICAgc3ViamVjdCA9IHN1YmplY3QgKyAnPSdcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIEZpbmQgdGhlIGxlbmd0aFxyXG4gIHZhciBsZW5ndGhcclxuICBpZiAodHlwZSA9PT0gJ251bWJlcicpXHJcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdClcclxuICBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJylcclxuICAgIGxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKHN1YmplY3QsIGVuY29kaW5nKVxyXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnKVxyXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QubGVuZ3RoKSAvLyBhc3N1bWUgdGhhdCBvYmplY3QgaXMgYXJyYXktbGlrZVxyXG4gIGVsc2VcclxuICAgIHRocm93IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgbmVlZHMgdG8gYmUgYSBudW1iZXIsIGFycmF5IG9yIHN0cmluZy4nKVxyXG5cclxuICB2YXIgYnVmXHJcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcclxuICAgIC8vIFByZWZlcnJlZDogUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2UgZm9yIGJlc3QgcGVyZm9ybWFuY2VcclxuICAgIGJ1ZiA9IEJ1ZmZlci5fYXVnbWVudChuZXcgVWludDhBcnJheShsZW5ndGgpKVxyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyBGYWxsYmFjazogUmV0dXJuIFRISVMgaW5zdGFuY2Ugb2YgQnVmZmVyIChjcmVhdGVkIGJ5IGBuZXdgKVxyXG4gICAgYnVmID0gdGhpc1xyXG4gICAgYnVmLmxlbmd0aCA9IGxlbmd0aFxyXG4gICAgYnVmLl9pc0J1ZmZlciA9IHRydWVcclxuICB9XHJcblxyXG4gIHZhciBpXHJcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgdHlwZW9mIHN1YmplY3QuYnl0ZUxlbmd0aCA9PT0gJ251bWJlcicpIHtcclxuICAgIC8vIFNwZWVkIG9wdGltaXphdGlvbiAtLSB1c2Ugc2V0IGlmIHdlJ3JlIGNvcHlpbmcgZnJvbSBhIHR5cGVkIGFycmF5XHJcbiAgICBidWYuX3NldChzdWJqZWN0KVxyXG4gIH0gZWxzZSBpZiAoaXNBcnJheWlzaChzdWJqZWN0KSkge1xyXG4gICAgLy8gVHJlYXQgYXJyYXktaXNoIG9iamVjdHMgYXMgYSBieXRlIGFycmF5XHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSlcclxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0LnJlYWRVSW50OChpKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdFtpXVxyXG4gICAgfVxyXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcclxuICAgIGJ1Zi53cml0ZShzdWJqZWN0LCAwLCBlbmNvZGluZylcclxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdudW1iZXInICYmICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmICFub1plcm8pIHtcclxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICBidWZbaV0gPSAwXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gYnVmXHJcbn1cclxuXHJcbi8vIFNUQVRJQyBNRVRIT0RTXHJcbi8vID09PT09PT09PT09PT09XHJcblxyXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIChlbmNvZGluZykge1xyXG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICBjYXNlICdoZXgnOlxyXG4gICAgY2FzZSAndXRmOCc6XHJcbiAgICBjYXNlICd1dGYtOCc6XHJcbiAgICBjYXNlICdhc2NpaSc6XHJcbiAgICBjYXNlICdiaW5hcnknOlxyXG4gICAgY2FzZSAnYmFzZTY0JzpcclxuICAgIGNhc2UgJ3Jhdyc6XHJcbiAgICBjYXNlICd1Y3MyJzpcclxuICAgIGNhc2UgJ3Vjcy0yJzpcclxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxyXG4gICAgY2FzZSAndXRmLTE2bGUnOlxyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgZGVmYXVsdDpcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG59XHJcblxyXG5CdWZmZXIuaXNCdWZmZXIgPSBmdW5jdGlvbiAoYikge1xyXG4gIHJldHVybiAhIShiICE9PSBudWxsICYmIGIgIT09IHVuZGVmaW5lZCAmJiBiLl9pc0J1ZmZlcilcclxufVxyXG5cclxuQnVmZmVyLmJ5dGVMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBlbmNvZGluZykge1xyXG4gIHZhciByZXRcclxuICBzdHIgPSBzdHIgKyAnJ1xyXG4gIHN3aXRjaCAoZW5jb2RpbmcgfHwgJ3V0ZjgnKSB7XHJcbiAgICBjYXNlICdoZXgnOlxyXG4gICAgICByZXQgPSBzdHIubGVuZ3RoIC8gMlxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAndXRmOCc6XHJcbiAgICBjYXNlICd1dGYtOCc6XHJcbiAgICAgIHJldCA9IHV0ZjhUb0J5dGVzKHN0cikubGVuZ3RoXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdhc2NpaSc6XHJcbiAgICBjYXNlICdiaW5hcnknOlxyXG4gICAgY2FzZSAncmF3JzpcclxuICAgICAgcmV0ID0gc3RyLmxlbmd0aFxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnYmFzZTY0JzpcclxuICAgICAgcmV0ID0gYmFzZTY0VG9CeXRlcyhzdHIpLmxlbmd0aFxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAndWNzMic6XHJcbiAgICBjYXNlICd1Y3MtMic6XHJcbiAgICBjYXNlICd1dGYxNmxlJzpcclxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcclxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAqIDJcclxuICAgICAgYnJlYWtcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXHJcbiAgfVxyXG4gIHJldHVybiByZXRcclxufVxyXG5cclxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIChsaXN0LCB0b3RhbExlbmd0aCkge1xyXG4gIGFzc2VydChpc0FycmF5KGxpc3QpLCAnVXNhZ2U6IEJ1ZmZlci5jb25jYXQobGlzdCwgW3RvdGFsTGVuZ3RoXSlcXG4nICtcclxuICAgICAgJ2xpc3Qgc2hvdWxkIGJlIGFuIEFycmF5LicpXHJcblxyXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoMClcclxuICB9IGVsc2UgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XHJcbiAgICByZXR1cm4gbGlzdFswXVxyXG4gIH1cclxuXHJcbiAgdmFyIGlcclxuICBpZiAodHlwZW9mIHRvdGFsTGVuZ3RoICE9PSAnbnVtYmVyJykge1xyXG4gICAgdG90YWxMZW5ndGggPSAwXHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xyXG4gICAgICB0b3RhbExlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdmFyIGJ1ZiA9IG5ldyBCdWZmZXIodG90YWxMZW5ndGgpXHJcbiAgdmFyIHBvcyA9IDBcclxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldXHJcbiAgICBpdGVtLmNvcHkoYnVmLCBwb3MpXHJcbiAgICBwb3MgKz0gaXRlbS5sZW5ndGhcclxuICB9XHJcbiAgcmV0dXJuIGJ1ZlxyXG59XHJcblxyXG4vLyBCVUZGRVIgSU5TVEFOQ0UgTUVUSE9EU1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZnVuY3Rpb24gX2hleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcclxuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXHJcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcclxuICBpZiAoIWxlbmd0aCkge1xyXG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXHJcbiAgfSBlbHNlIHtcclxuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXHJcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XHJcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBkaWdpdHNcclxuICB2YXIgc3RyTGVuID0gc3RyaW5nLmxlbmd0aFxyXG4gIGFzc2VydChzdHJMZW4gJSAyID09PSAwLCAnSW52YWxpZCBoZXggc3RyaW5nJylcclxuXHJcbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcclxuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcclxuICB9XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIGJ5dGUgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXHJcbiAgICBhc3NlcnQoIWlzTmFOKGJ5dGUpLCAnSW52YWxpZCBoZXggc3RyaW5nJylcclxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IGJ5dGVcclxuICB9XHJcbiAgQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPSBpICogMlxyXG4gIHJldHVybiBpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF91dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xyXG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XHJcbiAgICBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXHJcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxyXG59XHJcblxyXG5mdW5jdGlvbiBfYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XHJcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cclxuICAgIGJsaXRCdWZmZXIoYXNjaWlUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXHJcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxyXG59XHJcblxyXG5mdW5jdGlvbiBfYmluYXJ5V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xyXG4gIHJldHVybiBfYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9iYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XHJcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cclxuICAgIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxyXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cclxufVxyXG5cclxuZnVuY3Rpb24gX3V0ZjE2bGVXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XHJcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cclxuICAgIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcclxuICByZXR1cm4gY2hhcnNXcml0dGVuXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcclxuICAvLyBTdXBwb3J0IGJvdGggKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKVxyXG4gIC8vIGFuZCB0aGUgbGVnYWN5IChzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXQsIGxlbmd0aClcclxuICBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xyXG4gICAgaWYgKCFpc0Zpbml0ZShsZW5ndGgpKSB7XHJcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXHJcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxyXG4gICAgfVxyXG4gIH0gZWxzZSB7ICAvLyBsZWdhY3lcclxuICAgIHZhciBzd2FwID0gZW5jb2RpbmdcclxuICAgIGVuY29kaW5nID0gb2Zmc2V0XHJcbiAgICBvZmZzZXQgPSBsZW5ndGhcclxuICAgIGxlbmd0aCA9IHN3YXBcclxuICB9XHJcblxyXG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcclxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcclxuICBpZiAoIWxlbmd0aCkge1xyXG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXHJcbiAgfSBlbHNlIHtcclxuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXHJcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XHJcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xyXG4gICAgfVxyXG4gIH1cclxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcclxuXHJcbiAgdmFyIHJldFxyXG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcclxuICAgIGNhc2UgJ2hleCc6XHJcbiAgICAgIHJldCA9IF9oZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAndXRmOCc6XHJcbiAgICBjYXNlICd1dGYtOCc6XHJcbiAgICAgIHJldCA9IF91dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2FzY2lpJzpcclxuICAgICAgcmV0ID0gX2FzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2JpbmFyeSc6XHJcbiAgICAgIHJldCA9IF9iaW5hcnlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnYmFzZTY0JzpcclxuICAgICAgcmV0ID0gX2Jhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICd1Y3MyJzpcclxuICAgIGNhc2UgJ3Vjcy0yJzpcclxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxyXG4gICAgY2FzZSAndXRmLTE2bGUnOlxyXG4gICAgICByZXQgPSBfdXRmMTZsZVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxyXG4gIH1cclxuICByZXR1cm4gcmV0XHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcclxuICB2YXIgc2VsZiA9IHRoaXNcclxuXHJcbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXHJcbiAgc3RhcnQgPSBOdW1iZXIoc3RhcnQpIHx8IDBcclxuICBlbmQgPSAoZW5kICE9PSB1bmRlZmluZWQpXHJcbiAgICA/IE51bWJlcihlbmQpXHJcbiAgICA6IGVuZCA9IHNlbGYubGVuZ3RoXHJcblxyXG4gIC8vIEZhc3RwYXRoIGVtcHR5IHN0cmluZ3NcclxuICBpZiAoZW5kID09PSBzdGFydClcclxuICAgIHJldHVybiAnJ1xyXG5cclxuICB2YXIgcmV0XHJcbiAgc3dpdGNoIChlbmNvZGluZykge1xyXG4gICAgY2FzZSAnaGV4JzpcclxuICAgICAgcmV0ID0gX2hleFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICd1dGY4JzpcclxuICAgIGNhc2UgJ3V0Zi04JzpcclxuICAgICAgcmV0ID0gX3V0ZjhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnYXNjaWknOlxyXG4gICAgICByZXQgPSBfYXNjaWlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnYmluYXJ5JzpcclxuICAgICAgcmV0ID0gX2JpbmFyeVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdiYXNlNjQnOlxyXG4gICAgICByZXQgPSBfYmFzZTY0U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ3VjczInOlxyXG4gICAgY2FzZSAndWNzLTInOlxyXG4gICAgY2FzZSAndXRmMTZsZSc6XHJcbiAgICBjYXNlICd1dGYtMTZsZSc6XHJcbiAgICAgIHJldCA9IF91dGYxNmxlU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcclxuICAgICAgYnJlYWtcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXHJcbiAgfVxyXG4gIHJldHVybiByZXRcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHR5cGU6ICdCdWZmZXInLFxyXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXHJcbiAgfVxyXG59XHJcblxyXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXHJcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uICh0YXJnZXQsIHRhcmdldF9zdGFydCwgc3RhcnQsIGVuZCkge1xyXG4gIHZhciBzb3VyY2UgPSB0aGlzXHJcblxyXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxyXG4gIGlmICghZW5kICYmIGVuZCAhPT0gMCkgZW5kID0gdGhpcy5sZW5ndGhcclxuICBpZiAoIXRhcmdldF9zdGFydCkgdGFyZ2V0X3N0YXJ0ID0gMFxyXG5cclxuICAvLyBDb3B5IDAgYnl0ZXM7IHdlJ3JlIGRvbmVcclxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXHJcbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgc291cmNlLmxlbmd0aCA9PT0gMCkgcmV0dXJuXHJcblxyXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcclxuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnc291cmNlRW5kIDwgc291cmNlU3RhcnQnKVxyXG4gIGFzc2VydCh0YXJnZXRfc3RhcnQgPj0gMCAmJiB0YXJnZXRfc3RhcnQgPCB0YXJnZXQubGVuZ3RoLFxyXG4gICAgICAndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXHJcbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCBzb3VyY2UubGVuZ3RoLCAnc291cmNlU3RhcnQgb3V0IG9mIGJvdW5kcycpXHJcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSBzb3VyY2UubGVuZ3RoLCAnc291cmNlRW5kIG91dCBvZiBib3VuZHMnKVxyXG5cclxuICAvLyBBcmUgd2Ugb29iP1xyXG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aClcclxuICAgIGVuZCA9IHRoaXMubGVuZ3RoXHJcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgPCBlbmQgLSBzdGFydClcclxuICAgIGVuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgKyBzdGFydFxyXG5cclxuICB2YXIgbGVuID0gZW5kIC0gc3RhcnRcclxuXHJcbiAgaWYgKGxlbiA8IDEwMCB8fCAhQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKylcclxuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRfc3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXHJcbiAgfSBlbHNlIHtcclxuICAgIHRhcmdldC5fc2V0KHRoaXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuKSwgdGFyZ2V0X3N0YXJ0KVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gX2Jhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcclxuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XHJcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gX3V0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XHJcbiAgdmFyIHJlcyA9ICcnXHJcbiAgdmFyIHRtcCA9ICcnXHJcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxyXG5cclxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xyXG4gICAgaWYgKGJ1ZltpXSA8PSAweDdGKSB7XHJcbiAgICAgIHJlcyArPSBkZWNvZGVVdGY4Q2hhcih0bXApICsgU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXHJcbiAgICAgIHRtcCA9ICcnXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0bXAgKz0gJyUnICsgYnVmW2ldLnRvU3RyaW5nKDE2KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJlcyArIGRlY29kZVV0ZjhDaGFyKHRtcClcclxufVxyXG5cclxuZnVuY3Rpb24gX2FzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xyXG4gIHZhciByZXQgPSAnJ1xyXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcclxuXHJcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspXHJcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXHJcbiAgcmV0dXJuIHJldFxyXG59XHJcblxyXG5mdW5jdGlvbiBfYmluYXJ5U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xyXG4gIHJldHVybiBfYXNjaWlTbGljZShidWYsIHN0YXJ0LCBlbmQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9oZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XHJcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcclxuXHJcbiAgaWYgKCFzdGFydCB8fCBzdGFydCA8IDApIHN0YXJ0ID0gMFxyXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cclxuXHJcbiAgdmFyIG91dCA9ICcnXHJcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcclxuICAgIG91dCArPSB0b0hleChidWZbaV0pXHJcbiAgfVxyXG4gIHJldHVybiBvdXRcclxufVxyXG5cclxuZnVuY3Rpb24gX3V0ZjE2bGVTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XHJcbiAgdmFyIGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXHJcbiAgdmFyIHJlcyA9ICcnXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMikge1xyXG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyBieXRlc1tpKzFdICogMjU2KVxyXG4gIH1cclxuICByZXR1cm4gcmVzXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xyXG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxyXG4gIHN0YXJ0ID0gY2xhbXAoc3RhcnQsIGxlbiwgMClcclxuICBlbmQgPSBjbGFtcChlbmQsIGxlbiwgbGVuKVxyXG5cclxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xyXG4gICAgcmV0dXJuIEJ1ZmZlci5fYXVnbWVudCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpKVxyXG4gIH0gZWxzZSB7XHJcbiAgICB2YXIgc2xpY2VMZW4gPSBlbmQgLSBzdGFydFxyXG4gICAgdmFyIG5ld0J1ZiA9IG5ldyBCdWZmZXIoc2xpY2VMZW4sIHVuZGVmaW5lZCwgdHJ1ZSlcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpY2VMZW47IGkrKykge1xyXG4gICAgICBuZXdCdWZbaV0gPSB0aGlzW2kgKyBzdGFydF1cclxuICAgIH1cclxuICAgIHJldHVybiBuZXdCdWZcclxuICB9XHJcbn1cclxuXHJcbi8vIGBnZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXHJcbkJ1ZmZlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKG9mZnNldCkge1xyXG4gIGNvbnNvbGUubG9nKCcuZ2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxyXG4gIHJldHVybiB0aGlzLnJlYWRVSW50OChvZmZzZXQpXHJcbn1cclxuXHJcbi8vIGBzZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXHJcbkJ1ZmZlci5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKHYsIG9mZnNldCkge1xyXG4gIGNvbnNvbGUubG9nKCcuc2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxyXG4gIHJldHVybiB0aGlzLndyaXRlVUludDgodiwgb2Zmc2V0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICB9XHJcblxyXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxyXG59XHJcblxyXG5mdW5jdGlvbiBfcmVhZFVJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gIH1cclxuXHJcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcclxuICBpZiAob2Zmc2V0ID49IGxlbilcclxuICAgIHJldHVyblxyXG5cclxuICB2YXIgdmFsXHJcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xyXG4gICAgdmFsID0gYnVmW29mZnNldF1cclxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxyXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcclxuICB9IGVsc2Uge1xyXG4gICAgdmFsID0gYnVmW29mZnNldF0gPDwgOFxyXG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXHJcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV1cclxuICB9XHJcbiAgcmV0dXJuIHZhbFxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9yZWFkVUludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgfVxyXG5cclxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxyXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHZhciB2YWxcclxuICBpZiAobGl0dGxlRW5kaWFuKSB7XHJcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcclxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDJdIDw8IDE2XHJcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcclxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XHJcbiAgICB2YWwgfD0gYnVmW29mZnNldF1cclxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxyXG4gICAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldCArIDNdIDw8IDI0ID4+PiAwKVxyXG4gIH0gZWxzZSB7XHJcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcclxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDFdIDw8IDE2XHJcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcclxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAyXSA8PCA4XHJcbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcclxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAzXVxyXG4gICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXRdIDw8IDI0ID4+PiAwKVxyXG4gIH1cclxuICByZXR1cm4gdmFsXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcclxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gIH1cclxuXHJcbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcclxuICAgIHJldHVyblxyXG5cclxuICB2YXIgbmVnID0gdGhpc1tvZmZzZXRdICYgMHg4MFxyXG4gIGlmIChuZWcpXHJcbiAgICByZXR1cm4gKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xXHJcbiAgZWxzZVxyXG4gICAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxyXG59XHJcblxyXG5mdW5jdGlvbiBfcmVhZEludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgfVxyXG5cclxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxyXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQxNihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxyXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDBcclxuICBpZiAobmVnKVxyXG4gICAgcmV0dXJuICgweGZmZmYgLSB2YWwgKyAxKSAqIC0xXHJcbiAgZWxzZVxyXG4gICAgcmV0dXJuIHZhbFxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcclxufVxyXG5cclxuZnVuY3Rpb24gX3JlYWRJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gIH1cclxuXHJcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcclxuICBpZiAob2Zmc2V0ID49IGxlbilcclxuICAgIHJldHVyblxyXG5cclxuICB2YXIgdmFsID0gX3JlYWRVSW50MzIoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcclxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwMDAwMFxyXG4gIGlmIChuZWcpXHJcbiAgICByZXR1cm4gKDB4ZmZmZmZmZmYgLSB2YWwgKyAxKSAqIC0xXHJcbiAgZWxzZVxyXG4gICAgcmV0dXJuIHZhbFxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcclxufVxyXG5cclxuZnVuY3Rpb24gX3JlYWRGbG9hdCAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgfVxyXG5cclxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcclxufVxyXG5cclxuZnVuY3Rpb24gX3JlYWREb3VibGUgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmYpXHJcbiAgfVxyXG5cclxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKSByZXR1cm5cclxuXHJcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWVcclxufVxyXG5cclxuZnVuY3Rpb24gX3dyaXRlVUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxyXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZilcclxuICB9XHJcblxyXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXHJcbiAgaWYgKG9mZnNldCA+PSBsZW4pXHJcbiAgICByZXR1cm5cclxuXHJcbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDIpOyBpIDwgajsgaSsrKSB7XHJcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxyXG4gICAgICAgICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkpKSkgPj4+XHJcbiAgICAgICAgICAgIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpICogOFxyXG4gIH1cclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBfd3JpdGVVSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXHJcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmZmZmZilcclxuICB9XHJcblxyXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXHJcbiAgaWYgKG9mZnNldCA+PSBsZW4pXHJcbiAgICByZXR1cm5cclxuXHJcbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDQpOyBpIDwgajsgaSsrKSB7XHJcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxyXG4gICAgICAgICh2YWx1ZSA+Pj4gKGxpdHRsZUVuZGlhbiA/IGkgOiAzIC0gaSkgKiA4KSAmIDB4ZmZcclxuICB9XHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2YsIC0weDgwKVxyXG4gIH1cclxuXHJcbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcclxuICAgIHJldHVyblxyXG5cclxuICBpZiAodmFsdWUgPj0gMClcclxuICAgIHRoaXMud3JpdGVVSW50OCh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydClcclxuICBlbHNlXHJcbiAgICB0aGlzLndyaXRlVUludDgoMHhmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBub0Fzc2VydClcclxufVxyXG5cclxuZnVuY3Rpb24gX3dyaXRlSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXHJcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmLCAtMHg4MDAwKVxyXG4gIH1cclxuXHJcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcclxuICBpZiAob2Zmc2V0ID49IGxlbilcclxuICAgIHJldHVyblxyXG5cclxuICBpZiAodmFsdWUgPj0gMClcclxuICAgIF93cml0ZVVJbnQxNihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXHJcbiAgZWxzZVxyXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgMHhmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBfd3JpdGVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcclxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcclxuICB9XHJcblxyXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXHJcbiAgaWYgKG9mZnNldCA+PSBsZW4pXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgKHZhbHVlID49IDApXHJcbiAgICBfd3JpdGVVSW50MzIoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxyXG4gIGVsc2VcclxuICAgIF93cml0ZVVJbnQzMihidWYsIDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF93cml0ZUZsb2F0IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxyXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgsIC0zLjQwMjgyMzQ2NjM4NTI4ODZlKzM4KVxyXG4gIH1cclxuXHJcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcclxuICBpZiAob2Zmc2V0ID49IGxlbilcclxuICAgIHJldHVyblxyXG5cclxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF93cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcclxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsXHJcbiAgICAgICAgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXHJcbiAgfVxyXG5cclxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxyXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbi8vIGZpbGwodmFsdWUsIHN0YXJ0PTAsIGVuZD1idWZmZXIubGVuZ3RoKVxyXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiAodmFsdWUsIHN0YXJ0LCBlbmQpIHtcclxuICBpZiAoIXZhbHVlKSB2YWx1ZSA9IDBcclxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcclxuICBpZiAoIWVuZCkgZW5kID0gdGhpcy5sZW5ndGhcclxuXHJcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcclxuICAgIHZhbHVlID0gdmFsdWUuY2hhckNvZGVBdCgwKVxyXG4gIH1cclxuXHJcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgIWlzTmFOKHZhbHVlKSwgJ3ZhbHVlIGlzIG5vdCBhIG51bWJlcicpXHJcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ2VuZCA8IHN0YXJ0JylcclxuXHJcbiAgLy8gRmlsbCAwIGJ5dGVzOyB3ZSdyZSBkb25lXHJcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxyXG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXHJcblxyXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgdGhpcy5sZW5ndGgsICdzdGFydCBvdXQgb2YgYm91bmRzJylcclxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHRoaXMubGVuZ3RoLCAnZW5kIG91dCBvZiBib3VuZHMnKVxyXG5cclxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xyXG4gICAgdGhpc1tpXSA9IHZhbHVlXHJcbiAgfVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIG91dCA9IFtdXHJcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgb3V0W2ldID0gdG9IZXgodGhpc1tpXSlcclxuICAgIGlmIChpID09PSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTKSB7XHJcbiAgICAgIG91dFtpICsgMV0gPSAnLi4uJ1xyXG4gICAgICBicmVha1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gJzxCdWZmZXIgJyArIG91dC5qb2luKCcgJykgKyAnPidcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgYEFycmF5QnVmZmVyYCB3aXRoIHRoZSAqY29waWVkKiBtZW1vcnkgb2YgdGhlIGJ1ZmZlciBpbnN0YW5jZS5cclxuICogQWRkZWQgaW4gTm9kZSAwLjEyLiBPbmx5IGF2YWlsYWJsZSBpbiBicm93c2VycyB0aGF0IHN1cHBvcnQgQXJyYXlCdWZmZXIuXHJcbiAqL1xyXG5CdWZmZXIucHJvdG90eXBlLnRvQXJyYXlCdWZmZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgaWYgKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcclxuICAgICAgcmV0dXJuIChuZXcgQnVmZmVyKHRoaXMpKS5idWZmZXJcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHZhciBidWYgPSBuZXcgVWludDhBcnJheSh0aGlzLmxlbmd0aClcclxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGJ1Zi5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSlcclxuICAgICAgICBidWZbaV0gPSB0aGlzW2ldXHJcbiAgICAgIHJldHVybiBidWYuYnVmZmVyXHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignQnVmZmVyLnRvQXJyYXlCdWZmZXIgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXInKVxyXG4gIH1cclxufVxyXG5cclxuLy8gSEVMUEVSIEZVTkNUSU9OU1xyXG4vLyA9PT09PT09PT09PT09PT09XHJcblxyXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcclxuICBpZiAoc3RyLnRyaW0pIHJldHVybiBzdHIudHJpbSgpXHJcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcclxufVxyXG5cclxudmFyIEJQID0gQnVmZmVyLnByb3RvdHlwZVxyXG5cclxuLyoqXHJcbiAqIEF1Z21lbnQgYSBVaW50OEFycmF5ICppbnN0YW5jZSogKG5vdCB0aGUgVWludDhBcnJheSBjbGFzcyEpIHdpdGggQnVmZmVyIG1ldGhvZHNcclxuICovXHJcbkJ1ZmZlci5fYXVnbWVudCA9IGZ1bmN0aW9uIChhcnIpIHtcclxuICBhcnIuX2lzQnVmZmVyID0gdHJ1ZVxyXG5cclxuICAvLyBzYXZlIHJlZmVyZW5jZSB0byBvcmlnaW5hbCBVaW50OEFycmF5IGdldC9zZXQgbWV0aG9kcyBiZWZvcmUgb3ZlcndyaXRpbmdcclxuICBhcnIuX2dldCA9IGFyci5nZXRcclxuICBhcnIuX3NldCA9IGFyci5zZXRcclxuXHJcbiAgLy8gZGVwcmVjYXRlZCwgd2lsbCBiZSByZW1vdmVkIGluIG5vZGUgMC4xMytcclxuICBhcnIuZ2V0ID0gQlAuZ2V0XHJcbiAgYXJyLnNldCA9IEJQLnNldFxyXG5cclxuICBhcnIud3JpdGUgPSBCUC53cml0ZVxyXG4gIGFyci50b1N0cmluZyA9IEJQLnRvU3RyaW5nXHJcbiAgYXJyLnRvTG9jYWxlU3RyaW5nID0gQlAudG9TdHJpbmdcclxuICBhcnIudG9KU09OID0gQlAudG9KU09OXHJcbiAgYXJyLmNvcHkgPSBCUC5jb3B5XHJcbiAgYXJyLnNsaWNlID0gQlAuc2xpY2VcclxuICBhcnIucmVhZFVJbnQ4ID0gQlAucmVhZFVJbnQ4XHJcbiAgYXJyLnJlYWRVSW50MTZMRSA9IEJQLnJlYWRVSW50MTZMRVxyXG4gIGFyci5yZWFkVUludDE2QkUgPSBCUC5yZWFkVUludDE2QkVcclxuICBhcnIucmVhZFVJbnQzMkxFID0gQlAucmVhZFVJbnQzMkxFXHJcbiAgYXJyLnJlYWRVSW50MzJCRSA9IEJQLnJlYWRVSW50MzJCRVxyXG4gIGFyci5yZWFkSW50OCA9IEJQLnJlYWRJbnQ4XHJcbiAgYXJyLnJlYWRJbnQxNkxFID0gQlAucmVhZEludDE2TEVcclxuICBhcnIucmVhZEludDE2QkUgPSBCUC5yZWFkSW50MTZCRVxyXG4gIGFyci5yZWFkSW50MzJMRSA9IEJQLnJlYWRJbnQzMkxFXHJcbiAgYXJyLnJlYWRJbnQzMkJFID0gQlAucmVhZEludDMyQkVcclxuICBhcnIucmVhZEZsb2F0TEUgPSBCUC5yZWFkRmxvYXRMRVxyXG4gIGFyci5yZWFkRmxvYXRCRSA9IEJQLnJlYWRGbG9hdEJFXHJcbiAgYXJyLnJlYWREb3VibGVMRSA9IEJQLnJlYWREb3VibGVMRVxyXG4gIGFyci5yZWFkRG91YmxlQkUgPSBCUC5yZWFkRG91YmxlQkVcclxuICBhcnIud3JpdGVVSW50OCA9IEJQLndyaXRlVUludDhcclxuICBhcnIud3JpdGVVSW50MTZMRSA9IEJQLndyaXRlVUludDE2TEVcclxuICBhcnIud3JpdGVVSW50MTZCRSA9IEJQLndyaXRlVUludDE2QkVcclxuICBhcnIud3JpdGVVSW50MzJMRSA9IEJQLndyaXRlVUludDMyTEVcclxuICBhcnIud3JpdGVVSW50MzJCRSA9IEJQLndyaXRlVUludDMyQkVcclxuICBhcnIud3JpdGVJbnQ4ID0gQlAud3JpdGVJbnQ4XHJcbiAgYXJyLndyaXRlSW50MTZMRSA9IEJQLndyaXRlSW50MTZMRVxyXG4gIGFyci53cml0ZUludDE2QkUgPSBCUC53cml0ZUludDE2QkVcclxuICBhcnIud3JpdGVJbnQzMkxFID0gQlAud3JpdGVJbnQzMkxFXHJcbiAgYXJyLndyaXRlSW50MzJCRSA9IEJQLndyaXRlSW50MzJCRVxyXG4gIGFyci53cml0ZUZsb2F0TEUgPSBCUC53cml0ZUZsb2F0TEVcclxuICBhcnIud3JpdGVGbG9hdEJFID0gQlAud3JpdGVGbG9hdEJFXHJcbiAgYXJyLndyaXRlRG91YmxlTEUgPSBCUC53cml0ZURvdWJsZUxFXHJcbiAgYXJyLndyaXRlRG91YmxlQkUgPSBCUC53cml0ZURvdWJsZUJFXHJcbiAgYXJyLmZpbGwgPSBCUC5maWxsXHJcbiAgYXJyLmluc3BlY3QgPSBCUC5pbnNwZWN0XHJcbiAgYXJyLnRvQXJyYXlCdWZmZXIgPSBCUC50b0FycmF5QnVmZmVyXHJcblxyXG4gIHJldHVybiBhcnJcclxufVxyXG5cclxuLy8gc2xpY2Uoc3RhcnQsIGVuZClcclxuZnVuY3Rpb24gY2xhbXAgKGluZGV4LCBsZW4sIGRlZmF1bHRWYWx1ZSkge1xyXG4gIGlmICh0eXBlb2YgaW5kZXggIT09ICdudW1iZXInKSByZXR1cm4gZGVmYXVsdFZhbHVlXHJcbiAgaW5kZXggPSB+fmluZGV4OyAgLy8gQ29lcmNlIHRvIGludGVnZXIuXHJcbiAgaWYgKGluZGV4ID49IGxlbikgcmV0dXJuIGxlblxyXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcclxuICBpbmRleCArPSBsZW5cclxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XHJcbiAgcmV0dXJuIDBcclxufVxyXG5cclxuZnVuY3Rpb24gY29lcmNlIChsZW5ndGgpIHtcclxuICAvLyBDb2VyY2UgbGVuZ3RoIHRvIGEgbnVtYmVyIChwb3NzaWJseSBOYU4pLCByb3VuZCB1cFxyXG4gIC8vIGluIGNhc2UgaXQncyBmcmFjdGlvbmFsIChlLmcuIDEyMy40NTYpIHRoZW4gZG8gYVxyXG4gIC8vIGRvdWJsZSBuZWdhdGUgdG8gY29lcmNlIGEgTmFOIHRvIDAuIEVhc3ksIHJpZ2h0P1xyXG4gIGxlbmd0aCA9IH5+TWF0aC5jZWlsKCtsZW5ndGgpXHJcbiAgcmV0dXJuIGxlbmd0aCA8IDAgPyAwIDogbGVuZ3RoXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzQXJyYXkgKHN1YmplY3QpIHtcclxuICByZXR1cm4gKEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHN1YmplY3QpIHtcclxuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3ViamVjdCkgPT09ICdbb2JqZWN0IEFycmF5XSdcclxuICB9KShzdWJqZWN0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBpc0FycmF5aXNoIChzdWJqZWN0KSB7XHJcbiAgcmV0dXJuIGlzQXJyYXkoc3ViamVjdCkgfHwgQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpIHx8XHJcbiAgICAgIHN1YmplY3QgJiYgdHlwZW9mIHN1YmplY3QgPT09ICdvYmplY3QnICYmXHJcbiAgICAgIHR5cGVvZiBzdWJqZWN0Lmxlbmd0aCA9PT0gJ251bWJlcidcclxufVxyXG5cclxuZnVuY3Rpb24gdG9IZXggKG4pIHtcclxuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcclxuICByZXR1cm4gbi50b1N0cmluZygxNilcclxufVxyXG5cclxuZnVuY3Rpb24gdXRmOFRvQnl0ZXMgKHN0cikge1xyXG4gIHZhciBieXRlQXJyYXkgPSBbXVxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB2YXIgYiA9IHN0ci5jaGFyQ29kZUF0KGkpXHJcbiAgICBpZiAoYiA8PSAweDdGKVxyXG4gICAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSlcclxuICAgIGVsc2Uge1xyXG4gICAgICB2YXIgc3RhcnQgPSBpXHJcbiAgICAgIGlmIChiID49IDB4RDgwMCAmJiBiIDw9IDB4REZGRikgaSsrXHJcbiAgICAgIHZhciBoID0gZW5jb2RlVVJJQ29tcG9uZW50KHN0ci5zbGljZShzdGFydCwgaSsxKSkuc3Vic3RyKDEpLnNwbGl0KCclJylcclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBoLmxlbmd0aDsgaisrKVxyXG4gICAgICAgIGJ5dGVBcnJheS5wdXNoKHBhcnNlSW50KGhbal0sIDE2KSlcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGJ5dGVBcnJheVxyXG59XHJcblxyXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xyXG4gIHZhciBieXRlQXJyYXkgPSBbXVxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cclxuICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRilcclxuICB9XHJcbiAgcmV0dXJuIGJ5dGVBcnJheVxyXG59XHJcblxyXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyKSB7XHJcbiAgdmFyIGMsIGhpLCBsb1xyXG4gIHZhciBieXRlQXJyYXkgPSBbXVxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBjID0gc3RyLmNoYXJDb2RlQXQoaSlcclxuICAgIGhpID0gYyA+PiA4XHJcbiAgICBsbyA9IGMgJSAyNTZcclxuICAgIGJ5dGVBcnJheS5wdXNoKGxvKVxyXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXHJcbiAgfVxyXG5cclxuICByZXR1cm4gYnl0ZUFycmF5XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xyXG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoc3RyKVxyXG59XHJcblxyXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcclxuICB2YXIgcG9zXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKVxyXG4gICAgICBicmVha1xyXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXHJcbiAgfVxyXG4gIHJldHVybiBpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlY29kZVV0ZjhDaGFyIChzdHIpIHtcclxuICB0cnkge1xyXG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzdHIpXHJcbiAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSgweEZGRkQpIC8vIFVURiA4IGludmFsaWQgY2hhclxyXG4gIH1cclxufVxyXG5cclxuLypcclxuICogV2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhhdCB0aGUgdmFsdWUgaXMgYSB2YWxpZCBpbnRlZ2VyLiBUaGlzIG1lYW5zIHRoYXQgaXRcclxuICogaXMgbm9uLW5lZ2F0aXZlLiBJdCBoYXMgbm8gZnJhY3Rpb25hbCBjb21wb25lbnQgYW5kIHRoYXQgaXQgZG9lcyBub3RcclxuICogZXhjZWVkIHRoZSBtYXhpbXVtIGFsbG93ZWQgdmFsdWUuXHJcbiAqL1xyXG5mdW5jdGlvbiB2ZXJpZnVpbnQgKHZhbHVlLCBtYXgpIHtcclxuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxyXG4gIGFzc2VydCh2YWx1ZSA+PSAwLCAnc3BlY2lmaWVkIGEgbmVnYXRpdmUgdmFsdWUgZm9yIHdyaXRpbmcgYW4gdW5zaWduZWQgdmFsdWUnKVxyXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBpcyBsYXJnZXIgdGhhbiBtYXhpbXVtIHZhbHVlIGZvciB0eXBlJylcclxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxyXG59XHJcblxyXG5mdW5jdGlvbiB2ZXJpZnNpbnQgKHZhbHVlLCBtYXgsIG1pbikge1xyXG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXHJcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXHJcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxyXG4gIGFzc2VydChNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHZlcmlmSUVFRTc1NCAodmFsdWUsIG1heCwgbWluKSB7XHJcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcclxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcclxuICBhc3NlcnQodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFzc2VydCAodGVzdCwgbWVzc2FnZSkge1xyXG4gIGlmICghdGVzdCkgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UgfHwgJ0ZhaWxlZCBhc3NlcnRpb24nKVxyXG59XHJcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcYnVmZmVyXFxcXGluZGV4LmpzXCIsXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJ1ZmZlclwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbmV4cG9ydHMucmVhZCA9IGZ1bmN0aW9uIChidWZmZXIsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XHJcbiAgdmFyIGUsIG1cclxuICB2YXIgZUxlbiA9IChuQnl0ZXMgKiA4KSAtIG1MZW4gLSAxXHJcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcclxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcclxuICB2YXIgbkJpdHMgPSAtN1xyXG4gIHZhciBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDBcclxuICB2YXIgZCA9IGlzTEUgPyAtMSA6IDFcclxuICB2YXIgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxyXG5cclxuICBpICs9IGRcclxuXHJcbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcclxuICBzID4+PSAoLW5CaXRzKVxyXG4gIG5CaXRzICs9IGVMZW5cclxuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gKGUgKiAyNTYpICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XHJcblxyXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXHJcbiAgZSA+Pj0gKC1uQml0cylcclxuICBuQml0cyArPSBtTGVuXHJcbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IChtICogMjU2KSArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxyXG5cclxuICBpZiAoZSA9PT0gMCkge1xyXG4gICAgZSA9IDEgLSBlQmlhc1xyXG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xyXG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpXHJcbiAgfSBlbHNlIHtcclxuICAgIG0gPSBtICsgTWF0aC5wb3coMiwgbUxlbilcclxuICAgIGUgPSBlIC0gZUJpYXNcclxuICB9XHJcbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbilcclxufVxyXG5cclxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uIChidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xyXG4gIHZhciBlLCBtLCBjXHJcbiAgdmFyIGVMZW4gPSAobkJ5dGVzICogOCkgLSBtTGVuIC0gMVxyXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXHJcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXHJcbiAgdmFyIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKVxyXG4gIHZhciBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSlcclxuICB2YXIgZCA9IGlzTEUgPyAxIDogLTFcclxuICB2YXIgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxyXG5cclxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKVxyXG5cclxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xyXG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwXHJcbiAgICBlID0gZU1heFxyXG4gIH0gZWxzZSB7XHJcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMilcclxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcclxuICAgICAgZS0tXHJcbiAgICAgIGMgKj0gMlxyXG4gICAgfVxyXG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XHJcbiAgICAgIHZhbHVlICs9IHJ0IC8gY1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpXHJcbiAgICB9XHJcbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcclxuICAgICAgZSsrXHJcbiAgICAgIGMgLz0gMlxyXG4gICAgfVxyXG5cclxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xyXG4gICAgICBtID0gMFxyXG4gICAgICBlID0gZU1heFxyXG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xyXG4gICAgICBtID0gKCh2YWx1ZSAqIGMpIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxyXG4gICAgICBlID0gZSArIGVCaWFzXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcclxuICAgICAgZSA9IDBcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZvciAoOyBtTGVuID49IDg7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IG0gJiAweGZmLCBpICs9IGQsIG0gLz0gMjU2LCBtTGVuIC09IDgpIHt9XHJcblxyXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG1cclxuICBlTGVuICs9IG1MZW5cclxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XHJcblxyXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyOFxyXG59XHJcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcaWVlZTc1NFxcXFxpbmRleC5qc1wiLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxpZWVlNzU0XCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXHJcblxyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XHJcblxyXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xyXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcclxuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcclxuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxyXG4gICAgO1xyXG5cclxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoY2FuUG9zdCkge1xyXG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XHJcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XHJcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xyXG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIHRydWUpO1xyXG5cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcclxuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XHJcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xyXG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xyXG4gICAgfTtcclxufSkoKTtcclxuXHJcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XHJcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XHJcbnByb2Nlc3MuZW52ID0ge307XHJcbnByb2Nlc3MuYXJndiA9IFtdO1xyXG5cclxuZnVuY3Rpb24gbm9vcCgpIHt9XHJcblxyXG5wcm9jZXNzLm9uID0gbm9vcDtcclxucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XHJcbnByb2Nlc3Mub25jZSA9IG5vb3A7XHJcbnByb2Nlc3Mub2ZmID0gbm9vcDtcclxucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XHJcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcclxucHJvY2Vzcy5lbWl0ID0gbm9vcDtcclxuXHJcbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XHJcbn1cclxuXHJcbi8vIFRPRE8oc2h0eWxtYW4pXHJcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XHJcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xyXG59O1xyXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXHByb2Nlc3NcXFxcYnJvd3Nlci5qc1wiLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxwcm9jZXNzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5NZWRpYVR5cGUgPSB2b2lkIDA7XHJcbnZhciBNZWRpYVR5cGU7XHJcbihmdW5jdGlvbiAoTWVkaWFUeXBlKSB7XHJcbiAgICBNZWRpYVR5cGVbXCJWSURFT1wiXSA9IFwidmlkZW9cIjtcclxuICAgIE1lZGlhVHlwZVtcIkFVRElPXCJdID0gXCJhdWRpb1wiO1xyXG4gICAgTWVkaWFUeXBlW1wiUFJFU0VOVEVSXCJdID0gXCJwcmVzZW50ZXJcIjtcclxufSkoTWVkaWFUeXBlID0gZXhwb3J0cy5NZWRpYVR5cGUgfHwgKGV4cG9ydHMuTWVkaWFUeXBlID0ge30pKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9TWVkaWFUeXBlLmpzLm1hcFxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9lbnVtXFxcXE1lZGlhVHlwZS5qc1wiLFwiL2VudW1cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLlBhcnRpY2lwYW50VHlwZSA9IHZvaWQgMDtcclxudmFyIFBhcnRpY2lwYW50VHlwZTtcclxuKGZ1bmN0aW9uIChQYXJ0aWNpcGFudFR5cGUpIHtcclxuICAgIFBhcnRpY2lwYW50VHlwZVtcIk5vcm1hbFwiXSA9IFwiTm9ybWFsXCI7XHJcbiAgICBQYXJ0aWNpcGFudFR5cGVbXCJIb3N0XCJdID0gXCJIb3N0XCI7XHJcbn0pKFBhcnRpY2lwYW50VHlwZSA9IGV4cG9ydHMuUGFydGljaXBhbnRUeXBlIHx8IChleHBvcnRzLlBhcnRpY2lwYW50VHlwZSA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVBhcnRpY2lwYW50VHlwZS5qcy5tYXBcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZW51bVxcXFxQYXJ0aWNpcGFudFR5cGUuanNcIixcIi9lbnVtXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5Mb2JieSA9IHZvaWQgMDtcclxudmFyIE1lZGlhVHlwZV8xID0gcmVxdWlyZShcIi4vZW51bS9NZWRpYVR5cGVcIik7XHJcbnZhciBzbmlwcGV0XzEgPSByZXF1aXJlKFwiLi91dGlsL3NuaXBwZXRcIik7XHJcbnZhciBQYXJ0aWNpcGFudFR5cGVfMSA9IHJlcXVpcmUoXCIuL2VudW0vUGFydGljaXBhbnRUeXBlXCIpO1xyXG52YXIgTG9iYnlTZWV0aW5ncyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIExvYmJ5U2VldGluZ3MoKSB7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gTG9iYnlTZWV0aW5ncztcclxufSgpKTtcclxudmFyIExvYmJ5ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTG9iYnkoKSB7XHJcbiAgICAgICAgdGhpcy5KaXRzaU1lZXRKUyA9IHdpbmRvdy5KaXRzaU1lZXRKUztcclxuICAgICAgICB0aGlzLmF1ZGlvVHJhY2tFcnJvciA9IG51bGw7XHJcbiAgICAgICAgdGhpcy52aWRlb1RyYWNrRXJyb3IgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlQ2FtZXJhRGV2aWNlSWQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlTWljRGV2aWNlSWQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlU3BlYWtlckRldmljZUlkID0gbnVsbDtcclxuICAgICAgICB0aGlzLmNvbmZlcmVuY2VJZCA9IHdpbmRvdy5jb25mZXJlbmNlSWQ7XHJcbiAgICAgICAgdGhpcy51c2VySWQgPSB3aW5kb3cudXNlcklkO1xyXG4gICAgICAgIHRoaXMubG9jYWxWaWRlb1RyYWNrID0gbnVsbDtcclxuICAgICAgICB0aGlzLmxvY2FsQXVkaW9UcmFjayA9IG51bGw7XHJcbiAgICAgICAgdGhpcy52aWRlb1ByZXZpZXdFbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW1lcmEtcHJldmlld1wiKTtcclxuICAgICAgICB0aGlzLmF1ZGlvUHJldmlld0VsZW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1pYy1wcmV2aWV3XCIpO1xyXG4gICAgICAgIHRoaXMuY2FtZXJhTGlzdEVsZW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbWVyYS1saXN0XCIpO1xyXG4gICAgICAgIHRoaXMubWljTGlzdEVsZW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1pYy1saXN0XCIpO1xyXG4gICAgICAgIHRoaXMuc3BlYWtlckxpc3RFbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzcGVha2VyLWxpc3RcIik7XHJcbiAgICAgICAgdGhpcy52aWRlb011dGVFbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ2aWRlb011dGVcIik7XHJcbiAgICAgICAgdGhpcy5hdWRpb011dGVFbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdWRpb011dGVcIik7XHJcbiAgICAgICAgdGhpcy5hbm9ueW1vdXNOYW1lRmlsZWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFub255bW91cy1uYW1lXCIpO1xyXG4gICAgICAgIHRoaXMuc3RhcnRTZXNzaW9uQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydC1zZXNzaW9uXCIpO1xyXG4gICAgfVxyXG4gICAgTG9iYnkucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBfdGhpc18xID0gdGhpcztcclxuICAgICAgICB2YXIgaW5pdE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGRpc2FibGVBdWRpb0xldmVsczogdHJ1ZVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5KaXRzaU1lZXRKUy5pbml0KGluaXRPcHRpb25zKTtcclxuICAgICAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIF90aGlzXzEucmVzaXplQ2FtZXJhVmlldygpO1xyXG4gICAgICAgICAgICBfdGhpc18xLmF0dGFjaEV2ZW50SGFuZGxlcnMoKTtcclxuICAgICAgICAgICAgX3RoaXNfMS5yZWZyZXNoRGV2aWNlTGlzdCgpO1xyXG4gICAgICAgICAgICAkKF90aGlzXzEuc3RhcnRTZXNzaW9uQnV0dG9uKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xyXG4gICAgICAgICAgICBfdGhpc18xLnZpZGVvTXV0ZUVsZW0uY2hlY2tlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBfdGhpc18xLmF1ZGlvTXV0ZUVsZW0uY2hlY2tlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBfdGhpc18xLnZpZGVvTXV0ZUVsZW0uZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBfdGhpc18xLmF1ZGlvTXV0ZUVsZW0uZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcGkvTWVldGluZy9cIiArIF90aGlzXzEuY29uZmVyZW5jZUlkLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJHRVRcIixcclxuICAgICAgICAgICAgICAgIGRhdGE6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxyXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzXzEub25NZWV0aW5nUmVzdWx0KHJlcyk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uICh4aHIsIHN0YXR1cywgZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpc18xLm9uTWVldGluZ0Vycm9yUmVzdWx0KGVycm9yKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgTG9iYnkucHJvdG90eXBlLmF0dGFjaEV2ZW50SGFuZGxlcnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzXzEgPSB0aGlzO1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgJCh0aGlzLmNhbWVyYUxpc3RFbGVtKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBfdGhpcy5vbkNhbWVyYUNoYW5nZWQoJCh0aGlzKS52YWwoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCh0aGlzLm1pY0xpc3RFbGVtKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBfdGhpcy5vbk1pY0NoYW5nZWQoJCh0aGlzKS52YWwoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCh0aGlzLnNwZWFrZXJMaXN0RWxlbSkub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgX3RoaXMub25TcGVha2VyQ2hhbmdlZCgkKHRoaXMpLnZhbCgpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKHRoaXMuc3RhcnRTZXNzaW9uQnV0dG9uKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIF90aGlzXzEuc3RhcnRTZXNzaW9uKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIF90aGlzXzEucmVzaXplQ2FtZXJhVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQodGhpcy52aWRlb011dGVFbGVtKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBfdGhpcy5vbkVuYWJsZVZpZGVvKHRoaXMuY2hlY2tlZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCh0aGlzLmF1ZGlvTXV0ZUVsZW0pLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIF90aGlzLm9uRW5hYmxlQXVkaW8odGhpcy5jaGVja2VkKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBMb2JieS5wcm90b3R5cGUucmVmcmVzaERldmljZUxpc3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzXzEgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuSml0c2lNZWV0SlMubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMoZnVuY3Rpb24gKGRldmljZXMpIHtcclxuICAgICAgICAgICAgX3RoaXNfMS5jYW1lcmFMaXN0ID0gZGV2aWNlcy5maWx0ZXIoZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQua2luZCA9PT0gJ3ZpZGVvaW5wdXQnOyB9KTtcclxuICAgICAgICAgICAgX3RoaXNfMS5taWNMaXN0ID0gZGV2aWNlcy5maWx0ZXIoZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQua2luZCA9PT0gJ2F1ZGlvaW5wdXQnOyB9KTtcclxuICAgICAgICAgICAgX3RoaXNfMS5zcGVha2VyTGlzdCA9IGRldmljZXMuZmlsdGVyKGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLmtpbmQgPT09ICdhdWRpb291dHB1dCc7IH0pO1xyXG4gICAgICAgICAgICBfdGhpc18xLnJlbmRlckRldmljZXMoKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBMb2JieS5wcm90b3R5cGUucmVuZGVyRGV2aWNlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgX3RoaXNfMSA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5jbGVhckRPTUVsZW1lbnQodGhpcy5jYW1lcmFMaXN0RWxlbSk7XHJcbiAgICAgICAgdGhpcy5jYW1lcmFMaXN0LmZvckVhY2goZnVuY3Rpb24gKGNhbWVyYSkge1xyXG4gICAgICAgICAgICAkKF90aGlzXzEuY2FtZXJhTGlzdEVsZW0pLmFwcGVuZChcIjxvcHRpb24gdmFsdWU9XFxcIlwiICsgY2FtZXJhLmRldmljZUlkICsgXCJcXFwiPlwiICsgY2FtZXJhLmxhYmVsICsgXCI8L29wdGlvbj5cIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5jbGVhckRPTUVsZW1lbnQodGhpcy5taWNMaXN0RWxlbSk7XHJcbiAgICAgICAgdGhpcy5taWNMaXN0LmZvckVhY2goZnVuY3Rpb24gKG1pYykge1xyXG4gICAgICAgICAgICAkKF90aGlzXzEubWljTGlzdEVsZW0pLmFwcGVuZChcIjxvcHRpb24gdmFsdWU9XFxcIlwiICsgbWljLmRldmljZUlkICsgXCJcXFwiPlwiICsgbWljLmxhYmVsICsgXCI8L29wdGlvbj5cIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5jbGVhckRPTUVsZW1lbnQodGhpcy5zcGVha2VyTGlzdEVsZW0pO1xyXG4gICAgICAgIHRoaXMuc3BlYWtlckxpc3QuZm9yRWFjaChmdW5jdGlvbiAoc3BlYWtlcikge1xyXG4gICAgICAgICAgICAkKF90aGlzXzEuc3BlYWtlckxpc3RFbGVtKS5hcHBlbmQoXCI8b3B0aW9uIHZhbHVlPVxcXCJcIiArIHNwZWFrZXIuZGV2aWNlSWQgKyBcIlxcXCI+XCIgKyBzcGVha2VyLmxhYmVsICsgXCI8L29wdGlvbj5cIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVDYW1lcmFEZXZpY2VJZCA9IHRoaXMuY2FtZXJhTGlzdC5sZW5ndGggPiAwID8gdGhpcy5jYW1lcmFMaXN0WzBdLmRldmljZUlkIDogbnVsbDtcclxuICAgICAgICB0aGlzLmFjdGl2ZU1pY0RldmljZUlkID0gdGhpcy5taWNMaXN0Lmxlbmd0aCA+IDAgPyB0aGlzLm1pY0xpc3RbMF0uZGV2aWNlSWQgOiBudWxsO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlU3BlYWtlckRldmljZUlkID0gdGhpcy5zcGVha2VyTGlzdC5sZW5ndGggPiAwID8gdGhpcy5zcGVha2VyTGlzdFswXS5kZXZpY2VJZCA6IG51bGw7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVMb2NhbFRyYWNrcyh0aGlzLmFjdGl2ZUNhbWVyYURldmljZUlkLCB0aGlzLmFjdGl2ZU1pY0RldmljZUlkKVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAodHJhY2tzKSB7XHJcbiAgICAgICAgICAgIF90aGlzXzEuaW5pdE9uVHJhY2tzKHRyYWNrcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgTG9iYnkucHJvdG90eXBlLmluaXRPblRyYWNrcyA9IGZ1bmN0aW9uICh0cmFja3MpIHtcclxuICAgICAgICB2YXIgX3RoaXNfMSA9IHRoaXM7XHJcbiAgICAgICAgdHJhY2tzLmZvckVhY2goZnVuY3Rpb24gKHQpIHtcclxuICAgICAgICAgICAgaWYgKHQuZ2V0VHlwZSgpID09PSBNZWRpYVR5cGVfMS5NZWRpYVR5cGUuVklERU8pIHtcclxuICAgICAgICAgICAgICAgIF90aGlzXzEubG9jYWxWaWRlb1RyYWNrID0gdDtcclxuICAgICAgICAgICAgICAgIF90aGlzXzEuYXR0YWNoVmlkZW9UcmFja1RvRWxlbSh0LCBfdGhpc18xLnZpZGVvUHJldmlld0VsZW0pO1xyXG4gICAgICAgICAgICAgICAgX3RoaXNfMS5zaG93Q2FtZXJhKHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHQuZ2V0VHlwZSgpID09PSBNZWRpYVR5cGVfMS5NZWRpYVR5cGUuQVVESU8pIHtcclxuICAgICAgICAgICAgICAgIF90aGlzXzEubG9jYWxBdWRpb1RyYWNrID0gdDtcclxuICAgICAgICAgICAgICAgIHQuYXR0YWNoKF90aGlzXzEuYXVkaW9QcmV2aWV3RWxlbSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAodGhpcy5hY3RpdmVDYW1lcmFEZXZpY2VJZCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLnNob3dDYW1lcmEoZmFsc2UpO1xyXG4gICAgICAgICAgICB0aGlzLnZpZGVvTXV0ZUVsZW0uZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLnZpZGVvTXV0ZUVsZW0uY2hlY2tlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmNhbWVyYUxpc3RFbGVtLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0NhbWVyYSh0cnVlKTtcclxuICAgICAgICAgICAgdGhpcy52aWRlb011dGVFbGVtLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMudmlkZW9NdXRlRWxlbS5jaGVja2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5jYW1lcmFMaXN0RWxlbS5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5hY3RpdmVNaWNEZXZpY2VJZCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmF1ZGlvTXV0ZUVsZW0uZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmF1ZGlvTXV0ZUVsZW0uY2hlY2tlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLm1pY0xpc3RFbGVtLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuYXVkaW9NdXRlRWxlbS5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmF1ZGlvTXV0ZUVsZW0uY2hlY2tlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMubWljTGlzdEVsZW0uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTG9iYnkucHJvdG90eXBlLmNsZWFyRE9NRWxlbWVudCA9IGZ1bmN0aW9uIChlbGVtKSB7XHJcbiAgICAgICAgd2hpbGUgKGVsZW0uZmlyc3RDaGlsZCkge1xyXG4gICAgICAgICAgICBlbGVtLnJlbW92ZUNoaWxkKGVsZW0uZmlyc3RDaGlsZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIExvYmJ5LnByb3RvdHlwZS5jcmVhdGVMb2NhbFRyYWNrcyA9IGZ1bmN0aW9uIChjYW1lcmFEZXZpY2VJZCwgbWljRGV2aWNlSWQpIHtcclxuICAgICAgICB2YXIgX3RoaXNfMSA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy52aWRlb1RyYWNrRXJyb3IgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuYXVkaW9UcmFja0Vycm9yID0gbnVsbDtcclxuICAgICAgICBpZiAoY2FtZXJhRGV2aWNlSWQgIT0gbnVsbCAmJiBtaWNEZXZpY2VJZCAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkppdHNpTWVldEpTLmNyZWF0ZUxvY2FsVHJhY2tzKHtcclxuICAgICAgICAgICAgICAgIGRldmljZXM6IFsnYXVkaW8nLCAndmlkZW8nXSxcclxuICAgICAgICAgICAgICAgIGNhbWVyYURldmljZUlkOiBjYW1lcmFEZXZpY2VJZCxcclxuICAgICAgICAgICAgICAgIG1pY0RldmljZUlkOiBtaWNEZXZpY2VJZFxyXG4gICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoKSB7IHJldHVybiBQcm9taXNlLmFsbChbXHJcbiAgICAgICAgICAgICAgICBfdGhpc18xLmNyZWF0ZUF1ZGlvVHJhY2sobWljRGV2aWNlSWQpLnRoZW4oZnVuY3Rpb24gKF9hKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0cmVhbSA9IF9hWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHJlYW07XHJcbiAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICAgIF90aGlzXzEuY3JlYXRlVmlkZW9UcmFjayhjYW1lcmFEZXZpY2VJZCkudGhlbihmdW5jdGlvbiAoX2EpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RyZWFtID0gX2FbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0cmVhbTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIF0pOyB9KS50aGVuKGZ1bmN0aW9uICh0cmFja3MpIHtcclxuICAgICAgICAgICAgICAgIGlmIChfdGhpc18xLmF1ZGlvVHJhY2tFcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZGlzcGxheSBlcnJvclxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKF90aGlzXzEudmlkZW9UcmFja0Vycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9kaXNwbGF5IGVycm9yXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJhY2tzLmZpbHRlcihmdW5jdGlvbiAodCkgeyByZXR1cm4gdHlwZW9mIHQgIT09ICd1bmRlZmluZWQnOyB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGNhbWVyYURldmljZUlkICE9IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlVmlkZW9UcmFjayhjYW1lcmFEZXZpY2VJZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKG1pY0RldmljZUlkICE9IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlQXVkaW9UcmFjayhtaWNEZXZpY2VJZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xyXG4gICAgfTtcclxuICAgIExvYmJ5LnByb3RvdHlwZS5jcmVhdGVWaWRlb1RyYWNrID0gZnVuY3Rpb24gKGNhbWVyYURldmljZUlkKSB7XHJcbiAgICAgICAgdmFyIF90aGlzXzEgPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiB0aGlzLkppdHNpTWVldEpTLmNyZWF0ZUxvY2FsVHJhY2tzKHtcclxuICAgICAgICAgICAgZGV2aWNlczogWyd2aWRlbyddLFxyXG4gICAgICAgICAgICBjYW1lcmFEZXZpY2VJZDogY2FtZXJhRGV2aWNlSWQsXHJcbiAgICAgICAgICAgIG1pY0RldmljZUlkOiBudWxsXHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICBfdGhpc18xLnZpZGVvVHJhY2tFcnJvciA9IGVycm9yO1xyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBMb2JieS5wcm90b3R5cGUuY3JlYXRlQXVkaW9UcmFjayA9IGZ1bmN0aW9uIChtaWNEZXZpY2VJZCkge1xyXG4gICAgICAgIHZhciBfdGhpc18xID0gdGhpcztcclxuICAgICAgICByZXR1cm4gKHRoaXMuSml0c2lNZWV0SlMuY3JlYXRlTG9jYWxUcmFja3Moe1xyXG4gICAgICAgICAgICBkZXZpY2VzOiBbJ2F1ZGlvJ10sXHJcbiAgICAgICAgICAgIGNhbWVyYURldmljZUlkOiBudWxsLFxyXG4gICAgICAgICAgICBtaWNEZXZpY2VJZDogbWljRGV2aWNlSWRcclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgIF90aGlzXzEuYXVkaW9UcmFja0Vycm9yID0gZXJyb3I7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xyXG4gICAgICAgIH0pKTtcclxuICAgIH07XHJcbiAgICBMb2JieS5wcm90b3R5cGUub25DYW1lcmFDaGFuZ2VkID0gZnVuY3Rpb24gKGNhbWVyYURldmljZUlkKSB7XHJcbiAgICAgICAgdmFyIF90aGlzXzEgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlQ2FtZXJhRGV2aWNlSWQgPSBjYW1lcmFEZXZpY2VJZDtcclxuICAgICAgICB0aGlzLnJlbW92ZVZpZGVvVHJhY2soKTtcclxuICAgICAgICB0aGlzLmNyZWF0ZUxvY2FsVHJhY2tzKHRoaXMuYWN0aXZlQ2FtZXJhRGV2aWNlSWQsIG51bGwpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh0cmFja3MpIHtcclxuICAgICAgICAgICAgdHJhY2tzLmZvckVhY2goZnVuY3Rpb24gKHQpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0LmdldFR5cGUoKSA9PT0gTWVkaWFUeXBlXzEuTWVkaWFUeXBlLlZJREVPKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXNfMS5sb2NhbFZpZGVvVHJhY2sgPSB0O1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzXzEuYXR0YWNoVmlkZW9UcmFja1RvRWxlbSh0LCBfdGhpc18xLnZpZGVvUHJldmlld0VsZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzXzEuc2hvd0NhbWVyYSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgTG9iYnkucHJvdG90eXBlLm9uTWljQ2hhbmdlZCA9IGZ1bmN0aW9uIChtaWNEZXZpY2VJZCkge1xyXG4gICAgICAgIHZhciBfdGhpc18xID0gdGhpcztcclxuICAgICAgICB0aGlzLmFjdGl2ZU1pY0RldmljZUlkID0gbWljRGV2aWNlSWQ7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVBdWRpb1RyYWNrKCk7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVMb2NhbFRyYWNrcyhudWxsLCB0aGlzLmFjdGl2ZU1pY0RldmljZUlkKVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAodHJhY2tzKSB7XHJcbiAgICAgICAgICAgIHRyYWNrcy5mb3JFYWNoKGZ1bmN0aW9uICh0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodC5nZXRUeXBlKCkgPT09IE1lZGlhVHlwZV8xLk1lZGlhVHlwZS5BVURJTykge1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzXzEubG9jYWxBdWRpb1RyYWNrID0gdDtcclxuICAgICAgICAgICAgICAgICAgICB0LmF0dGFjaChfdGhpc18xLmF1ZGlvUHJldmlld0VsZW0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBMb2JieS5wcm90b3R5cGUucmVtb3ZlVmlkZW9UcmFjayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5sb2NhbFZpZGVvVHJhY2spIHtcclxuICAgICAgICAgICAgdGhpcy5sb2NhbFZpZGVvVHJhY2suZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmxvY2FsVmlkZW9UcmFjayA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIExvYmJ5LnByb3RvdHlwZS5yZW1vdmVBdWRpb1RyYWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmxvY2FsQXVkaW9UcmFjaykge1xyXG4gICAgICAgICAgICB0aGlzLmxvY2FsQXVkaW9UcmFjay5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgIHRoaXMubG9jYWxBdWRpb1RyYWNrID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTG9iYnkucHJvdG90eXBlLm9uU3BlYWtlckNoYW5nZWQgPSBmdW5jdGlvbiAoc3BlYWtlckRldmljZUlkKSB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVTcGVha2VyRGV2aWNlSWQgPSBzcGVha2VyRGV2aWNlSWQ7XHJcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlU3BlYWtlckRldmljZUlkICYmIHRoaXMuSml0c2lNZWV0SlMubWVkaWFEZXZpY2VzLmlzRGV2aWNlQ2hhbmdlQXZhaWxhYmxlKCdvdXRwdXQnKSkge1xyXG4gICAgICAgICAgICB0aGlzLkppdHNpTWVldEpTLm1lZGlhRGV2aWNlcy5zZXRBdWRpb091dHB1dERldmljZSh0aGlzLmFjdGl2ZVNwZWFrZXJEZXZpY2VJZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIDtcclxuICAgIH07XHJcbiAgICBMb2JieS5wcm90b3R5cGUub25FbmFibGVWaWRlbyA9IGZ1bmN0aW9uIChlbmFibGUpIHtcclxuICAgICAgICBpZiAoZW5hYmxlKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25DYW1lcmFDaGFuZ2VkKHRoaXMuYWN0aXZlQ2FtZXJhRGV2aWNlSWQpO1xyXG4gICAgICAgICAgICB0aGlzLmNhbWVyYUxpc3RFbGVtLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZVZpZGVvVHJhY2soKTtcclxuICAgICAgICAgICAgdGhpcy5zaG93Q2FtZXJhKGZhbHNlKTtcclxuICAgICAgICAgICAgdGhpcy5jYW1lcmFMaXN0RWxlbS5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIExvYmJ5LnByb3RvdHlwZS5vbkVuYWJsZUF1ZGlvID0gZnVuY3Rpb24gKGVuYWJsZSkge1xyXG4gICAgICAgIGlmIChlbmFibGUpIHtcclxuICAgICAgICAgICAgdGhpcy5vbk1pY0NoYW5nZWQodGhpcy5hY3RpdmVNaWNEZXZpY2VJZCk7XHJcbiAgICAgICAgICAgIHRoaXMubWljTGlzdEVsZW0uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQXVkaW9UcmFjaygpO1xyXG4gICAgICAgICAgICB0aGlzLm1pY0xpc3RFbGVtLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTG9iYnkucHJvdG90eXBlLnNob3dDYW1lcmEgPSBmdW5jdGlvbiAoc2hvdykge1xyXG4gICAgICAgIGlmIChzaG93KSB7XHJcbiAgICAgICAgICAgICQodGhpcy52aWRlb1ByZXZpZXdFbGVtKS5yZW1vdmVDbGFzcyhcImQtbm9uZVwiKTtcclxuICAgICAgICAgICAgJChcIiNuby1jYW1lcmEtaWNvblwiKS5hZGRDbGFzcyhcImQtbm9uZVwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICQodGhpcy52aWRlb1ByZXZpZXdFbGVtKS5hZGRDbGFzcyhcImQtbm9uZVwiKTtcclxuICAgICAgICAgICAgJChcIiNuby1jYW1lcmEtaWNvblwiKS5yZW1vdmVDbGFzcyhcImQtbm9uZVwiKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTG9iYnkucHJvdG90eXBlLmF0dGFjaFZpZGVvVHJhY2tUb0VsZW0gPSBmdW5jdGlvbiAodHJhY2ssIGVsZW0pIHtcclxuICAgICAgICB0cmFjay5hdHRhY2goZWxlbSk7XHJcbiAgICAgICAgdGhpcy5yZXNpemVDYW1lcmFWaWV3KCk7XHJcbiAgICB9O1xyXG4gICAgTG9iYnkucHJvdG90eXBlLnJlc2l6ZUNhbWVyYVZpZXcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF9hO1xyXG4gICAgICAgIHZhciAkY29udGFpbmVyID0gJChcIiNjYW1lcmEtcHJldmlldy1jb250YWluZXJcIik7XHJcbiAgICAgICAgdmFyIHcgPSAkY29udGFpbmVyLndpZHRoKCk7XHJcbiAgICAgICAgdmFyIGggPSB3ICogOSAvIDE2O1xyXG4gICAgICAgIGlmICh0aGlzLmxvY2FsVmlkZW9UcmFjaykge1xyXG4gICAgICAgICAgICB2YXIgcmF3VHJhY2sgPSB0aGlzLmxvY2FsVmlkZW9UcmFjay5nZXRUcmFjaygpO1xyXG4gICAgICAgICAgICB2YXIgX2IgPSAoX2EgPSByYXdUcmFjay5nZXRTZXR0aW5ncygpKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiByYXdUcmFjay5nZXRDb25zdHJhaW50cygpLCBoZWlnaHQgPSBfYi5oZWlnaHQsIHdpZHRoID0gX2Iud2lkdGg7XHJcbiAgICAgICAgICAgIHZhciBIZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgICAgIHZhciBXaWR0aCA9IHdpZHRoO1xyXG4gICAgICAgICAgICBpZiAod2lkdGggJiYgaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICBoID0gdyAqIEhlaWdodCAvIFdpZHRoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgICRjb250YWluZXIuY3NzKFwiaGVpZ2h0XCIsIGgpO1xyXG4gICAgICAgICRjb250YWluZXIuY3NzKFwibWluLWhlaWdodFwiLCBoKTtcclxuICAgIH07XHJcbiAgICBMb2JieS5wcm90b3R5cGUuc3RhcnRTZXNzaW9uID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzQW5vbnltb3VzVXNlcigpICYmIHRoaXMuYW5vbnltb3VzTmFtZUZpbGVkLnZhbHVlLnRyaW0oKS5sZW5ndGggPD0gMClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICQoXCJbbmFtZT1jYW1lcmFJZF1cIikudmFsKHRoaXMuYWN0aXZlQ2FtZXJhRGV2aWNlSWQpO1xyXG4gICAgICAgICQoXCJbbmFtZT1taWNJZF1cIikudmFsKHRoaXMuYWN0aXZlTWljRGV2aWNlSWQpO1xyXG4gICAgICAgICQoXCJbbmFtZT1zcGVha2VySWRdXCIpLnZhbCh0aGlzLmFjdGl2ZVNwZWFrZXJEZXZpY2VJZCk7XHJcbiAgICAgICAgJChcIltuYW1lPWFub255bW91c1VzZXJOYW1lXVwiKS52YWwodGhpcy5hbm9ueW1vdXNOYW1lRmlsZWQudmFsdWUudHJpbSgpKTtcclxuICAgICAgICAkKFwiW25hbWU9dmlkZW9NdXRlXVwiKS52YWwodGhpcy52aWRlb011dGVFbGVtLmNoZWNrZWQgKyBcIlwiKTtcclxuICAgICAgICAkKFwiW25hbWU9YXVkaW9NdXRlXVwiKS52YWwodGhpcy5hdWRpb011dGVFbGVtLmNoZWNrZWQgKyBcIlwiKTtcclxuICAgICAgICAkKFwiZm9ybVwiKS5zdWJtaXQoKTtcclxuICAgIH07XHJcbiAgICBMb2JieS5wcm90b3R5cGUudmFsaWRhdGVVc2VyID0gZnVuY3Rpb24gKG1lZXRpbmcpIHtcclxuICAgICAgICB2YXIgX3RoaXNfMSA9IHRoaXM7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNBbm9ueW1vdXNVc2VyKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1lZXRpbmcuSXNPcGVuZWQgPT09IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgdXNlciA9IG1lZXRpbmcuUGFydGljaXBhbnRzLmZpbHRlcihmdW5jdGlvbiAocCkgeyByZXR1cm4gcC5QYXJ0aWNpcGFudElkLnRvU3RyaW5nKCkgPT09IF90aGlzXzEudXNlcklkOyB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHVzZXIubGVuZ3RoID4gMDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTG9iYnkucHJvdG90eXBlLm9uTWVldGluZ1Jlc3VsdCA9IGZ1bmN0aW9uIChtZWV0aW5nKSB7XHJcbiAgICAgICAgdmFyIF90aGlzXzEgPSB0aGlzO1xyXG4gICAgICAgIGlmICghdGhpcy52YWxpZGF0ZVVzZXIobWVldGluZykpIHtcclxuICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9IFwiL25vYWNjZXNzXCI7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGhvc3RzID0gbWVldGluZy5QYXJ0aWNpcGFudHMuZmlsdGVyKGZ1bmN0aW9uIChwKSB7IHJldHVybiBwLlBhcnRpY2lwYW50VHlwZSA9PT0gUGFydGljaXBhbnRUeXBlXzEuUGFydGljaXBhbnRUeXBlLkhvc3Q7IH0pO1xyXG4gICAgICAgIGlmIChob3N0cy5sZW5ndGggPT09IDEpXHJcbiAgICAgICAgICAgIHRoaXMuc2V0T3JnYW5pemVyTmFtZShob3N0c1swXS5QYXJ0aWNpcGFudE5hbWUpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGhpcy5zZXRPcmdhbml6ZXJOYW1lKFwiTm8gb3JnYW5pemVyXCIpO1xyXG4gICAgICAgIC8vYW5vbnltb3VzXHJcbiAgICAgICAgaWYgKHRoaXMuaXNBbm9ueW1vdXNVc2VyKCkpIHtcclxuICAgICAgICAgICAgJCh0aGlzLmFub255bW91c05hbWVGaWxlZClcclxuICAgICAgICAgICAgICAgIC5zaG93KClcclxuICAgICAgICAgICAgICAgIC5mb2N1cygpXHJcbiAgICAgICAgICAgICAgICAua2V5dXAoZnVuY3Rpb24gKF8pIHtcclxuICAgICAgICAgICAgICAgICQoX3RoaXNfMS5zdGFydFNlc3Npb25CdXR0b24pLnByb3AoJ2Rpc2FibGVkJywgX3RoaXNfMS5hbm9ueW1vdXNOYW1lRmlsZWQudmFsdWUudHJpbSgpLmxlbmd0aCA8PSAwKTtcclxuICAgICAgICAgICAgfSkua2V5cHJlc3MoZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgIGlmICgoZS5rZXlDb2RlIHx8IGUud2hpY2gpID09IDEzKSB7IC8vRW50ZXIga2V5Y29kZVxyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpc18xLnN0YXJ0U2Vzc2lvbigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICQodGhpcy5hbm9ueW1vdXNOYW1lRmlsZWQpLmhpZGUoKTtcclxuICAgICAgICAgICAgJCh0aGlzLnN0YXJ0U2Vzc2lvbkJ1dHRvbikucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaGlkZVByZWxvYWRlcigpO1xyXG4gICAgfTtcclxuICAgIExvYmJ5LnByb3RvdHlwZS5vbk1lZXRpbmdFcnJvclJlc3VsdCA9IGZ1bmN0aW9uIChlcnIpIHtcclxuICAgICAgICBsb2NhdGlvbi5ocmVmID0gXCIvXCI7XHJcbiAgICB9O1xyXG4gICAgTG9iYnkucHJvdG90eXBlLmlzQW5vbnltb3VzVXNlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gIXRoaXMudXNlcklkIHx8ICFwYXJzZUludCh0aGlzLnVzZXJJZCk7XHJcbiAgICB9O1xyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICBcclxuICAgICAgICAgICAgICAgICAgICBMb2JieSBVSSBtZXRob2RzXHJcbiAgICAgICAgICAobm90IGludHJvZHVjZWQgc2VwZXJhdGUgVUkgY2xhc3MgYXMgdGhpcyBpcyBzaW1wbGUgY2xhc3MpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgTG9iYnkucHJvdG90eXBlLnNldE9yZ2FuaXplck5hbWUgPSBmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgICAgICQoXCIjaG9zdC1uYW1lXCIpLmh0bWwoc25pcHBldF8xLnN0cmlwSFRNTFRhZ3MobmFtZSkpO1xyXG4gICAgfTtcclxuICAgIExvYmJ5LnByb3RvdHlwZS5oaWRlUHJlbG9hZGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICQoXCIjcHJlbG9hZGVyXCIpLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xyXG4gICAgICAgICQoXCIjbWFpbi13cmFwcGVyXCIpLmFkZENsYXNzKFwic2hvd1wiKTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gTG9iYnk7XHJcbn0oKSk7XHJcbmV4cG9ydHMuTG9iYnkgPSBMb2JieTtcclxudmFyIGxvYmJ5ID0gbmV3IExvYmJ5KCk7XHJcbmxvYmJ5LnN0YXJ0KCk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxvYmJ5LmpzLm1hcFxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9mYWtlXzI4NWI1OGMuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLmdldENhcGFjaXR5TGFiZWwgPSBleHBvcnRzLnJhbmRvbSA9IGV4cG9ydHMuYXZhdGFyTmFtZSA9IGV4cG9ydHMuc3RyaXBIVE1MVGFncyA9IHZvaWQgMDtcclxuZnVuY3Rpb24gc3RyaXBIVE1MVGFncyh0ZXh0KSB7XHJcbiAgICByZXR1cm4gdGV4dC5yZXBsYWNlKC8oPChbXj5dKyk+KS9naSwgXCJcIik7XHJcbn1cclxuZXhwb3J0cy5zdHJpcEhUTUxUYWdzID0gc3RyaXBIVE1MVGFncztcclxuLypcclxuIGFqYXggZXhhbXBsZVxyXG4gJC5hamF4KHtcclxuICAgICAgICB1cmw6IFwiaHR0cDovL2xvY2FsaG9zdC9teXByb2plY3QvYWpheF91cmxcIixcclxuICAgICAgICB0eXBlOiBcIlBPU1RcIixcclxuICAgICAgICBkYXRhOiAkKFwiI215LWZvcm1cIikuc2VyaWFsaXplKCksXHJcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJywgLy8gbG93ZXJjYXNlIGlzIGFsd2F5cyBwcmVmZXJlcmVkIHRob3VnaCBqUXVlcnkgZG9lcyBpdCwgdG9vLlxyXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCl7fVxyXG59KTtcclxuIFxyXG4gXHJcbiAqL1xyXG5mdW5jdGlvbiBhdmF0YXJOYW1lKG5hbWUpIHtcclxuICAgIHZhciB1bmtub3duID0gXCI/XCI7XHJcbiAgICBpZiAoIW5hbWUgfHwgbmFtZS5sZW5ndGggPD0gMClcclxuICAgICAgICByZXR1cm4gdW5rbm93bjtcclxuICAgIHZhciBuYW1lUGFydHMgPSBuYW1lLnNwbGl0KFwiIFwiKTtcclxuICAgIHZhciByZXMgPSBcIlwiO1xyXG4gICAgbmFtZVBhcnRzLmZvckVhY2goZnVuY3Rpb24gKHApIHtcclxuICAgICAgICBpZiAocC5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICByZXMgKz0gcFswXTtcclxuICAgIH0pO1xyXG4gICAgaWYgKHJlcy5sZW5ndGggPD0gMClcclxuICAgICAgICB1bmtub3duO1xyXG4gICAgcmV0dXJuIHJlcy50b1VwcGVyQ2FzZSgpLnN1YnN0cigwLCAyKTtcclxufVxyXG5leHBvcnRzLmF2YXRhck5hbWUgPSBhdmF0YXJOYW1lO1xyXG52YXIgcmFuZG9tID0gZnVuY3Rpb24gKG1pbiwgbWF4KSB7IHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSkgKyBtaW47IH07XHJcbmV4cG9ydHMucmFuZG9tID0gcmFuZG9tO1xyXG5mdW5jdGlvbiBnZXRDYXBhY2l0eUxhYmVsKGJ5dGVzKSB7XHJcbiAgICBpZiAoYnl0ZXMgPCAxMDI0KVxyXG4gICAgICAgIHJldHVybiBieXRlcyArIFwiIGJ5dGVzXCI7XHJcbiAgICBlbHNlIGlmIChieXRlcyA8IDEwMjQgKiAxMDI0KSB7XHJcbiAgICAgICAgdmFyIGtiID0gYnl0ZXMgLyAxMDI0O1xyXG4gICAgICAgIHJldHVybiBrYi50b0ZpeGVkKDIpICsgXCIgS0JcIjtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHZhciBtYiA9IGJ5dGVzIC8gKDEwMjQgKiAxMDI0KTtcclxuICAgICAgICByZXR1cm4gbWIudG9GaXhlZCgyKSArIFwiIE1CXCI7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5nZXRDYXBhY2l0eUxhYmVsID0gZ2V0Q2FwYWNpdHlMYWJlbDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c25pcHBldC5qcy5tYXBcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvdXRpbFxcXFxzbmlwcGV0LmpzXCIsXCIvdXRpbFwiKSJdfQ==
