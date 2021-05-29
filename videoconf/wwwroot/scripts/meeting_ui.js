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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChattingPanel = exports.ChattingPanelProps = void 0;
var snippet_1 = require("../util/snippet");
var ChattingPanelProps = /** @class */ (function () {
    function ChattingPanelProps() {
    }
    return ChattingPanelProps;
}());
exports.ChattingPanelProps = ChattingPanelProps;
var ChattingPanel = /** @class */ (function () {
    function ChattingPanel() {
        this.unreadCount = 0;
        this.nameColors = [];
        this.remainColors = [];
    }
    ChattingPanel.prototype.init = function (props) {
        this.props = props;
        this.container = document.querySelector("#sideToolbarContainer");
        this.closeButton = document.querySelector(".chat-close-button");
        this.inputField = document.querySelector("#chat-input #usermsg");
        this.nameColors.push("#00bfff"); //deepskyblue
        this.nameColors.push("#9acd32"); //yellowgreen
        this.nameColors.push("#d2691e"); //chocolate
        this.nameColors.push("#ee82ee"); //violet
        this.nameColors.push("#6495ed"); //cornflowerblue
        this.nameColors.push("#ffd700"); //gold
        this.nameColors.push("#808000"); //olive
        this.nameColors.push("#cd853f"); //peru
        this.remainColors = __spreadArray([], this.nameColors);
        this.nameColorMap = new Map();
        this.attachEventHandlers();
        this.open(this.opened);
    };
    ChattingPanel.prototype.attachEventHandlers = function () {
        var _this_1 = this;
        $(this.closeButton).on('click', function () {
            _this_1.open(false);
        });
        $(this.inputField).keypress(function (e) {
            if ((e.keyCode || e.which) == 13) { //Enter keycode
                if (!e.shiftKey) {
                    e.preventDefault();
                    _this_1.onEnter();
                }
            }
        });
        var _this = this;
        $(".smileyContainer").click(function () {
            var id = $(this).attr("id");
            var imoname = _this.idToEmoname(id);
            console.log(imoname);
            var sendel = $("#usermsg");
            var sms = sendel.val();
            sms += imoname;
            sendel.val(sms);
            var el = $(".smileys-panel");
            el.removeClass("show-smileys");
            el.addClass("hide-smileys");
            sendel.focus();
        });
        $("#smileys").click(function () {
            var el = $(".smileys-panel");
            if (el.hasClass("hide-smileys")) {
                el.removeClass("hide-smileys");
                el.addClass("show-smileys");
            }
            else {
                el.removeClass("show-smileys");
                el.addClass("hide-smileys");
            }
        });
    };
    ChattingPanel.prototype.open = function (opened) {
        if (opened) {
            $("#video-panel").addClass("shift-right");
            $("#new-toolbox").addClass("shift-right");
            $(this.container).removeClass("invisible");
            $(this.inputField).focus();
            $(".toolbox-icon", this.props.chatOpenButton).addClass("toggled");
        }
        else {
            $("#video-panel").removeClass("shift-right");
            $("#new-toolbox").removeClass("shift-right");
            $(this.container).addClass("invisible");
            $(".toolbox-icon", this.props.chatOpenButton).removeClass("toggled");
        }
        this.unreadCount = 0;
        this.showUnreadBadge(false);
        this.opened = opened;
        this.props.openCallback();
    };
    ChattingPanel.prototype.showUnreadBadge = function (show) {
        this.props.unreadBadgeElement.style.display = !!show ? "flex" : "none";
    };
    ChattingPanel.prototype.toggleOpen = function () {
        this.opened = !this.opened;
        this.open(this.opened);
    };
    ChattingPanel.prototype.onEnter = function () {
        var sms = $(this.inputField).val().toString().trim();
        $(this.inputField).val('');
        if (!sms)
            return;
        sms = this.emonameToEmoicon(sms);
        var time = this.getCurTime();
        var sel = $("#chatconversation div.chat-message-group:last-child");
        if (sel.hasClass("local")) {
            sel.find(".timestamp").remove();
            sel.append('<div class= "chatmessage-wrapper" >\
                                        <div class="chatmessage ">\
                                            <div class="replywrapper">\
                                                <div class="messagecontent">\
                                                    <div class="usermessage">' + sms + '</div>\
                                                </div>\
                                            </div>\
                                        </div>\
                                        <div class="timestamp">' + time + '</div>\
                                    </div >');
        }
        else {
            $("#chatconversation").append('<div class="chat-message-group local"> \
                                                <div class= "chatmessage-wrapper" >\
                                                        <div class="chatmessage ">\
                                                            <div class="replywrapper">\
                                                                <div class="messagecontent">\
                                                                    <div class="usermessage">' + sms + '</div>\
                                                                </div>\
                                                            </div>\
                                                        </div>\
                                                        <div class="timestamp">' + time + '</div>\
                                                    </div >\
                                                </div>');
        }
        this.scrollToBottom();
        this.props.sendChat(sms);
    };
    //chat
    ChattingPanel.prototype.receiveMessage = function (username, message, timestamp) {
        //update unread count
        if (!this.opened) {
            this.unreadCount++;
            $(this.props.unreadBadgeElement).html("" + this.unreadCount);
            this.showUnreadBadge(true);
        }
        //update ui
        var emoMessage = this.emonameToEmoicon(message);
        var nameColor = this.getNameColor(username);
        $("#chatconversation").append("<div class=\"chat-message-group remote\">         <div class= \"chatmessage-wrapper\" >                <div class=\"chatmessage \">                    <div class=\"replywrapper\">                        <div class=\"messagecontent\">                            <div class=\"display-name\" style=\"color:" + nameColor + "\">" + username + '</div>\
                            <div class="usermessage">' + emoMessage + '</div>\
                        </div>\
                    </div>\
                </div>\
                <div class="timestamp">' + this.getCurTime() + '</div>\
            </div >\
        </div>');
        this.scrollToBottom();
    };
    ChattingPanel.prototype.scrollToBottom = function () {
        var overheight = 0;
        $(".chat-message-group").each(function () {
            overheight += $(this).height();
        });
        var limit = $('#chatconversation').height();
        var pos = overheight - limit;
        $("#chatconversation").animate({ scrollTop: pos }, 200);
    };
    ChattingPanel.prototype.getCurTime = function () {
        var date = new Date();
        var h = date.getHours();
        var m = date.getMinutes();
        var m_2 = ("0" + m).slice(-2);
        var h_2 = ("0" + h).slice(-2);
        var time = h_2 + ":" + m_2;
        return time;
    };
    ChattingPanel.prototype.idToEmoname = function (id) {
        if (id == 'smiley1')
            return ':)';
        if (id == 'smiley2')
            return ':(';
        if (id == 'smiley3')
            return ':D';
        if (id == 'smiley4')
            return ':+1:';
        if (id == 'smiley5')
            return ':P';
        if (id == 'smiley6')
            return ':wave:';
        if (id == 'smiley7')
            return ':blush:';
        if (id == 'smiley8')
            return ':slightly_smiling_face:';
        if (id == 'smiley9')
            return ':scream:';
        if (id == 'smiley10')
            return ':*';
        if (id == 'smiley11')
            return ':-1:';
        if (id == 'smiley12')
            return ':mag:';
        if (id == 'smiley13')
            return ':heart:';
        if (id == 'smiley14')
            return ':innocent:';
        if (id == 'smiley15')
            return ':angry:';
        if (id == 'smiley16')
            return ':angel:';
        if (id == 'smiley17')
            return ';(';
        if (id == 'smiley18')
            return ':clap:';
        if (id == 'smiley19')
            return ';)';
        if (id == 'smiley20')
            return ':beer:';
    };
    ChattingPanel.prototype.emonameToEmoicon = function (sms) {
        var smsout = sms;
        smsout = smsout.replace(':)', '<span class="smiley" style="width: 20px; height:20px;">😃</span>');
        smsout = smsout.replace(':(', '<span class="smiley">😦</span>');
        smsout = smsout.replace(':D', '<span class="smiley">😄</span>');
        smsout = smsout.replace(':+1:', '<span class="smiley">👍</span>');
        smsout = smsout.replace(':P', '<span class="smiley">😛</span>');
        smsout = smsout.replace(':wave:', '<span class="smiley">👋</span>');
        smsout = smsout.replace(':blush:', '<span class="smiley">😊</span>');
        smsout = smsout.replace(':slightly_smiling_face:', '<span class="smiley">🙂</span>');
        smsout = smsout.replace(':scream:', '<span class="smiley">😱</span>');
        smsout = smsout.replace(':*', '<span class="smiley">😗</span>');
        smsout = smsout.replace(':-1:', '<span class="smiley">👎</span>');
        smsout = smsout.replace(':mag:', '<span class="smiley">🔍</span>');
        smsout = smsout.replace(':heart:', '<span class="smiley">❤️</span>');
        smsout = smsout.replace(':innocent:', '<span class="smiley">😇</span>');
        smsout = smsout.replace(':angry:', '<span class="smiley">😠</span>');
        smsout = smsout.replace(':angel:', '<span class="smiley">👼</span>');
        smsout = smsout.replace(';(', '<span class="smiley">😭</span>');
        smsout = smsout.replace(':clap:', '<span class="smiley">👏</span>');
        smsout = smsout.replace(';)', '<span class="smiley">😉</span>');
        smsout = smsout.replace(':beer:', '<span class="smiley">🍺</span>');
        return smsout;
    };
    ChattingPanel.prototype.getNameColor = function (name) {
        if (this.nameColorMap.has(name))
            return this.nameColorMap.get(name);
        if (this.remainColors.length <= 0)
            this.remainColors = __spreadArray([], this.nameColors);
        //[min, max)
        var randIndex = snippet_1.random(0, this.remainColors.length);
        var randomColor = this.remainColors[randIndex];
        this.remainColors.splice(randIndex, 1);
        this.nameColorMap.set(name, randomColor);
        return randomColor;
    };
    return ChattingPanel;
}());
exports.ChattingPanel = ChattingPanel;
//# sourceMappingURL=ChattingPanel.js.map
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/components\\ChattingPanel.js","/components")
},{"../util/snippet":13,"buffer":2,"e/U+97":4}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantListPanel = exports.ParticipantListPanelProps = void 0;
var snippet_1 = require("../util/snippet");
var vector_icon_1 = require("./vector_icon");
var ParticipantItemProps = /** @class */ (function () {
    function ParticipantItemProps() {
    }
    return ParticipantItemProps;
}());
var ParticipantItem = /** @class */ (function () {
    function ParticipantItem(props) {
        this.props = props;
        this.useCamera = this.props.useCamera;
        this.useMic = this.props.useMic;
        this.init();
    }
    ParticipantItem.prototype.init = function () {
        var _this = this;
        var body = "\n            <div class=\"jitsi-participant\">\n                <div class=\"participant-avatar\">\n                    <div class=\"avatar  userAvatar w-40px h-40px\" style=\"background-color: rgba(234, 255, 128, 0.4);\">\n                        <svg class=\"avatar-svg\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n                            <text dominant-baseline=\"central\" fill=\"rgba(255,255,255,.6)\" font-size=\"40pt\" text-anchor=\"middle\" x=\"50\" y=\"50\">?</text>\n                        </svg>\n                    </div>\n                </div>\n                <div class=\"participant-content\">\n                    <span class=\"name\" class=\"fs-2 fw-bolder\">?</span>\n                    <span class=\"spacer\"></span>\n                    <div class=\"jitsi-icon camera-toggle-button\">\n                        <svg id=\"camera-disabled\" width=\"20\" height=\"20\" viewBox=\"0 0 20 20\">\n                            <path d=\"\"></path>\n                        </svg>\n                    </div>\n                    <div class=\"jitsi-icon mic-toggle-button\">\n                        <svg id=\"mic-disabled\" width=\"20\" height=\"20\" viewBox=\"0 0 20 20\">\n                            <path d=\"\"></path>\n                        </svg>\n                    </div>\n                </div>\n            </div>\n        ";
        var $root = $(body);
        this.rootElement = $root[0];
        this.avatarElement = $root.find(".avatar")[0];
        this.avatarTextElement = $(this.avatarElement).find("text")[0];
        this.nameElement = $root.find(".name")[0];
        this.cameraButtonElement = $root.find(".camera-toggle-button")[0];
        this.micButtonElement = $root.find(".mic-toggle-button")[0];
        this.cameraIconElement = $(this.cameraButtonElement).find("path")[0];
        this.micIconElement = $(this.micButtonElement).find("path")[0];
        //avatar
        this.avatarTextElement.innerHTML = snippet_1.avatarName(this.props.name);
        var avatarColors = [
            "rgba(234, 255, 128, 0.4)",
            "rgba(114, 91, 60, 1.0)",
            "rgba(63, 65, 113, 1.0)",
            "rgba(56, 105, 91, 1.0)"
        ];
        $(this.avatarElement).css("background-color", avatarColors[snippet_1.random(0, avatarColors.length)]);
        //name
        $(this.nameElement).html(this.props.name);
        //icon
        this.updateCameraIcon();
        this.updateMicIcon();
        $(this.cameraButtonElement).on('click', function (_) {
            _this.onToggleCamera();
        });
        $(this.micButtonElement).on('click', function (_) {
            _this.onToggleMic();
        });
    };
    ParticipantItem.prototype.element = function () {
        return this.rootElement;
    };
    ParticipantItem.prototype.removeSelf = function () {
        $(this.rootElement).remove();
    };
    ParticipantItem.prototype.onToggleCamera = function () {
        this.useCamera = !this.useCamera;
        this.updateCameraIcon();
        this.props.onUseCamera(this.props.jitsiId, this.useCamera);
    };
    ParticipantItem.prototype.onToggleMic = function () {
        this.useMic = !this.useMic;
        this.updateMicIcon();
        this.props.onUseMic(this.props.jitsiId, this.useMic);
    };
    ParticipantItem.prototype.updateCameraIcon = function () {
        var icon = this.useCamera ? vector_icon_1.VectorIcon.VIDEO_UNMUTE_ICON : vector_icon_1.VectorIcon.VIDEO_MUTE_ICON;
        $(this.cameraIconElement).attr("d", icon);
    };
    ParticipantItem.prototype.updateMicIcon = function () {
        var icon = this.useMic ? vector_icon_1.VectorIcon.AUDIO_UNMUTE_ICON : vector_icon_1.VectorIcon.AUDIO_MUTE_ICON;
        $(this.micIconElement).attr("d", icon);
    };
    return ParticipantItem;
}());
var ParticipantListPanelProps = /** @class */ (function () {
    function ParticipantListPanelProps() {
    }
    return ParticipantListPanelProps;
}());
exports.ParticipantListPanelProps = ParticipantListPanelProps;
var ParticipantListPanel = /** @class */ (function () {
    function ParticipantListPanel() {
        //states
        this.participantItemMap = new Map();
        this.rootElement = document.getElementById("participants-list");
        this.participantCountElement = $(this.rootElement).find("#participant-count")[0];
        this.participantListElement = $(this.rootElement).find("#participants-list-body")[0];
    }
    ParticipantListPanel.prototype.init = function (props) {
        this.props = props;
        this.updateParticipantCount();
    };
    ParticipantListPanel.prototype.addParticipant = function (jitsiId, name, me, useCamera, useMic) {
        if (this.participantItemMap.has(jitsiId)) {
            this.removeParticipant(jitsiId);
        }
        var props = new ParticipantItemProps();
        props.jitsiId = jitsiId;
        props.name = me ? name + " (Me)" : name;
        props.useCamera = useCamera;
        props.useMic = useMic;
        props.onUseCamera = this.props.onUseCamera;
        props.onUseMic = this.props.onUseMic;
        var item = new ParticipantItem(props);
        this.participantItemMap.set(jitsiId, item);
        this.updateParticipantCount();
        if (me) {
            $(this.participantListElement).prepend(item.element());
        }
        else {
            $(this.participantListElement).append(item.element());
        }
    };
    ParticipantListPanel.prototype.removeParticipant = function (jitsiId) {
        if (this.participantItemMap.size <= 0 || !this.participantItemMap.has(jitsiId))
            return;
        this.participantItemMap.get(jitsiId).removeSelf();
        this.participantItemMap.delete(jitsiId);
        this.updateParticipantCount();
    };
    ParticipantListPanel.prototype.updateParticipantCount = function () {
        this.participantCountElement.innerHTML = "" + this.participantItemMap.size;
    };
    return ParticipantListPanel;
}());
exports.ParticipantListPanel = ParticipantListPanel;
//# sourceMappingURL=ParticipantListPanel.js.map
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/components\\ParticipantListPanel.js","/components")
},{"../util/snippet":13,"./vector_icon":8,"buffer":2,"e/U+97":4}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingDialog = exports.SettingDialogProps = void 0;
var MediaType_1 = require("../enum/MediaType");
var ActiveDevices_1 = require("../model/ActiveDevices");
var SettingDialogProps = /** @class */ (function () {
    function SettingDialogProps() {
    }
    return SettingDialogProps;
}());
exports.SettingDialogProps = SettingDialogProps;
var SettingDialog = /** @class */ (function () {
    function SettingDialog() {
        this.JitsiMeetJS = window.JitsiMeetJS;
        this.audioTrackError = null;
        this.videoTrackError = null;
        this.activeCameraDeviceId = null;
        this.activeMicDeviceId = null;
        this.activeSpeakerDeviceId = null;
        this.localTracks = [];
    }
    SettingDialog.prototype.init = function (props) {
        this.props = props;
        this.dialog = document.querySelector(".setting-dialog-wrapper");
        this.showButton = document.querySelector(".setting-dialog-wrapper>button");
        $(this.dialog).addClass("d-none");
        this.okButton = document.querySelector("#setting-dialog-ok-button");
        this.closeButton = document.querySelector("#setting-dialog-cancel-button");
        this.videoPreviewElem = document.getElementById("camera-preview");
        this.audioPreviewElem = document.getElementById("mic-preview");
        this.cameraListElem = document.getElementById("camera-list");
        this.micListElem = document.getElementById("mic-list");
        this.speakerListElem = document.getElementById("speaker-list");
        this.attachEventHandlers();
        this.refreshDeviceList();
    };
    SettingDialog.prototype.show = function () {
        $(this.dialog).removeClass("d-none");
        $(this.showButton).trigger("click");
    };
    SettingDialog.prototype.attachEventHandlers = function () {
        var _this_1 = this;
        var _this = this;
        $(this.cameraListElem).off('change').on('change', function () {
            _this.onCameraChanged($(this).val());
        });
        $(this.micListElem).off('change').on('change', function () {
            _this.onMicChanged($(this).val());
        });
        $(this.speakerListElem).off('change').on('change', function () {
            _this.onSpeakerChanged($(this).val());
        });
        $(this.okButton).off('click').on('click', function () {
            _this_1.onOK();
        });
    };
    SettingDialog.prototype.refreshDeviceList = function () {
        var _this_1 = this;
        this.JitsiMeetJS.mediaDevices.enumerateDevices(function (devices) {
            _this_1.cameraList = devices.filter(function (d) { return d.kind === 'videoinput'; });
            _this_1.micList = devices.filter(function (d) { return d.kind === 'audioinput'; });
            _this_1.speakerList = devices.filter(function (d) { return d.kind === 'audiooutput'; });
            _this_1.renderDevices();
        });
    };
    SettingDialog.prototype.renderDevices = function () {
        var _this_1 = this;
        this.activeCameraDeviceId = this.props.curDevices.cameraId;
        this.activeMicDeviceId = this.props.curDevices.micId;
        this.activeSpeakerDeviceId = this.props.curDevices.speakerId;
        this.clearDOMElement(this.cameraListElem);
        this.cameraList.forEach(function (camera) {
            var selected = (_this_1.activeCameraDeviceId && camera.deviceId === _this_1.activeCameraDeviceId)
                ? "selected" : "";
            $(_this_1.cameraListElem).append("<option value=\"" + camera.deviceId + "\" " + selected + ">" + camera.label + "</option>");
        });
        this.clearDOMElement(this.micListElem);
        this.micList.forEach(function (mic) {
            var selected = (_this_1.activeMicDeviceId && mic.deviceId === _this_1.activeMicDeviceId)
                ? "selected" : "";
            $(_this_1.micListElem).append("<option value=\"" + mic.deviceId + "\" " + selected + ">" + mic.label + "</option>");
        });
        this.clearDOMElement(this.speakerListElem);
        this.speakerList.forEach(function (speaker) {
            var selected = (_this_1.activeSpeakerDeviceId && speaker.deviceId === _this_1.activeSpeakerDeviceId)
                ? "selected" : "";
            $(_this_1.speakerListElem).append("<option value=\"" + speaker.deviceId + "\" " + selected + ">" + speaker.label + "</option>");
        });
        $(".form-select").select2();
        this.createLocalTracks(this.activeCameraDeviceId, this.activeMicDeviceId)
            .then(function (tracks) {
            tracks.forEach(function (t) {
                if (t.getType() === MediaType_1.MediaType.VIDEO) {
                    t.attach(_this_1.videoPreviewElem);
                }
                else if (t.getType() === MediaType_1.MediaType.AUDIO) {
                    t.attach(_this_1.audioPreviewElem);
                }
            });
            _this_1.localTracks = tracks;
        });
    };
    SettingDialog.prototype.initCurrentDevices = function () {
        var _this_1 = this;
        var _this = this;
        $("option", this.cameraListElem).each(function (_) {
            if ($(_this_1).val() === _this.props.curDevices.micId)
                $(_this_1).attr("selected", "selected");
        });
    };
    SettingDialog.prototype.clearDOMElement = function (elem) {
        while (elem.firstChild) {
            elem.removeChild(elem.firstChild);
        }
    };
    SettingDialog.prototype.createLocalTracks = function (cameraDeviceId, micDeviceId) {
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
    SettingDialog.prototype.createVideoTrack = function (cameraDeviceId) {
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
    SettingDialog.prototype.createAudioTrack = function (micDeviceId) {
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
    SettingDialog.prototype.onCameraChanged = function (cameraDeviceId) {
        var _this_1 = this;
        this.activeCameraDeviceId = cameraDeviceId;
        this.createLocalTracks(this.activeCameraDeviceId, null)
            .then(function (tracks) {
            var newTrack = tracks.find(function (t) { return t.getType() === MediaType_1.MediaType.VIDEO; });
            //remove existing track
            var oldTrack = _this_1.localTracks.find(function (t) { return t.getType() === MediaType_1.MediaType.VIDEO; });
            if (oldTrack) {
                oldTrack.dispose();
                _this_1.localTracks.splice(_this_1.localTracks.indexOf(oldTrack), 1);
            }
            if (newTrack) {
                _this_1.localTracks.push(newTrack);
                newTrack.attach(_this_1.videoPreviewElem);
            }
        });
    };
    SettingDialog.prototype.onMicChanged = function (micDeviceId) {
        var _this_1 = this;
        this.activeMicDeviceId = micDeviceId;
        this.createLocalTracks(null, this.activeMicDeviceId)
            .then(function (tracks) {
            var newTrack = tracks.find(function (t) { return t.getType() === MediaType_1.MediaType.AUDIO; });
            //remove existing track
            var oldTrack = _this_1.localTracks.find(function (t) { return t.getType() === MediaType_1.MediaType.AUDIO; });
            if (oldTrack) {
                oldTrack.dispose();
                _this_1.localTracks.splice(_this_1.localTracks.indexOf(oldTrack), 1);
            }
            if (newTrack) {
                _this_1.localTracks.push(newTrack);
                newTrack.attach(_this_1.audioPreviewElem);
            }
        });
    };
    SettingDialog.prototype.onSpeakerChanged = function (speakerDeviceId) {
        this.activeSpeakerDeviceId = speakerDeviceId;
        if (this.activeSpeakerDeviceId && this.JitsiMeetJS.mediaDevices.isDeviceChangeAvailable('output')) {
            this.JitsiMeetJS.mediaDevices.setAudioOutputDevice(this.activeSpeakerDeviceId);
        }
        ;
    };
    SettingDialog.prototype.onOK = function () {
        this.closeDialog();
        var newDevices = new ActiveDevices_1.ActiveDevices();
        newDevices.cameraId = this.activeCameraDeviceId;
        newDevices.micId = this.activeMicDeviceId;
        newDevices.speakerId = this.activeSpeakerDeviceId;
        this.props.onDeviceChange(newDevices);
    };
    SettingDialog.prototype.closeDialog = function () {
        $(this.closeButton).trigger("click");
        this.localTracks.forEach(function (track) {
            track.dispose();
        });
    };
    return SettingDialog;
}());
exports.SettingDialog = SettingDialog;
//# sourceMappingURL=SettingDialog.js.map
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/components\\SettingDialog.js","/components")
},{"../enum/MediaType":9,"../model/ActiveDevices":12,"buffer":2,"e/U+97":4}],8:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorIcon = void 0;
var VectorIcon = /** @class */ (function () {
    function VectorIcon() {
    }
    VectorIcon.AUDIO_MUTE_ICON = "M7.333 8.65V11a3.668 3.668 0 002.757 3.553.928.928 0 00-.007.114v1.757A5.501 5.501 0 015.5 11a.917.917 0 10-1.833 0c0 3.74 2.799 6.826 6.416 7.277v.973a.917.917 0 001.834 0v-.973a7.297 7.297 0 003.568-1.475l3.091 3.092a.932.932 0 101.318-1.318l-3.091-3.091.01-.013-1.311-1.311-.01.013-1.325-1.325.008-.014-1.395-1.395a1.24 1.24 0 01-.004.018l-3.61-3.609v-.023L7.334 5.993v.023l-3.909-3.91a.932.932 0 10-1.318 1.318L7.333 8.65zm1.834 1.834V11a1.833 1.833 0 002.291 1.776l-2.291-2.292zm3.682 3.683c-.29.17-.606.3-.94.386a.928.928 0 01.008.114v1.757a5.47 5.47 0 002.257-.932l-1.325-1.325zm1.818-3.476l-1.834-1.834V5.5a1.833 1.833 0 00-3.644-.287l-1.43-1.43A3.666 3.666 0 0114.667 5.5v5.19zm1.665 1.665l1.447 1.447c.357-.864.554-1.81.554-2.803a.917.917 0 10-1.833 0c0 .468-.058.922-.168 1.356z";
    VectorIcon.AUDIO_UNMUTE_ICON = "M16 6a4 4 0 00-8 0v6a4.002 4.002 0 003.008 3.876c-.005.04-.008.082-.008.124v1.917A6.002 6.002 0 016 12a1 1 0 10-2 0 8.001 8.001 0 007 7.938V21a1 1 0 102 0v-1.062A8.001 8.001 0 0020 12a1 1 0 10-2 0 6.002 6.002 0 01-5 5.917V16c0-.042-.003-.083-.008-.124A4.002 4.002 0 0016 12V6zm-4-2a2 2 0 00-2 2v6a2 2 0 104 0V6a2 2 0 00-2-2z";
    VectorIcon.VIDEO_MUTE_ICON = "M 6.84 5.5 h -0.022 L 3.424 2.106 a 0.932 0.932 0 1 0 -1.318 1.318 L 4.182 5.5 h -0.515 c -1.013 0 -1.834 0.82 -1.834 1.833 v 7.334 c 0 1.012 0.821 1.833 1.834 1.833 H 13.75 c 0.404 0 0.777 -0.13 1.08 -0.352 l 3.746 3.746 a 0.932 0.932 0 1 0 1.318 -1.318 l -4.31 -4.31 v -0.024 L 13.75 12.41 v 0.023 l -5.1 -5.099 h 0.024 L 6.841 5.5 Z m 6.91 4.274 V 7.333 h -2.44 L 9.475 5.5 h 4.274 c 1.012 0 1.833 0.82 1.833 1.833 v 0.786 l 3.212 -1.835 a 0.917 0.917 0 0 1 1.372 0.796 v 7.84 c 0 0.344 -0.19 0.644 -0.47 0.8 l -3.736 -3.735 l 2.372 1.356 V 8.659 l -2.75 1.571 v 1.377 L 13.75 9.774 Z M 3.667 7.334 h 2.349 l 7.333 7.333 H 3.667 V 7.333 Z";
    VectorIcon.VIDEO_UNMUTE_ICON = "M13.75 5.5H3.667c-1.013 0-1.834.82-1.834 1.833v7.334c0 1.012.821 1.833 1.834 1.833H13.75c1.012 0 1.833-.82 1.833-1.833v-.786l3.212 1.835a.916.916 0 001.372-.796V7.08a.917.917 0 00-1.372-.796l-3.212 1.835v-.786c0-1.012-.82-1.833-1.833-1.833zm0 3.667v5.5H3.667V7.333H13.75v1.834zm4.583 4.174l-2.75-1.572v-1.538l2.75-1.572v4.682z";
    VectorIcon.GRANT_MODERATOR_ICON = "M14 4a2 2 0 01-1.298 1.873l1.527 4.07.716 1.912c.062.074.126.074.165.035l1.444-1.444 2.032-2.032a2 2 0 111.248.579L19 19a2 2 0 01-2 2H7a2 2 0 01-2-2L4.166 8.993a2 2 0 111.248-.579l2.033 2.033L8.89 11.89c.087.042.145.016.165-.035l.716-1.912 1.527-4.07A2 2 0 1114 4zM6.84 17l-.393-4.725 1.029 1.03a2.1 2.1 0 003.451-.748L12 9.696l1.073 2.86a2.1 2.1 0 003.451.748l1.03-1.03L17.16 17H6.84z";
    VectorIcon.AUDIO_MUTE_SMALL_ICON = "M5.688 4l22.313 22.313-1.688 1.688-5.563-5.563c-1 .625-2.25 1-3.438 1.188v4.375h-2.625v-4.375c-4.375-.625-8-4.375-8-8.938h2.25c0 4 3.375 6.75 7.063 6.75 1.063 0 2.125-.25 3.063-.688l-2.188-2.188c-.25.063-.563.125-.875.125-2.188 0-4-1.813-4-4v-1l-8-8zM20 14.875l-8-7.938v-.25c0-2.188 1.813-4 4-4s4 1.813 4 4v8.188zm5.313-.187a8.824 8.824 0 01-1.188 4.375L22.5 17.375c.375-.813.563-1.688.563-2.688h2.25z";
    VectorIcon.VIDEO_MUTE_SMALL_ICON = "M4.375 2.688L28 26.313l-1.688 1.688-4.25-4.25c-.188.125-.5.25-.75.25h-16c-.75 0-1.313-.563-1.313-1.313V9.313c0-.75.563-1.313 1.313-1.313h1L2.687 4.375zm23.625 6v14.25L13.062 8h8.25c.75 0 1.375.563 1.375 1.313v4.688z";
    VectorIcon.MODERATOR_SMALL_ICON = "M16 20.563l5 3-1.313-5.688L24.125 14l-5.875-.5L16 8.125 13.75 13.5l-5.875.5 4.438 3.875L11 23.563zm13.313-8.25l-7.25 6.313 2.188 9.375-8.25-5-8.25 5 2.188-9.375-7.25-6.313 9.563-.813 3.75-8.813 3.75 8.813z";
    VectorIcon.SETTING_ICON = "M9.005 2.17l-.576 1.727-.634.262-1.628-.813a1.833 1.833 0 00-2.116.343l-.362.362a1.833 1.833 0 00-.343 2.116l.816 1.624-.265.638-1.727.576c-.748.25-1.253.95-1.253 1.739v.512c0 .79.505 1.49 1.253 1.74l1.727.575.262.634-.813 1.628a1.833 1.833 0 00.343 2.116l.362.362c.558.558 1.41.696 2.116.343l1.624-.816.638.265.576 1.727c.25.748.95 1.253 1.739 1.253h.512c.79 0 1.49-.505 1.74-1.253l.575-1.726.634-.263 1.628.813a1.833 1.833 0 002.116-.343l.362-.362c.558-.558.696-1.41.343-2.116l-.816-1.624.265-.638 1.727-.576a1.833 1.833 0 001.253-1.739v-.512c0-.79-.505-1.49-1.253-1.74l-1.726-.572-.264-.637.814-1.628a1.833 1.833 0 00-.343-2.116l-.362-.362a1.833 1.833 0 00-2.116-.343l-1.624.816-.638-.265-.576-1.727a1.833 1.833 0 00-1.74-1.253h-.511c-.79 0-1.49.505-1.74 1.253zM7.723 6.173l2.181-.903.84-2.52h.512l.84 2.52 2.185.908 2.372-1.193.362.362-1.188 2.376.903 2.185 2.52.836v.512l-2.52.84-.908 2.185 1.193 2.372-.362.362-2.376-1.188-2.181.903-.84 2.52h-.512l-.84-2.52-2.185-.908-2.372 1.193-.362-.362 1.188-2.376-.903-2.181-2.52-.84v-.512l2.52-.84.908-2.185-1.193-2.372.362-.362 2.376 1.188zM11 15.583a4.583 4.583 0 110-9.166 4.583 4.583 0 010 9.166zM13.75 11a2.75 2.75 0 11-5.5 0 2.75 2.75 0 015.5 0z";
    VectorIcon.USER_GROUP_ICON = "M5.33331 2C6.28101 2 7.09675 2.56499 7.46207 3.37651C7.00766 3.45023 6.58406 3.61583 6.21095 3.85361C6.04111 3.54356 5.71176 3.33333 5.33331 3.33333C4.78103 3.33333 4.33331 3.78105 4.33331 4.33333C4.33331 4.75895 4.59921 5.12246 4.97395 5.26682C4.77672 5.69245 4.66665 6.16671 4.66665 6.66667L4.66678 6.6967C3.12249 6.85332 2.66665 7.65415 2.66665 9.83333C2.66665 9.89666 2.66835 9.95222 2.67088 10H3.13441C2.977 10.3982 2.86114 10.8423 2.7841 11.3333H2.33331C1.66665 11.3333 1.33331 10.8333 1.33331 9.83333C1.33331 7.60559 1.88097 6.20498 3.39417 5.63152C3.14521 5.26038 2.99998 4.81382 2.99998 4.33333C2.99998 3.04467 4.04465 2 5.33331 2ZM9.78901 3.85361C9.4159 3.61583 8.9923 3.45023 8.53788 3.37651C8.90321 2.56499 9.71895 2 10.6666 2C11.9553 2 13 3.04467 13 4.33333C13 4.81382 12.8547 5.26038 12.6058 5.63152C14.119 6.20498 14.6666 7.60559 14.6666 9.83333C14.6666 10.8333 14.3333 11.3333 13.6666 11.3333H13.2159C13.1388 10.8423 13.023 10.3982 12.8656 10H13.3291C13.3316 9.95222 13.3333 9.89666 13.3333 9.83333C13.3333 7.65415 12.8775 6.85332 11.3332 6.6967L11.3333 6.66667C11.3333 6.1667 11.2232 5.69245 11.026 5.26682C11.4008 5.12246 11.6666 4.75895 11.6666 4.33333C11.6666 3.78105 11.2189 3.33333 10.6666 3.33333C10.2882 3.33333 9.95885 3.54356 9.78901 3.85361ZM4.49998 14.6667C3.7222 14.6667 3.33331 14.1111 3.33331 13C3.33331 10.4598 4.0062 8.8875 5.87888 8.28308C5.5366 7.83462 5.33331 7.27438 5.33331 6.66667C5.33331 5.19391 6.52722 4 7.99998 4C9.47274 4 10.6666 5.19391 10.6666 6.66667C10.6666 7.27438 10.4634 7.83462 10.1211 8.28308C11.9938 8.8875 12.6666 10.4598 12.6666 13C12.6666 14.1111 12.2778 14.6667 11.5 14.6667H4.49998ZM9.33331 6.66667C9.33331 7.40305 8.73636 8 7.99998 8C7.2636 8 6.66665 7.40305 6.66665 6.66667C6.66665 5.93029 7.2636 5.33333 7.99998 5.33333C8.73636 5.33333 9.33331 5.93029 9.33331 6.66667ZM11.3333 13C11.3333 13.1426 11.3252 13.2536 11.3152 13.3333H4.68477C4.67476 13.2536 4.66665 13.1426 4.66665 13C4.66665 10.1957 5.42021 9.33333 7.99998 9.33333C10.5797 9.33333 11.3333 10.1957 11.3333 13Z";
    return VectorIcon;
}());
exports.VectorIcon = VectorIcon;
//# sourceMappingURL=vector_icon.js.map
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/components\\vector_icon.js","/components")
},{"buffer":2,"e/U+97":4}],9:[function(require,module,exports){
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
},{"buffer":2,"e/U+97":4}],10:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProperty = void 0;
var UserProperty;
(function (UserProperty) {
    UserProperty["videoElem"] = "videoElem";
    UserProperty["audioElem"] = "audioElem";
    UserProperty["IsHost"] = "IsHost";
    UserProperty["useCamera"] = "useCamera";
    UserProperty["useMic"] = "useMic";
})(UserProperty = exports.UserProperty || (exports.UserProperty = {}));
//# sourceMappingURL=UserProperty.js.map
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/enum\\UserProperty.js","/enum")
},{"buffer":2,"e/U+97":4}],11:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
"use strict";
/****************************************************************
  
          nPanelCount = 4

----------panelContainer--------------

    ---panel---       ---panel---
    |    1     |      |    2    |
    |__________|      |_________|

    ---panel---       ---panel---
    |    3     |      |    4    |
    |__________|      |_________|

-------------------------------------

         Buttons -  audio/videoMute, screenShare, Record, Chat
*****************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingUI = void 0;
var vector_icon_1 = require("./components/vector_icon");
var MediaType_1 = require("./enum/MediaType");
var UserProperty_1 = require("./enum/UserProperty");
var SettingDialog_1 = require("./components/SettingDialog");
var ChattingPanel_1 = require("./components/ChattingPanel");
var ParticipantListPanel_1 = require("./components/ParticipantListPanel");
var PanelVideoState;
(function (PanelVideoState) {
    PanelVideoState["NoCamera"] = "no-camera";
    PanelVideoState["ScreenShare"] = "screen";
    PanelVideoState["Camera"] = "camera";
    PanelVideoState["VideoStreaming"] = "stream";
})(PanelVideoState || (PanelVideoState = {}));
var MeetingUI = /** @class */ (function () {
    function MeetingUI(meeting) {
        this.MAX_PANELS = 9;
        this.nPanelCount = 0;
        this.panelContainerId = "video-panel";
        this.panelContainerElement = null;
        this.toolbarId = "new-toolbox";
        this.toolbarElement = null;
        this.panelClass = "videocontainer"; //every panel elements have this class
        this.videoElementClass = "video-element";
        this.shortNameClass = "avatar-container";
        this.moderatorClass = "moderator-icon";
        this.audioMuteClass = "audioMuted";
        this.videoMuteClass = "videoMuted";
        this.popupMenuClass = "popup-menu";
        this.popupMenuButtonClass = "remotevideomenu";
        this.userNameClass = "displayname";
        this.activeSpeakerClass = "active-speaker";
        this.fullscreenClass = "video-fullscreen";
        this.initTopInfo = false;
        this.nPanelInstanceId = 1; //increased when add new, but not decreased when remove panel
        this.meeting = null;
        this.meeting = meeting;
        this.panelContainerElement = document.getElementById(this.panelContainerId);
        this.toolbarElement = document.getElementById(this.toolbarId);
        this.toolbarAudioButtonElement = document.querySelector("#mic-enable");
        this.toolbarVideoButtonElement = document.querySelector("#camera-enable");
        this.toolbarDesktopShareButtonElement = document.querySelector("#share");
        this.toolbarRecordButtonElement = document.querySelector("#record");
        this.toolbarChatButtonElement = document.querySelector("#chat");
        this.toolbarLeaveButtonElement = document.querySelector("#leave");
        this.toolbarSettingButtonElement = document.querySelector("#setting");
        this.subjectElement = document.querySelector(".subject-text");
        this.timestampElement = document.querySelector(".subject-timer");
        this.topInfobarElement = document.querySelector(".subject");
        this.userListToggleButtonElement = document.querySelector("#open-participants-toggle");
        this.registerEventHandlers();
        this.chattingPanel = new ChattingPanel_1.ChattingPanel();
        var props = new ChattingPanel_1.ChattingPanelProps();
        props.chatOpenButton = this.toolbarChatButtonElement;
        props.unreadBadgeElement = document.querySelector(".chat-badge");
        props.openCallback = this.refreshCardViews.bind(this);
        props.sendChat = this.meeting.sendChatMessage.bind(this.meeting);
        this.chattingPanel.init(props);
        this.participantsListPanel = new ParticipantListPanel_1.ParticipantListPanel();
        var lProps = new ParticipantListPanel_1.ParticipantListPanelProps();
        lProps.onUseCamera = this.meeting.allowCamera.bind(this.meeting);
        lProps.onUseMic = this.meeting.allowMic.bind(this.meeting);
        this.participantsListPanel.init(lProps);
    }
    MeetingUI.prototype.registerEventHandlers = function () {
        var _this_1 = this;
        $(window).resize(function () {
            _this_1.refreshCardViews();
        });
        window.addEventListener('unload', function () {
            _this_1.meeting.forceStop();
        });
        $(document).ready(function () {
            _this_1.refreshCardViews();
            var _this = _this_1;
            $(_this_1.toolbarLeaveButtonElement).click(function () {
                _this_1.meeting.stop();
            });
            if (_this_1.meeting.config.hideToolbarOnMouseOut) {
                $("#content").hover(function (_) {
                    $(_this_1.toolbarElement).addClass("visible");
                    if (_this_1.initTopInfo)
                        $(_this_1.topInfobarElement).addClass("visible");
                }, function (_) {
                    $(_this_1.toolbarElement).removeClass("visible");
                    if (_this_1.initTopInfo)
                        $(_this_1.topInfobarElement).removeClass("visible");
                }).click(function () {
                    $("." + _this_1.popupMenuClass).removeClass("visible");
                });
            }
            else {
                $(_this_1.toolbarElement).addClass("visible");
                if (_this_1.initTopInfo)
                    $(_this_1.topInfobarElement).addClass("visible");
            }
            $("#mic-enable").click(function () {
                _this_1.meeting.OnToggleMuteMyAudio();
                /*var el = $(this).find(".toolbox-icon");
                el.toggleClass("toggled");
                if (el.hasClass("toggled")) {

                    el.find("svg").attr("viewBox", "0 0 22 22");
                    el.find("path").attr("d", "M7.333 8.65V11a3.668 3.668 0 002.757 3.553.928.928 0 00-.007.114v1.757A5.501 5.501 0 015.5 11a.917.917 0 10-1.833 0c0 3.74 2.799 6.826 6.416 7.277v.973a.917.917 0 001.834 0v-.973a7.297 7.297 0 003.568-1.475l3.091 3.092a.932.932 0 101.318-1.318l-3.091-3.091.01-.013-1.311-1.311-.01.013-1.325-1.325.008-.014-1.395-1.395a1.24 1.24 0 01-.004.018l-3.61-3.609v-.023L7.334 5.993v.023l-3.909-3.91a.932.932 0 10-1.318 1.318L7.333 8.65zm1.834 1.834V11a1.833 1.833 0 002.291 1.776l-2.291-2.292zm3.682 3.683c-.29.17-.606.3-.94.386a.928.928 0 01.008.114v1.757a5.47 5.47 0 002.257-.932l-1.325-1.325zm1.818-3.476l-1.834-1.834V5.5a1.833 1.833 0 00-3.644-.287l-1.43-1.43A3.666 3.666 0 0114.667 5.5v5.19zm1.665 1.665l1.447 1.447c.357-.864.554-1.81.554-2.803a.917.917 0 10-1.833 0c0 .468-.058.922-.168 1.356z");
                } else {
                    el.find("svg").attr("viewBox", "0 0 24 24");
                    el.find("path").attr("d", "M16 6a4 4 0 00-8 0v6a4.002 4.002 0 003.008 3.876c-.005.04-.008.082-.008.124v1.917A6.002 6.002 0 016 12a1 1 0 10-2 0 8.001 8.001 0 007 7.938V21a1 1 0 102 0v-1.062A8.001 8.001 0 0020 12a1 1 0 10-2 0 6.002 6.002 0 01-5 5.917V16c0-.042-.003-.083-.008-.124A4.002 4.002 0 0016 12V6zm-4-2a2 2 0 00-2 2v6a2 2 0 104 0V6a2 2 0 00-2-2z");
                }*/
            });
            $("#camera-enable").click(function () {
                _this_1.meeting.OnToggleMuteMyVideo();
                /*var el = $(this).find(".toolbox-icon");
                el.toggleClass("toggled");
                if (el.hasClass("toggled")) {
                    el.find("path").attr("d", "M 6.84 5.5 h -0.022 L 3.424 2.106 a 0.932 0.932 0 1 0 -1.318 1.318 L 4.182 5.5 h -0.515 c -1.013 0 -1.834 0.82 -1.834 1.833 v 7.334 c 0 1.012 0.821 1.833 1.834 1.833 H 13.75 c 0.404 0 0.777 -0.13 1.08 -0.352 l 3.746 3.746 a 0.932 0.932 0 1 0 1.318 -1.318 l -4.31 -4.31 v -0.024 L 13.75 12.41 v 0.023 l -5.1 -5.099 h 0.024 L 6.841 5.5 Z m 6.91 4.274 V 7.333 h -2.44 L 9.475 5.5 h 4.274 c 1.012 0 1.833 0.82 1.833 1.833 v 0.786 l 3.212 -1.835 a 0.917 0.917 0 0 1 1.372 0.796 v 7.84 c 0 0.344 -0.19 0.644 -0.47 0.8 l -3.736 -3.735 l 2.372 1.356 V 8.659 l -2.75 1.571 v 1.377 L 13.75 9.774 Z M 3.667 7.334 h 2.349 l 7.333 7.333 H 3.667 V 7.333 Z");
                } else {
                    el.find("path").attr("d", "M13.75 5.5H3.667c-1.013 0-1.834.82-1.834 1.833v7.334c0 1.012.821 1.833 1.834 1.833H13.75c1.012 0 1.833-.82 1.833-1.833v-.786l3.212 1.835a.916.916 0 001.372-.796V7.08a.917.917 0 00-1.372-.796l-3.212 1.835v-.786c0-1.012-.82-1.833-1.833-1.833zm0 3.667v5.5H3.667V7.333H13.75v1.834zm4.583 4.174l-2.75-1.572v-1.538l2.75-1.572v4.682z");
                }*/
            });
            $(_this_1.toolbarChatButtonElement).on('click', function (_) {
                _this_1.chattingPanel.toggleOpen();
            });
            $(_this_1.toolbarDesktopShareButtonElement).on("click", function () {
                _this_1.meeting.toggleScreenShare();
            });
            $(_this_1.toolbarRecordButtonElement).on('click', function () {
                _this_1.meeting.toggleRecording();
            });
            $(_this_1.toolbarSettingButtonElement).on('click', function () {
                _this_1.showSettingDialog();
            });
        });
    };
    MeetingUI.prototype.registerPanelEventHandler = function (panel) {
        var popupMenuClass = this.popupMenuClass;
        var popupMenuButtonClass = this.popupMenuButtonClass;
        var panelContainerElement = this.panelContainerElement;
        var _this = this;
        $(panel)
            .on('click', "." + popupMenuButtonClass, function (e) {
            $(panelContainerElement).find("." + popupMenuClass).removeClass("visible");
            $(this).find("." + popupMenuClass).toggleClass("visible");
            e.stopPropagation();
        })
            .on('click', '.grant-moderator', function (e) {
            $(this).closest("." + popupMenuClass).removeClass("visible");
            e.stopPropagation();
        })
            .on('click', '.audio-mute', function (e) {
            $(this).closest("." + popupMenuClass).removeClass("visible");
            e.stopPropagation();
        })
            .on('click', '.video-mute', function (e) {
            $(this).closest("." + popupMenuClass).removeClass("visible");
            e.stopPropagation();
        })
            .on('click', '.fullscreen', function (e) {
            $(this).closest("." + popupMenuClass).removeClass("visible");
            e.stopPropagation();
            $(panel).toggleClass("video-fullscreen");
            _this.refreshCardViews();
        })
            .on('mouseover', function () {
            $(this).removeClass("display-video");
            $(this).addClass("display-name-on-video");
        })
            .on('mouseout', function () {
            $(this).removeClass("display-name-on-video");
            $(this).addClass("display-video");
        })
            .on('dblclick', function (e) {
            $(this).closest("." + popupMenuClass).removeClass("visible");
            e.stopPropagation();
            $(panel).toggleClass("video-fullscreen");
            _this.refreshCardViews();
        });
    };
    MeetingUI.prototype._getPanelFromVideoElement = function (videoElem) {
        return videoElem.parentNode;
    };
    MeetingUI.prototype._getVideoElementFromPanel = function (panel) {
        return $("." + this.videoElementClass, panel)[0];
    };
    MeetingUI.prototype._getAudioElementFromPanel = function (panel) {
        return $("audio", panel)[0];
    };
    MeetingUI.prototype._getShortNameElementFromPanel = function (panel) {
        return $("." + this.shortNameClass, panel)[0];
    };
    MeetingUI.prototype._getAudioMuteElementFromPanel = function (panel) {
        return $("." + this.audioMuteClass, panel)[0];
    };
    MeetingUI.prototype._getVideoMuteElementFromPanel = function (panel) {
        return $("." + this.videoMuteClass, panel)[0];
    };
    MeetingUI.prototype._getModeratorStarElementFromPanel = function (panel) {
        return $("." + this.moderatorClass, panel)[0];
    };
    MeetingUI.prototype._getNameElementFromPanel = function (panel) {
        return $("." + this.userNameClass, panel)[0];
    };
    MeetingUI.prototype._getPopupMenuGrantModeratorFromPanel = function (panel) {
        return $("li.grant-moderator", panel)[0];
    };
    MeetingUI.prototype._getPopupMenuAudioMuteFromPanel = function (panel) {
        return $("li.audio-mute", panel)[0];
    };
    MeetingUI.prototype._getPopupMenuVideoMuteFromPanel = function (panel) {
        return $("li.video-mute", panel)[0];
    };
    MeetingUI.prototype._getPopupMenuFullscreenFromPanel = function (panel) {
        return $("li.fullscreen", panel)[0];
    };
    MeetingUI.prototype.getEmptyVideoPanel = function () {
        var panel = this.addNewPanel();
        this.registerPanelEventHandler(panel);
        //bottom small icons
        this._getVideoMuteElementFromPanel(panel).style.display = "none";
        this._getAudioMuteElementFromPanel(panel).style.display = "none";
        this._getModeratorStarElementFromPanel(panel).style.display = "none";
        var videoElem = this._getVideoElementFromPanel(panel);
        var audioElem = this._getAudioElementFromPanel(panel);
        return { videoElem: videoElem, audioElem: audioElem };
    };
    MeetingUI.prototype.freeVideoPanel = function (videoElement) {
        var videoCardViews = document.querySelectorAll("video." + this.videoElementClass);
        var N = videoCardViews.length;
        var i = 0;
        for (i = 0; i < N; i++) {
            if (videoCardViews[i] == videoElement) {
                var curElem = videoCardViews[i];
                while (!$(curElem).hasClass(this.panelClass))
                    curElem = curElem.parentElement;
                curElem.remove();
                return;
            }
        }
        this.refreshCardViews();
    };
    MeetingUI.prototype.updatePanelOnJitsiUser = function (videoElem, myInfo, user) {
        var _this_1 = this;
        var panel = this._getPanelFromVideoElement(videoElem);
        if (!panel)
            return;
        //set name
        this.setUserName(user.getDisplayName(), videoElem);
        //hide shotname if exist visible video track
        var isVisibleVideo = false;
        user.getTracks().forEach(function (track) {
            if (track.getType() === MediaType_1.MediaType.VIDEO && !track.isMuted()) {
                isVisibleVideo = true;
            }
        });
        this.setShotnameVisible(!isVisibleVideo, videoElem);
        //bottom small icons
        this._getVideoMuteElementFromPanel(panel).style.display = user.isVideoMuted() ? "block" : "none";
        this._getAudioMuteElementFromPanel(panel).style.display = user.isAudioMuted() ? "block" : "none";
        this._getModeratorStarElementFromPanel(panel).style.display = user.getProperty(UserProperty_1.UserProperty.IsHost) ? "block" : "none";
        //popup menu
        var audioMutePopupMenu = this._getPopupMenuAudioMuteFromPanel(panel);
        var videoMutePopupMenu = this._getPopupMenuVideoMuteFromPanel(panel);
        var grantModeratorPopupMenu = this._getPopupMenuGrantModeratorFromPanel(panel);
        if (myInfo.IsHost) {
            var userHaveCamera_1 = false, userHaveMicrophone_1 = false;
            user.getTracks().forEach(function (track) {
                if (track.getType() === MediaType_1.MediaType.VIDEO)
                    userHaveCamera_1 = true;
                else if (track.getType() === MediaType_1.MediaType.AUDIO)
                    userHaveMicrophone_1 = true;
            });
            videoMutePopupMenu.style.display = userHaveCamera_1 ? "flex" : "none";
            audioMutePopupMenu.style.display = userHaveMicrophone_1 ? "flex" : "none";
            grantModeratorPopupMenu.style.display = "flex";
        }
        else {
            videoMutePopupMenu.style.display = "none";
            audioMutePopupMenu.style.display = "none";
            grantModeratorPopupMenu.style.display = "none";
        }
        if (user.getProperty(UserProperty_1.UserProperty.IsHost))
            grantModeratorPopupMenu.style.display = "none";
        //popup menu audio icon/label change
        if (audioMutePopupMenu.style.display === 'flex') {
            if (user.isAudioMuted()) {
                $(audioMutePopupMenu).find(".label").html("Unmute Audio");
                $(audioMutePopupMenu).find("path").attr("d", vector_icon_1.VectorIcon.AUDIO_MUTE_ICON);
            }
            else {
                $(audioMutePopupMenu).find(".label").html("Mute Audio");
                $(audioMutePopupMenu).find("path").attr("d", vector_icon_1.VectorIcon.AUDIO_UNMUTE_ICON);
            }
        }
        if (videoMutePopupMenu.style.display === 'flex') {
            if (user.isVideoMuted()) {
                $(videoMutePopupMenu).find(".label").html("Unmute Video");
                $(videoMutePopupMenu).find("path").attr("d", vector_icon_1.VectorIcon.VIDEO_MUTE_ICON);
            }
            else {
                $(videoMutePopupMenu).find(".label").html("Mute Video");
                $(videoMutePopupMenu).find("path").attr("d", vector_icon_1.VectorIcon.VIDEO_UNMUTE_ICON);
            }
        }
        //popup menu handlers
        if (myInfo.IsHost) {
            $(grantModeratorPopupMenu).unbind('click').on('click', function () {
                _this_1.meeting.grantModeratorRole(user.getId());
            });
            $(audioMutePopupMenu).unbind('click').on('click', function () {
                _this_1.meeting.muteUserAudio(user.getId(), !user.isAudioMuted());
            });
            $(videoMutePopupMenu).unbind('click').on('click', function () {
                _this_1.meeting.muteUserVideo(user.getId(), !user.isVideoMuted());
            });
        }
        //active speaker(blue border)
        $(panel).removeClass(this.activeSpeakerClass);
    };
    MeetingUI.prototype.updatePanelOnMyBGUser = function (videoElem, myInfo, localTracks) {
        var _this_1 = this;
        var panel = this._getPanelFromVideoElement(videoElem);
        if (!panel)
            return;
        var audioMuted = false, videoMuted = false;
        localTracks.forEach(function (track) {
            if (track.getType() === MediaType_1.MediaType.VIDEO && track.isMuted())
                videoMuted = true;
            else if (track.getType() === MediaType_1.MediaType.AUDIO && track.isMuted())
                audioMuted = true;
        });
        //name
        this.setUserName(myInfo.Name, videoElem);
        var isVisibleVideo = false;
        localTracks.forEach(function (track) {
            if (track.getType() === MediaType_1.MediaType.VIDEO && !track.isMuted()) {
                isVisibleVideo = true;
            }
        });
        this.setShotnameVisible(!isVisibleVideo, videoElem);
        //popup menu
        var audioMutePopupMenu = this._getPopupMenuAudioMuteFromPanel(panel);
        var videoMutePopupMenu = this._getPopupMenuVideoMuteFromPanel(panel);
        var grantModeratorPopupMenu = this._getPopupMenuGrantModeratorFromPanel(panel);
        if (myInfo.IsHost) {
            videoMutePopupMenu.style.display = myInfo.useMedia.useCamera ? "flex" : "none";
            audioMutePopupMenu.style.display = myInfo.useMedia.useMic ? "flex" : "none";
            grantModeratorPopupMenu.style.display = "flex";
        }
        else {
            videoMutePopupMenu.style.display = "none";
            audioMutePopupMenu.style.display = "none";
            grantModeratorPopupMenu.style.display = "none";
        }
        grantModeratorPopupMenu.style.display = "none";
        //popup menu audio icon/label change
        if (audioMutePopupMenu.style.display === 'flex') {
            if (myInfo.mediaMute.audioMute) {
                $(audioMutePopupMenu).find(".label").html("Unmute Audio");
                $(audioMutePopupMenu).find("path").attr("d", vector_icon_1.VectorIcon.AUDIO_MUTE_ICON);
            }
            else {
                $(audioMutePopupMenu).find(".label").html("Mute Audio");
                $(audioMutePopupMenu).find("path").attr("d", vector_icon_1.VectorIcon.AUDIO_UNMUTE_ICON);
            }
        }
        if (videoMutePopupMenu.style.display === 'flex') {
            if (myInfo.mediaMute.videoMute) {
                $(videoMutePopupMenu).find(".label").html("Unmute Video");
                $(videoMutePopupMenu).find("path").attr("d", vector_icon_1.VectorIcon.VIDEO_MUTE_ICON);
            }
            else {
                $(videoMutePopupMenu).find(".label").html("Mute Video");
                $(videoMutePopupMenu).find("path").attr("d", vector_icon_1.VectorIcon.VIDEO_UNMUTE_ICON);
            }
        }
        //popup menu handlers
        if (myInfo.IsHost) {
            $(audioMutePopupMenu).unbind('click').on('click', function () {
                _this_1.meeting.muteMyAudio(!audioMuted);
            });
            $(videoMutePopupMenu).unbind('click').on('click', function () {
                _this_1.meeting.muteMyVideo(!videoMuted);
            });
        }
        //bottom small icons
        this._getVideoMuteElementFromPanel(panel).style.display = videoMuted ? "block" : "none";
        this._getAudioMuteElementFromPanel(panel).style.display = audioMuted ? "block" : "none";
        this._getModeratorStarElementFromPanel(panel).style.display = myInfo.IsHost ? "block" : "none";
        //active speaker(blue border)
        $(panel).addClass(this.activeSpeakerClass);
    };
    MeetingUI.prototype.setShotnameVisible = function (show, videoElem) {
        var panel = this._getPanelFromVideoElement(videoElem);
        var shortNamePanel = this._getShortNameElementFromPanel(panel);
        shortNamePanel.style.display = show ? "block" : "none";
        videoElem.style.visibility = show ? "hidden" : "visible";
    };
    MeetingUI.prototype.setUserName = function (name, videoElem) {
        //name
        var panel = this._getPanelFromVideoElement(videoElem);
        this._getNameElementFromPanel(panel).innerHTML = name;
        //shortname
        var shortNamePanel = this._getShortNameElementFromPanel(panel);
        $("text", shortNamePanel).html(this.getShortName(name));
    };
    MeetingUI.prototype.updateToolbar = function (myInfo, localTracks) {
        var audioMuted = false, videoMuted = false;
        var hasAudioTrack = false, hasVideoTrack = false;
        localTracks.forEach(function (track) {
            if (track.getType() === MediaType_1.MediaType.VIDEO) {
                hasVideoTrack = true;
                if (track.isMuted())
                    videoMuted = true;
            }
            else if (track.getType() === MediaType_1.MediaType.AUDIO) {
                hasAudioTrack = true;
                if (track.isMuted())
                    audioMuted = true;
            }
        });
        this.toolbarVideoButtonElement.style.display = hasVideoTrack ? "inline-block" : "none";
        this.toolbarDesktopShareButtonElement.style.display = hasVideoTrack ? "inline-block" : "none";
        this.toolbarAudioButtonElement.style.display = hasAudioTrack ? "inline-block" : "none";
        if (audioMuted) {
            $(this.toolbarAudioButtonElement).find("path").attr("d", vector_icon_1.VectorIcon.AUDIO_MUTE_ICON);
            $(this.toolbarAudioButtonElement).addClass("muted");
        }
        else {
            $(this.toolbarAudioButtonElement).find("path").attr("d", vector_icon_1.VectorIcon.AUDIO_UNMUTE_ICON);
            $(this.toolbarAudioButtonElement).removeClass("muted");
        }
        if (videoMuted) {
            $(this.toolbarVideoButtonElement).find("path").attr("d", vector_icon_1.VectorIcon.VIDEO_MUTE_ICON);
            $(this.toolbarVideoButtonElement).addClass("muted");
        }
        else {
            $(this.toolbarVideoButtonElement).find("path").attr("d", vector_icon_1.VectorIcon.VIDEO_UNMUTE_ICON);
            $(this.toolbarVideoButtonElement).removeClass("muted");
        }
        this.userListToggleButtonElement.style.visibility = (myInfo.IsHost) ? "visible" : "hidden";
    };
    MeetingUI.prototype.setScreenShare = function (on) {
        if (on) {
            $(".toolbox-icon", this.toolbarDesktopShareButtonElement).addClass("toggled");
        }
        else {
            $(".toolbox-icon", this.toolbarDesktopShareButtonElement).removeClass("toggled");
        }
    };
    MeetingUI.prototype.setRecording = function (on) {
        if (on) {
            $(".toolbox-icon", this.toolbarRecordButtonElement).addClass("toggled");
        }
        else {
            $(".toolbox-icon", this.toolbarRecordButtonElement).removeClass("toggled");
        }
    };
    MeetingUI.prototype.getShortName = function (fullName) {
        if (!fullName || fullName.length <= 1)
            return "";
        else
            return fullName.toUpperCase().substr(0, 2);
    };
    MeetingUI.prototype.showModeratorIcon = function (panel, show) {
        this._getModeratorStarElementFromPanel(panel).style.display = show ? "block" : "none";
    };
    MeetingUI.prototype.setPanelState = function (panel, state) {
        panel.setAttribute("video-state", "" + state);
    };
    MeetingUI.prototype.getPanelState = function (panel) {
        var videoState = panel.getAttribute("video-state");
        return videoState;
    };
    MeetingUI.prototype.refreshCardViews = function () {
        //margin
        var gutter = 40;
        var width = $("#content").width() - gutter;
        var height = $("#content").height() - gutter;
        //number of video panels
        var panelCount = $("." + this.panelClass).length;
        //chatting dialog
        var chattingWidth = 315;
        if ($("#video-panel").hasClass("shift-right")) {
            width -= chattingWidth;
        }
        //width, height of each video panel
        var w, h;
        //if fullscreen mode, hide other video panels
        if ($("." + this.panelClass).hasClass(this.fullscreenClass)) {
            $("." + this.panelClass).css("display", "none");
            $("." + this.fullscreenClass).css("display", "inline-block").css("height", height + gutter - 6).css("width", width + gutter);
            return;
        }
        //show all video panels
        $("." + this.panelClass).css("display", "inline-block");
        var columnCount = 1;
        var rowCount = 1;
        var SM = 576;
        var MD = 768;
        var LG = 992;
        var XL = 1200;
        var XXL = 1400;
        if (width < SM) {
            columnCount = 1;
        }
        else if (width < LG) {
            if (panelCount <= 1)
                columnCount = 1;
            else
                columnCount = 2;
        }
        else {
            if (panelCount == 1) {
                if (width < XXL)
                    columnCount = 1;
                else
                    columnCount = 2;
            }
            else if (panelCount <= 4)
                columnCount = 2;
            else if (panelCount <= 9)
                columnCount = 3;
            else
                columnCount = 4;
        }
        rowCount = Math.floor((panelCount - 1) / columnCount) + 1;
        if (width < 576) {
            w = width;
            h = w * 9 / 16;
        }
        else {
            // 
            if (width * rowCount * 9 > height * columnCount * 16) {
                h = height / rowCount;
                w = h * 16 / 9;
            }
            //
            else {
                w = width / columnCount;
                h = w * 9 / 16;
            }
        }
        $("." + this.panelClass)
            .css("width", w)
            .css("height", h)
            .find(".avatar-container")
            .css("width", h / 2)
            .css("height", h / 2);
    };
    MeetingUI.prototype.addNewPanel = function () {
        var count = $("." + this.panelClass).length;
        if (count >= this.MAX_PANELS)
            return;
        var isSpeak = false;
        var isDisableCamera = true;
        var activeSpeaker = '';
        if (isSpeak) {
            activeSpeaker = "active-speaker";
        }
        var avatarVisible = '';
        var cameraStatus = '';
        ++this.nPanelInstanceId;
        var videoTag = "<video autoplay playsinline  class='" + this.videoElementClass + "' id='remoteVideo_" + this.nPanelInstanceId + "'></video>";
        var audioTag = "<audio autoplay=\"\" id=\"remoteAudio_" + this.nPanelInstanceId + "\"></audio>";
        if (isDisableCamera) {
            avatarVisible = 'visible';
            cameraStatus = '<div class="indicator-container videoMuted"> \
                            <div> \
                                <span class="indicator-icon-container  toolbar-icon" id=""> \
                                    <div class="jitsi-icon "> \
                                        <svg height="13" id="camera-disabled" width="13" viewBox="0 0 32 32"> \
                                            <path d="M4.375 2.688L28 26.313l-1.688 1.688-4.25-4.25c-.188.125-.5.25-.75.25h-16c-.75 0-1.313-.563-1.313-1.313V9.313c0-.75.563-1.313 1.313-1.313h1L2.687 4.375zm23.625 6v14.25L13.062 8h8.25c.75 0 1.375.563 1.375 1.313v4.688z"></path> \
                                        </svg> \
                                    </div> \
                                </span> \
                            </div> \
                        </div>';
        }
        var micStatus = '<div class="indicator-container audioMuted"> \
                            <div> \
                                <span class="indicator-icon-container  toolbar-icon" id=""> \
                                    <div class="jitsi-icon "> \
                                        <svg height="13" id="mic-disabled" width="13" viewBox="0 0 32 32"> \
                                            <path d="M5.688 4l22.313 22.313-1.688 1.688-5.563-5.563c-1 .625-2.25 1-3.438 1.188v4.375h-2.625v-4.375c-4.375-.625-8-4.375-8-8.938h2.25c0 4 3.375 6.75 7.063 6.75 1.063 0 2.125-.25 3.063-.688l-2.188-2.188c-.25.063-.563.125-.875.125-2.188 0-4-1.813-4-4v-1l-8-8zM20 14.875l-8-7.938v-.25c0-2.188 1.813-4 4-4s4 1.813 4 4v8.188zm5.313-.187a8.824 8.824 0 01-1.188 4.375L22.5 17.375c.375-.813.563-1.688.563-2.688h2.25z"></path> \
                                        </svg> \
                                    </div> \
                                </span> \
                            </div> \
                        </div>';
        var moderatorStatus = '<div class="moderator-icon right"> \
                                <div class="indicator-container"> \
                                    <div> \
                                        <span class="indicator-icon-container focusindicator toolbar-icon" id=""> \
                                            <div class="jitsi-icon "> \
                                                <svg height="13" width="13" viewBox="0 0 32 32"> \
                                                    <path d="M16 20.563l5 3-1.313-5.688L24.125 14l-5.875-.5L16 8.125 13.75 13.5l-5.875.5 4.438 3.875L11 23.563zm13.313-8.25l-7.25 6.313 2.188 9.375-8.25-5-8.25 5 2.188-9.375-7.25-6.313 9.563-.813 3.75-8.813 3.75 8.813z"></path> \
                                                </svg> \
                                            </div> \
                                        </span> \
                                    </div> \
                                </div> \
                            </div>';
        var panelHtml = "\n        <span class=\"" + this.panelClass + " display-video " + activeSpeaker + "\">\n            " + videoTag + " \n            " + audioTag + "\n            <div class=\"videocontainer__toolbar\">\n                <div> " + cameraStatus + " " + micStatus + " " + moderatorStatus + "</div>\n            </div>\n            <div class=\"videocontainer__hoverOverlay\"></div>\n            <div class=\"displayNameContainer\"><span class=\"displayname\" id=\"localDisplayName\">Name</span></div>\n            <div class=\"avatar-container " + avatarVisible + "\" style=\"height: 105.5px; width: 105.5px;\">\n                <div class=\"avatar  userAvatar\" style=\"background-color: rgba(234, 255, 128, 0.4); font-size: 180%; height: 100%; width: 100%;\">\n                    <svg class=\"avatar-svg\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n                        <text dominant-baseline=\"central\" fill=\"rgba(255,255,255,.6)\" font-size=\"40pt\" text-anchor=\"middle\" x=\"50\" y=\"50\">Name</text>\n                    </svg>\n                </div>\n            </div >\n            <span class=\"" + this.popupMenuButtonClass + "\">\n                <div class=\"\" id=\"\">\n                    <span class=\"popover-trigger remote-video-menu-trigger\">\n                        <div class=\"jitsi-icon\">\n                            <svg height=\"1em\" width=\"1em\" viewBox=\"0 0 24 24\">\n                                <path d=\"M12 15.984c1.078 0 2.016.938 2.016 2.016s-.938 2.016-2.016 2.016S9.984 19.078 9.984 18s.938-2.016 2.016-2.016zm0-6c1.078 0 2.016.938 2.016 2.016s-.938 2.016-2.016 2.016S9.984 13.078 9.984 12 10.922 9.984 12 9.984zm0-1.968c-1.078 0-2.016-.938-2.016-2.016S10.922 3.984 12 3.984s2.016.938 2.016 2.016S13.078 8.016 12 8.016z\"></path>                             </svg>\n                        </div>\n                    </span>\n                </div>\n                <div class=\"" + this.popupMenuClass + "\" style=\"position: relative; right: 168px;  top: 25px; width: 175px;\">\n                    <ul aria-label=\"More actions menu\" class=\"overflow-menu\">\n                        <li aria-label=\"Grant Moderator\" class=\"overflow-menu-item grant-moderator\" tabindex=\"0\" role=\"button\">\n                            <span class=\"overflow-menu-item-icon\">\n                                <div class=\"jitsi-icon \">\n                                    <svg height=\"22\" width=\"22\" viewBox=\"0 0 24 24\">\n                                        <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M14 4a2 2 0 01-1.298 1.873l1.527 4.07.716 1.912c.062.074.126.074.165.035l1.444-1.444 2.032-2.032a2 2 0 111.248.579L19 19a2 2 0 01-2 2H7a2 2 0 01-2-2L4.166 8.993a2 2 0 111.248-.579l2.033 2.033L8.89 11.89c.087.042.145.016.165-.035l.716-1.912 1.527-4.07A2 2 0 1114 4zM6.84 17l-.393-4.725 1.029 1.03a2.1 2.1 0 003.451-.748L12 9.696l1.073 2.86a2.1 2.1 0 003.451.748l1.03-1.03L17.16 17H6.84z\"></path>                                     </svg>\n                                </div>\n                            </span>\n                            <span class=\"label\">Grant Moderator</span>\n                        </li>\n                        <li aria-label=\"Mute\" class=\"overflow-menu-item audio-mute\" tabindex=\"0\" role=\"button\">\n                            <span class=\"overflow-menu-item-icon\">\n                                <div class=\"jitsi-icon \">\n                                    <svg fill=\"none\" height=\"22\" width=\"22\" viewBox=\"0 0 22 22\">\n                                        <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M7.333 8.65V11a3.668 3.668 0 002.757 3.553.928.928 0 00-.007.114v1.757A5.501 5.501 0 015.5 11a.917.917 0 10-1.833 0c0 3.74 2.799 6.826 6.416 7.277v.973a.917.917 0 001.834 0v-.973a7.297 7.297 0 003.568-1.475l3.091 3.092a.932.932 0 101.318-1.318l-3.091-3.091.01-.013-1.311-1.311-.01.013-1.325-1.325.008-.014-1.395-1.395a1.24 1.24 0 01-.004.018l-3.61-3.609v-.023L7.334 5.993v.023l-3.909-3.91a.932.932 0 10-1.318 1.318L7.333 8.65zm1.834 1.834V11a1.833 1.833 0 002.291 1.776l-2.291-2.292zm3.682 3.683c-.29.17-.606.3-.94.386a.928.928 0 01.008.114v1.757a5.47 5.47 0 002.257-.932l-1.325-1.325zm1.818-3.476l-1.834-1.834V5.5a1.833 1.833 0 00-3.644-.287l-1.43-1.43A3.666 3.666 0 0114.667 5.5v5.19zm1.665 1.665l1.447 1.447c.357-.864.554-1.81.554-2.803a.917.917 0 10-1.833 0c0 .468-.058.922-.168 1.356z\"></path>                                     </svg>\n                                </div>\n                            </span>\n                            <span class=\"label\">Mute</span>\n                        </li>\n                        <li aria-label=\"Disable camera\" class=\"overflow-menu-item video-mute\" tabindex=\"0\" role=\"button\">\n                            <span class=\"overflow-menu-item-icon\">\n                                <div class=\"jitsi-icon\">\n                                    <svg fill=\"none\" height=\"22\" width=\"22\" viewBox=\"0 0 22 22\">\n                                        <path clip-rule=\"evenodd\" d=\"M6.84 5.5h-.022L3.424 2.106a.932.932 0 10-1.318 1.318L4.182 5.5h-.515c-1.013 0-1.834.82-1.834 1.833v7.334c0 1.012.821 1.833 1.834 1.833H13.75c.404 0 .777-.13 1.08-.352l3.746 3.746a.932.932 0 101.318-1.318l-4.31-4.31v-.024L13.75 12.41v.023l-5.1-5.099h.024L6.841 5.5zm6.91 4.274V7.333h-2.44L9.475 5.5h4.274c1.012 0 1.833.82 1.833 1.833v.786l3.212-1.835a.917.917 0 011.372.796v7.84c0 .344-.19.644-.47.8l-3.736-3.735 2.372 1.356V8.659l-2.75 1.571v1.377L13.75 9.774zM3.667 7.334h2.349l7.333 7.333H3.667V7.333z\"></path>                                     </svg>\n                                </div>\n                            </span>\n                            <span class=\"label\">Disable camera</span>\n                        </li>\n                        <li aria-label=\"Toggle full screen\" class=\"overflow-menu-item fullscreen\">\n                            <span class=\"overflow-menu-item-icon\">\n                                <div class=\"jitsi-icon \">\n                                    <svg fill=\"none\" height=\"22\" width=\"22\" viewBox=\"0 0 22 22\">\n                                        <path clip-rule=\"evenodd\" d=\"M8.25 2.75H3.667a.917.917 0 00-.917.917V8.25h1.833V4.583H8.25V2.75zm5.5 1.833V2.75h4.583c.507 0 .917.41.917.917V8.25h-1.833V4.583H13.75zm0 12.834h3.667V13.75h1.833v4.583c0 .507-.41.917-.917.917H13.75v-1.833zM4.583 13.75v3.667H8.25v1.833H3.667a.917.917 0 01-.917-.917V13.75h1.833z\"></path>                                     </svg>\n                                </div>\n                            </span>\n                            <span class=\"label overflow-menu-item-text\">View full screen</span>\n                        </li>\n                    </ul>\n                </div>\n            </span>\n        </span >";
        var panel = $(panelHtml);
        $("#" + this.panelContainerId).append(panel[0]);
        this.refreshCardViews();
        return panel[0];
    };
    MeetingUI.prototype.Log = function (message) {
        if ($("#logPanel").length <= 0) {
            var logPanel = "<div id=\"logPanel\" style=\"position: fixed;width: 300px;height: 200px;background: black;bottom:0px;right: 0px;\n                                z-index: 100000;border-left: 1px dashed rebeccapurple;border-top: 1px dashed rebeccapurple;overflow-y:auto;\"></div>";
            $("body").append(logPanel);
        }
        var colors = ['blanchedalmond', 'hotpink', 'chartreuse', 'coral', 'gold', 'greenyellow', 'violet', 'wheat'];
        var color = colors[Math.floor(Math.random() * 100) % colors.length];
        var messageItm = "<div style=\"color:" + color + ";\"><span>" + message + "</span></div>";
        $("#logPanel").append(messageItm);
        $('#logPanel').scroll();
        $("#logPanel").animate({
            scrollTop: 20000
        }, 200);
    };
    MeetingUI.prototype.updateTime = function (timeLabel) {
        this.timestampElement.innerHTML = timeLabel;
        if (!this.initTopInfo) {
            this.initTopInfo = true;
            $(this.topInfobarElement).addClass("visible");
        }
    };
    MeetingUI.prototype.showMeetingSubject = function (subject, hostName) {
        if (subject && subject.trim().length > 0) {
            var subjectLabel = subject.trim();
            if (hostName && hostName.trim().length > 0)
                subjectLabel += "(" + hostName.trim() + ")";
            this.subjectElement.innerHTML = subjectLabel;
        }
    };
    MeetingUI.prototype.showSettingDialog = function () {
        var settingDialog = new SettingDialog_1.SettingDialog();
        var props = new SettingDialog_1.SettingDialogProps();
        props.curDevices = this.meeting.getActiveDevices();
        props.onDeviceChange = this.meeting.onDeviceChange.bind(this.meeting);
        settingDialog.init(props);
        settingDialog.show();
    };
    MeetingUI.prototype.onChatMessage = function (name, msg, timestamp) {
        this.chattingPanel.receiveMessage(name, msg, timestamp);
    };
    //add, remove participant to and from list
    MeetingUI.prototype.addParticipant = function (jitsiId, name, me, useCamera, useMic) {
        this.participantsListPanel.addParticipant(jitsiId, name, me, useCamera, useMic);
    };
    MeetingUI.prototype.removeParticipant = function (jitsiId) {
        this.participantsListPanel.removeParticipant(jitsiId);
    };
    MeetingUI.prototype.showParticipantListButton = function (show) {
        $("#open-participants-toggle").css("visibility", show ? "visible" : "hidden");
    };
    return MeetingUI;
}());
exports.MeetingUI = MeetingUI;
//# sourceMappingURL=meeting_ui.js.map
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_89a0fe66.js","/")
},{"./components/ChattingPanel":5,"./components/ParticipantListPanel":6,"./components/SettingDialog":7,"./components/vector_icon":8,"./enum/MediaType":9,"./enum/UserProperty":10,"buffer":2,"e/U+97":4}],12:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveDevices = void 0;
var ActiveDevices = /** @class */ (function () {
    function ActiveDevices() {
    }
    return ActiveDevices;
}());
exports.ActiveDevices = ActiveDevices;
//# sourceMappingURL=ActiveDevices.js.map
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/model\\ActiveDevices.js","/model")
},{"buffer":2,"e/U+97":4}],13:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.random = exports.avatarName = exports.stripHTMLTags = void 0;
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
//# sourceMappingURL=snippet.js.map
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/util\\snippet.js","/util")
},{"buffer":2,"e/U+97":4}]},{},[11])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkY6XFwxX0JpemdhemVfd2VicnRjXFxfUHJvamVjdFxcYml6Z2F6ZV9tZWV0aW5nXFx2aWRlb2NvbmZcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkY6LzFfQml6Z2F6ZV93ZWJydGMvX1Byb2plY3QvYml6Z2F6ZV9tZWV0aW5nL3ZpZGVvY29uZi9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYi9iNjQuanMiLCJGOi8xX0JpemdhemVfd2VicnRjL19Qcm9qZWN0L2JpemdhemVfbWVldGluZy92aWRlb2NvbmYvbm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qcyIsIkY6LzFfQml6Z2F6ZV93ZWJydGMvX1Byb2plY3QvYml6Z2F6ZV9tZWV0aW5nL3ZpZGVvY29uZi9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIkY6LzFfQml6Z2F6ZV93ZWJydGMvX1Byb2plY3QvYml6Z2F6ZV9tZWV0aW5nL3ZpZGVvY29uZi9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiRjovMV9CaXpnYXplX3dlYnJ0Yy9fUHJvamVjdC9iaXpnYXplX21lZXRpbmcvdmlkZW9jb25mL3NjcmlwdHMvYnVpbGQvY29tcG9uZW50cy9DaGF0dGluZ1BhbmVsLmpzIiwiRjovMV9CaXpnYXplX3dlYnJ0Yy9fUHJvamVjdC9iaXpnYXplX21lZXRpbmcvdmlkZW9jb25mL3NjcmlwdHMvYnVpbGQvY29tcG9uZW50cy9QYXJ0aWNpcGFudExpc3RQYW5lbC5qcyIsIkY6LzFfQml6Z2F6ZV93ZWJydGMvX1Byb2plY3QvYml6Z2F6ZV9tZWV0aW5nL3ZpZGVvY29uZi9zY3JpcHRzL2J1aWxkL2NvbXBvbmVudHMvU2V0dGluZ0RpYWxvZy5qcyIsIkY6LzFfQml6Z2F6ZV93ZWJydGMvX1Byb2plY3QvYml6Z2F6ZV9tZWV0aW5nL3ZpZGVvY29uZi9zY3JpcHRzL2J1aWxkL2NvbXBvbmVudHMvdmVjdG9yX2ljb24uanMiLCJGOi8xX0JpemdhemVfd2VicnRjL19Qcm9qZWN0L2JpemdhemVfbWVldGluZy92aWRlb2NvbmYvc2NyaXB0cy9idWlsZC9lbnVtL01lZGlhVHlwZS5qcyIsIkY6LzFfQml6Z2F6ZV93ZWJydGMvX1Byb2plY3QvYml6Z2F6ZV9tZWV0aW5nL3ZpZGVvY29uZi9zY3JpcHRzL2J1aWxkL2VudW0vVXNlclByb3BlcnR5LmpzIiwiRjovMV9CaXpnYXplX3dlYnJ0Yy9fUHJvamVjdC9iaXpnYXplX21lZXRpbmcvdmlkZW9jb25mL3NjcmlwdHMvYnVpbGQvZmFrZV84OWEwZmU2Ni5qcyIsIkY6LzFfQml6Z2F6ZV93ZWJydGMvX1Byb2plY3QvYml6Z2F6ZV9tZWV0aW5nL3ZpZGVvY29uZi9zY3JpcHRzL2J1aWxkL21vZGVsL0FjdGl2ZURldmljZXMuanMiLCJGOi8xX0JpemdhemVfd2VicnRjL19Qcm9qZWN0L2JpemdhemVfbWVldGluZy92aWRlb2NvbmYvc2NyaXB0cy9idWlsZC91dGlsL3NuaXBwZXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2bENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN09BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgbG9va3VwID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuXG47KGZ1bmN0aW9uIChleHBvcnRzKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuICB2YXIgQXJyID0gKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJylcbiAgICA/IFVpbnQ4QXJyYXlcbiAgICA6IEFycmF5XG5cblx0dmFyIFBMVVMgICA9ICcrJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSCAgPSAnLycuY2hhckNvZGVBdCgwKVxuXHR2YXIgTlVNQkVSID0gJzAnLmNoYXJDb2RlQXQoMClcblx0dmFyIExPV0VSICA9ICdhJy5jaGFyQ29kZUF0KDApXG5cdHZhciBVUFBFUiAgPSAnQScuY2hhckNvZGVBdCgwKVxuXHR2YXIgUExVU19VUkxfU0FGRSA9ICctJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSF9VUkxfU0FGRSA9ICdfJy5jaGFyQ29kZUF0KDApXG5cblx0ZnVuY3Rpb24gZGVjb2RlIChlbHQpIHtcblx0XHR2YXIgY29kZSA9IGVsdC5jaGFyQ29kZUF0KDApXG5cdFx0aWYgKGNvZGUgPT09IFBMVVMgfHxcblx0XHQgICAgY29kZSA9PT0gUExVU19VUkxfU0FGRSlcblx0XHRcdHJldHVybiA2MiAvLyAnKydcblx0XHRpZiAoY29kZSA9PT0gU0xBU0ggfHxcblx0XHQgICAgY29kZSA9PT0gU0xBU0hfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjMgLy8gJy8nXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIpXG5cdFx0XHRyZXR1cm4gLTEgLy9ubyBtYXRjaFxuXHRcdGlmIChjb2RlIDwgTlVNQkVSICsgMTApXG5cdFx0XHRyZXR1cm4gY29kZSAtIE5VTUJFUiArIDI2ICsgMjZcblx0XHRpZiAoY29kZSA8IFVQUEVSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIFVQUEVSXG5cdFx0aWYgKGNvZGUgPCBMT1dFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBMT1dFUiArIDI2XG5cdH1cblxuXHRmdW5jdGlvbiBiNjRUb0J5dGVBcnJheSAoYjY0KSB7XG5cdFx0dmFyIGksIGosIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnJcblxuXHRcdGlmIChiNjQubGVuZ3RoICUgNCA+IDApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG5cdFx0fVxuXG5cdFx0Ly8gdGhlIG51bWJlciBvZiBlcXVhbCBzaWducyAocGxhY2UgaG9sZGVycylcblx0XHQvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XG5cdFx0Ly8gcmVwcmVzZW50IG9uZSBieXRlXG5cdFx0Ly8gaWYgdGhlcmUgaXMgb25seSBvbmUsIHRoZW4gdGhlIHRocmVlIGNoYXJhY3RlcnMgYmVmb3JlIGl0IHJlcHJlc2VudCAyIGJ5dGVzXG5cdFx0Ly8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxuXHRcdHZhciBsZW4gPSBiNjQubGVuZ3RoXG5cdFx0cGxhY2VIb2xkZXJzID0gJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDIpID8gMiA6ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAxKSA/IDEgOiAwXG5cblx0XHQvLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcblx0XHRhcnIgPSBuZXcgQXJyKGI2NC5sZW5ndGggKiAzIC8gNCAtIHBsYWNlSG9sZGVycylcblxuXHRcdC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcblx0XHRsID0gcGxhY2VIb2xkZXJzID4gMCA/IGI2NC5sZW5ndGggLSA0IDogYjY0Lmxlbmd0aFxuXG5cdFx0dmFyIEwgPSAwXG5cblx0XHRmdW5jdGlvbiBwdXNoICh2KSB7XG5cdFx0XHRhcnJbTCsrXSA9IHZcblx0XHR9XG5cblx0XHRmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDE4KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDEyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpIDw8IDYpIHwgZGVjb2RlKGI2NC5jaGFyQXQoaSArIDMpKVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwMDApID4+IDE2KVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwKSA+PiA4KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdGlmIChwbGFjZUhvbGRlcnMgPT09IDIpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA+PiA0KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH0gZWxzZSBpZiAocGxhY2VIb2xkZXJzID09PSAxKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDEwKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDQpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPj4gMilcblx0XHRcdHB1c2goKHRtcCA+PiA4KSAmIDB4RkYpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFyclxuXHR9XG5cblx0ZnVuY3Rpb24gdWludDhUb0Jhc2U2NCAodWludDgpIHtcblx0XHR2YXIgaSxcblx0XHRcdGV4dHJhQnl0ZXMgPSB1aW50OC5sZW5ndGggJSAzLCAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xuXHRcdFx0b3V0cHV0ID0gXCJcIixcblx0XHRcdHRlbXAsIGxlbmd0aFxuXG5cdFx0ZnVuY3Rpb24gZW5jb2RlIChudW0pIHtcblx0XHRcdHJldHVybiBsb29rdXAuY2hhckF0KG51bSlcblx0XHR9XG5cblx0XHRmdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuXHRcdFx0cmV0dXJuIGVuY29kZShudW0gPj4gMTggJiAweDNGKSArIGVuY29kZShudW0gPj4gMTIgJiAweDNGKSArIGVuY29kZShudW0gPj4gNiAmIDB4M0YpICsgZW5jb2RlKG51bSAmIDB4M0YpXG5cdFx0fVxuXG5cdFx0Ly8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuXHRcdGZvciAoaSA9IDAsIGxlbmd0aCA9IHVpbnQ4Lmxlbmd0aCAtIGV4dHJhQnl0ZXM7IGkgPCBsZW5ndGg7IGkgKz0gMykge1xuXHRcdFx0dGVtcCA9ICh1aW50OFtpXSA8PCAxNikgKyAodWludDhbaSArIDFdIDw8IDgpICsgKHVpbnQ4W2kgKyAyXSlcblx0XHRcdG91dHB1dCArPSB0cmlwbGV0VG9CYXNlNjQodGVtcClcblx0XHR9XG5cblx0XHQvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXG5cdFx0c3dpdGNoIChleHRyYUJ5dGVzKSB7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHRlbXAgPSB1aW50OFt1aW50OC5sZW5ndGggLSAxXVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPT0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHRlbXAgPSAodWludDhbdWludDgubGVuZ3RoIC0gMl0gPDwgOCkgKyAodWludDhbdWludDgubGVuZ3RoIC0gMV0pXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAxMClcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA+PiA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgMikgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dFxuXHR9XG5cblx0ZXhwb3J0cy50b0J5dGVBcnJheSA9IGI2NFRvQnl0ZUFycmF5XG5cdGV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IHVpbnQ4VG9CYXNlNjRcbn0odHlwZW9mIGV4cG9ydHMgPT09ICd1bmRlZmluZWQnID8gKHRoaXMuYmFzZTY0anMgPSB7fSkgOiBleHBvcnRzKSlcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcYmFzZTY0LWpzXFxcXGxpYlxcXFxiNjQuanNcIixcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcYmFzZTY0LWpzXFxcXGxpYlwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qIVxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTID0gNTBcbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTJcblxuLyoqXG4gKiBJZiBgQnVmZmVyLl91c2VUeXBlZEFycmF5c2A6XG4gKiAgID09PSB0cnVlICAgIFVzZSBVaW50OEFycmF5IGltcGxlbWVudGF0aW9uIChmYXN0ZXN0KVxuICogICA9PT0gZmFsc2UgICBVc2UgT2JqZWN0IGltcGxlbWVudGF0aW9uIChjb21wYXRpYmxlIGRvd24gdG8gSUU2KVxuICovXG5CdWZmZXIuX3VzZVR5cGVkQXJyYXlzID0gKGZ1bmN0aW9uICgpIHtcbiAgLy8gRGV0ZWN0IGlmIGJyb3dzZXIgc3VwcG9ydHMgVHlwZWQgQXJyYXlzLiBTdXBwb3J0ZWQgYnJvd3NlcnMgYXJlIElFIDEwKywgRmlyZWZveCA0KyxcbiAgLy8gQ2hyb21lIDcrLCBTYWZhcmkgNS4xKywgT3BlcmEgMTEuNissIGlPUyA0LjIrLiBJZiB0aGUgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGFkZGluZ1xuICAvLyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YCBpbnN0YW5jZXMsIHRoZW4gdGhhdCdzIHRoZSBzYW1lIGFzIG5vIGBVaW50OEFycmF5YCBzdXBwb3J0XG4gIC8vIGJlY2F1c2Ugd2UgbmVlZCB0byBiZSBhYmxlIHRvIGFkZCBhbGwgdGhlIG5vZGUgQnVmZmVyIEFQSSBtZXRob2RzLiBUaGlzIGlzIGFuIGlzc3VlXG4gIC8vIGluIEZpcmVmb3ggNC0yOS4gTm93IGZpeGVkOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzhcbiAgdHJ5IHtcbiAgICB2YXIgYnVmID0gbmV3IEFycmF5QnVmZmVyKDApXG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KGJ1ZilcbiAgICBhcnIuZm9vID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfVxuICAgIHJldHVybiA0MiA9PT0gYXJyLmZvbygpICYmXG4gICAgICAgIHR5cGVvZiBhcnIuc3ViYXJyYXkgPT09ICdmdW5jdGlvbicgLy8gQ2hyb21lIDktMTAgbGFjayBgc3ViYXJyYXlgXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufSkoKVxuXG4vKipcbiAqIENsYXNzOiBCdWZmZXJcbiAqID09PT09PT09PT09PT1cbiAqXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGFyZSBhdWdtZW50ZWRcbiAqIHdpdGggZnVuY3Rpb24gcHJvcGVydGllcyBmb3IgYWxsIHRoZSBub2RlIGBCdWZmZXJgIEFQSSBmdW5jdGlvbnMuIFdlIHVzZVxuICogYFVpbnQ4QXJyYXlgIHNvIHRoYXQgc3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXQgcmV0dXJuc1xuICogYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogQnkgYXVnbWVudGluZyB0aGUgaW5zdGFuY2VzLCB3ZSBjYW4gYXZvaWQgbW9kaWZ5aW5nIHRoZSBgVWludDhBcnJheWBcbiAqIHByb3RvdHlwZS5cbiAqL1xuZnVuY3Rpb24gQnVmZmVyIChzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBCdWZmZXIpKVxuICAgIHJldHVybiBuZXcgQnVmZmVyKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pXG5cbiAgdmFyIHR5cGUgPSB0eXBlb2Ygc3ViamVjdFxuXG4gIC8vIFdvcmthcm91bmQ6IG5vZGUncyBiYXNlNjQgaW1wbGVtZW50YXRpb24gYWxsb3dzIGZvciBub24tcGFkZGVkIHN0cmluZ3NcbiAgLy8gd2hpbGUgYmFzZTY0LWpzIGRvZXMgbm90LlxuICBpZiAoZW5jb2RpbmcgPT09ICdiYXNlNjQnICYmIHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgc3ViamVjdCA9IHN0cmluZ3RyaW0oc3ViamVjdClcbiAgICB3aGlsZSAoc3ViamVjdC5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgICBzdWJqZWN0ID0gc3ViamVjdCArICc9J1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpbmQgdGhlIGxlbmd0aFxuICB2YXIgbGVuZ3RoXG4gIGlmICh0eXBlID09PSAnbnVtYmVyJylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdClcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpXG4gICAgbGVuZ3RoID0gQnVmZmVyLmJ5dGVMZW5ndGgoc3ViamVjdCwgZW5jb2RpbmcpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnKVxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0Lmxlbmd0aCkgLy8gYXNzdW1lIHRoYXQgb2JqZWN0IGlzIGFycmF5LWxpa2VcbiAgZWxzZVxuICAgIHRocm93IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgbmVlZHMgdG8gYmUgYSBudW1iZXIsIGFycmF5IG9yIHN0cmluZy4nKVxuXG4gIHZhciBidWZcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICAvLyBQcmVmZXJyZWQ6IFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgYnVmID0gQnVmZmVyLl9hdWdtZW50KG5ldyBVaW50OEFycmF5KGxlbmd0aCkpXG4gIH0gZWxzZSB7XG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBUSElTIGluc3RhbmNlIG9mIEJ1ZmZlciAoY3JlYXRlZCBieSBgbmV3YClcbiAgICBidWYgPSB0aGlzXG4gICAgYnVmLmxlbmd0aCA9IGxlbmd0aFxuICAgIGJ1Zi5faXNCdWZmZXIgPSB0cnVlXG4gIH1cblxuICB2YXIgaVxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiB0eXBlb2Ygc3ViamVjdC5ieXRlTGVuZ3RoID09PSAnbnVtYmVyJykge1xuICAgIC8vIFNwZWVkIG9wdGltaXphdGlvbiAtLSB1c2Ugc2V0IGlmIHdlJ3JlIGNvcHlpbmcgZnJvbSBhIHR5cGVkIGFycmF5XG4gICAgYnVmLl9zZXQoc3ViamVjdClcbiAgfSBlbHNlIGlmIChpc0FycmF5aXNoKHN1YmplY3QpKSB7XG4gICAgLy8gVHJlYXQgYXJyYXktaXNoIG9iamVjdHMgYXMgYSBieXRlIGFycmF5XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpKVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0LnJlYWRVSW50OChpKVxuICAgICAgZWxzZVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0W2ldXG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgYnVmLndyaXRlKHN1YmplY3QsIDAsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdudW1iZXInICYmICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmICFub1plcm8pIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGJ1ZltpXSA9IDBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbi8vIFNUQVRJQyBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PVxuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAncmF3JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gKGIpIHtcbiAgcmV0dXJuICEhKGIgIT09IG51bGwgJiYgYiAhPT0gdW5kZWZpbmVkICYmIGIuX2lzQnVmZmVyKVxufVxuXG5CdWZmZXIuYnl0ZUxlbmd0aCA9IGZ1bmN0aW9uIChzdHIsIGVuY29kaW5nKSB7XG4gIHZhciByZXRcbiAgc3RyID0gc3RyICsgJydcbiAgc3dpdGNoIChlbmNvZGluZyB8fCAndXRmOCcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAvIDJcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gdXRmOFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAncmF3JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IGJhc2U2NFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggKiAyXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIChsaXN0LCB0b3RhbExlbmd0aCkge1xuICBhc3NlcnQoaXNBcnJheShsaXN0KSwgJ1VzYWdlOiBCdWZmZXIuY29uY2F0KGxpc3QsIFt0b3RhbExlbmd0aF0pXFxuJyArXG4gICAgICAnbGlzdCBzaG91bGQgYmUgYW4gQXJyYXkuJylcblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcigwKVxuICB9IGVsc2UgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIGxpc3RbMF1cbiAgfVxuXG4gIHZhciBpXG4gIGlmICh0eXBlb2YgdG90YWxMZW5ndGggIT09ICdudW1iZXInKSB7XG4gICAgdG90YWxMZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRvdGFsTGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZiA9IG5ldyBCdWZmZXIodG90YWxMZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldXG4gICAgaXRlbS5jb3B5KGJ1ZiwgcG9zKVxuICAgIHBvcyArPSBpdGVtLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZcbn1cblxuLy8gQlVGRkVSIElOU1RBTkNFIE1FVEhPRFNcbi8vID09PT09PT09PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIF9oZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGFzc2VydChzdHJMZW4gJSAyID09PSAwLCAnSW52YWxpZCBoZXggc3RyaW5nJylcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGJ5dGUgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXG4gICAgYXNzZXJ0KCFpc05hTihieXRlKSwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG4gICAgYnVmW29mZnNldCArIGldID0gYnl0ZVxuICB9XG4gIEJ1ZmZlci5fY2hhcnNXcml0dGVuID0gaSAqIDJcbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gX3V0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9hc2NpaVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBfYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX3V0ZjE2bGVXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcbiAgLy8gU3VwcG9ydCBib3RoIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZylcbiAgLy8gYW5kIHRoZSBsZWdhY3kgKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIGlmICghaXNGaW5pdGUobGVuZ3RoKSkge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgfSBlbHNlIHsgIC8vIGxlZ2FjeVxuICAgIHZhciBzd2FwID0gZW5jb2RpbmdcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIG9mZnNldCA9IGxlbmd0aFxuICAgIGxlbmd0aCA9IHN3YXBcbiAgfVxuXG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG5cbiAgdmFyIHJldFxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IF9oZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSBfdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldCA9IF9hc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXQgPSBfYmluYXJ5V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IF9iYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gX3V0ZjE2bGVXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG4gIHN0YXJ0ID0gTnVtYmVyKHN0YXJ0KSB8fCAwXG4gIGVuZCA9IChlbmQgIT09IHVuZGVmaW5lZClcbiAgICA/IE51bWJlcihlbmQpXG4gICAgOiBlbmQgPSBzZWxmLmxlbmd0aFxuXG4gIC8vIEZhc3RwYXRoIGVtcHR5IHN0cmluZ3NcbiAgaWYgKGVuZCA9PT0gc3RhcnQpXG4gICAgcmV0dXJuICcnXG5cbiAgdmFyIHJldFxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IF9oZXhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSBfdXRmOFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldCA9IF9hc2NpaVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXQgPSBfYmluYXJ5U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IF9iYXNlNjRTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gX3V0ZjE2bGVTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uICh0YXJnZXQsIHRhcmdldF9zdGFydCwgc3RhcnQsIGVuZCkge1xuICB2YXIgc291cmNlID0gdGhpc1xuXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICghdGFyZ2V0X3N0YXJ0KSB0YXJnZXRfc3RhcnQgPSAwXG5cbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgc291cmNlLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnc291cmNlRW5kIDwgc291cmNlU3RhcnQnKVxuICBhc3NlcnQodGFyZ2V0X3N0YXJ0ID49IDAgJiYgdGFyZ2V0X3N0YXJ0IDwgdGFyZ2V0Lmxlbmd0aCxcbiAgICAgICd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCBzb3VyY2UubGVuZ3RoLCAnc291cmNlU3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gc291cmNlLmxlbmd0aCwgJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpXG4gICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgPCBlbmQgLSBzdGFydClcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0ICsgc3RhcnRcblxuICB2YXIgbGVuID0gZW5kIC0gc3RhcnRcblxuICBpZiAobGVuIDwgMTAwIHx8ICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0X3N0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICB9IGVsc2Uge1xuICAgIHRhcmdldC5fc2V0KHRoaXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuKSwgdGFyZ2V0X3N0YXJ0KVxuICB9XG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGlmIChzdGFydCA9PT0gMCAmJiBlbmQgPT09IGJ1Zi5sZW5ndGgpIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYuc2xpY2Uoc3RhcnQsIGVuZCkpXG4gIH1cbn1cblxuZnVuY3Rpb24gX3V0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXMgPSAnJ1xuICB2YXIgdG1wID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgaWYgKGJ1ZltpXSA8PSAweDdGKSB7XG4gICAgICByZXMgKz0gZGVjb2RlVXRmOENoYXIodG1wKSArIFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICAgICAgdG1wID0gJydcbiAgICB9IGVsc2Uge1xuICAgICAgdG1wICs9ICclJyArIGJ1ZltpXS50b1N0cmluZygxNilcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzICsgZGVjb2RlVXRmOENoYXIodG1wKVxufVxuXG5mdW5jdGlvbiBfYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspXG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHJldHVybiBfYXNjaWlTbGljZShidWYsIHN0YXJ0LCBlbmQpXG59XG5cbmZ1bmN0aW9uIF9oZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG5cbiAgaWYgKCFzdGFydCB8fCBzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuXG5cbiAgdmFyIG91dCA9ICcnXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgb3V0ICs9IHRvSGV4KGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIF91dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIGJ5dGVzW2krMV0gKiAyNTYpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIHN0YXJ0ID0gY2xhbXAoc3RhcnQsIGxlbiwgMClcbiAgZW5kID0gY2xhbXAoZW5kLCBsZW4sIGxlbilcblxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIHJldHVybiBCdWZmZXIuX2F1Z21lbnQodGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSlcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2xpY2VMZW4gPSBlbmQgLSBzdGFydFxuICAgIHZhciBuZXdCdWYgPSBuZXcgQnVmZmVyKHNsaWNlTGVuLCB1bmRlZmluZWQsIHRydWUpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGljZUxlbjsgaSsrKSB7XG4gICAgICBuZXdCdWZbaV0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gICAgcmV0dXJuIG5ld0J1ZlxuICB9XG59XG5cbi8vIGBnZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5nZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLnJlYWRVSW50OChvZmZzZXQpXG59XG5cbi8vIGBzZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh2LCBvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5zZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLndyaXRlVUludDgodiwgb2Zmc2V0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZFVJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWxcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xuICAgIHZhbCA9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcbiAgfSBlbHNlIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAyXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gICAgdmFsIHw9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldCArIDNdIDw8IDI0ID4+PiAwKVxuICB9IGVsc2Uge1xuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDFdIDw8IDE2XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDJdIDw8IDhcbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgM11cbiAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldF0gPDwgMjQgPj4+IDApXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgdmFyIG5lZyA9IHRoaXNbb2Zmc2V0XSAmIDB4ODBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbmZ1bmN0aW9uIF9yZWFkSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsID0gX3JlYWRVSW50MTYoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDMyKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDAwMDAwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmZmZmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEZsb2F0IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkRG91YmxlIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZilcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpIHJldHVyblxuXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmYpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgMik7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgJiAoMHhmZiA8PCAoOCAqIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpKSkpID4+PlxuICAgICAgICAgICAgKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkgKiA4XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmZmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDQpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlID4+PiAobGl0dGxlRW5kaWFuID8gaSA6IDMgLSBpKSAqIDgpICYgMHhmZlxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmLCAtMHg4MClcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgdGhpcy53cml0ZVVJbnQ4KHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgdGhpcy53cml0ZVVJbnQ4KDB4ZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZiwgLTB4ODAwMClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIF93cml0ZVVJbnQxNihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICBfd3JpdGVVSW50MTYoYnVmLCAweGZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MzIoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgMHhmZmZmZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuLy8gZmlsbCh2YWx1ZSwgc3RhcnQ9MCwgZW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiAodmFsdWUsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKCF2YWx1ZSkgdmFsdWUgPSAwXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCkgZW5kID0gdGhpcy5sZW5ndGhcblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHZhbHVlID0gdmFsdWUuY2hhckNvZGVBdCgwKVxuICB9XG5cbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgIWlzTmFOKHZhbHVlKSwgJ3ZhbHVlIGlzIG5vdCBhIG51bWJlcicpXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdlbmQgPCBzdGFydCcpXG5cbiAgLy8gRmlsbCAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHRoaXMubGVuZ3RoLCAnc3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gdGhpcy5sZW5ndGgsICdlbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICB0aGlzW2ldID0gdmFsdWVcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBvdXQgPSBbXVxuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIG91dFtpXSA9IHRvSGV4KHRoaXNbaV0pXG4gICAgaWYgKGkgPT09IGV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMpIHtcbiAgICAgIG91dFtpICsgMV0gPSAnLi4uJ1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbiAgcmV0dXJuICc8QnVmZmVyICcgKyBvdXQuam9pbignICcpICsgJz4nXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBgQXJyYXlCdWZmZXJgIHdpdGggdGhlICpjb3BpZWQqIG1lbW9yeSBvZiB0aGUgYnVmZmVyIGluc3RhbmNlLlxuICogQWRkZWQgaW4gTm9kZSAwLjEyLiBPbmx5IGF2YWlsYWJsZSBpbiBicm93c2VycyB0aGF0IHN1cHBvcnQgQXJyYXlCdWZmZXIuXG4gKi9cbkJ1ZmZlci5wcm90b3R5cGUudG9BcnJheUJ1ZmZlciA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgICByZXR1cm4gKG5ldyBCdWZmZXIodGhpcykpLmJ1ZmZlclxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYnVmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5sZW5ndGgpXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYnVmLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKVxuICAgICAgICBidWZbaV0gPSB0aGlzW2ldXG4gICAgICByZXR1cm4gYnVmLmJ1ZmZlclxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1ZmZlci50b0FycmF5QnVmZmVyIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyJylcbiAgfVxufVxuXG4vLyBIRUxQRVIgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIHN0cmluZ3RyaW0gKHN0cikge1xuICBpZiAoc3RyLnRyaW0pIHJldHVybiBzdHIudHJpbSgpXG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG59XG5cbnZhciBCUCA9IEJ1ZmZlci5wcm90b3R5cGVcblxuLyoqXG4gKiBBdWdtZW50IGEgVWludDhBcnJheSAqaW5zdGFuY2UqIChub3QgdGhlIFVpbnQ4QXJyYXkgY2xhc3MhKSB3aXRoIEJ1ZmZlciBtZXRob2RzXG4gKi9cbkJ1ZmZlci5fYXVnbWVudCA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgYXJyLl9pc0J1ZmZlciA9IHRydWVcblxuICAvLyBzYXZlIHJlZmVyZW5jZSB0byBvcmlnaW5hbCBVaW50OEFycmF5IGdldC9zZXQgbWV0aG9kcyBiZWZvcmUgb3ZlcndyaXRpbmdcbiAgYXJyLl9nZXQgPSBhcnIuZ2V0XG4gIGFyci5fc2V0ID0gYXJyLnNldFxuXG4gIC8vIGRlcHJlY2F0ZWQsIHdpbGwgYmUgcmVtb3ZlZCBpbiBub2RlIDAuMTMrXG4gIGFyci5nZXQgPSBCUC5nZXRcbiAgYXJyLnNldCA9IEJQLnNldFxuXG4gIGFyci53cml0ZSA9IEJQLndyaXRlXG4gIGFyci50b1N0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0xvY2FsZVN0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0pTT04gPSBCUC50b0pTT05cbiAgYXJyLmNvcHkgPSBCUC5jb3B5XG4gIGFyci5zbGljZSA9IEJQLnNsaWNlXG4gIGFyci5yZWFkVUludDggPSBCUC5yZWFkVUludDhcbiAgYXJyLnJlYWRVSW50MTZMRSA9IEJQLnJlYWRVSW50MTZMRVxuICBhcnIucmVhZFVJbnQxNkJFID0gQlAucmVhZFVJbnQxNkJFXG4gIGFyci5yZWFkVUludDMyTEUgPSBCUC5yZWFkVUludDMyTEVcbiAgYXJyLnJlYWRVSW50MzJCRSA9IEJQLnJlYWRVSW50MzJCRVxuICBhcnIucmVhZEludDggPSBCUC5yZWFkSW50OFxuICBhcnIucmVhZEludDE2TEUgPSBCUC5yZWFkSW50MTZMRVxuICBhcnIucmVhZEludDE2QkUgPSBCUC5yZWFkSW50MTZCRVxuICBhcnIucmVhZEludDMyTEUgPSBCUC5yZWFkSW50MzJMRVxuICBhcnIucmVhZEludDMyQkUgPSBCUC5yZWFkSW50MzJCRVxuICBhcnIucmVhZEZsb2F0TEUgPSBCUC5yZWFkRmxvYXRMRVxuICBhcnIucmVhZEZsb2F0QkUgPSBCUC5yZWFkRmxvYXRCRVxuICBhcnIucmVhZERvdWJsZUxFID0gQlAucmVhZERvdWJsZUxFXG4gIGFyci5yZWFkRG91YmxlQkUgPSBCUC5yZWFkRG91YmxlQkVcbiAgYXJyLndyaXRlVUludDggPSBCUC53cml0ZVVJbnQ4XG4gIGFyci53cml0ZVVJbnQxNkxFID0gQlAud3JpdGVVSW50MTZMRVxuICBhcnIud3JpdGVVSW50MTZCRSA9IEJQLndyaXRlVUludDE2QkVcbiAgYXJyLndyaXRlVUludDMyTEUgPSBCUC53cml0ZVVJbnQzMkxFXG4gIGFyci53cml0ZVVJbnQzMkJFID0gQlAud3JpdGVVSW50MzJCRVxuICBhcnIud3JpdGVJbnQ4ID0gQlAud3JpdGVJbnQ4XG4gIGFyci53cml0ZUludDE2TEUgPSBCUC53cml0ZUludDE2TEVcbiAgYXJyLndyaXRlSW50MTZCRSA9IEJQLndyaXRlSW50MTZCRVxuICBhcnIud3JpdGVJbnQzMkxFID0gQlAud3JpdGVJbnQzMkxFXG4gIGFyci53cml0ZUludDMyQkUgPSBCUC53cml0ZUludDMyQkVcbiAgYXJyLndyaXRlRmxvYXRMRSA9IEJQLndyaXRlRmxvYXRMRVxuICBhcnIud3JpdGVGbG9hdEJFID0gQlAud3JpdGVGbG9hdEJFXG4gIGFyci53cml0ZURvdWJsZUxFID0gQlAud3JpdGVEb3VibGVMRVxuICBhcnIud3JpdGVEb3VibGVCRSA9IEJQLndyaXRlRG91YmxlQkVcbiAgYXJyLmZpbGwgPSBCUC5maWxsXG4gIGFyci5pbnNwZWN0ID0gQlAuaW5zcGVjdFxuICBhcnIudG9BcnJheUJ1ZmZlciA9IEJQLnRvQXJyYXlCdWZmZXJcblxuICByZXR1cm4gYXJyXG59XG5cbi8vIHNsaWNlKHN0YXJ0LCBlbmQpXG5mdW5jdGlvbiBjbGFtcCAoaW5kZXgsIGxlbiwgZGVmYXVsdFZhbHVlKSB7XG4gIGlmICh0eXBlb2YgaW5kZXggIT09ICdudW1iZXInKSByZXR1cm4gZGVmYXVsdFZhbHVlXG4gIGluZGV4ID0gfn5pbmRleDsgIC8vIENvZXJjZSB0byBpbnRlZ2VyLlxuICBpZiAoaW5kZXggPj0gbGVuKSByZXR1cm4gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgaW5kZXggKz0gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gY29lcmNlIChsZW5ndGgpIHtcbiAgLy8gQ29lcmNlIGxlbmd0aCB0byBhIG51bWJlciAocG9zc2libHkgTmFOKSwgcm91bmQgdXBcbiAgLy8gaW4gY2FzZSBpdCdzIGZyYWN0aW9uYWwgKGUuZy4gMTIzLjQ1NikgdGhlbiBkbyBhXG4gIC8vIGRvdWJsZSBuZWdhdGUgdG8gY29lcmNlIGEgTmFOIHRvIDAuIEVhc3ksIHJpZ2h0P1xuICBsZW5ndGggPSB+fk1hdGguY2VpbCgrbGVuZ3RoKVxuICByZXR1cm4gbGVuZ3RoIDwgMCA/IDAgOiBsZW5ndGhcbn1cblxuZnVuY3Rpb24gaXNBcnJheSAoc3ViamVjdCkge1xuICByZXR1cm4gKEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHN1YmplY3QpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHN1YmplY3QpID09PSAnW29iamVjdCBBcnJheV0nXG4gIH0pKHN1YmplY3QpXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXlpc2ggKHN1YmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXkoc3ViamVjdCkgfHwgQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpIHx8XG4gICAgICBzdWJqZWN0ICYmIHR5cGVvZiBzdWJqZWN0ID09PSAnb2JqZWN0JyAmJlxuICAgICAgdHlwZW9mIHN1YmplY3QubGVuZ3RoID09PSAnbnVtYmVyJ1xufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGIgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGlmIChiIDw9IDB4N0YpXG4gICAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSlcbiAgICBlbHNlIHtcbiAgICAgIHZhciBzdGFydCA9IGlcbiAgICAgIGlmIChiID49IDB4RDgwMCAmJiBiIDw9IDB4REZGRikgaSsrXG4gICAgICB2YXIgaCA9IGVuY29kZVVSSUNvbXBvbmVudChzdHIuc2xpY2Uoc3RhcnQsIGkrMSkpLnN1YnN0cigxKS5zcGxpdCgnJScpXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGgubGVuZ3RoOyBqKyspXG4gICAgICAgIGJ5dGVBcnJheS5wdXNoKHBhcnNlSW50KGhbal0sIDE2KSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoc3RyKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIHBvc1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKVxuICAgICAgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBkZWNvZGVVdGY4Q2hhciAoc3RyKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzdHIpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4RkZGRCkgLy8gVVRGIDggaW52YWxpZCBjaGFyXG4gIH1cbn1cblxuLypcbiAqIFdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHZhbHVlIGlzIGEgdmFsaWQgaW50ZWdlci4gVGhpcyBtZWFucyB0aGF0IGl0XG4gKiBpcyBub24tbmVnYXRpdmUuIEl0IGhhcyBubyBmcmFjdGlvbmFsIGNvbXBvbmVudCBhbmQgdGhhdCBpdCBkb2VzIG5vdFxuICogZXhjZWVkIHRoZSBtYXhpbXVtIGFsbG93ZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHZlcmlmdWludCAodmFsdWUsIG1heCkge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPj0gMCwgJ3NwZWNpZmllZCBhIG5lZ2F0aXZlIHZhbHVlIGZvciB3cml0aW5nIGFuIHVuc2lnbmVkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGlzIGxhcmdlciB0aGFuIG1heGltdW0gdmFsdWUgZm9yIHR5cGUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnNpbnQgKHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZklFRUU3NTQgKHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxufVxuXG5mdW5jdGlvbiBhc3NlcnQgKHRlc3QsIG1lc3NhZ2UpIHtcbiAgaWYgKCF0ZXN0KSB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSB8fCAnRmFpbGVkIGFzc2VydGlvbicpXG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJ1ZmZlclxcXFxpbmRleC5qc1wiLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxidWZmZXJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5leHBvcnRzLnJlYWQgPSBmdW5jdGlvbiAoYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbVxuICB2YXIgZUxlbiA9IChuQnl0ZXMgKiA4KSAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgbkJpdHMgPSAtN1xuICB2YXIgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwXG4gIHZhciBkID0gaXNMRSA/IC0xIDogMVxuICB2YXIgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxuXG4gIGkgKz0gZFxuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIHMgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IGVMZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IChlICogMjU2KSArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIGUgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IG1MZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IChtICogMjU2KSArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhc1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pXG4gICAgZSA9IGUgLSBlQmlhc1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pXG59XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbiAoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGNcbiAgdmFyIGVMZW4gPSAobkJ5dGVzICogOCkgLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKVxuICB2YXIgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpXG4gIHZhciBkID0gaXNMRSA/IDEgOiAtMVxuICB2YXIgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpXG5cbiAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHkpIHtcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDBcbiAgICBlID0gZU1heFxuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKVxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcbiAgICAgIGUtLVxuICAgICAgYyAqPSAyXG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlICs9IHJ0ICogTWF0aC5wb3coMiwgMSAtIGVCaWFzKVxuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrK1xuICAgICAgYyAvPSAyXG4gICAgfVxuXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XG4gICAgICBtID0gMFxuICAgICAgZSA9IGVNYXhcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKCh2YWx1ZSAqIGMpIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IGUgKyBlQmlhc1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSAwXG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCkge31cblxuICBlID0gKGUgPDwgbUxlbikgfCBtXG4gIGVMZW4gKz0gbUxlblxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4XG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGllZWU3NTRcXFxcaW5kZXguanNcIixcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcaWVlZTc1NFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxwcm9jZXNzXFxcXGJyb3dzZXIuanNcIixcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxccHJvY2Vzc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcblwidXNlIHN0cmljdFwiO1xyXG52YXIgX19zcHJlYWRBcnJheSA9ICh0aGlzICYmIHRoaXMuX19zcHJlYWRBcnJheSkgfHwgZnVuY3Rpb24gKHRvLCBmcm9tKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgaWwgPSBmcm9tLmxlbmd0aCwgaiA9IHRvLmxlbmd0aDsgaSA8IGlsOyBpKyssIGorKylcclxuICAgICAgICB0b1tqXSA9IGZyb21baV07XHJcbiAgICByZXR1cm4gdG87XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5DaGF0dGluZ1BhbmVsID0gZXhwb3J0cy5DaGF0dGluZ1BhbmVsUHJvcHMgPSB2b2lkIDA7XHJcbnZhciBzbmlwcGV0XzEgPSByZXF1aXJlKFwiLi4vdXRpbC9zbmlwcGV0XCIpO1xyXG52YXIgQ2hhdHRpbmdQYW5lbFByb3BzID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gQ2hhdHRpbmdQYW5lbFByb3BzKCkge1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIENoYXR0aW5nUGFuZWxQcm9wcztcclxufSgpKTtcclxuZXhwb3J0cy5DaGF0dGluZ1BhbmVsUHJvcHMgPSBDaGF0dGluZ1BhbmVsUHJvcHM7XHJcbnZhciBDaGF0dGluZ1BhbmVsID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gQ2hhdHRpbmdQYW5lbCgpIHtcclxuICAgICAgICB0aGlzLnVucmVhZENvdW50ID0gMDtcclxuICAgICAgICB0aGlzLm5hbWVDb2xvcnMgPSBbXTtcclxuICAgICAgICB0aGlzLnJlbWFpbkNvbG9ycyA9IFtdO1xyXG4gICAgfVxyXG4gICAgQ2hhdHRpbmdQYW5lbC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChwcm9wcykge1xyXG4gICAgICAgIHRoaXMucHJvcHMgPSBwcm9wcztcclxuICAgICAgICB0aGlzLmNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2lkZVRvb2xiYXJDb250YWluZXJcIik7XHJcbiAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1jbG9zZS1idXR0b25cIik7XHJcbiAgICAgICAgdGhpcy5pbnB1dEZpZWxkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGF0LWlucHV0ICN1c2VybXNnXCIpO1xyXG4gICAgICAgIHRoaXMubmFtZUNvbG9ycy5wdXNoKFwiIzAwYmZmZlwiKTsgLy9kZWVwc2t5Ymx1ZVxyXG4gICAgICAgIHRoaXMubmFtZUNvbG9ycy5wdXNoKFwiIzlhY2QzMlwiKTsgLy95ZWxsb3dncmVlblxyXG4gICAgICAgIHRoaXMubmFtZUNvbG9ycy5wdXNoKFwiI2QyNjkxZVwiKTsgLy9jaG9jb2xhdGVcclxuICAgICAgICB0aGlzLm5hbWVDb2xvcnMucHVzaChcIiNlZTgyZWVcIik7IC8vdmlvbGV0XHJcbiAgICAgICAgdGhpcy5uYW1lQ29sb3JzLnB1c2goXCIjNjQ5NWVkXCIpOyAvL2Nvcm5mbG93ZXJibHVlXHJcbiAgICAgICAgdGhpcy5uYW1lQ29sb3JzLnB1c2goXCIjZmZkNzAwXCIpOyAvL2dvbGRcclxuICAgICAgICB0aGlzLm5hbWVDb2xvcnMucHVzaChcIiM4MDgwMDBcIik7IC8vb2xpdmVcclxuICAgICAgICB0aGlzLm5hbWVDb2xvcnMucHVzaChcIiNjZDg1M2ZcIik7IC8vcGVydVxyXG4gICAgICAgIHRoaXMucmVtYWluQ29sb3JzID0gX19zcHJlYWRBcnJheShbXSwgdGhpcy5uYW1lQ29sb3JzKTtcclxuICAgICAgICB0aGlzLm5hbWVDb2xvck1hcCA9IG5ldyBNYXAoKTtcclxuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50SGFuZGxlcnMoKTtcclxuICAgICAgICB0aGlzLm9wZW4odGhpcy5vcGVuZWQpO1xyXG4gICAgfTtcclxuICAgIENoYXR0aW5nUGFuZWwucHJvdG90eXBlLmF0dGFjaEV2ZW50SGFuZGxlcnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzXzEgPSB0aGlzO1xyXG4gICAgICAgICQodGhpcy5jbG9zZUJ1dHRvbikub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBfdGhpc18xLm9wZW4oZmFsc2UpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQodGhpcy5pbnB1dEZpZWxkKS5rZXlwcmVzcyhmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBpZiAoKGUua2V5Q29kZSB8fCBlLndoaWNoKSA9PSAxMykgeyAvL0VudGVyIGtleWNvZGVcclxuICAgICAgICAgICAgICAgIGlmICghZS5zaGlmdEtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpc18xLm9uRW50ZXIoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgJChcIi5zbWlsZXlDb250YWluZXJcIikuY2xpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmF0dHIoXCJpZFwiKTtcclxuICAgICAgICAgICAgdmFyIGltb25hbWUgPSBfdGhpcy5pZFRvRW1vbmFtZShpZCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGltb25hbWUpO1xyXG4gICAgICAgICAgICB2YXIgc2VuZGVsID0gJChcIiN1c2VybXNnXCIpO1xyXG4gICAgICAgICAgICB2YXIgc21zID0gc2VuZGVsLnZhbCgpO1xyXG4gICAgICAgICAgICBzbXMgKz0gaW1vbmFtZTtcclxuICAgICAgICAgICAgc2VuZGVsLnZhbChzbXMpO1xyXG4gICAgICAgICAgICB2YXIgZWwgPSAkKFwiLnNtaWxleXMtcGFuZWxcIik7XHJcbiAgICAgICAgICAgIGVsLnJlbW92ZUNsYXNzKFwic2hvdy1zbWlsZXlzXCIpO1xyXG4gICAgICAgICAgICBlbC5hZGRDbGFzcyhcImhpZGUtc21pbGV5c1wiKTtcclxuICAgICAgICAgICAgc2VuZGVsLmZvY3VzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJChcIiNzbWlsZXlzXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGVsID0gJChcIi5zbWlsZXlzLXBhbmVsXCIpO1xyXG4gICAgICAgICAgICBpZiAoZWwuaGFzQ2xhc3MoXCJoaWRlLXNtaWxleXNcIikpIHtcclxuICAgICAgICAgICAgICAgIGVsLnJlbW92ZUNsYXNzKFwiaGlkZS1zbWlsZXlzXCIpO1xyXG4gICAgICAgICAgICAgICAgZWwuYWRkQ2xhc3MoXCJzaG93LXNtaWxleXNcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlbC5yZW1vdmVDbGFzcyhcInNob3ctc21pbGV5c1wiKTtcclxuICAgICAgICAgICAgICAgIGVsLmFkZENsYXNzKFwiaGlkZS1zbWlsZXlzXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgQ2hhdHRpbmdQYW5lbC5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uIChvcGVuZWQpIHtcclxuICAgICAgICBpZiAob3BlbmVkKSB7XHJcbiAgICAgICAgICAgICQoXCIjdmlkZW8tcGFuZWxcIikuYWRkQ2xhc3MoXCJzaGlmdC1yaWdodFwiKTtcclxuICAgICAgICAgICAgJChcIiNuZXctdG9vbGJveFwiKS5hZGRDbGFzcyhcInNoaWZ0LXJpZ2h0XCIpO1xyXG4gICAgICAgICAgICAkKHRoaXMuY29udGFpbmVyKS5yZW1vdmVDbGFzcyhcImludmlzaWJsZVwiKTtcclxuICAgICAgICAgICAgJCh0aGlzLmlucHV0RmllbGQpLmZvY3VzKCk7XHJcbiAgICAgICAgICAgICQoXCIudG9vbGJveC1pY29uXCIsIHRoaXMucHJvcHMuY2hhdE9wZW5CdXR0b24pLmFkZENsYXNzKFwidG9nZ2xlZFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICQoXCIjdmlkZW8tcGFuZWxcIikucmVtb3ZlQ2xhc3MoXCJzaGlmdC1yaWdodFwiKTtcclxuICAgICAgICAgICAgJChcIiNuZXctdG9vbGJveFwiKS5yZW1vdmVDbGFzcyhcInNoaWZ0LXJpZ2h0XCIpO1xyXG4gICAgICAgICAgICAkKHRoaXMuY29udGFpbmVyKS5hZGRDbGFzcyhcImludmlzaWJsZVwiKTtcclxuICAgICAgICAgICAgJChcIi50b29sYm94LWljb25cIiwgdGhpcy5wcm9wcy5jaGF0T3BlbkJ1dHRvbikucmVtb3ZlQ2xhc3MoXCJ0b2dnbGVkXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVucmVhZENvdW50ID0gMDtcclxuICAgICAgICB0aGlzLnNob3dVbnJlYWRCYWRnZShmYWxzZSk7XHJcbiAgICAgICAgdGhpcy5vcGVuZWQgPSBvcGVuZWQ7XHJcbiAgICAgICAgdGhpcy5wcm9wcy5vcGVuQ2FsbGJhY2soKTtcclxuICAgIH07XHJcbiAgICBDaGF0dGluZ1BhbmVsLnByb3RvdHlwZS5zaG93VW5yZWFkQmFkZ2UgPSBmdW5jdGlvbiAoc2hvdykge1xyXG4gICAgICAgIHRoaXMucHJvcHMudW5yZWFkQmFkZ2VFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAhIXNob3cgPyBcImZsZXhcIiA6IFwibm9uZVwiO1xyXG4gICAgfTtcclxuICAgIENoYXR0aW5nUGFuZWwucHJvdG90eXBlLnRvZ2dsZU9wZW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5vcGVuZWQgPSAhdGhpcy5vcGVuZWQ7XHJcbiAgICAgICAgdGhpcy5vcGVuKHRoaXMub3BlbmVkKTtcclxuICAgIH07XHJcbiAgICBDaGF0dGluZ1BhbmVsLnByb3RvdHlwZS5vbkVudGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBzbXMgPSAkKHRoaXMuaW5wdXRGaWVsZCkudmFsKCkudG9TdHJpbmcoKS50cmltKCk7XHJcbiAgICAgICAgJCh0aGlzLmlucHV0RmllbGQpLnZhbCgnJyk7XHJcbiAgICAgICAgaWYgKCFzbXMpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBzbXMgPSB0aGlzLmVtb25hbWVUb0Vtb2ljb24oc21zKTtcclxuICAgICAgICB2YXIgdGltZSA9IHRoaXMuZ2V0Q3VyVGltZSgpO1xyXG4gICAgICAgIHZhciBzZWwgPSAkKFwiI2NoYXRjb252ZXJzYXRpb24gZGl2LmNoYXQtbWVzc2FnZS1ncm91cDpsYXN0LWNoaWxkXCIpO1xyXG4gICAgICAgIGlmIChzZWwuaGFzQ2xhc3MoXCJsb2NhbFwiKSkge1xyXG4gICAgICAgICAgICBzZWwuZmluZChcIi50aW1lc3RhbXBcIikucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHNlbC5hcHBlbmQoJzxkaXYgY2xhc3M9IFwiY2hhdG1lc3NhZ2Utd3JhcHBlclwiID5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNoYXRtZXNzYWdlIFwiPlxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJlcGx5d3JhcHBlclwiPlxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZXNzYWdlY29udGVudFwiPlxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlcm1lc3NhZ2VcIj4nICsgc21zICsgJzwvZGl2PlxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGltZXN0YW1wXCI+JyArIHRpbWUgKyAnPC9kaXY+XFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXYgPicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgJChcIiNjaGF0Y29udmVyc2F0aW9uXCIpLmFwcGVuZCgnPGRpdiBjbGFzcz1cImNoYXQtbWVzc2FnZS1ncm91cCBsb2NhbFwiPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSBcImNoYXRtZXNzYWdlLXdyYXBwZXJcIiA+XFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2hhdG1lc3NhZ2UgXCI+XFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJlcGx5d3JhcHBlclwiPlxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVzc2FnZWNvbnRlbnRcIj5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ1c2VybWVzc2FnZVwiPicgKyBzbXMgKyAnPC9kaXY+XFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGltZXN0YW1wXCI+JyArIHRpbWUgKyAnPC9kaXY+XFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2ID5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zY3JvbGxUb0JvdHRvbSgpO1xyXG4gICAgICAgIHRoaXMucHJvcHMuc2VuZENoYXQoc21zKTtcclxuICAgIH07XHJcbiAgICAvL2NoYXRcclxuICAgIENoYXR0aW5nUGFuZWwucHJvdG90eXBlLnJlY2VpdmVNZXNzYWdlID0gZnVuY3Rpb24gKHVzZXJuYW1lLCBtZXNzYWdlLCB0aW1lc3RhbXApIHtcclxuICAgICAgICAvL3VwZGF0ZSB1bnJlYWQgY291bnRcclxuICAgICAgICBpZiAoIXRoaXMub3BlbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMudW5yZWFkQ291bnQrKztcclxuICAgICAgICAgICAgJCh0aGlzLnByb3BzLnVucmVhZEJhZGdlRWxlbWVudCkuaHRtbChcIlwiICsgdGhpcy51bnJlYWRDb3VudCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd1VucmVhZEJhZGdlKHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL3VwZGF0ZSB1aVxyXG4gICAgICAgIHZhciBlbW9NZXNzYWdlID0gdGhpcy5lbW9uYW1lVG9FbW9pY29uKG1lc3NhZ2UpO1xyXG4gICAgICAgIHZhciBuYW1lQ29sb3IgPSB0aGlzLmdldE5hbWVDb2xvcih1c2VybmFtZSk7XHJcbiAgICAgICAgJChcIiNjaGF0Y29udmVyc2F0aW9uXCIpLmFwcGVuZChcIjxkaXYgY2xhc3M9XFxcImNoYXQtbWVzc2FnZS1ncm91cCByZW1vdGVcXFwiPiAgICAgICAgIDxkaXYgY2xhc3M9IFxcXCJjaGF0bWVzc2FnZS13cmFwcGVyXFxcIiA+ICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImNoYXRtZXNzYWdlIFxcXCI+ICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBseXdyYXBwZXJcXFwiPiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcIm1lc3NhZ2Vjb250ZW50XFxcIj4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZGlzcGxheS1uYW1lXFxcIiBzdHlsZT1cXFwiY29sb3I6XCIgKyBuYW1lQ29sb3IgKyBcIlxcXCI+XCIgKyB1c2VybmFtZSArICc8L2Rpdj5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVzZXJtZXNzYWdlXCI+JyArIGVtb01lc3NhZ2UgKyAnPC9kaXY+XFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxcclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXFxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxcclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aW1lc3RhbXBcIj4nICsgdGhpcy5nZXRDdXJUaW1lKCkgKyAnPC9kaXY+XFxcclxuICAgICAgICAgICAgPC9kaXYgPlxcXHJcbiAgICAgICAgPC9kaXY+Jyk7XHJcbiAgICAgICAgdGhpcy5zY3JvbGxUb0JvdHRvbSgpO1xyXG4gICAgfTtcclxuICAgIENoYXR0aW5nUGFuZWwucHJvdG90eXBlLnNjcm9sbFRvQm90dG9tID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBvdmVyaGVpZ2h0ID0gMDtcclxuICAgICAgICAkKFwiLmNoYXQtbWVzc2FnZS1ncm91cFwiKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgb3ZlcmhlaWdodCArPSAkKHRoaXMpLmhlaWdodCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBsaW1pdCA9ICQoJyNjaGF0Y29udmVyc2F0aW9uJykuaGVpZ2h0KCk7XHJcbiAgICAgICAgdmFyIHBvcyA9IG92ZXJoZWlnaHQgLSBsaW1pdDtcclxuICAgICAgICAkKFwiI2NoYXRjb252ZXJzYXRpb25cIikuYW5pbWF0ZSh7IHNjcm9sbFRvcDogcG9zIH0sIDIwMCk7XHJcbiAgICB9O1xyXG4gICAgQ2hhdHRpbmdQYW5lbC5wcm90b3R5cGUuZ2V0Q3VyVGltZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgdmFyIGggPSBkYXRlLmdldEhvdXJzKCk7XHJcbiAgICAgICAgdmFyIG0gPSBkYXRlLmdldE1pbnV0ZXMoKTtcclxuICAgICAgICB2YXIgbV8yID0gKFwiMFwiICsgbSkuc2xpY2UoLTIpO1xyXG4gICAgICAgIHZhciBoXzIgPSAoXCIwXCIgKyBoKS5zbGljZSgtMik7XHJcbiAgICAgICAgdmFyIHRpbWUgPSBoXzIgKyBcIjpcIiArIG1fMjtcclxuICAgICAgICByZXR1cm4gdGltZTtcclxuICAgIH07XHJcbiAgICBDaGF0dGluZ1BhbmVsLnByb3RvdHlwZS5pZFRvRW1vbmFtZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgIGlmIChpZCA9PSAnc21pbGV5MScpXHJcbiAgICAgICAgICAgIHJldHVybiAnOiknO1xyXG4gICAgICAgIGlmIChpZCA9PSAnc21pbGV5MicpXHJcbiAgICAgICAgICAgIHJldHVybiAnOignO1xyXG4gICAgICAgIGlmIChpZCA9PSAnc21pbGV5MycpXHJcbiAgICAgICAgICAgIHJldHVybiAnOkQnO1xyXG4gICAgICAgIGlmIChpZCA9PSAnc21pbGV5NCcpXHJcbiAgICAgICAgICAgIHJldHVybiAnOisxOic7XHJcbiAgICAgICAgaWYgKGlkID09ICdzbWlsZXk1JylcclxuICAgICAgICAgICAgcmV0dXJuICc6UCc7XHJcbiAgICAgICAgaWYgKGlkID09ICdzbWlsZXk2JylcclxuICAgICAgICAgICAgcmV0dXJuICc6d2F2ZTonO1xyXG4gICAgICAgIGlmIChpZCA9PSAnc21pbGV5NycpXHJcbiAgICAgICAgICAgIHJldHVybiAnOmJsdXNoOic7XHJcbiAgICAgICAgaWYgKGlkID09ICdzbWlsZXk4JylcclxuICAgICAgICAgICAgcmV0dXJuICc6c2xpZ2h0bHlfc21pbGluZ19mYWNlOic7XHJcbiAgICAgICAgaWYgKGlkID09ICdzbWlsZXk5JylcclxuICAgICAgICAgICAgcmV0dXJuICc6c2NyZWFtOic7XHJcbiAgICAgICAgaWYgKGlkID09ICdzbWlsZXkxMCcpXHJcbiAgICAgICAgICAgIHJldHVybiAnOionO1xyXG4gICAgICAgIGlmIChpZCA9PSAnc21pbGV5MTEnKVxyXG4gICAgICAgICAgICByZXR1cm4gJzotMTonO1xyXG4gICAgICAgIGlmIChpZCA9PSAnc21pbGV5MTInKVxyXG4gICAgICAgICAgICByZXR1cm4gJzptYWc6JztcclxuICAgICAgICBpZiAoaWQgPT0gJ3NtaWxleTEzJylcclxuICAgICAgICAgICAgcmV0dXJuICc6aGVhcnQ6JztcclxuICAgICAgICBpZiAoaWQgPT0gJ3NtaWxleTE0JylcclxuICAgICAgICAgICAgcmV0dXJuICc6aW5ub2NlbnQ6JztcclxuICAgICAgICBpZiAoaWQgPT0gJ3NtaWxleTE1JylcclxuICAgICAgICAgICAgcmV0dXJuICc6YW5ncnk6JztcclxuICAgICAgICBpZiAoaWQgPT0gJ3NtaWxleTE2JylcclxuICAgICAgICAgICAgcmV0dXJuICc6YW5nZWw6JztcclxuICAgICAgICBpZiAoaWQgPT0gJ3NtaWxleTE3JylcclxuICAgICAgICAgICAgcmV0dXJuICc7KCc7XHJcbiAgICAgICAgaWYgKGlkID09ICdzbWlsZXkxOCcpXHJcbiAgICAgICAgICAgIHJldHVybiAnOmNsYXA6JztcclxuICAgICAgICBpZiAoaWQgPT0gJ3NtaWxleTE5JylcclxuICAgICAgICAgICAgcmV0dXJuICc7KSc7XHJcbiAgICAgICAgaWYgKGlkID09ICdzbWlsZXkyMCcpXHJcbiAgICAgICAgICAgIHJldHVybiAnOmJlZXI6JztcclxuICAgIH07XHJcbiAgICBDaGF0dGluZ1BhbmVsLnByb3RvdHlwZS5lbW9uYW1lVG9FbW9pY29uID0gZnVuY3Rpb24gKHNtcykge1xyXG4gICAgICAgIHZhciBzbXNvdXQgPSBzbXM7XHJcbiAgICAgICAgc21zb3V0ID0gc21zb3V0LnJlcGxhY2UoJzopJywgJzxzcGFuIGNsYXNzPVwic21pbGV5XCIgc3R5bGU9XCJ3aWR0aDogMjBweDsgaGVpZ2h0OjIwcHg7XCI+8J+Ygzwvc3Bhbj4nKTtcclxuICAgICAgICBzbXNvdXQgPSBzbXNvdXQucmVwbGFjZSgnOignLCAnPHNwYW4gY2xhc3M9XCJzbWlsZXlcIj7wn5imPC9zcGFuPicpO1xyXG4gICAgICAgIHNtc291dCA9IHNtc291dC5yZXBsYWNlKCc6RCcsICc8c3BhbiBjbGFzcz1cInNtaWxleVwiPvCfmIQ8L3NwYW4+Jyk7XHJcbiAgICAgICAgc21zb3V0ID0gc21zb3V0LnJlcGxhY2UoJzorMTonLCAnPHNwYW4gY2xhc3M9XCJzbWlsZXlcIj7wn5GNPC9zcGFuPicpO1xyXG4gICAgICAgIHNtc291dCA9IHNtc291dC5yZXBsYWNlKCc6UCcsICc8c3BhbiBjbGFzcz1cInNtaWxleVwiPvCfmJs8L3NwYW4+Jyk7XHJcbiAgICAgICAgc21zb3V0ID0gc21zb3V0LnJlcGxhY2UoJzp3YXZlOicsICc8c3BhbiBjbGFzcz1cInNtaWxleVwiPvCfkYs8L3NwYW4+Jyk7XHJcbiAgICAgICAgc21zb3V0ID0gc21zb3V0LnJlcGxhY2UoJzpibHVzaDonLCAnPHNwYW4gY2xhc3M9XCJzbWlsZXlcIj7wn5iKPC9zcGFuPicpO1xyXG4gICAgICAgIHNtc291dCA9IHNtc291dC5yZXBsYWNlKCc6c2xpZ2h0bHlfc21pbGluZ19mYWNlOicsICc8c3BhbiBjbGFzcz1cInNtaWxleVwiPvCfmYI8L3NwYW4+Jyk7XHJcbiAgICAgICAgc21zb3V0ID0gc21zb3V0LnJlcGxhY2UoJzpzY3JlYW06JywgJzxzcGFuIGNsYXNzPVwic21pbGV5XCI+8J+YsTwvc3Bhbj4nKTtcclxuICAgICAgICBzbXNvdXQgPSBzbXNvdXQucmVwbGFjZSgnOionLCAnPHNwYW4gY2xhc3M9XCJzbWlsZXlcIj7wn5iXPC9zcGFuPicpO1xyXG4gICAgICAgIHNtc291dCA9IHNtc291dC5yZXBsYWNlKCc6LTE6JywgJzxzcGFuIGNsYXNzPVwic21pbGV5XCI+8J+Rjjwvc3Bhbj4nKTtcclxuICAgICAgICBzbXNvdXQgPSBzbXNvdXQucmVwbGFjZSgnOm1hZzonLCAnPHNwYW4gY2xhc3M9XCJzbWlsZXlcIj7wn5SNPC9zcGFuPicpO1xyXG4gICAgICAgIHNtc291dCA9IHNtc291dC5yZXBsYWNlKCc6aGVhcnQ6JywgJzxzcGFuIGNsYXNzPVwic21pbGV5XCI+4p2k77iPPC9zcGFuPicpO1xyXG4gICAgICAgIHNtc291dCA9IHNtc291dC5yZXBsYWNlKCc6aW5ub2NlbnQ6JywgJzxzcGFuIGNsYXNzPVwic21pbGV5XCI+8J+Yhzwvc3Bhbj4nKTtcclxuICAgICAgICBzbXNvdXQgPSBzbXNvdXQucmVwbGFjZSgnOmFuZ3J5OicsICc8c3BhbiBjbGFzcz1cInNtaWxleVwiPvCfmKA8L3NwYW4+Jyk7XHJcbiAgICAgICAgc21zb3V0ID0gc21zb3V0LnJlcGxhY2UoJzphbmdlbDonLCAnPHNwYW4gY2xhc3M9XCJzbWlsZXlcIj7wn5G8PC9zcGFuPicpO1xyXG4gICAgICAgIHNtc291dCA9IHNtc291dC5yZXBsYWNlKCc7KCcsICc8c3BhbiBjbGFzcz1cInNtaWxleVwiPvCfmK08L3NwYW4+Jyk7XHJcbiAgICAgICAgc21zb3V0ID0gc21zb3V0LnJlcGxhY2UoJzpjbGFwOicsICc8c3BhbiBjbGFzcz1cInNtaWxleVwiPvCfkY88L3NwYW4+Jyk7XHJcbiAgICAgICAgc21zb3V0ID0gc21zb3V0LnJlcGxhY2UoJzspJywgJzxzcGFuIGNsYXNzPVwic21pbGV5XCI+8J+YiTwvc3Bhbj4nKTtcclxuICAgICAgICBzbXNvdXQgPSBzbXNvdXQucmVwbGFjZSgnOmJlZXI6JywgJzxzcGFuIGNsYXNzPVwic21pbGV5XCI+8J+Nujwvc3Bhbj4nKTtcclxuICAgICAgICByZXR1cm4gc21zb3V0O1xyXG4gICAgfTtcclxuICAgIENoYXR0aW5nUGFuZWwucHJvdG90eXBlLmdldE5hbWVDb2xvciA9IGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubmFtZUNvbG9yTWFwLmhhcyhuYW1lKSlcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubmFtZUNvbG9yTWFwLmdldChuYW1lKTtcclxuICAgICAgICBpZiAodGhpcy5yZW1haW5Db2xvcnMubGVuZ3RoIDw9IDApXHJcbiAgICAgICAgICAgIHRoaXMucmVtYWluQ29sb3JzID0gX19zcHJlYWRBcnJheShbXSwgdGhpcy5uYW1lQ29sb3JzKTtcclxuICAgICAgICAvL1ttaW4sIG1heClcclxuICAgICAgICB2YXIgcmFuZEluZGV4ID0gc25pcHBldF8xLnJhbmRvbSgwLCB0aGlzLnJlbWFpbkNvbG9ycy5sZW5ndGgpO1xyXG4gICAgICAgIHZhciByYW5kb21Db2xvciA9IHRoaXMucmVtYWluQ29sb3JzW3JhbmRJbmRleF07XHJcbiAgICAgICAgdGhpcy5yZW1haW5Db2xvcnMuc3BsaWNlKHJhbmRJbmRleCwgMSk7XHJcbiAgICAgICAgdGhpcy5uYW1lQ29sb3JNYXAuc2V0KG5hbWUsIHJhbmRvbUNvbG9yKTtcclxuICAgICAgICByZXR1cm4gcmFuZG9tQ29sb3I7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIENoYXR0aW5nUGFuZWw7XHJcbn0oKSk7XHJcbmV4cG9ydHMuQ2hhdHRpbmdQYW5lbCA9IENoYXR0aW5nUGFuZWw7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUNoYXR0aW5nUGFuZWwuanMubWFwXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2NvbXBvbmVudHNcXFxcQ2hhdHRpbmdQYW5lbC5qc1wiLFwiL2NvbXBvbmVudHNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLlBhcnRpY2lwYW50TGlzdFBhbmVsID0gZXhwb3J0cy5QYXJ0aWNpcGFudExpc3RQYW5lbFByb3BzID0gdm9pZCAwO1xyXG52YXIgc25pcHBldF8xID0gcmVxdWlyZShcIi4uL3V0aWwvc25pcHBldFwiKTtcclxudmFyIHZlY3Rvcl9pY29uXzEgPSByZXF1aXJlKFwiLi92ZWN0b3JfaWNvblwiKTtcclxudmFyIFBhcnRpY2lwYW50SXRlbVByb3BzID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gUGFydGljaXBhbnRJdGVtUHJvcHMoKSB7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gUGFydGljaXBhbnRJdGVtUHJvcHM7XHJcbn0oKSk7XHJcbnZhciBQYXJ0aWNpcGFudEl0ZW0gPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBQYXJ0aWNpcGFudEl0ZW0ocHJvcHMpIHtcclxuICAgICAgICB0aGlzLnByb3BzID0gcHJvcHM7XHJcbiAgICAgICAgdGhpcy51c2VDYW1lcmEgPSB0aGlzLnByb3BzLnVzZUNhbWVyYTtcclxuICAgICAgICB0aGlzLnVzZU1pYyA9IHRoaXMucHJvcHMudXNlTWljO1xyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfVxyXG4gICAgUGFydGljaXBhbnRJdGVtLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdmFyIGJvZHkgPSBcIlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImppdHNpLXBhcnRpY2lwYW50XFxcIj5cXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwicGFydGljaXBhbnQtYXZhdGFyXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImF2YXRhciAgdXNlckF2YXRhciB3LTQwcHggaC00MHB4XFxcIiBzdHlsZT1cXFwiYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyMzQsIDI1NSwgMTI4LCAwLjQpO1xcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyBjbGFzcz1cXFwiYXZhdGFyLXN2Z1xcXCIgdmlld0JveD1cXFwiMCAwIDEwMCAxMDBcXFwiIHhtbG5zPVxcXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1xcXCIgeG1sbnM6eGxpbms9XFxcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGV4dCBkb21pbmFudC1iYXNlbGluZT1cXFwiY2VudHJhbFxcXCIgZmlsbD1cXFwicmdiYSgyNTUsMjU1LDI1NSwuNilcXFwiIGZvbnQtc2l6ZT1cXFwiNDBwdFxcXCIgdGV4dC1hbmNob3I9XFxcIm1pZGRsZVxcXCIgeD1cXFwiNTBcXFwiIHk9XFxcIjUwXFxcIj4/PC90ZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJwYXJ0aWNpcGFudC1jb250ZW50XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJuYW1lXFxcIiBjbGFzcz1cXFwiZnMtMiBmdy1ib2xkZXJcXFwiPj88L3NwYW4+XFxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwic3BhY2VyXFxcIj48L3NwYW4+XFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJqaXRzaS1pY29uIGNhbWVyYS10b2dnbGUtYnV0dG9uXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGlkPVxcXCJjYW1lcmEtZGlzYWJsZWRcXFwiIHdpZHRoPVxcXCIyMFxcXCIgaGVpZ2h0PVxcXCIyMFxcXCIgdmlld0JveD1cXFwiMCAwIDIwIDIwXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cXFwiXFxcIj48L3BhdGg+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImppdHNpLWljb24gbWljLXRvZ2dsZS1idXR0b25cXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgaWQ9XFxcIm1pYy1kaXNhYmxlZFxcXCIgd2lkdGg9XFxcIjIwXFxcIiBoZWlnaHQ9XFxcIjIwXFxcIiB2aWV3Qm94PVxcXCIwIDAgMjAgMjBcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVxcXCJcXFwiPjwvcGF0aD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgIFwiO1xyXG4gICAgICAgIHZhciAkcm9vdCA9ICQoYm9keSk7XHJcbiAgICAgICAgdGhpcy5yb290RWxlbWVudCA9ICRyb290WzBdO1xyXG4gICAgICAgIHRoaXMuYXZhdGFyRWxlbWVudCA9ICRyb290LmZpbmQoXCIuYXZhdGFyXCIpWzBdO1xyXG4gICAgICAgIHRoaXMuYXZhdGFyVGV4dEVsZW1lbnQgPSAkKHRoaXMuYXZhdGFyRWxlbWVudCkuZmluZChcInRleHRcIilbMF07XHJcbiAgICAgICAgdGhpcy5uYW1lRWxlbWVudCA9ICRyb290LmZpbmQoXCIubmFtZVwiKVswXTtcclxuICAgICAgICB0aGlzLmNhbWVyYUJ1dHRvbkVsZW1lbnQgPSAkcm9vdC5maW5kKFwiLmNhbWVyYS10b2dnbGUtYnV0dG9uXCIpWzBdO1xyXG4gICAgICAgIHRoaXMubWljQnV0dG9uRWxlbWVudCA9ICRyb290LmZpbmQoXCIubWljLXRvZ2dsZS1idXR0b25cIilbMF07XHJcbiAgICAgICAgdGhpcy5jYW1lcmFJY29uRWxlbWVudCA9ICQodGhpcy5jYW1lcmFCdXR0b25FbGVtZW50KS5maW5kKFwicGF0aFwiKVswXTtcclxuICAgICAgICB0aGlzLm1pY0ljb25FbGVtZW50ID0gJCh0aGlzLm1pY0J1dHRvbkVsZW1lbnQpLmZpbmQoXCJwYXRoXCIpWzBdO1xyXG4gICAgICAgIC8vYXZhdGFyXHJcbiAgICAgICAgdGhpcy5hdmF0YXJUZXh0RWxlbWVudC5pbm5lckhUTUwgPSBzbmlwcGV0XzEuYXZhdGFyTmFtZSh0aGlzLnByb3BzLm5hbWUpO1xyXG4gICAgICAgIHZhciBhdmF0YXJDb2xvcnMgPSBbXHJcbiAgICAgICAgICAgIFwicmdiYSgyMzQsIDI1NSwgMTI4LCAwLjQpXCIsXHJcbiAgICAgICAgICAgIFwicmdiYSgxMTQsIDkxLCA2MCwgMS4wKVwiLFxyXG4gICAgICAgICAgICBcInJnYmEoNjMsIDY1LCAxMTMsIDEuMClcIixcclxuICAgICAgICAgICAgXCJyZ2JhKDU2LCAxMDUsIDkxLCAxLjApXCJcclxuICAgICAgICBdO1xyXG4gICAgICAgICQodGhpcy5hdmF0YXJFbGVtZW50KS5jc3MoXCJiYWNrZ3JvdW5kLWNvbG9yXCIsIGF2YXRhckNvbG9yc1tzbmlwcGV0XzEucmFuZG9tKDAsIGF2YXRhckNvbG9ycy5sZW5ndGgpXSk7XHJcbiAgICAgICAgLy9uYW1lXHJcbiAgICAgICAgJCh0aGlzLm5hbWVFbGVtZW50KS5odG1sKHRoaXMucHJvcHMubmFtZSk7XHJcbiAgICAgICAgLy9pY29uXHJcbiAgICAgICAgdGhpcy51cGRhdGVDYW1lcmFJY29uKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVNaWNJY29uKCk7XHJcbiAgICAgICAgJCh0aGlzLmNhbWVyYUJ1dHRvbkVsZW1lbnQpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChfKSB7XHJcbiAgICAgICAgICAgIF90aGlzLm9uVG9nZ2xlQ2FtZXJhKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCh0aGlzLm1pY0J1dHRvbkVsZW1lbnQpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChfKSB7XHJcbiAgICAgICAgICAgIF90aGlzLm9uVG9nZ2xlTWljKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgUGFydGljaXBhbnRJdGVtLnByb3RvdHlwZS5lbGVtZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJvb3RFbGVtZW50O1xyXG4gICAgfTtcclxuICAgIFBhcnRpY2lwYW50SXRlbS5wcm90b3R5cGUucmVtb3ZlU2VsZiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKHRoaXMucm9vdEVsZW1lbnQpLnJlbW92ZSgpO1xyXG4gICAgfTtcclxuICAgIFBhcnRpY2lwYW50SXRlbS5wcm90b3R5cGUub25Ub2dnbGVDYW1lcmEgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy51c2VDYW1lcmEgPSAhdGhpcy51c2VDYW1lcmE7XHJcbiAgICAgICAgdGhpcy51cGRhdGVDYW1lcmFJY29uKCk7XHJcbiAgICAgICAgdGhpcy5wcm9wcy5vblVzZUNhbWVyYSh0aGlzLnByb3BzLmppdHNpSWQsIHRoaXMudXNlQ2FtZXJhKTtcclxuICAgIH07XHJcbiAgICBQYXJ0aWNpcGFudEl0ZW0ucHJvdG90eXBlLm9uVG9nZ2xlTWljID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMudXNlTWljID0gIXRoaXMudXNlTWljO1xyXG4gICAgICAgIHRoaXMudXBkYXRlTWljSWNvbigpO1xyXG4gICAgICAgIHRoaXMucHJvcHMub25Vc2VNaWModGhpcy5wcm9wcy5qaXRzaUlkLCB0aGlzLnVzZU1pYyk7XHJcbiAgICB9O1xyXG4gICAgUGFydGljaXBhbnRJdGVtLnByb3RvdHlwZS51cGRhdGVDYW1lcmFJY29uID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBpY29uID0gdGhpcy51c2VDYW1lcmEgPyB2ZWN0b3JfaWNvbl8xLlZlY3Rvckljb24uVklERU9fVU5NVVRFX0lDT04gOiB2ZWN0b3JfaWNvbl8xLlZlY3Rvckljb24uVklERU9fTVVURV9JQ09OO1xyXG4gICAgICAgICQodGhpcy5jYW1lcmFJY29uRWxlbWVudCkuYXR0cihcImRcIiwgaWNvbik7XHJcbiAgICB9O1xyXG4gICAgUGFydGljaXBhbnRJdGVtLnByb3RvdHlwZS51cGRhdGVNaWNJY29uID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBpY29uID0gdGhpcy51c2VNaWMgPyB2ZWN0b3JfaWNvbl8xLlZlY3Rvckljb24uQVVESU9fVU5NVVRFX0lDT04gOiB2ZWN0b3JfaWNvbl8xLlZlY3Rvckljb24uQVVESU9fTVVURV9JQ09OO1xyXG4gICAgICAgICQodGhpcy5taWNJY29uRWxlbWVudCkuYXR0cihcImRcIiwgaWNvbik7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFBhcnRpY2lwYW50SXRlbTtcclxufSgpKTtcclxudmFyIFBhcnRpY2lwYW50TGlzdFBhbmVsUHJvcHMgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBQYXJ0aWNpcGFudExpc3RQYW5lbFByb3BzKCkge1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFBhcnRpY2lwYW50TGlzdFBhbmVsUHJvcHM7XHJcbn0oKSk7XHJcbmV4cG9ydHMuUGFydGljaXBhbnRMaXN0UGFuZWxQcm9wcyA9IFBhcnRpY2lwYW50TGlzdFBhbmVsUHJvcHM7XHJcbnZhciBQYXJ0aWNpcGFudExpc3RQYW5lbCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFBhcnRpY2lwYW50TGlzdFBhbmVsKCkge1xyXG4gICAgICAgIC8vc3RhdGVzXHJcbiAgICAgICAgdGhpcy5wYXJ0aWNpcGFudEl0ZW1NYXAgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgdGhpcy5yb290RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydGljaXBhbnRzLWxpc3RcIik7XHJcbiAgICAgICAgdGhpcy5wYXJ0aWNpcGFudENvdW50RWxlbWVudCA9ICQodGhpcy5yb290RWxlbWVudCkuZmluZChcIiNwYXJ0aWNpcGFudC1jb3VudFwiKVswXTtcclxuICAgICAgICB0aGlzLnBhcnRpY2lwYW50TGlzdEVsZW1lbnQgPSAkKHRoaXMucm9vdEVsZW1lbnQpLmZpbmQoXCIjcGFydGljaXBhbnRzLWxpc3QtYm9keVwiKVswXTtcclxuICAgIH1cclxuICAgIFBhcnRpY2lwYW50TGlzdFBhbmVsLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKHByb3BzKSB7XHJcbiAgICAgICAgdGhpcy5wcm9wcyA9IHByb3BzO1xyXG4gICAgICAgIHRoaXMudXBkYXRlUGFydGljaXBhbnRDb3VudCgpO1xyXG4gICAgfTtcclxuICAgIFBhcnRpY2lwYW50TGlzdFBhbmVsLnByb3RvdHlwZS5hZGRQYXJ0aWNpcGFudCA9IGZ1bmN0aW9uIChqaXRzaUlkLCBuYW1lLCBtZSwgdXNlQ2FtZXJhLCB1c2VNaWMpIHtcclxuICAgICAgICBpZiAodGhpcy5wYXJ0aWNpcGFudEl0ZW1NYXAuaGFzKGppdHNpSWQpKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlUGFydGljaXBhbnQoaml0c2lJZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBwcm9wcyA9IG5ldyBQYXJ0aWNpcGFudEl0ZW1Qcm9wcygpO1xyXG4gICAgICAgIHByb3BzLmppdHNpSWQgPSBqaXRzaUlkO1xyXG4gICAgICAgIHByb3BzLm5hbWUgPSBtZSA/IG5hbWUgKyBcIiAoTWUpXCIgOiBuYW1lO1xyXG4gICAgICAgIHByb3BzLnVzZUNhbWVyYSA9IHVzZUNhbWVyYTtcclxuICAgICAgICBwcm9wcy51c2VNaWMgPSB1c2VNaWM7XHJcbiAgICAgICAgcHJvcHMub25Vc2VDYW1lcmEgPSB0aGlzLnByb3BzLm9uVXNlQ2FtZXJhO1xyXG4gICAgICAgIHByb3BzLm9uVXNlTWljID0gdGhpcy5wcm9wcy5vblVzZU1pYztcclxuICAgICAgICB2YXIgaXRlbSA9IG5ldyBQYXJ0aWNpcGFudEl0ZW0ocHJvcHMpO1xyXG4gICAgICAgIHRoaXMucGFydGljaXBhbnRJdGVtTWFwLnNldChqaXRzaUlkLCBpdGVtKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVBhcnRpY2lwYW50Q291bnQoKTtcclxuICAgICAgICBpZiAobWUpIHtcclxuICAgICAgICAgICAgJCh0aGlzLnBhcnRpY2lwYW50TGlzdEVsZW1lbnQpLnByZXBlbmQoaXRlbS5lbGVtZW50KCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgJCh0aGlzLnBhcnRpY2lwYW50TGlzdEVsZW1lbnQpLmFwcGVuZChpdGVtLmVsZW1lbnQoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFBhcnRpY2lwYW50TGlzdFBhbmVsLnByb3RvdHlwZS5yZW1vdmVQYXJ0aWNpcGFudCA9IGZ1bmN0aW9uIChqaXRzaUlkKSB7XHJcbiAgICAgICAgaWYgKHRoaXMucGFydGljaXBhbnRJdGVtTWFwLnNpemUgPD0gMCB8fCAhdGhpcy5wYXJ0aWNpcGFudEl0ZW1NYXAuaGFzKGppdHNpSWQpKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgdGhpcy5wYXJ0aWNpcGFudEl0ZW1NYXAuZ2V0KGppdHNpSWQpLnJlbW92ZVNlbGYoKTtcclxuICAgICAgICB0aGlzLnBhcnRpY2lwYW50SXRlbU1hcC5kZWxldGUoaml0c2lJZCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVQYXJ0aWNpcGFudENvdW50KCk7XHJcbiAgICB9O1xyXG4gICAgUGFydGljaXBhbnRMaXN0UGFuZWwucHJvdG90eXBlLnVwZGF0ZVBhcnRpY2lwYW50Q291bnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5wYXJ0aWNpcGFudENvdW50RWxlbWVudC5pbm5lckhUTUwgPSBcIlwiICsgdGhpcy5wYXJ0aWNpcGFudEl0ZW1NYXAuc2l6ZTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gUGFydGljaXBhbnRMaXN0UGFuZWw7XHJcbn0oKSk7XHJcbmV4cG9ydHMuUGFydGljaXBhbnRMaXN0UGFuZWwgPSBQYXJ0aWNpcGFudExpc3RQYW5lbDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9UGFydGljaXBhbnRMaXN0UGFuZWwuanMubWFwXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2NvbXBvbmVudHNcXFxcUGFydGljaXBhbnRMaXN0UGFuZWwuanNcIixcIi9jb21wb25lbnRzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5TZXR0aW5nRGlhbG9nID0gZXhwb3J0cy5TZXR0aW5nRGlhbG9nUHJvcHMgPSB2b2lkIDA7XHJcbnZhciBNZWRpYVR5cGVfMSA9IHJlcXVpcmUoXCIuLi9lbnVtL01lZGlhVHlwZVwiKTtcclxudmFyIEFjdGl2ZURldmljZXNfMSA9IHJlcXVpcmUoXCIuLi9tb2RlbC9BY3RpdmVEZXZpY2VzXCIpO1xyXG52YXIgU2V0dGluZ0RpYWxvZ1Byb3BzID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gU2V0dGluZ0RpYWxvZ1Byb3BzKCkge1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFNldHRpbmdEaWFsb2dQcm9wcztcclxufSgpKTtcclxuZXhwb3J0cy5TZXR0aW5nRGlhbG9nUHJvcHMgPSBTZXR0aW5nRGlhbG9nUHJvcHM7XHJcbnZhciBTZXR0aW5nRGlhbG9nID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gU2V0dGluZ0RpYWxvZygpIHtcclxuICAgICAgICB0aGlzLkppdHNpTWVldEpTID0gd2luZG93LkppdHNpTWVldEpTO1xyXG4gICAgICAgIHRoaXMuYXVkaW9UcmFja0Vycm9yID0gbnVsbDtcclxuICAgICAgICB0aGlzLnZpZGVvVHJhY2tFcnJvciA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVDYW1lcmFEZXZpY2VJZCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVNaWNEZXZpY2VJZCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVTcGVha2VyRGV2aWNlSWQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMubG9jYWxUcmFja3MgPSBbXTtcclxuICAgIH1cclxuICAgIFNldHRpbmdEaWFsb2cucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAocHJvcHMpIHtcclxuICAgICAgICB0aGlzLnByb3BzID0gcHJvcHM7XHJcbiAgICAgICAgdGhpcy5kaWFsb2cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnNldHRpbmctZGlhbG9nLXdyYXBwZXJcIik7XHJcbiAgICAgICAgdGhpcy5zaG93QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zZXR0aW5nLWRpYWxvZy13cmFwcGVyPmJ1dHRvblwiKTtcclxuICAgICAgICAkKHRoaXMuZGlhbG9nKS5hZGRDbGFzcyhcImQtbm9uZVwiKTtcclxuICAgICAgICB0aGlzLm9rQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzZXR0aW5nLWRpYWxvZy1vay1idXR0b25cIik7XHJcbiAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2V0dGluZy1kaWFsb2ctY2FuY2VsLWJ1dHRvblwiKTtcclxuICAgICAgICB0aGlzLnZpZGVvUHJldmlld0VsZW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbWVyYS1wcmV2aWV3XCIpO1xyXG4gICAgICAgIHRoaXMuYXVkaW9QcmV2aWV3RWxlbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWljLXByZXZpZXdcIik7XHJcbiAgICAgICAgdGhpcy5jYW1lcmFMaXN0RWxlbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FtZXJhLWxpc3RcIik7XHJcbiAgICAgICAgdGhpcy5taWNMaXN0RWxlbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWljLWxpc3RcIik7XHJcbiAgICAgICAgdGhpcy5zcGVha2VyTGlzdEVsZW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNwZWFrZXItbGlzdFwiKTtcclxuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50SGFuZGxlcnMoKTtcclxuICAgICAgICB0aGlzLnJlZnJlc2hEZXZpY2VMaXN0KCk7XHJcbiAgICB9O1xyXG4gICAgU2V0dGluZ0RpYWxvZy5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKHRoaXMuZGlhbG9nKS5yZW1vdmVDbGFzcyhcImQtbm9uZVwiKTtcclxuICAgICAgICAkKHRoaXMuc2hvd0J1dHRvbikudHJpZ2dlcihcImNsaWNrXCIpO1xyXG4gICAgfTtcclxuICAgIFNldHRpbmdEaWFsb2cucHJvdG90eXBlLmF0dGFjaEV2ZW50SGFuZGxlcnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzXzEgPSB0aGlzO1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgJCh0aGlzLmNhbWVyYUxpc3RFbGVtKS5vZmYoJ2NoYW5nZScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIF90aGlzLm9uQ2FtZXJhQ2hhbmdlZCgkKHRoaXMpLnZhbCgpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKHRoaXMubWljTGlzdEVsZW0pLm9mZignY2hhbmdlJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgX3RoaXMub25NaWNDaGFuZ2VkKCQodGhpcykudmFsKCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQodGhpcy5zcGVha2VyTGlzdEVsZW0pLm9mZignY2hhbmdlJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgX3RoaXMub25TcGVha2VyQ2hhbmdlZCgkKHRoaXMpLnZhbCgpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKHRoaXMub2tCdXR0b24pLm9mZignY2xpY2snKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIF90aGlzXzEub25PSygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIFNldHRpbmdEaWFsb2cucHJvdG90eXBlLnJlZnJlc2hEZXZpY2VMaXN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBfdGhpc18xID0gdGhpcztcclxuICAgICAgICB0aGlzLkppdHNpTWVldEpTLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzKGZ1bmN0aW9uIChkZXZpY2VzKSB7XHJcbiAgICAgICAgICAgIF90aGlzXzEuY2FtZXJhTGlzdCA9IGRldmljZXMuZmlsdGVyKGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLmtpbmQgPT09ICd2aWRlb2lucHV0JzsgfSk7XHJcbiAgICAgICAgICAgIF90aGlzXzEubWljTGlzdCA9IGRldmljZXMuZmlsdGVyKGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLmtpbmQgPT09ICdhdWRpb2lucHV0JzsgfSk7XHJcbiAgICAgICAgICAgIF90aGlzXzEuc3BlYWtlckxpc3QgPSBkZXZpY2VzLmZpbHRlcihmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC5raW5kID09PSAnYXVkaW9vdXRwdXQnOyB9KTtcclxuICAgICAgICAgICAgX3RoaXNfMS5yZW5kZXJEZXZpY2VzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgU2V0dGluZ0RpYWxvZy5wcm90b3R5cGUucmVuZGVyRGV2aWNlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgX3RoaXNfMSA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVDYW1lcmFEZXZpY2VJZCA9IHRoaXMucHJvcHMuY3VyRGV2aWNlcy5jYW1lcmFJZDtcclxuICAgICAgICB0aGlzLmFjdGl2ZU1pY0RldmljZUlkID0gdGhpcy5wcm9wcy5jdXJEZXZpY2VzLm1pY0lkO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlU3BlYWtlckRldmljZUlkID0gdGhpcy5wcm9wcy5jdXJEZXZpY2VzLnNwZWFrZXJJZDtcclxuICAgICAgICB0aGlzLmNsZWFyRE9NRWxlbWVudCh0aGlzLmNhbWVyYUxpc3RFbGVtKTtcclxuICAgICAgICB0aGlzLmNhbWVyYUxpc3QuZm9yRWFjaChmdW5jdGlvbiAoY2FtZXJhKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxlY3RlZCA9IChfdGhpc18xLmFjdGl2ZUNhbWVyYURldmljZUlkICYmIGNhbWVyYS5kZXZpY2VJZCA9PT0gX3RoaXNfMS5hY3RpdmVDYW1lcmFEZXZpY2VJZClcclxuICAgICAgICAgICAgICAgID8gXCJzZWxlY3RlZFwiIDogXCJcIjtcclxuICAgICAgICAgICAgJChfdGhpc18xLmNhbWVyYUxpc3RFbGVtKS5hcHBlbmQoXCI8b3B0aW9uIHZhbHVlPVxcXCJcIiArIGNhbWVyYS5kZXZpY2VJZCArIFwiXFxcIiBcIiArIHNlbGVjdGVkICsgXCI+XCIgKyBjYW1lcmEubGFiZWwgKyBcIjwvb3B0aW9uPlwiKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmNsZWFyRE9NRWxlbWVudCh0aGlzLm1pY0xpc3RFbGVtKTtcclxuICAgICAgICB0aGlzLm1pY0xpc3QuZm9yRWFjaChmdW5jdGlvbiAobWljKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxlY3RlZCA9IChfdGhpc18xLmFjdGl2ZU1pY0RldmljZUlkICYmIG1pYy5kZXZpY2VJZCA9PT0gX3RoaXNfMS5hY3RpdmVNaWNEZXZpY2VJZClcclxuICAgICAgICAgICAgICAgID8gXCJzZWxlY3RlZFwiIDogXCJcIjtcclxuICAgICAgICAgICAgJChfdGhpc18xLm1pY0xpc3RFbGVtKS5hcHBlbmQoXCI8b3B0aW9uIHZhbHVlPVxcXCJcIiArIG1pYy5kZXZpY2VJZCArIFwiXFxcIiBcIiArIHNlbGVjdGVkICsgXCI+XCIgKyBtaWMubGFiZWwgKyBcIjwvb3B0aW9uPlwiKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmNsZWFyRE9NRWxlbWVudCh0aGlzLnNwZWFrZXJMaXN0RWxlbSk7XHJcbiAgICAgICAgdGhpcy5zcGVha2VyTGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChzcGVha2VyKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxlY3RlZCA9IChfdGhpc18xLmFjdGl2ZVNwZWFrZXJEZXZpY2VJZCAmJiBzcGVha2VyLmRldmljZUlkID09PSBfdGhpc18xLmFjdGl2ZVNwZWFrZXJEZXZpY2VJZClcclxuICAgICAgICAgICAgICAgID8gXCJzZWxlY3RlZFwiIDogXCJcIjtcclxuICAgICAgICAgICAgJChfdGhpc18xLnNwZWFrZXJMaXN0RWxlbSkuYXBwZW5kKFwiPG9wdGlvbiB2YWx1ZT1cXFwiXCIgKyBzcGVha2VyLmRldmljZUlkICsgXCJcXFwiIFwiICsgc2VsZWN0ZWQgKyBcIj5cIiArIHNwZWFrZXIubGFiZWwgKyBcIjwvb3B0aW9uPlwiKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKFwiLmZvcm0tc2VsZWN0XCIpLnNlbGVjdDIoKTtcclxuICAgICAgICB0aGlzLmNyZWF0ZUxvY2FsVHJhY2tzKHRoaXMuYWN0aXZlQ2FtZXJhRGV2aWNlSWQsIHRoaXMuYWN0aXZlTWljRGV2aWNlSWQpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh0cmFja3MpIHtcclxuICAgICAgICAgICAgdHJhY2tzLmZvckVhY2goZnVuY3Rpb24gKHQpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0LmdldFR5cGUoKSA9PT0gTWVkaWFUeXBlXzEuTWVkaWFUeXBlLlZJREVPKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdC5hdHRhY2goX3RoaXNfMS52aWRlb1ByZXZpZXdFbGVtKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHQuZ2V0VHlwZSgpID09PSBNZWRpYVR5cGVfMS5NZWRpYVR5cGUuQVVESU8pIHtcclxuICAgICAgICAgICAgICAgICAgICB0LmF0dGFjaChfdGhpc18xLmF1ZGlvUHJldmlld0VsZW0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgX3RoaXNfMS5sb2NhbFRyYWNrcyA9IHRyYWNrcztcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBTZXR0aW5nRGlhbG9nLnByb3RvdHlwZS5pbml0Q3VycmVudERldmljZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzXzEgPSB0aGlzO1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgJChcIm9wdGlvblwiLCB0aGlzLmNhbWVyYUxpc3RFbGVtKS5lYWNoKGZ1bmN0aW9uIChfKSB7XHJcbiAgICAgICAgICAgIGlmICgkKF90aGlzXzEpLnZhbCgpID09PSBfdGhpcy5wcm9wcy5jdXJEZXZpY2VzLm1pY0lkKVxyXG4gICAgICAgICAgICAgICAgJChfdGhpc18xKS5hdHRyKFwic2VsZWN0ZWRcIiwgXCJzZWxlY3RlZFwiKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBTZXR0aW5nRGlhbG9nLnByb3RvdHlwZS5jbGVhckRPTUVsZW1lbnQgPSBmdW5jdGlvbiAoZWxlbSkge1xyXG4gICAgICAgIHdoaWxlIChlbGVtLmZpcnN0Q2hpbGQpIHtcclxuICAgICAgICAgICAgZWxlbS5yZW1vdmVDaGlsZChlbGVtLmZpcnN0Q2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBTZXR0aW5nRGlhbG9nLnByb3RvdHlwZS5jcmVhdGVMb2NhbFRyYWNrcyA9IGZ1bmN0aW9uIChjYW1lcmFEZXZpY2VJZCwgbWljRGV2aWNlSWQpIHtcclxuICAgICAgICB2YXIgX3RoaXNfMSA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy52aWRlb1RyYWNrRXJyb3IgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuYXVkaW9UcmFja0Vycm9yID0gbnVsbDtcclxuICAgICAgICBpZiAoY2FtZXJhRGV2aWNlSWQgIT0gbnVsbCAmJiBtaWNEZXZpY2VJZCAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkppdHNpTWVldEpTLmNyZWF0ZUxvY2FsVHJhY2tzKHtcclxuICAgICAgICAgICAgICAgIGRldmljZXM6IFsnYXVkaW8nLCAndmlkZW8nXSxcclxuICAgICAgICAgICAgICAgIGNhbWVyYURldmljZUlkOiBjYW1lcmFEZXZpY2VJZCxcclxuICAgICAgICAgICAgICAgIG1pY0RldmljZUlkOiBtaWNEZXZpY2VJZFxyXG4gICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoKSB7IHJldHVybiBQcm9taXNlLmFsbChbXHJcbiAgICAgICAgICAgICAgICBfdGhpc18xLmNyZWF0ZUF1ZGlvVHJhY2sobWljRGV2aWNlSWQpLnRoZW4oZnVuY3Rpb24gKF9hKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0cmVhbSA9IF9hWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHJlYW07XHJcbiAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICAgIF90aGlzXzEuY3JlYXRlVmlkZW9UcmFjayhjYW1lcmFEZXZpY2VJZCkudGhlbihmdW5jdGlvbiAoX2EpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RyZWFtID0gX2FbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0cmVhbTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIF0pOyB9KS50aGVuKGZ1bmN0aW9uICh0cmFja3MpIHtcclxuICAgICAgICAgICAgICAgIGlmIChfdGhpc18xLmF1ZGlvVHJhY2tFcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZGlzcGxheSBlcnJvclxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKF90aGlzXzEudmlkZW9UcmFja0Vycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9kaXNwbGF5IGVycm9yXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJhY2tzLmZpbHRlcihmdW5jdGlvbiAodCkgeyByZXR1cm4gdHlwZW9mIHQgIT09ICd1bmRlZmluZWQnOyB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGNhbWVyYURldmljZUlkICE9IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlVmlkZW9UcmFjayhjYW1lcmFEZXZpY2VJZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKG1pY0RldmljZUlkICE9IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlQXVkaW9UcmFjayhtaWNEZXZpY2VJZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xyXG4gICAgfTtcclxuICAgIFNldHRpbmdEaWFsb2cucHJvdG90eXBlLmNyZWF0ZVZpZGVvVHJhY2sgPSBmdW5jdGlvbiAoY2FtZXJhRGV2aWNlSWQpIHtcclxuICAgICAgICB2YXIgX3RoaXNfMSA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuSml0c2lNZWV0SlMuY3JlYXRlTG9jYWxUcmFja3Moe1xyXG4gICAgICAgICAgICBkZXZpY2VzOiBbJ3ZpZGVvJ10sXHJcbiAgICAgICAgICAgIGNhbWVyYURldmljZUlkOiBjYW1lcmFEZXZpY2VJZCxcclxuICAgICAgICAgICAgbWljRGV2aWNlSWQ6IG51bGxcclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgIF90aGlzXzEudmlkZW9UcmFja0Vycm9yID0gZXJyb3I7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIFNldHRpbmdEaWFsb2cucHJvdG90eXBlLmNyZWF0ZUF1ZGlvVHJhY2sgPSBmdW5jdGlvbiAobWljRGV2aWNlSWQpIHtcclxuICAgICAgICB2YXIgX3RoaXNfMSA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLkppdHNpTWVldEpTLmNyZWF0ZUxvY2FsVHJhY2tzKHtcclxuICAgICAgICAgICAgZGV2aWNlczogWydhdWRpbyddLFxyXG4gICAgICAgICAgICBjYW1lcmFEZXZpY2VJZDogbnVsbCxcclxuICAgICAgICAgICAgbWljRGV2aWNlSWQ6IG1pY0RldmljZUlkXHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICBfdGhpc18xLmF1ZGlvVHJhY2tFcnJvciA9IGVycm9yO1xyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcclxuICAgICAgICB9KSk7XHJcbiAgICB9O1xyXG4gICAgU2V0dGluZ0RpYWxvZy5wcm90b3R5cGUub25DYW1lcmFDaGFuZ2VkID0gZnVuY3Rpb24gKGNhbWVyYURldmljZUlkKSB7XHJcbiAgICAgICAgdmFyIF90aGlzXzEgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlQ2FtZXJhRGV2aWNlSWQgPSBjYW1lcmFEZXZpY2VJZDtcclxuICAgICAgICB0aGlzLmNyZWF0ZUxvY2FsVHJhY2tzKHRoaXMuYWN0aXZlQ2FtZXJhRGV2aWNlSWQsIG51bGwpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh0cmFja3MpIHtcclxuICAgICAgICAgICAgdmFyIG5ld1RyYWNrID0gdHJhY2tzLmZpbmQoZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQuZ2V0VHlwZSgpID09PSBNZWRpYVR5cGVfMS5NZWRpYVR5cGUuVklERU87IH0pO1xyXG4gICAgICAgICAgICAvL3JlbW92ZSBleGlzdGluZyB0cmFja1xyXG4gICAgICAgICAgICB2YXIgb2xkVHJhY2sgPSBfdGhpc18xLmxvY2FsVHJhY2tzLmZpbmQoZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQuZ2V0VHlwZSgpID09PSBNZWRpYVR5cGVfMS5NZWRpYVR5cGUuVklERU87IH0pO1xyXG4gICAgICAgICAgICBpZiAob2xkVHJhY2spIHtcclxuICAgICAgICAgICAgICAgIG9sZFRyYWNrLmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgICAgIF90aGlzXzEubG9jYWxUcmFja3Muc3BsaWNlKF90aGlzXzEubG9jYWxUcmFja3MuaW5kZXhPZihvbGRUcmFjayksIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChuZXdUcmFjaykge1xyXG4gICAgICAgICAgICAgICAgX3RoaXNfMS5sb2NhbFRyYWNrcy5wdXNoKG5ld1RyYWNrKTtcclxuICAgICAgICAgICAgICAgIG5ld1RyYWNrLmF0dGFjaChfdGhpc18xLnZpZGVvUHJldmlld0VsZW0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgU2V0dGluZ0RpYWxvZy5wcm90b3R5cGUub25NaWNDaGFuZ2VkID0gZnVuY3Rpb24gKG1pY0RldmljZUlkKSB7XHJcbiAgICAgICAgdmFyIF90aGlzXzEgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlTWljRGV2aWNlSWQgPSBtaWNEZXZpY2VJZDtcclxuICAgICAgICB0aGlzLmNyZWF0ZUxvY2FsVHJhY2tzKG51bGwsIHRoaXMuYWN0aXZlTWljRGV2aWNlSWQpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh0cmFja3MpIHtcclxuICAgICAgICAgICAgdmFyIG5ld1RyYWNrID0gdHJhY2tzLmZpbmQoZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQuZ2V0VHlwZSgpID09PSBNZWRpYVR5cGVfMS5NZWRpYVR5cGUuQVVESU87IH0pO1xyXG4gICAgICAgICAgICAvL3JlbW92ZSBleGlzdGluZyB0cmFja1xyXG4gICAgICAgICAgICB2YXIgb2xkVHJhY2sgPSBfdGhpc18xLmxvY2FsVHJhY2tzLmZpbmQoZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQuZ2V0VHlwZSgpID09PSBNZWRpYVR5cGVfMS5NZWRpYVR5cGUuQVVESU87IH0pO1xyXG4gICAgICAgICAgICBpZiAob2xkVHJhY2spIHtcclxuICAgICAgICAgICAgICAgIG9sZFRyYWNrLmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgICAgIF90aGlzXzEubG9jYWxUcmFja3Muc3BsaWNlKF90aGlzXzEubG9jYWxUcmFja3MuaW5kZXhPZihvbGRUcmFjayksIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChuZXdUcmFjaykge1xyXG4gICAgICAgICAgICAgICAgX3RoaXNfMS5sb2NhbFRyYWNrcy5wdXNoKG5ld1RyYWNrKTtcclxuICAgICAgICAgICAgICAgIG5ld1RyYWNrLmF0dGFjaChfdGhpc18xLmF1ZGlvUHJldmlld0VsZW0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgU2V0dGluZ0RpYWxvZy5wcm90b3R5cGUub25TcGVha2VyQ2hhbmdlZCA9IGZ1bmN0aW9uIChzcGVha2VyRGV2aWNlSWQpIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZVNwZWFrZXJEZXZpY2VJZCA9IHNwZWFrZXJEZXZpY2VJZDtcclxuICAgICAgICBpZiAodGhpcy5hY3RpdmVTcGVha2VyRGV2aWNlSWQgJiYgdGhpcy5KaXRzaU1lZXRKUy5tZWRpYURldmljZXMuaXNEZXZpY2VDaGFuZ2VBdmFpbGFibGUoJ291dHB1dCcpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuSml0c2lNZWV0SlMubWVkaWFEZXZpY2VzLnNldEF1ZGlvT3V0cHV0RGV2aWNlKHRoaXMuYWN0aXZlU3BlYWtlckRldmljZUlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgO1xyXG4gICAgfTtcclxuICAgIFNldHRpbmdEaWFsb2cucHJvdG90eXBlLm9uT0sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5jbG9zZURpYWxvZygpO1xyXG4gICAgICAgIHZhciBuZXdEZXZpY2VzID0gbmV3IEFjdGl2ZURldmljZXNfMS5BY3RpdmVEZXZpY2VzKCk7XHJcbiAgICAgICAgbmV3RGV2aWNlcy5jYW1lcmFJZCA9IHRoaXMuYWN0aXZlQ2FtZXJhRGV2aWNlSWQ7XHJcbiAgICAgICAgbmV3RGV2aWNlcy5taWNJZCA9IHRoaXMuYWN0aXZlTWljRGV2aWNlSWQ7XHJcbiAgICAgICAgbmV3RGV2aWNlcy5zcGVha2VySWQgPSB0aGlzLmFjdGl2ZVNwZWFrZXJEZXZpY2VJZDtcclxuICAgICAgICB0aGlzLnByb3BzLm9uRGV2aWNlQ2hhbmdlKG5ld0RldmljZXMpO1xyXG4gICAgfTtcclxuICAgIFNldHRpbmdEaWFsb2cucHJvdG90eXBlLmNsb3NlRGlhbG9nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICQodGhpcy5jbG9zZUJ1dHRvbikudHJpZ2dlcihcImNsaWNrXCIpO1xyXG4gICAgICAgIHRoaXMubG9jYWxUcmFja3MuZm9yRWFjaChmdW5jdGlvbiAodHJhY2spIHtcclxuICAgICAgICAgICAgdHJhY2suZGlzcG9zZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBTZXR0aW5nRGlhbG9nO1xyXG59KCkpO1xyXG5leHBvcnRzLlNldHRpbmdEaWFsb2cgPSBTZXR0aW5nRGlhbG9nO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1TZXR0aW5nRGlhbG9nLmpzLm1hcFxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9jb21wb25lbnRzXFxcXFNldHRpbmdEaWFsb2cuanNcIixcIi9jb21wb25lbnRzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5WZWN0b3JJY29uID0gdm9pZCAwO1xyXG52YXIgVmVjdG9ySWNvbiA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFZlY3Rvckljb24oKSB7XHJcbiAgICB9XHJcbiAgICBWZWN0b3JJY29uLkFVRElPX01VVEVfSUNPTiA9IFwiTTcuMzMzIDguNjVWMTFhMy42NjggMy42NjggMCAwMDIuNzU3IDMuNTUzLjkyOC45MjggMCAwMC0uMDA3LjExNHYxLjc1N0E1LjUwMSA1LjUwMSAwIDAxNS41IDExYS45MTcuOTE3IDAgMTAtMS44MzMgMGMwIDMuNzQgMi43OTkgNi44MjYgNi40MTYgNy4yNzd2Ljk3M2EuOTE3LjkxNyAwIDAwMS44MzQgMHYtLjk3M2E3LjI5NyA3LjI5NyAwIDAwMy41NjgtMS40NzVsMy4wOTEgMy4wOTJhLjkzMi45MzIgMCAxMDEuMzE4LTEuMzE4bC0zLjA5MS0zLjA5MS4wMS0uMDEzLTEuMzExLTEuMzExLS4wMS4wMTMtMS4zMjUtMS4zMjUuMDA4LS4wMTQtMS4zOTUtMS4zOTVhMS4yNCAxLjI0IDAgMDEtLjAwNC4wMThsLTMuNjEtMy42MDl2LS4wMjNMNy4zMzQgNS45OTN2LjAyM2wtMy45MDktMy45MWEuOTMyLjkzMiAwIDEwLTEuMzE4IDEuMzE4TDcuMzMzIDguNjV6bTEuODM0IDEuODM0VjExYTEuODMzIDEuODMzIDAgMDAyLjI5MSAxLjc3NmwtMi4yOTEtMi4yOTJ6bTMuNjgyIDMuNjgzYy0uMjkuMTctLjYwNi4zLS45NC4zODZhLjkyOC45MjggMCAwMS4wMDguMTE0djEuNzU3YTUuNDcgNS40NyAwIDAwMi4yNTctLjkzMmwtMS4zMjUtMS4zMjV6bTEuODE4LTMuNDc2bC0xLjgzNC0xLjgzNFY1LjVhMS44MzMgMS44MzMgMCAwMC0zLjY0NC0uMjg3bC0xLjQzLTEuNDNBMy42NjYgMy42NjYgMCAwMTE0LjY2NyA1LjV2NS4xOXptMS42NjUgMS42NjVsMS40NDcgMS40NDdjLjM1Ny0uODY0LjU1NC0xLjgxLjU1NC0yLjgwM2EuOTE3LjkxNyAwIDEwLTEuODMzIDBjMCAuNDY4LS4wNTguOTIyLS4xNjggMS4zNTZ6XCI7XHJcbiAgICBWZWN0b3JJY29uLkFVRElPX1VOTVVURV9JQ09OID0gXCJNMTYgNmE0IDQgMCAwMC04IDB2NmE0LjAwMiA0LjAwMiAwIDAwMy4wMDggMy44NzZjLS4wMDUuMDQtLjAwOC4wODItLjAwOC4xMjR2MS45MTdBNi4wMDIgNi4wMDIgMCAwMTYgMTJhMSAxIDAgMTAtMiAwIDguMDAxIDguMDAxIDAgMDA3IDcuOTM4VjIxYTEgMSAwIDEwMiAwdi0xLjA2MkE4LjAwMSA4LjAwMSAwIDAwMjAgMTJhMSAxIDAgMTAtMiAwIDYuMDAyIDYuMDAyIDAgMDEtNSA1LjkxN1YxNmMwLS4wNDItLjAwMy0uMDgzLS4wMDgtLjEyNEE0LjAwMiA0LjAwMiAwIDAwMTYgMTJWNnptLTQtMmEyIDIgMCAwMC0yIDJ2NmEyIDIgMCAxMDQgMFY2YTIgMiAwIDAwLTItMnpcIjtcclxuICAgIFZlY3Rvckljb24uVklERU9fTVVURV9JQ09OID0gXCJNIDYuODQgNS41IGggLTAuMDIyIEwgMy40MjQgMi4xMDYgYSAwLjkzMiAwLjkzMiAwIDEgMCAtMS4zMTggMS4zMTggTCA0LjE4MiA1LjUgaCAtMC41MTUgYyAtMS4wMTMgMCAtMS44MzQgMC44MiAtMS44MzQgMS44MzMgdiA3LjMzNCBjIDAgMS4wMTIgMC44MjEgMS44MzMgMS44MzQgMS44MzMgSCAxMy43NSBjIDAuNDA0IDAgMC43NzcgLTAuMTMgMS4wOCAtMC4zNTIgbCAzLjc0NiAzLjc0NiBhIDAuOTMyIDAuOTMyIDAgMSAwIDEuMzE4IC0xLjMxOCBsIC00LjMxIC00LjMxIHYgLTAuMDI0IEwgMTMuNzUgMTIuNDEgdiAwLjAyMyBsIC01LjEgLTUuMDk5IGggMC4wMjQgTCA2Ljg0MSA1LjUgWiBtIDYuOTEgNC4yNzQgViA3LjMzMyBoIC0yLjQ0IEwgOS40NzUgNS41IGggNC4yNzQgYyAxLjAxMiAwIDEuODMzIDAuODIgMS44MzMgMS44MzMgdiAwLjc4NiBsIDMuMjEyIC0xLjgzNSBhIDAuOTE3IDAuOTE3IDAgMCAxIDEuMzcyIDAuNzk2IHYgNy44NCBjIDAgMC4zNDQgLTAuMTkgMC42NDQgLTAuNDcgMC44IGwgLTMuNzM2IC0zLjczNSBsIDIuMzcyIDEuMzU2IFYgOC42NTkgbCAtMi43NSAxLjU3MSB2IDEuMzc3IEwgMTMuNzUgOS43NzQgWiBNIDMuNjY3IDcuMzM0IGggMi4zNDkgbCA3LjMzMyA3LjMzMyBIIDMuNjY3IFYgNy4zMzMgWlwiO1xyXG4gICAgVmVjdG9ySWNvbi5WSURFT19VTk1VVEVfSUNPTiA9IFwiTTEzLjc1IDUuNUgzLjY2N2MtMS4wMTMgMC0xLjgzNC44Mi0xLjgzNCAxLjgzM3Y3LjMzNGMwIDEuMDEyLjgyMSAxLjgzMyAxLjgzNCAxLjgzM0gxMy43NWMxLjAxMiAwIDEuODMzLS44MiAxLjgzMy0xLjgzM3YtLjc4NmwzLjIxMiAxLjgzNWEuOTE2LjkxNiAwIDAwMS4zNzItLjc5NlY3LjA4YS45MTcuOTE3IDAgMDAtMS4zNzItLjc5NmwtMy4yMTIgMS44MzV2LS43ODZjMC0xLjAxMi0uODItMS44MzMtMS44MzMtMS44MzN6bTAgMy42Njd2NS41SDMuNjY3VjcuMzMzSDEzLjc1djEuODM0em00LjU4MyA0LjE3NGwtMi43NS0xLjU3MnYtMS41MzhsMi43NS0xLjU3MnY0LjY4MnpcIjtcclxuICAgIFZlY3Rvckljb24uR1JBTlRfTU9ERVJBVE9SX0lDT04gPSBcIk0xNCA0YTIgMiAwIDAxLTEuMjk4IDEuODczbDEuNTI3IDQuMDcuNzE2IDEuOTEyYy4wNjIuMDc0LjEyNi4wNzQuMTY1LjAzNWwxLjQ0NC0xLjQ0NCAyLjAzMi0yLjAzMmEyIDIgMCAxMTEuMjQ4LjU3OUwxOSAxOWEyIDIgMCAwMS0yIDJIN2EyIDIgMCAwMS0yLTJMNC4xNjYgOC45OTNhMiAyIDAgMTExLjI0OC0uNTc5bDIuMDMzIDIuMDMzTDguODkgMTEuODljLjA4Ny4wNDIuMTQ1LjAxNi4xNjUtLjAzNWwuNzE2LTEuOTEyIDEuNTI3LTQuMDdBMiAyIDAgMTExNCA0ek02Ljg0IDE3bC0uMzkzLTQuNzI1IDEuMDI5IDEuMDNhMi4xIDIuMSAwIDAwMy40NTEtLjc0OEwxMiA5LjY5NmwxLjA3MyAyLjg2YTIuMSAyLjEgMCAwMDMuNDUxLjc0OGwxLjAzLTEuMDNMMTcuMTYgMTdINi44NHpcIjtcclxuICAgIFZlY3Rvckljb24uQVVESU9fTVVURV9TTUFMTF9JQ09OID0gXCJNNS42ODggNGwyMi4zMTMgMjIuMzEzLTEuNjg4IDEuNjg4LTUuNTYzLTUuNTYzYy0xIC42MjUtMi4yNSAxLTMuNDM4IDEuMTg4djQuMzc1aC0yLjYyNXYtNC4zNzVjLTQuMzc1LS42MjUtOC00LjM3NS04LTguOTM4aDIuMjVjMCA0IDMuMzc1IDYuNzUgNy4wNjMgNi43NSAxLjA2MyAwIDIuMTI1LS4yNSAzLjA2My0uNjg4bC0yLjE4OC0yLjE4OGMtLjI1LjA2My0uNTYzLjEyNS0uODc1LjEyNS0yLjE4OCAwLTQtMS44MTMtNC00di0xbC04LTh6TTIwIDE0Ljg3NWwtOC03LjkzOHYtLjI1YzAtMi4xODggMS44MTMtNCA0LTRzNCAxLjgxMyA0IDR2OC4xODh6bTUuMzEzLS4xODdhOC44MjQgOC44MjQgMCAwMS0xLjE4OCA0LjM3NUwyMi41IDE3LjM3NWMuMzc1LS44MTMuNTYzLTEuNjg4LjU2My0yLjY4OGgyLjI1elwiO1xyXG4gICAgVmVjdG9ySWNvbi5WSURFT19NVVRFX1NNQUxMX0lDT04gPSBcIk00LjM3NSAyLjY4OEwyOCAyNi4zMTNsLTEuNjg4IDEuNjg4LTQuMjUtNC4yNWMtLjE4OC4xMjUtLjUuMjUtLjc1LjI1aC0xNmMtLjc1IDAtMS4zMTMtLjU2My0xLjMxMy0xLjMxM1Y5LjMxM2MwLS43NS41NjMtMS4zMTMgMS4zMTMtMS4zMTNoMUwyLjY4NyA0LjM3NXptMjMuNjI1IDZ2MTQuMjVMMTMuMDYyIDhoOC4yNWMuNzUgMCAxLjM3NS41NjMgMS4zNzUgMS4zMTN2NC42ODh6XCI7XHJcbiAgICBWZWN0b3JJY29uLk1PREVSQVRPUl9TTUFMTF9JQ09OID0gXCJNMTYgMjAuNTYzbDUgMy0xLjMxMy01LjY4OEwyNC4xMjUgMTRsLTUuODc1LS41TDE2IDguMTI1IDEzLjc1IDEzLjVsLTUuODc1LjUgNC40MzggMy44NzVMMTEgMjMuNTYzem0xMy4zMTMtOC4yNWwtNy4yNSA2LjMxMyAyLjE4OCA5LjM3NS04LjI1LTUtOC4yNSA1IDIuMTg4LTkuMzc1LTcuMjUtNi4zMTMgOS41NjMtLjgxMyAzLjc1LTguODEzIDMuNzUgOC44MTN6XCI7XHJcbiAgICBWZWN0b3JJY29uLlNFVFRJTkdfSUNPTiA9IFwiTTkuMDA1IDIuMTdsLS41NzYgMS43MjctLjYzNC4yNjItMS42MjgtLjgxM2ExLjgzMyAxLjgzMyAwIDAwLTIuMTE2LjM0M2wtLjM2Mi4zNjJhMS44MzMgMS44MzMgMCAwMC0uMzQzIDIuMTE2bC44MTYgMS42MjQtLjI2NS42MzgtMS43MjcuNTc2Yy0uNzQ4LjI1LTEuMjUzLjk1LTEuMjUzIDEuNzM5di41MTJjMCAuNzkuNTA1IDEuNDkgMS4yNTMgMS43NGwxLjcyNy41NzUuMjYyLjYzNC0uODEzIDEuNjI4YTEuODMzIDEuODMzIDAgMDAuMzQzIDIuMTE2bC4zNjIuMzYyYy41NTguNTU4IDEuNDEuNjk2IDIuMTE2LjM0M2wxLjYyNC0uODE2LjYzOC4yNjUuNTc2IDEuNzI3Yy4yNS43NDguOTUgMS4yNTMgMS43MzkgMS4yNTNoLjUxMmMuNzkgMCAxLjQ5LS41MDUgMS43NC0xLjI1M2wuNTc1LTEuNzI2LjYzNC0uMjYzIDEuNjI4LjgxM2ExLjgzMyAxLjgzMyAwIDAwMi4xMTYtLjM0M2wuMzYyLS4zNjJjLjU1OC0uNTU4LjY5Ni0xLjQxLjM0My0yLjExNmwtLjgxNi0xLjYyNC4yNjUtLjYzOCAxLjcyNy0uNTc2YTEuODMzIDEuODMzIDAgMDAxLjI1My0xLjczOXYtLjUxMmMwLS43OS0uNTA1LTEuNDktMS4yNTMtMS43NGwtMS43MjYtLjU3Mi0uMjY0LS42MzcuODE0LTEuNjI4YTEuODMzIDEuODMzIDAgMDAtLjM0My0yLjExNmwtLjM2Mi0uMzYyYTEuODMzIDEuODMzIDAgMDAtMi4xMTYtLjM0M2wtMS42MjQuODE2LS42MzgtLjI2NS0uNTc2LTEuNzI3YTEuODMzIDEuODMzIDAgMDAtMS43NC0xLjI1M2gtLjUxMWMtLjc5IDAtMS40OS41MDUtMS43NCAxLjI1M3pNNy43MjMgNi4xNzNsMi4xODEtLjkwMy44NC0yLjUyaC41MTJsLjg0IDIuNTIgMi4xODUuOTA4IDIuMzcyLTEuMTkzLjM2Mi4zNjItMS4xODggMi4zNzYuOTAzIDIuMTg1IDIuNTIuODM2di41MTJsLTIuNTIuODQtLjkwOCAyLjE4NSAxLjE5MyAyLjM3Mi0uMzYyLjM2Mi0yLjM3Ni0xLjE4OC0yLjE4MS45MDMtLjg0IDIuNTJoLS41MTJsLS44NC0yLjUyLTIuMTg1LS45MDgtMi4zNzIgMS4xOTMtLjM2Mi0uMzYyIDEuMTg4LTIuMzc2LS45MDMtMi4xODEtMi41Mi0uODR2LS41MTJsMi41Mi0uODQuOTA4LTIuMTg1LTEuMTkzLTIuMzcyLjM2Mi0uMzYyIDIuMzc2IDEuMTg4ek0xMSAxNS41ODNhNC41ODMgNC41ODMgMCAxMTAtOS4xNjYgNC41ODMgNC41ODMgMCAwMTAgOS4xNjZ6TTEzLjc1IDExYTIuNzUgMi43NSAwIDExLTUuNSAwIDIuNzUgMi43NSAwIDAxNS41IDB6XCI7XHJcbiAgICBWZWN0b3JJY29uLlVTRVJfR1JPVVBfSUNPTiA9IFwiTTUuMzMzMzEgMkM2LjI4MTAxIDIgNy4wOTY3NSAyLjU2NDk5IDcuNDYyMDcgMy4zNzY1MUM3LjAwNzY2IDMuNDUwMjMgNi41ODQwNiAzLjYxNTgzIDYuMjEwOTUgMy44NTM2MUM2LjA0MTExIDMuNTQzNTYgNS43MTE3NiAzLjMzMzMzIDUuMzMzMzEgMy4zMzMzM0M0Ljc4MTAzIDMuMzMzMzMgNC4zMzMzMSAzLjc4MTA1IDQuMzMzMzEgNC4zMzMzM0M0LjMzMzMxIDQuNzU4OTUgNC41OTkyMSA1LjEyMjQ2IDQuOTczOTUgNS4yNjY4MkM0Ljc3NjcyIDUuNjkyNDUgNC42NjY2NSA2LjE2NjcxIDQuNjY2NjUgNi42NjY2N0w0LjY2Njc4IDYuNjk2N0MzLjEyMjQ5IDYuODUzMzIgMi42NjY2NSA3LjY1NDE1IDIuNjY2NjUgOS44MzMzM0MyLjY2NjY1IDkuODk2NjYgMi42NjgzNSA5Ljk1MjIyIDIuNjcwODggMTBIMy4xMzQ0MUMyLjk3NyAxMC4zOTgyIDIuODYxMTQgMTAuODQyMyAyLjc4NDEgMTEuMzMzM0gyLjMzMzMxQzEuNjY2NjUgMTEuMzMzMyAxLjMzMzMxIDEwLjgzMzMgMS4zMzMzMSA5LjgzMzMzQzEuMzMzMzEgNy42MDU1OSAxLjg4MDk3IDYuMjA0OTggMy4zOTQxNyA1LjYzMTUyQzMuMTQ1MjEgNS4yNjAzOCAyLjk5OTk4IDQuODEzODIgMi45OTk5OCA0LjMzMzMzQzIuOTk5OTggMy4wNDQ2NyA0LjA0NDY1IDIgNS4zMzMzMSAyWk05Ljc4OTAxIDMuODUzNjFDOS40MTU5IDMuNjE1ODMgOC45OTIzIDMuNDUwMjMgOC41Mzc4OCAzLjM3NjUxQzguOTAzMjEgMi41NjQ5OSA5LjcxODk1IDIgMTAuNjY2NiAyQzExLjk1NTMgMiAxMyAzLjA0NDY3IDEzIDQuMzMzMzNDMTMgNC44MTM4MiAxMi44NTQ3IDUuMjYwMzggMTIuNjA1OCA1LjYzMTUyQzE0LjExOSA2LjIwNDk4IDE0LjY2NjYgNy42MDU1OSAxNC42NjY2IDkuODMzMzNDMTQuNjY2NiAxMC44MzMzIDE0LjMzMzMgMTEuMzMzMyAxMy42NjY2IDExLjMzMzNIMTMuMjE1OUMxMy4xMzg4IDEwLjg0MjMgMTMuMDIzIDEwLjM5ODIgMTIuODY1NiAxMEgxMy4zMjkxQzEzLjMzMTYgOS45NTIyMiAxMy4zMzMzIDkuODk2NjYgMTMuMzMzMyA5LjgzMzMzQzEzLjMzMzMgNy42NTQxNSAxMi44Nzc1IDYuODUzMzIgMTEuMzMzMiA2LjY5NjdMMTEuMzMzMyA2LjY2NjY3QzExLjMzMzMgNi4xNjY3IDExLjIyMzIgNS42OTI0NSAxMS4wMjYgNS4yNjY4MkMxMS40MDA4IDUuMTIyNDYgMTEuNjY2NiA0Ljc1ODk1IDExLjY2NjYgNC4zMzMzM0MxMS42NjY2IDMuNzgxMDUgMTEuMjE4OSAzLjMzMzMzIDEwLjY2NjYgMy4zMzMzM0MxMC4yODgyIDMuMzMzMzMgOS45NTg4NSAzLjU0MzU2IDkuNzg5MDEgMy44NTM2MVpNNC40OTk5OCAxNC42NjY3QzMuNzIyMiAxNC42NjY3IDMuMzMzMzEgMTQuMTExMSAzLjMzMzMxIDEzQzMuMzMzMzEgMTAuNDU5OCA0LjAwNjIgOC44ODc1IDUuODc4ODggOC4yODMwOEM1LjUzNjYgNy44MzQ2MiA1LjMzMzMxIDcuMjc0MzggNS4zMzMzMSA2LjY2NjY3QzUuMzMzMzEgNS4xOTM5MSA2LjUyNzIyIDQgNy45OTk5OCA0QzkuNDcyNzQgNCAxMC42NjY2IDUuMTkzOTEgMTAuNjY2NiA2LjY2NjY3QzEwLjY2NjYgNy4yNzQzOCAxMC40NjM0IDcuODM0NjIgMTAuMTIxMSA4LjI4MzA4QzExLjk5MzggOC44ODc1IDEyLjY2NjYgMTAuNDU5OCAxMi42NjY2IDEzQzEyLjY2NjYgMTQuMTExMSAxMi4yNzc4IDE0LjY2NjcgMTEuNSAxNC42NjY3SDQuNDk5OThaTTkuMzMzMzEgNi42NjY2N0M5LjMzMzMxIDcuNDAzMDUgOC43MzYzNiA4IDcuOTk5OTggOEM3LjI2MzYgOCA2LjY2NjY1IDcuNDAzMDUgNi42NjY2NSA2LjY2NjY3QzYuNjY2NjUgNS45MzAyOSA3LjI2MzYgNS4zMzMzMyA3Ljk5OTk4IDUuMzMzMzNDOC43MzYzNiA1LjMzMzMzIDkuMzMzMzEgNS45MzAyOSA5LjMzMzMxIDYuNjY2NjdaTTExLjMzMzMgMTNDMTEuMzMzMyAxMy4xNDI2IDExLjMyNTIgMTMuMjUzNiAxMS4zMTUyIDEzLjMzMzNINC42ODQ3N0M0LjY3NDc2IDEzLjI1MzYgNC42NjY2NSAxMy4xNDI2IDQuNjY2NjUgMTNDNC42NjY2NSAxMC4xOTU3IDUuNDIwMjEgOS4zMzMzMyA3Ljk5OTk4IDkuMzMzMzNDMTAuNTc5NyA5LjMzMzMzIDExLjMzMzMgMTAuMTk1NyAxMS4zMzMzIDEzWlwiO1xyXG4gICAgcmV0dXJuIFZlY3Rvckljb247XHJcbn0oKSk7XHJcbmV4cG9ydHMuVmVjdG9ySWNvbiA9IFZlY3Rvckljb247XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXZlY3Rvcl9pY29uLmpzLm1hcFxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9jb21wb25lbnRzXFxcXHZlY3Rvcl9pY29uLmpzXCIsXCIvY29tcG9uZW50c1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcblwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuTWVkaWFUeXBlID0gdm9pZCAwO1xyXG52YXIgTWVkaWFUeXBlO1xyXG4oZnVuY3Rpb24gKE1lZGlhVHlwZSkge1xyXG4gICAgTWVkaWFUeXBlW1wiVklERU9cIl0gPSBcInZpZGVvXCI7XHJcbiAgICBNZWRpYVR5cGVbXCJBVURJT1wiXSA9IFwiYXVkaW9cIjtcclxuICAgIE1lZGlhVHlwZVtcIlBSRVNFTlRFUlwiXSA9IFwicHJlc2VudGVyXCI7XHJcbn0pKE1lZGlhVHlwZSA9IGV4cG9ydHMuTWVkaWFUeXBlIHx8IChleHBvcnRzLk1lZGlhVHlwZSA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPU1lZGlhVHlwZS5qcy5tYXBcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZW51bVxcXFxNZWRpYVR5cGUuanNcIixcIi9lbnVtXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5Vc2VyUHJvcGVydHkgPSB2b2lkIDA7XHJcbnZhciBVc2VyUHJvcGVydHk7XHJcbihmdW5jdGlvbiAoVXNlclByb3BlcnR5KSB7XHJcbiAgICBVc2VyUHJvcGVydHlbXCJ2aWRlb0VsZW1cIl0gPSBcInZpZGVvRWxlbVwiO1xyXG4gICAgVXNlclByb3BlcnR5W1wiYXVkaW9FbGVtXCJdID0gXCJhdWRpb0VsZW1cIjtcclxuICAgIFVzZXJQcm9wZXJ0eVtcIklzSG9zdFwiXSA9IFwiSXNIb3N0XCI7XHJcbiAgICBVc2VyUHJvcGVydHlbXCJ1c2VDYW1lcmFcIl0gPSBcInVzZUNhbWVyYVwiO1xyXG4gICAgVXNlclByb3BlcnR5W1widXNlTWljXCJdID0gXCJ1c2VNaWNcIjtcclxufSkoVXNlclByb3BlcnR5ID0gZXhwb3J0cy5Vc2VyUHJvcGVydHkgfHwgKGV4cG9ydHMuVXNlclByb3BlcnR5ID0ge30pKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9VXNlclByb3BlcnR5LmpzLm1hcFxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9lbnVtXFxcXFVzZXJQcm9wZXJ0eS5qc1wiLFwiL2VudW1cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cInVzZSBzdHJpY3RcIjtcclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICBcclxuICAgICAgICAgIG5QYW5lbENvdW50ID0gNFxyXG5cclxuLS0tLS0tLS0tLXBhbmVsQ29udGFpbmVyLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAtLS1wYW5lbC0tLSAgICAgICAtLS1wYW5lbC0tLVxyXG4gICAgfCAgICAxICAgICB8ICAgICAgfCAgICAyICAgIHxcclxuICAgIHxfX19fX19fX19ffCAgICAgIHxfX19fX19fX198XHJcblxyXG4gICAgLS0tcGFuZWwtLS0gICAgICAgLS0tcGFuZWwtLS1cclxuICAgIHwgICAgMyAgICAgfCAgICAgIHwgICAgNCAgICB8XHJcbiAgICB8X19fX19fX19fX3wgICAgICB8X19fX19fX19ffFxyXG5cclxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICAgQnV0dG9ucyAtICBhdWRpby92aWRlb011dGUsIHNjcmVlblNoYXJlLCBSZWNvcmQsIENoYXRcclxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5NZWV0aW5nVUkgPSB2b2lkIDA7XHJcbnZhciB2ZWN0b3JfaWNvbl8xID0gcmVxdWlyZShcIi4vY29tcG9uZW50cy92ZWN0b3JfaWNvblwiKTtcclxudmFyIE1lZGlhVHlwZV8xID0gcmVxdWlyZShcIi4vZW51bS9NZWRpYVR5cGVcIik7XHJcbnZhciBVc2VyUHJvcGVydHlfMSA9IHJlcXVpcmUoXCIuL2VudW0vVXNlclByb3BlcnR5XCIpO1xyXG52YXIgU2V0dGluZ0RpYWxvZ18xID0gcmVxdWlyZShcIi4vY29tcG9uZW50cy9TZXR0aW5nRGlhbG9nXCIpO1xyXG52YXIgQ2hhdHRpbmdQYW5lbF8xID0gcmVxdWlyZShcIi4vY29tcG9uZW50cy9DaGF0dGluZ1BhbmVsXCIpO1xyXG52YXIgUGFydGljaXBhbnRMaXN0UGFuZWxfMSA9IHJlcXVpcmUoXCIuL2NvbXBvbmVudHMvUGFydGljaXBhbnRMaXN0UGFuZWxcIik7XHJcbnZhciBQYW5lbFZpZGVvU3RhdGU7XHJcbihmdW5jdGlvbiAoUGFuZWxWaWRlb1N0YXRlKSB7XHJcbiAgICBQYW5lbFZpZGVvU3RhdGVbXCJOb0NhbWVyYVwiXSA9IFwibm8tY2FtZXJhXCI7XHJcbiAgICBQYW5lbFZpZGVvU3RhdGVbXCJTY3JlZW5TaGFyZVwiXSA9IFwic2NyZWVuXCI7XHJcbiAgICBQYW5lbFZpZGVvU3RhdGVbXCJDYW1lcmFcIl0gPSBcImNhbWVyYVwiO1xyXG4gICAgUGFuZWxWaWRlb1N0YXRlW1wiVmlkZW9TdHJlYW1pbmdcIl0gPSBcInN0cmVhbVwiO1xyXG59KShQYW5lbFZpZGVvU3RhdGUgfHwgKFBhbmVsVmlkZW9TdGF0ZSA9IHt9KSk7XHJcbnZhciBNZWV0aW5nVUkgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBNZWV0aW5nVUkobWVldGluZykge1xyXG4gICAgICAgIHRoaXMuTUFYX1BBTkVMUyA9IDk7XHJcbiAgICAgICAgdGhpcy5uUGFuZWxDb3VudCA9IDA7XHJcbiAgICAgICAgdGhpcy5wYW5lbENvbnRhaW5lcklkID0gXCJ2aWRlby1wYW5lbFwiO1xyXG4gICAgICAgIHRoaXMucGFuZWxDb250YWluZXJFbGVtZW50ID0gbnVsbDtcclxuICAgICAgICB0aGlzLnRvb2xiYXJJZCA9IFwibmV3LXRvb2xib3hcIjtcclxuICAgICAgICB0aGlzLnRvb2xiYXJFbGVtZW50ID0gbnVsbDtcclxuICAgICAgICB0aGlzLnBhbmVsQ2xhc3MgPSBcInZpZGVvY29udGFpbmVyXCI7IC8vZXZlcnkgcGFuZWwgZWxlbWVudHMgaGF2ZSB0aGlzIGNsYXNzXHJcbiAgICAgICAgdGhpcy52aWRlb0VsZW1lbnRDbGFzcyA9IFwidmlkZW8tZWxlbWVudFwiO1xyXG4gICAgICAgIHRoaXMuc2hvcnROYW1lQ2xhc3MgPSBcImF2YXRhci1jb250YWluZXJcIjtcclxuICAgICAgICB0aGlzLm1vZGVyYXRvckNsYXNzID0gXCJtb2RlcmF0b3ItaWNvblwiO1xyXG4gICAgICAgIHRoaXMuYXVkaW9NdXRlQ2xhc3MgPSBcImF1ZGlvTXV0ZWRcIjtcclxuICAgICAgICB0aGlzLnZpZGVvTXV0ZUNsYXNzID0gXCJ2aWRlb011dGVkXCI7XHJcbiAgICAgICAgdGhpcy5wb3B1cE1lbnVDbGFzcyA9IFwicG9wdXAtbWVudVwiO1xyXG4gICAgICAgIHRoaXMucG9wdXBNZW51QnV0dG9uQ2xhc3MgPSBcInJlbW90ZXZpZGVvbWVudVwiO1xyXG4gICAgICAgIHRoaXMudXNlck5hbWVDbGFzcyA9IFwiZGlzcGxheW5hbWVcIjtcclxuICAgICAgICB0aGlzLmFjdGl2ZVNwZWFrZXJDbGFzcyA9IFwiYWN0aXZlLXNwZWFrZXJcIjtcclxuICAgICAgICB0aGlzLmZ1bGxzY3JlZW5DbGFzcyA9IFwidmlkZW8tZnVsbHNjcmVlblwiO1xyXG4gICAgICAgIHRoaXMuaW5pdFRvcEluZm8gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm5QYW5lbEluc3RhbmNlSWQgPSAxOyAvL2luY3JlYXNlZCB3aGVuIGFkZCBuZXcsIGJ1dCBub3QgZGVjcmVhc2VkIHdoZW4gcmVtb3ZlIHBhbmVsXHJcbiAgICAgICAgdGhpcy5tZWV0aW5nID0gbnVsbDtcclxuICAgICAgICB0aGlzLm1lZXRpbmcgPSBtZWV0aW5nO1xyXG4gICAgICAgIHRoaXMucGFuZWxDb250YWluZXJFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5wYW5lbENvbnRhaW5lcklkKTtcclxuICAgICAgICB0aGlzLnRvb2xiYXJFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy50b29sYmFySWQpO1xyXG4gICAgICAgIHRoaXMudG9vbGJhckF1ZGlvQnV0dG9uRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWljLWVuYWJsZVwiKTtcclxuICAgICAgICB0aGlzLnRvb2xiYXJWaWRlb0J1dHRvbkVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NhbWVyYS1lbmFibGVcIik7XHJcbiAgICAgICAgdGhpcy50b29sYmFyRGVza3RvcFNoYXJlQnV0dG9uRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2hhcmVcIik7XHJcbiAgICAgICAgdGhpcy50b29sYmFyUmVjb3JkQnV0dG9uRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmVjb3JkXCIpO1xyXG4gICAgICAgIHRoaXMudG9vbGJhckNoYXRCdXR0b25FbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGF0XCIpO1xyXG4gICAgICAgIHRoaXMudG9vbGJhckxlYXZlQnV0dG9uRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbGVhdmVcIik7XHJcbiAgICAgICAgdGhpcy50b29sYmFyU2V0dGluZ0J1dHRvbkVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3NldHRpbmdcIik7XHJcbiAgICAgICAgdGhpcy5zdWJqZWN0RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc3ViamVjdC10ZXh0XCIpO1xyXG4gICAgICAgIHRoaXMudGltZXN0YW1wRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc3ViamVjdC10aW1lclwiKTtcclxuICAgICAgICB0aGlzLnRvcEluZm9iYXJFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zdWJqZWN0XCIpO1xyXG4gICAgICAgIHRoaXMudXNlckxpc3RUb2dnbGVCdXR0b25FbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNvcGVuLXBhcnRpY2lwYW50cy10b2dnbGVcIik7XHJcbiAgICAgICAgdGhpcy5yZWdpc3RlckV2ZW50SGFuZGxlcnMoKTtcclxuICAgICAgICB0aGlzLmNoYXR0aW5nUGFuZWwgPSBuZXcgQ2hhdHRpbmdQYW5lbF8xLkNoYXR0aW5nUGFuZWwoKTtcclxuICAgICAgICB2YXIgcHJvcHMgPSBuZXcgQ2hhdHRpbmdQYW5lbF8xLkNoYXR0aW5nUGFuZWxQcm9wcygpO1xyXG4gICAgICAgIHByb3BzLmNoYXRPcGVuQnV0dG9uID0gdGhpcy50b29sYmFyQ2hhdEJ1dHRvbkVsZW1lbnQ7XHJcbiAgICAgICAgcHJvcHMudW5yZWFkQmFkZ2VFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LWJhZGdlXCIpO1xyXG4gICAgICAgIHByb3BzLm9wZW5DYWxsYmFjayA9IHRoaXMucmVmcmVzaENhcmRWaWV3cy5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHByb3BzLnNlbmRDaGF0ID0gdGhpcy5tZWV0aW5nLnNlbmRDaGF0TWVzc2FnZS5iaW5kKHRoaXMubWVldGluZyk7XHJcbiAgICAgICAgdGhpcy5jaGF0dGluZ1BhbmVsLmluaXQocHJvcHMpO1xyXG4gICAgICAgIHRoaXMucGFydGljaXBhbnRzTGlzdFBhbmVsID0gbmV3IFBhcnRpY2lwYW50TGlzdFBhbmVsXzEuUGFydGljaXBhbnRMaXN0UGFuZWwoKTtcclxuICAgICAgICB2YXIgbFByb3BzID0gbmV3IFBhcnRpY2lwYW50TGlzdFBhbmVsXzEuUGFydGljaXBhbnRMaXN0UGFuZWxQcm9wcygpO1xyXG4gICAgICAgIGxQcm9wcy5vblVzZUNhbWVyYSA9IHRoaXMubWVldGluZy5hbGxvd0NhbWVyYS5iaW5kKHRoaXMubWVldGluZyk7XHJcbiAgICAgICAgbFByb3BzLm9uVXNlTWljID0gdGhpcy5tZWV0aW5nLmFsbG93TWljLmJpbmQodGhpcy5tZWV0aW5nKTtcclxuICAgICAgICB0aGlzLnBhcnRpY2lwYW50c0xpc3RQYW5lbC5pbml0KGxQcm9wcyk7XHJcbiAgICB9XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLnJlZ2lzdGVyRXZlbnRIYW5kbGVycyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgX3RoaXNfMSA9IHRoaXM7XHJcbiAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIF90aGlzXzEucmVmcmVzaENhcmRWaWV3cygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd1bmxvYWQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIF90aGlzXzEubWVldGluZy5mb3JjZVN0b3AoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIF90aGlzXzEucmVmcmVzaENhcmRWaWV3cygpO1xyXG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfdGhpc18xO1xyXG4gICAgICAgICAgICAkKF90aGlzXzEudG9vbGJhckxlYXZlQnV0dG9uRWxlbWVudCkuY2xpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgX3RoaXNfMS5tZWV0aW5nLnN0b3AoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmIChfdGhpc18xLm1lZXRpbmcuY29uZmlnLmhpZGVUb29sYmFyT25Nb3VzZU91dCkge1xyXG4gICAgICAgICAgICAgICAgJChcIiNjb250ZW50XCIpLmhvdmVyKGZ1bmN0aW9uIChfKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChfdGhpc18xLnRvb2xiYXJFbGVtZW50KS5hZGRDbGFzcyhcInZpc2libGVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzXzEuaW5pdFRvcEluZm8pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoX3RoaXNfMS50b3BJbmZvYmFyRWxlbWVudCkuYWRkQ2xhc3MoXCJ2aXNpYmxlXCIpO1xyXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKF8pIHtcclxuICAgICAgICAgICAgICAgICAgICAkKF90aGlzXzEudG9vbGJhckVsZW1lbnQpLnJlbW92ZUNsYXNzKFwidmlzaWJsZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXNfMS5pbml0VG9wSW5mbylcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChfdGhpc18xLnRvcEluZm9iYXJFbGVtZW50KS5yZW1vdmVDbGFzcyhcInZpc2libGVcIik7XHJcbiAgICAgICAgICAgICAgICB9KS5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIi5cIiArIF90aGlzXzEucG9wdXBNZW51Q2xhc3MpLnJlbW92ZUNsYXNzKFwidmlzaWJsZVwiKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJChfdGhpc18xLnRvb2xiYXJFbGVtZW50KS5hZGRDbGFzcyhcInZpc2libGVcIik7XHJcbiAgICAgICAgICAgICAgICBpZiAoX3RoaXNfMS5pbml0VG9wSW5mbylcclxuICAgICAgICAgICAgICAgICAgICAkKF90aGlzXzEudG9wSW5mb2JhckVsZW1lbnQpLmFkZENsYXNzKFwidmlzaWJsZVwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkKFwiI21pYy1lbmFibGVcIikuY2xpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgX3RoaXNfMS5tZWV0aW5nLk9uVG9nZ2xlTXV0ZU15QXVkaW8oKTtcclxuICAgICAgICAgICAgICAgIC8qdmFyIGVsID0gJCh0aGlzKS5maW5kKFwiLnRvb2xib3gtaWNvblwiKTtcclxuICAgICAgICAgICAgICAgIGVsLnRvZ2dsZUNsYXNzKFwidG9nZ2xlZFwiKTtcclxuICAgICAgICAgICAgICAgIGlmIChlbC5oYXNDbGFzcyhcInRvZ2dsZWRcIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZWwuZmluZChcInN2Z1wiKS5hdHRyKFwidmlld0JveFwiLCBcIjAgMCAyMiAyMlwiKTtcclxuICAgICAgICAgICAgICAgICAgICBlbC5maW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk03LjMzMyA4LjY1VjExYTMuNjY4IDMuNjY4IDAgMDAyLjc1NyAzLjU1My45MjguOTI4IDAgMDAtLjAwNy4xMTR2MS43NTdBNS41MDEgNS41MDEgMCAwMTUuNSAxMWEuOTE3LjkxNyAwIDEwLTEuODMzIDBjMCAzLjc0IDIuNzk5IDYuODI2IDYuNDE2IDcuMjc3di45NzNhLjkxNy45MTcgMCAwMDEuODM0IDB2LS45NzNhNy4yOTcgNy4yOTcgMCAwMDMuNTY4LTEuNDc1bDMuMDkxIDMuMDkyYS45MzIuOTMyIDAgMTAxLjMxOC0xLjMxOGwtMy4wOTEtMy4wOTEuMDEtLjAxMy0xLjMxMS0xLjMxMS0uMDEuMDEzLTEuMzI1LTEuMzI1LjAwOC0uMDE0LTEuMzk1LTEuMzk1YTEuMjQgMS4yNCAwIDAxLS4wMDQuMDE4bC0zLjYxLTMuNjA5di0uMDIzTDcuMzM0IDUuOTkzdi4wMjNsLTMuOTA5LTMuOTFhLjkzMi45MzIgMCAxMC0xLjMxOCAxLjMxOEw3LjMzMyA4LjY1em0xLjgzNCAxLjgzNFYxMWExLjgzMyAxLjgzMyAwIDAwMi4yOTEgMS43NzZsLTIuMjkxLTIuMjkyem0zLjY4MiAzLjY4M2MtLjI5LjE3LS42MDYuMy0uOTQuMzg2YS45MjguOTI4IDAgMDEuMDA4LjExNHYxLjc1N2E1LjQ3IDUuNDcgMCAwMDIuMjU3LS45MzJsLTEuMzI1LTEuMzI1em0xLjgxOC0zLjQ3NmwtMS44MzQtMS44MzRWNS41YTEuODMzIDEuODMzIDAgMDAtMy42NDQtLjI4N2wtMS40My0xLjQzQTMuNjY2IDMuNjY2IDAgMDExNC42NjcgNS41djUuMTl6bTEuNjY1IDEuNjY1bDEuNDQ3IDEuNDQ3Yy4zNTctLjg2NC41NTQtMS44MS41NTQtMi44MDNhLjkxNy45MTcgMCAxMC0xLjgzMyAwYzAgLjQ2OC0uMDU4LjkyMi0uMTY4IDEuMzU2elwiKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWwuZmluZChcInN2Z1wiKS5hdHRyKFwidmlld0JveFwiLCBcIjAgMCAyNCAyNFwiKTtcclxuICAgICAgICAgICAgICAgICAgICBlbC5maW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk0xNiA2YTQgNCAwIDAwLTggMHY2YTQuMDAyIDQuMDAyIDAgMDAzLjAwOCAzLjg3NmMtLjAwNS4wNC0uMDA4LjA4Mi0uMDA4LjEyNHYxLjkxN0E2LjAwMiA2LjAwMiAwIDAxNiAxMmExIDEgMCAxMC0yIDAgOC4wMDEgOC4wMDEgMCAwMDcgNy45MzhWMjFhMSAxIDAgMTAyIDB2LTEuMDYyQTguMDAxIDguMDAxIDAgMDAyMCAxMmExIDEgMCAxMC0yIDAgNi4wMDIgNi4wMDIgMCAwMS01IDUuOTE3VjE2YzAtLjA0Mi0uMDAzLS4wODMtLjAwOC0uMTI0QTQuMDAyIDQuMDAyIDAgMDAxNiAxMlY2em0tNC0yYTIgMiAwIDAwLTIgMnY2YTIgMiAwIDEwNCAwVjZhMiAyIDAgMDAtMi0yelwiKTtcclxuICAgICAgICAgICAgICAgIH0qL1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJChcIiNjYW1lcmEtZW5hYmxlXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzXzEubWVldGluZy5PblRvZ2dsZU11dGVNeVZpZGVvKCk7XHJcbiAgICAgICAgICAgICAgICAvKnZhciBlbCA9ICQodGhpcykuZmluZChcIi50b29sYm94LWljb25cIik7XHJcbiAgICAgICAgICAgICAgICBlbC50b2dnbGVDbGFzcyhcInRvZ2dsZWRcIik7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWwuaGFzQ2xhc3MoXCJ0b2dnbGVkXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWwuZmluZChcInBhdGhcIikuYXR0cihcImRcIiwgXCJNIDYuODQgNS41IGggLTAuMDIyIEwgMy40MjQgMi4xMDYgYSAwLjkzMiAwLjkzMiAwIDEgMCAtMS4zMTggMS4zMTggTCA0LjE4MiA1LjUgaCAtMC41MTUgYyAtMS4wMTMgMCAtMS44MzQgMC44MiAtMS44MzQgMS44MzMgdiA3LjMzNCBjIDAgMS4wMTIgMC44MjEgMS44MzMgMS44MzQgMS44MzMgSCAxMy43NSBjIDAuNDA0IDAgMC43NzcgLTAuMTMgMS4wOCAtMC4zNTIgbCAzLjc0NiAzLjc0NiBhIDAuOTMyIDAuOTMyIDAgMSAwIDEuMzE4IC0xLjMxOCBsIC00LjMxIC00LjMxIHYgLTAuMDI0IEwgMTMuNzUgMTIuNDEgdiAwLjAyMyBsIC01LjEgLTUuMDk5IGggMC4wMjQgTCA2Ljg0MSA1LjUgWiBtIDYuOTEgNC4yNzQgViA3LjMzMyBoIC0yLjQ0IEwgOS40NzUgNS41IGggNC4yNzQgYyAxLjAxMiAwIDEuODMzIDAuODIgMS44MzMgMS44MzMgdiAwLjc4NiBsIDMuMjEyIC0xLjgzNSBhIDAuOTE3IDAuOTE3IDAgMCAxIDEuMzcyIDAuNzk2IHYgNy44NCBjIDAgMC4zNDQgLTAuMTkgMC42NDQgLTAuNDcgMC44IGwgLTMuNzM2IC0zLjczNSBsIDIuMzcyIDEuMzU2IFYgOC42NTkgbCAtMi43NSAxLjU3MSB2IDEuMzc3IEwgMTMuNzUgOS43NzQgWiBNIDMuNjY3IDcuMzM0IGggMi4zNDkgbCA3LjMzMyA3LjMzMyBIIDMuNjY3IFYgNy4zMzMgWlwiKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWwuZmluZChcInBhdGhcIikuYXR0cihcImRcIiwgXCJNMTMuNzUgNS41SDMuNjY3Yy0xLjAxMyAwLTEuODM0LjgyLTEuODM0IDEuODMzdjcuMzM0YzAgMS4wMTIuODIxIDEuODMzIDEuODM0IDEuODMzSDEzLjc1YzEuMDEyIDAgMS44MzMtLjgyIDEuODMzLTEuODMzdi0uNzg2bDMuMjEyIDEuODM1YS45MTYuOTE2IDAgMDAxLjM3Mi0uNzk2VjcuMDhhLjkxNy45MTcgMCAwMC0xLjM3Mi0uNzk2bC0zLjIxMiAxLjgzNXYtLjc4NmMwLTEuMDEyLS44Mi0xLjgzMy0xLjgzMy0xLjgzM3ptMCAzLjY2N3Y1LjVIMy42NjdWNy4zMzNIMTMuNzV2MS44MzR6bTQuNTgzIDQuMTc0bC0yLjc1LTEuNTcydi0xLjUzOGwyLjc1LTEuNTcydjQuNjgyelwiKTtcclxuICAgICAgICAgICAgICAgIH0qL1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJChfdGhpc18xLnRvb2xiYXJDaGF0QnV0dG9uRWxlbWVudCkub24oJ2NsaWNrJywgZnVuY3Rpb24gKF8pIHtcclxuICAgICAgICAgICAgICAgIF90aGlzXzEuY2hhdHRpbmdQYW5lbC50b2dnbGVPcGVuKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKF90aGlzXzEudG9vbGJhckRlc2t0b3BTaGFyZUJ1dHRvbkVsZW1lbnQpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgX3RoaXNfMS5tZWV0aW5nLnRvZ2dsZVNjcmVlblNoYXJlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKF90aGlzXzEudG9vbGJhclJlY29yZEJ1dHRvbkVsZW1lbnQpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzXzEubWVldGluZy50b2dnbGVSZWNvcmRpbmcoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQoX3RoaXNfMS50b29sYmFyU2V0dGluZ0J1dHRvbkVsZW1lbnQpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzXzEuc2hvd1NldHRpbmdEaWFsb2coKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5yZWdpc3RlclBhbmVsRXZlbnRIYW5kbGVyID0gZnVuY3Rpb24gKHBhbmVsKSB7XHJcbiAgICAgICAgdmFyIHBvcHVwTWVudUNsYXNzID0gdGhpcy5wb3B1cE1lbnVDbGFzcztcclxuICAgICAgICB2YXIgcG9wdXBNZW51QnV0dG9uQ2xhc3MgPSB0aGlzLnBvcHVwTWVudUJ1dHRvbkNsYXNzO1xyXG4gICAgICAgIHZhciBwYW5lbENvbnRhaW5lckVsZW1lbnQgPSB0aGlzLnBhbmVsQ29udGFpbmVyRWxlbWVudDtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgICQocGFuZWwpXHJcbiAgICAgICAgICAgIC5vbignY2xpY2snLCBcIi5cIiArIHBvcHVwTWVudUJ1dHRvbkNsYXNzLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAkKHBhbmVsQ29udGFpbmVyRWxlbWVudCkuZmluZChcIi5cIiArIHBvcHVwTWVudUNsYXNzKS5yZW1vdmVDbGFzcyhcInZpc2libGVcIik7XHJcbiAgICAgICAgICAgICQodGhpcykuZmluZChcIi5cIiArIHBvcHVwTWVudUNsYXNzKS50b2dnbGVDbGFzcyhcInZpc2libGVcIik7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgLm9uKCdjbGljaycsICcuZ3JhbnQtbW9kZXJhdG9yJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KFwiLlwiICsgcG9wdXBNZW51Q2xhc3MpLnJlbW92ZUNsYXNzKFwidmlzaWJsZVwiKTtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgJy5hdWRpby1tdXRlJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KFwiLlwiICsgcG9wdXBNZW51Q2xhc3MpLnJlbW92ZUNsYXNzKFwidmlzaWJsZVwiKTtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgJy52aWRlby1tdXRlJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KFwiLlwiICsgcG9wdXBNZW51Q2xhc3MpLnJlbW92ZUNsYXNzKFwidmlzaWJsZVwiKTtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgJy5mdWxsc2NyZWVuJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KFwiLlwiICsgcG9wdXBNZW51Q2xhc3MpLnJlbW92ZUNsYXNzKFwidmlzaWJsZVwiKTtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgJChwYW5lbCkudG9nZ2xlQ2xhc3MoXCJ2aWRlby1mdWxsc2NyZWVuXCIpO1xyXG4gICAgICAgICAgICBfdGhpcy5yZWZyZXNoQ2FyZFZpZXdzKCk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJkaXNwbGF5LXZpZGVvXCIpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKFwiZGlzcGxheS1uYW1lLW9uLXZpZGVvXCIpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5vbignbW91c2VvdXQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJkaXNwbGF5LW5hbWUtb24tdmlkZW9cIik7XHJcbiAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJkaXNwbGF5LXZpZGVvXCIpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5vbignZGJsY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAkKHRoaXMpLmNsb3Nlc3QoXCIuXCIgKyBwb3B1cE1lbnVDbGFzcykucmVtb3ZlQ2xhc3MoXCJ2aXNpYmxlXCIpO1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAkKHBhbmVsKS50b2dnbGVDbGFzcyhcInZpZGVvLWZ1bGxzY3JlZW5cIik7XHJcbiAgICAgICAgICAgIF90aGlzLnJlZnJlc2hDYXJkVmlld3MoKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLl9nZXRQYW5lbEZyb21WaWRlb0VsZW1lbnQgPSBmdW5jdGlvbiAodmlkZW9FbGVtKSB7XHJcbiAgICAgICAgcmV0dXJuIHZpZGVvRWxlbS5wYXJlbnROb2RlO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuX2dldFZpZGVvRWxlbWVudEZyb21QYW5lbCA9IGZ1bmN0aW9uIChwYW5lbCkge1xyXG4gICAgICAgIHJldHVybiAkKFwiLlwiICsgdGhpcy52aWRlb0VsZW1lbnRDbGFzcywgcGFuZWwpWzBdO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuX2dldEF1ZGlvRWxlbWVudEZyb21QYW5lbCA9IGZ1bmN0aW9uIChwYW5lbCkge1xyXG4gICAgICAgIHJldHVybiAkKFwiYXVkaW9cIiwgcGFuZWwpWzBdO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuX2dldFNob3J0TmFtZUVsZW1lbnRGcm9tUGFuZWwgPSBmdW5jdGlvbiAocGFuZWwpIHtcclxuICAgICAgICByZXR1cm4gJChcIi5cIiArIHRoaXMuc2hvcnROYW1lQ2xhc3MsIHBhbmVsKVswXTtcclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLl9nZXRBdWRpb011dGVFbGVtZW50RnJvbVBhbmVsID0gZnVuY3Rpb24gKHBhbmVsKSB7XHJcbiAgICAgICAgcmV0dXJuICQoXCIuXCIgKyB0aGlzLmF1ZGlvTXV0ZUNsYXNzLCBwYW5lbClbMF07XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5fZ2V0VmlkZW9NdXRlRWxlbWVudEZyb21QYW5lbCA9IGZ1bmN0aW9uIChwYW5lbCkge1xyXG4gICAgICAgIHJldHVybiAkKFwiLlwiICsgdGhpcy52aWRlb011dGVDbGFzcywgcGFuZWwpWzBdO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuX2dldE1vZGVyYXRvclN0YXJFbGVtZW50RnJvbVBhbmVsID0gZnVuY3Rpb24gKHBhbmVsKSB7XHJcbiAgICAgICAgcmV0dXJuICQoXCIuXCIgKyB0aGlzLm1vZGVyYXRvckNsYXNzLCBwYW5lbClbMF07XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5fZ2V0TmFtZUVsZW1lbnRGcm9tUGFuZWwgPSBmdW5jdGlvbiAocGFuZWwpIHtcclxuICAgICAgICByZXR1cm4gJChcIi5cIiArIHRoaXMudXNlck5hbWVDbGFzcywgcGFuZWwpWzBdO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuX2dldFBvcHVwTWVudUdyYW50TW9kZXJhdG9yRnJvbVBhbmVsID0gZnVuY3Rpb24gKHBhbmVsKSB7XHJcbiAgICAgICAgcmV0dXJuICQoXCJsaS5ncmFudC1tb2RlcmF0b3JcIiwgcGFuZWwpWzBdO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuX2dldFBvcHVwTWVudUF1ZGlvTXV0ZUZyb21QYW5lbCA9IGZ1bmN0aW9uIChwYW5lbCkge1xyXG4gICAgICAgIHJldHVybiAkKFwibGkuYXVkaW8tbXV0ZVwiLCBwYW5lbClbMF07XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5fZ2V0UG9wdXBNZW51VmlkZW9NdXRlRnJvbVBhbmVsID0gZnVuY3Rpb24gKHBhbmVsKSB7XHJcbiAgICAgICAgcmV0dXJuICQoXCJsaS52aWRlby1tdXRlXCIsIHBhbmVsKVswXTtcclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLl9nZXRQb3B1cE1lbnVGdWxsc2NyZWVuRnJvbVBhbmVsID0gZnVuY3Rpb24gKHBhbmVsKSB7XHJcbiAgICAgICAgcmV0dXJuICQoXCJsaS5mdWxsc2NyZWVuXCIsIHBhbmVsKVswXTtcclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLmdldEVtcHR5VmlkZW9QYW5lbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcGFuZWwgPSB0aGlzLmFkZE5ld1BhbmVsKCk7XHJcbiAgICAgICAgdGhpcy5yZWdpc3RlclBhbmVsRXZlbnRIYW5kbGVyKHBhbmVsKTtcclxuICAgICAgICAvL2JvdHRvbSBzbWFsbCBpY29uc1xyXG4gICAgICAgIHRoaXMuX2dldFZpZGVvTXV0ZUVsZW1lbnRGcm9tUGFuZWwocGFuZWwpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICB0aGlzLl9nZXRBdWRpb011dGVFbGVtZW50RnJvbVBhbmVsKHBhbmVsKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgdGhpcy5fZ2V0TW9kZXJhdG9yU3RhckVsZW1lbnRGcm9tUGFuZWwocGFuZWwpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICB2YXIgdmlkZW9FbGVtID0gdGhpcy5fZ2V0VmlkZW9FbGVtZW50RnJvbVBhbmVsKHBhbmVsKTtcclxuICAgICAgICB2YXIgYXVkaW9FbGVtID0gdGhpcy5fZ2V0QXVkaW9FbGVtZW50RnJvbVBhbmVsKHBhbmVsKTtcclxuICAgICAgICByZXR1cm4geyB2aWRlb0VsZW06IHZpZGVvRWxlbSwgYXVkaW9FbGVtOiBhdWRpb0VsZW0gfTtcclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLmZyZWVWaWRlb1BhbmVsID0gZnVuY3Rpb24gKHZpZGVvRWxlbWVudCkge1xyXG4gICAgICAgIHZhciB2aWRlb0NhcmRWaWV3cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJ2aWRlby5cIiArIHRoaXMudmlkZW9FbGVtZW50Q2xhc3MpO1xyXG4gICAgICAgIHZhciBOID0gdmlkZW9DYXJkVmlld3MubGVuZ3RoO1xyXG4gICAgICAgIHZhciBpID0gMDtcclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgTjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh2aWRlb0NhcmRWaWV3c1tpXSA9PSB2aWRlb0VsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBjdXJFbGVtID0gdmlkZW9DYXJkVmlld3NbaV07XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoISQoY3VyRWxlbSkuaGFzQ2xhc3ModGhpcy5wYW5lbENsYXNzKSlcclxuICAgICAgICAgICAgICAgICAgICBjdXJFbGVtID0gY3VyRWxlbS5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgICAgICAgICAgY3VyRWxlbS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnJlZnJlc2hDYXJkVmlld3MoKTtcclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLnVwZGF0ZVBhbmVsT25KaXRzaVVzZXIgPSBmdW5jdGlvbiAodmlkZW9FbGVtLCBteUluZm8sIHVzZXIpIHtcclxuICAgICAgICB2YXIgX3RoaXNfMSA9IHRoaXM7XHJcbiAgICAgICAgdmFyIHBhbmVsID0gdGhpcy5fZ2V0UGFuZWxGcm9tVmlkZW9FbGVtZW50KHZpZGVvRWxlbSk7XHJcbiAgICAgICAgaWYgKCFwYW5lbClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIC8vc2V0IG5hbWVcclxuICAgICAgICB0aGlzLnNldFVzZXJOYW1lKHVzZXIuZ2V0RGlzcGxheU5hbWUoKSwgdmlkZW9FbGVtKTtcclxuICAgICAgICAvL2hpZGUgc2hvdG5hbWUgaWYgZXhpc3QgdmlzaWJsZSB2aWRlbyB0cmFja1xyXG4gICAgICAgIHZhciBpc1Zpc2libGVWaWRlbyA9IGZhbHNlO1xyXG4gICAgICAgIHVzZXIuZ2V0VHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbiAodHJhY2spIHtcclxuICAgICAgICAgICAgaWYgKHRyYWNrLmdldFR5cGUoKSA9PT0gTWVkaWFUeXBlXzEuTWVkaWFUeXBlLlZJREVPICYmICF0cmFjay5pc011dGVkKCkpIHtcclxuICAgICAgICAgICAgICAgIGlzVmlzaWJsZVZpZGVvID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc2V0U2hvdG5hbWVWaXNpYmxlKCFpc1Zpc2libGVWaWRlbywgdmlkZW9FbGVtKTtcclxuICAgICAgICAvL2JvdHRvbSBzbWFsbCBpY29uc1xyXG4gICAgICAgIHRoaXMuX2dldFZpZGVvTXV0ZUVsZW1lbnRGcm9tUGFuZWwocGFuZWwpLnN0eWxlLmRpc3BsYXkgPSB1c2VyLmlzVmlkZW9NdXRlZCgpID8gXCJibG9ja1wiIDogXCJub25lXCI7XHJcbiAgICAgICAgdGhpcy5fZ2V0QXVkaW9NdXRlRWxlbWVudEZyb21QYW5lbChwYW5lbCkuc3R5bGUuZGlzcGxheSA9IHVzZXIuaXNBdWRpb011dGVkKCkgPyBcImJsb2NrXCIgOiBcIm5vbmVcIjtcclxuICAgICAgICB0aGlzLl9nZXRNb2RlcmF0b3JTdGFyRWxlbWVudEZyb21QYW5lbChwYW5lbCkuc3R5bGUuZGlzcGxheSA9IHVzZXIuZ2V0UHJvcGVydHkoVXNlclByb3BlcnR5XzEuVXNlclByb3BlcnR5LklzSG9zdCkgPyBcImJsb2NrXCIgOiBcIm5vbmVcIjtcclxuICAgICAgICAvL3BvcHVwIG1lbnVcclxuICAgICAgICB2YXIgYXVkaW9NdXRlUG9wdXBNZW51ID0gdGhpcy5fZ2V0UG9wdXBNZW51QXVkaW9NdXRlRnJvbVBhbmVsKHBhbmVsKTtcclxuICAgICAgICB2YXIgdmlkZW9NdXRlUG9wdXBNZW51ID0gdGhpcy5fZ2V0UG9wdXBNZW51VmlkZW9NdXRlRnJvbVBhbmVsKHBhbmVsKTtcclxuICAgICAgICB2YXIgZ3JhbnRNb2RlcmF0b3JQb3B1cE1lbnUgPSB0aGlzLl9nZXRQb3B1cE1lbnVHcmFudE1vZGVyYXRvckZyb21QYW5lbChwYW5lbCk7XHJcbiAgICAgICAgaWYgKG15SW5mby5Jc0hvc3QpIHtcclxuICAgICAgICAgICAgdmFyIHVzZXJIYXZlQ2FtZXJhXzEgPSBmYWxzZSwgdXNlckhhdmVNaWNyb3Bob25lXzEgPSBmYWxzZTtcclxuICAgICAgICAgICAgdXNlci5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uICh0cmFjaykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRyYWNrLmdldFR5cGUoKSA9PT0gTWVkaWFUeXBlXzEuTWVkaWFUeXBlLlZJREVPKVxyXG4gICAgICAgICAgICAgICAgICAgIHVzZXJIYXZlQ2FtZXJhXzEgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodHJhY2suZ2V0VHlwZSgpID09PSBNZWRpYVR5cGVfMS5NZWRpYVR5cGUuQVVESU8pXHJcbiAgICAgICAgICAgICAgICAgICAgdXNlckhhdmVNaWNyb3Bob25lXzEgPSB0cnVlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdmlkZW9NdXRlUG9wdXBNZW51LnN0eWxlLmRpc3BsYXkgPSB1c2VySGF2ZUNhbWVyYV8xID8gXCJmbGV4XCIgOiBcIm5vbmVcIjtcclxuICAgICAgICAgICAgYXVkaW9NdXRlUG9wdXBNZW51LnN0eWxlLmRpc3BsYXkgPSB1c2VySGF2ZU1pY3JvcGhvbmVfMSA/IFwiZmxleFwiIDogXCJub25lXCI7XHJcbiAgICAgICAgICAgIGdyYW50TW9kZXJhdG9yUG9wdXBNZW51LnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZpZGVvTXV0ZVBvcHVwTWVudS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgICAgIGF1ZGlvTXV0ZVBvcHVwTWVudS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgICAgIGdyYW50TW9kZXJhdG9yUG9wdXBNZW51LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHVzZXIuZ2V0UHJvcGVydHkoVXNlclByb3BlcnR5XzEuVXNlclByb3BlcnR5LklzSG9zdCkpXHJcbiAgICAgICAgICAgIGdyYW50TW9kZXJhdG9yUG9wdXBNZW51LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAvL3BvcHVwIG1lbnUgYXVkaW8gaWNvbi9sYWJlbCBjaGFuZ2VcclxuICAgICAgICBpZiAoYXVkaW9NdXRlUG9wdXBNZW51LnN0eWxlLmRpc3BsYXkgPT09ICdmbGV4Jykge1xyXG4gICAgICAgICAgICBpZiAodXNlci5pc0F1ZGlvTXV0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgJChhdWRpb011dGVQb3B1cE1lbnUpLmZpbmQoXCIubGFiZWxcIikuaHRtbChcIlVubXV0ZSBBdWRpb1wiKTtcclxuICAgICAgICAgICAgICAgICQoYXVkaW9NdXRlUG9wdXBNZW51KS5maW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCB2ZWN0b3JfaWNvbl8xLlZlY3Rvckljb24uQVVESU9fTVVURV9JQ09OKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoYXVkaW9NdXRlUG9wdXBNZW51KS5maW5kKFwiLmxhYmVsXCIpLmh0bWwoXCJNdXRlIEF1ZGlvXCIpO1xyXG4gICAgICAgICAgICAgICAgJChhdWRpb011dGVQb3B1cE1lbnUpLmZpbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIHZlY3Rvcl9pY29uXzEuVmVjdG9ySWNvbi5BVURJT19VTk1VVEVfSUNPTik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZpZGVvTXV0ZVBvcHVwTWVudS5zdHlsZS5kaXNwbGF5ID09PSAnZmxleCcpIHtcclxuICAgICAgICAgICAgaWYgKHVzZXIuaXNWaWRlb011dGVkKCkpIHtcclxuICAgICAgICAgICAgICAgICQodmlkZW9NdXRlUG9wdXBNZW51KS5maW5kKFwiLmxhYmVsXCIpLmh0bWwoXCJVbm11dGUgVmlkZW9cIik7XHJcbiAgICAgICAgICAgICAgICAkKHZpZGVvTXV0ZVBvcHVwTWVudSkuZmluZChcInBhdGhcIikuYXR0cihcImRcIiwgdmVjdG9yX2ljb25fMS5WZWN0b3JJY29uLlZJREVPX01VVEVfSUNPTik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKHZpZGVvTXV0ZVBvcHVwTWVudSkuZmluZChcIi5sYWJlbFwiKS5odG1sKFwiTXV0ZSBWaWRlb1wiKTtcclxuICAgICAgICAgICAgICAgICQodmlkZW9NdXRlUG9wdXBNZW51KS5maW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCB2ZWN0b3JfaWNvbl8xLlZlY3Rvckljb24uVklERU9fVU5NVVRFX0lDT04pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vcG9wdXAgbWVudSBoYW5kbGVyc1xyXG4gICAgICAgIGlmIChteUluZm8uSXNIb3N0KSB7XHJcbiAgICAgICAgICAgICQoZ3JhbnRNb2RlcmF0b3JQb3B1cE1lbnUpLnVuYmluZCgnY2xpY2snKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpc18xLm1lZXRpbmcuZ3JhbnRNb2RlcmF0b3JSb2xlKHVzZXIuZ2V0SWQoKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKGF1ZGlvTXV0ZVBvcHVwTWVudSkudW5iaW5kKCdjbGljaycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzXzEubWVldGluZy5tdXRlVXNlckF1ZGlvKHVzZXIuZ2V0SWQoKSwgIXVzZXIuaXNBdWRpb011dGVkKCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJCh2aWRlb011dGVQb3B1cE1lbnUpLnVuYmluZCgnY2xpY2snKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpc18xLm1lZXRpbmcubXV0ZVVzZXJWaWRlbyh1c2VyLmdldElkKCksICF1c2VyLmlzVmlkZW9NdXRlZCgpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vYWN0aXZlIHNwZWFrZXIoYmx1ZSBib3JkZXIpXHJcbiAgICAgICAgJChwYW5lbCkucmVtb3ZlQ2xhc3ModGhpcy5hY3RpdmVTcGVha2VyQ2xhc3MpO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUudXBkYXRlUGFuZWxPbk15QkdVc2VyID0gZnVuY3Rpb24gKHZpZGVvRWxlbSwgbXlJbmZvLCBsb2NhbFRyYWNrcykge1xyXG4gICAgICAgIHZhciBfdGhpc18xID0gdGhpcztcclxuICAgICAgICB2YXIgcGFuZWwgPSB0aGlzLl9nZXRQYW5lbEZyb21WaWRlb0VsZW1lbnQodmlkZW9FbGVtKTtcclxuICAgICAgICBpZiAoIXBhbmVsKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgdmFyIGF1ZGlvTXV0ZWQgPSBmYWxzZSwgdmlkZW9NdXRlZCA9IGZhbHNlO1xyXG4gICAgICAgIGxvY2FsVHJhY2tzLmZvckVhY2goZnVuY3Rpb24gKHRyYWNrKSB7XHJcbiAgICAgICAgICAgIGlmICh0cmFjay5nZXRUeXBlKCkgPT09IE1lZGlhVHlwZV8xLk1lZGlhVHlwZS5WSURFTyAmJiB0cmFjay5pc011dGVkKCkpXHJcbiAgICAgICAgICAgICAgICB2aWRlb011dGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgZWxzZSBpZiAodHJhY2suZ2V0VHlwZSgpID09PSBNZWRpYVR5cGVfMS5NZWRpYVR5cGUuQVVESU8gJiYgdHJhY2suaXNNdXRlZCgpKVxyXG4gICAgICAgICAgICAgICAgYXVkaW9NdXRlZCA9IHRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy9uYW1lXHJcbiAgICAgICAgdGhpcy5zZXRVc2VyTmFtZShteUluZm8uTmFtZSwgdmlkZW9FbGVtKTtcclxuICAgICAgICB2YXIgaXNWaXNpYmxlVmlkZW8gPSBmYWxzZTtcclxuICAgICAgICBsb2NhbFRyYWNrcy5mb3JFYWNoKGZ1bmN0aW9uICh0cmFjaykge1xyXG4gICAgICAgICAgICBpZiAodHJhY2suZ2V0VHlwZSgpID09PSBNZWRpYVR5cGVfMS5NZWRpYVR5cGUuVklERU8gJiYgIXRyYWNrLmlzTXV0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgaXNWaXNpYmxlVmlkZW8gPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zZXRTaG90bmFtZVZpc2libGUoIWlzVmlzaWJsZVZpZGVvLCB2aWRlb0VsZW0pO1xyXG4gICAgICAgIC8vcG9wdXAgbWVudVxyXG4gICAgICAgIHZhciBhdWRpb011dGVQb3B1cE1lbnUgPSB0aGlzLl9nZXRQb3B1cE1lbnVBdWRpb011dGVGcm9tUGFuZWwocGFuZWwpO1xyXG4gICAgICAgIHZhciB2aWRlb011dGVQb3B1cE1lbnUgPSB0aGlzLl9nZXRQb3B1cE1lbnVWaWRlb011dGVGcm9tUGFuZWwocGFuZWwpO1xyXG4gICAgICAgIHZhciBncmFudE1vZGVyYXRvclBvcHVwTWVudSA9IHRoaXMuX2dldFBvcHVwTWVudUdyYW50TW9kZXJhdG9yRnJvbVBhbmVsKHBhbmVsKTtcclxuICAgICAgICBpZiAobXlJbmZvLklzSG9zdCkge1xyXG4gICAgICAgICAgICB2aWRlb011dGVQb3B1cE1lbnUuc3R5bGUuZGlzcGxheSA9IG15SW5mby51c2VNZWRpYS51c2VDYW1lcmEgPyBcImZsZXhcIiA6IFwibm9uZVwiO1xyXG4gICAgICAgICAgICBhdWRpb011dGVQb3B1cE1lbnUuc3R5bGUuZGlzcGxheSA9IG15SW5mby51c2VNZWRpYS51c2VNaWMgPyBcImZsZXhcIiA6IFwibm9uZVwiO1xyXG4gICAgICAgICAgICBncmFudE1vZGVyYXRvclBvcHVwTWVudS5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2aWRlb011dGVQb3B1cE1lbnUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICBhdWRpb011dGVQb3B1cE1lbnUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICBncmFudE1vZGVyYXRvclBvcHVwTWVudS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdyYW50TW9kZXJhdG9yUG9wdXBNZW51LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAvL3BvcHVwIG1lbnUgYXVkaW8gaWNvbi9sYWJlbCBjaGFuZ2VcclxuICAgICAgICBpZiAoYXVkaW9NdXRlUG9wdXBNZW51LnN0eWxlLmRpc3BsYXkgPT09ICdmbGV4Jykge1xyXG4gICAgICAgICAgICBpZiAobXlJbmZvLm1lZGlhTXV0ZS5hdWRpb011dGUpIHtcclxuICAgICAgICAgICAgICAgICQoYXVkaW9NdXRlUG9wdXBNZW51KS5maW5kKFwiLmxhYmVsXCIpLmh0bWwoXCJVbm11dGUgQXVkaW9cIik7XHJcbiAgICAgICAgICAgICAgICAkKGF1ZGlvTXV0ZVBvcHVwTWVudSkuZmluZChcInBhdGhcIikuYXR0cihcImRcIiwgdmVjdG9yX2ljb25fMS5WZWN0b3JJY29uLkFVRElPX01VVEVfSUNPTik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKGF1ZGlvTXV0ZVBvcHVwTWVudSkuZmluZChcIi5sYWJlbFwiKS5odG1sKFwiTXV0ZSBBdWRpb1wiKTtcclxuICAgICAgICAgICAgICAgICQoYXVkaW9NdXRlUG9wdXBNZW51KS5maW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCB2ZWN0b3JfaWNvbl8xLlZlY3Rvckljb24uQVVESU9fVU5NVVRFX0lDT04pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2aWRlb011dGVQb3B1cE1lbnUuc3R5bGUuZGlzcGxheSA9PT0gJ2ZsZXgnKSB7XHJcbiAgICAgICAgICAgIGlmIChteUluZm8ubWVkaWFNdXRlLnZpZGVvTXV0ZSkge1xyXG4gICAgICAgICAgICAgICAgJCh2aWRlb011dGVQb3B1cE1lbnUpLmZpbmQoXCIubGFiZWxcIikuaHRtbChcIlVubXV0ZSBWaWRlb1wiKTtcclxuICAgICAgICAgICAgICAgICQodmlkZW9NdXRlUG9wdXBNZW51KS5maW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCB2ZWN0b3JfaWNvbl8xLlZlY3Rvckljb24uVklERU9fTVVURV9JQ09OKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQodmlkZW9NdXRlUG9wdXBNZW51KS5maW5kKFwiLmxhYmVsXCIpLmh0bWwoXCJNdXRlIFZpZGVvXCIpO1xyXG4gICAgICAgICAgICAgICAgJCh2aWRlb011dGVQb3B1cE1lbnUpLmZpbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIHZlY3Rvcl9pY29uXzEuVmVjdG9ySWNvbi5WSURFT19VTk1VVEVfSUNPTik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy9wb3B1cCBtZW51IGhhbmRsZXJzXHJcbiAgICAgICAgaWYgKG15SW5mby5Jc0hvc3QpIHtcclxuICAgICAgICAgICAgJChhdWRpb011dGVQb3B1cE1lbnUpLnVuYmluZCgnY2xpY2snKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpc18xLm1lZXRpbmcubXV0ZU15QXVkaW8oIWF1ZGlvTXV0ZWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJCh2aWRlb011dGVQb3B1cE1lbnUpLnVuYmluZCgnY2xpY2snKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpc18xLm1lZXRpbmcubXV0ZU15VmlkZW8oIXZpZGVvTXV0ZWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy9ib3R0b20gc21hbGwgaWNvbnNcclxuICAgICAgICB0aGlzLl9nZXRWaWRlb011dGVFbGVtZW50RnJvbVBhbmVsKHBhbmVsKS5zdHlsZS5kaXNwbGF5ID0gdmlkZW9NdXRlZCA/IFwiYmxvY2tcIiA6IFwibm9uZVwiO1xyXG4gICAgICAgIHRoaXMuX2dldEF1ZGlvTXV0ZUVsZW1lbnRGcm9tUGFuZWwocGFuZWwpLnN0eWxlLmRpc3BsYXkgPSBhdWRpb011dGVkID8gXCJibG9ja1wiIDogXCJub25lXCI7XHJcbiAgICAgICAgdGhpcy5fZ2V0TW9kZXJhdG9yU3RhckVsZW1lbnRGcm9tUGFuZWwocGFuZWwpLnN0eWxlLmRpc3BsYXkgPSBteUluZm8uSXNIb3N0ID8gXCJibG9ja1wiIDogXCJub25lXCI7XHJcbiAgICAgICAgLy9hY3RpdmUgc3BlYWtlcihibHVlIGJvcmRlcilcclxuICAgICAgICAkKHBhbmVsKS5hZGRDbGFzcyh0aGlzLmFjdGl2ZVNwZWFrZXJDbGFzcyk7XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5zZXRTaG90bmFtZVZpc2libGUgPSBmdW5jdGlvbiAoc2hvdywgdmlkZW9FbGVtKSB7XHJcbiAgICAgICAgdmFyIHBhbmVsID0gdGhpcy5fZ2V0UGFuZWxGcm9tVmlkZW9FbGVtZW50KHZpZGVvRWxlbSk7XHJcbiAgICAgICAgdmFyIHNob3J0TmFtZVBhbmVsID0gdGhpcy5fZ2V0U2hvcnROYW1lRWxlbWVudEZyb21QYW5lbChwYW5lbCk7XHJcbiAgICAgICAgc2hvcnROYW1lUGFuZWwuc3R5bGUuZGlzcGxheSA9IHNob3cgPyBcImJsb2NrXCIgOiBcIm5vbmVcIjtcclxuICAgICAgICB2aWRlb0VsZW0uc3R5bGUudmlzaWJpbGl0eSA9IHNob3cgPyBcImhpZGRlblwiIDogXCJ2aXNpYmxlXCI7XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5zZXRVc2VyTmFtZSA9IGZ1bmN0aW9uIChuYW1lLCB2aWRlb0VsZW0pIHtcclxuICAgICAgICAvL25hbWVcclxuICAgICAgICB2YXIgcGFuZWwgPSB0aGlzLl9nZXRQYW5lbEZyb21WaWRlb0VsZW1lbnQodmlkZW9FbGVtKTtcclxuICAgICAgICB0aGlzLl9nZXROYW1lRWxlbWVudEZyb21QYW5lbChwYW5lbCkuaW5uZXJIVE1MID0gbmFtZTtcclxuICAgICAgICAvL3Nob3J0bmFtZVxyXG4gICAgICAgIHZhciBzaG9ydE5hbWVQYW5lbCA9IHRoaXMuX2dldFNob3J0TmFtZUVsZW1lbnRGcm9tUGFuZWwocGFuZWwpO1xyXG4gICAgICAgICQoXCJ0ZXh0XCIsIHNob3J0TmFtZVBhbmVsKS5odG1sKHRoaXMuZ2V0U2hvcnROYW1lKG5hbWUpKTtcclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLnVwZGF0ZVRvb2xiYXIgPSBmdW5jdGlvbiAobXlJbmZvLCBsb2NhbFRyYWNrcykge1xyXG4gICAgICAgIHZhciBhdWRpb011dGVkID0gZmFsc2UsIHZpZGVvTXV0ZWQgPSBmYWxzZTtcclxuICAgICAgICB2YXIgaGFzQXVkaW9UcmFjayA9IGZhbHNlLCBoYXNWaWRlb1RyYWNrID0gZmFsc2U7XHJcbiAgICAgICAgbG9jYWxUcmFja3MuZm9yRWFjaChmdW5jdGlvbiAodHJhY2spIHtcclxuICAgICAgICAgICAgaWYgKHRyYWNrLmdldFR5cGUoKSA9PT0gTWVkaWFUeXBlXzEuTWVkaWFUeXBlLlZJREVPKSB7XHJcbiAgICAgICAgICAgICAgICBoYXNWaWRlb1RyYWNrID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGlmICh0cmFjay5pc011dGVkKCkpXHJcbiAgICAgICAgICAgICAgICAgICAgdmlkZW9NdXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodHJhY2suZ2V0VHlwZSgpID09PSBNZWRpYVR5cGVfMS5NZWRpYVR5cGUuQVVESU8pIHtcclxuICAgICAgICAgICAgICAgIGhhc0F1ZGlvVHJhY2sgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRyYWNrLmlzTXV0ZWQoKSlcclxuICAgICAgICAgICAgICAgICAgICBhdWRpb011dGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMudG9vbGJhclZpZGVvQnV0dG9uRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gaGFzVmlkZW9UcmFjayA/IFwiaW5saW5lLWJsb2NrXCIgOiBcIm5vbmVcIjtcclxuICAgICAgICB0aGlzLnRvb2xiYXJEZXNrdG9wU2hhcmVCdXR0b25FbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBoYXNWaWRlb1RyYWNrID8gXCJpbmxpbmUtYmxvY2tcIiA6IFwibm9uZVwiO1xyXG4gICAgICAgIHRoaXMudG9vbGJhckF1ZGlvQnV0dG9uRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gaGFzQXVkaW9UcmFjayA/IFwiaW5saW5lLWJsb2NrXCIgOiBcIm5vbmVcIjtcclxuICAgICAgICBpZiAoYXVkaW9NdXRlZCkge1xyXG4gICAgICAgICAgICAkKHRoaXMudG9vbGJhckF1ZGlvQnV0dG9uRWxlbWVudCkuZmluZChcInBhdGhcIikuYXR0cihcImRcIiwgdmVjdG9yX2ljb25fMS5WZWN0b3JJY29uLkFVRElPX01VVEVfSUNPTik7XHJcbiAgICAgICAgICAgICQodGhpcy50b29sYmFyQXVkaW9CdXR0b25FbGVtZW50KS5hZGRDbGFzcyhcIm11dGVkXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgJCh0aGlzLnRvb2xiYXJBdWRpb0J1dHRvbkVsZW1lbnQpLmZpbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIHZlY3Rvcl9pY29uXzEuVmVjdG9ySWNvbi5BVURJT19VTk1VVEVfSUNPTik7XHJcbiAgICAgICAgICAgICQodGhpcy50b29sYmFyQXVkaW9CdXR0b25FbGVtZW50KS5yZW1vdmVDbGFzcyhcIm11dGVkXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmlkZW9NdXRlZCkge1xyXG4gICAgICAgICAgICAkKHRoaXMudG9vbGJhclZpZGVvQnV0dG9uRWxlbWVudCkuZmluZChcInBhdGhcIikuYXR0cihcImRcIiwgdmVjdG9yX2ljb25fMS5WZWN0b3JJY29uLlZJREVPX01VVEVfSUNPTik7XHJcbiAgICAgICAgICAgICQodGhpcy50b29sYmFyVmlkZW9CdXR0b25FbGVtZW50KS5hZGRDbGFzcyhcIm11dGVkXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgJCh0aGlzLnRvb2xiYXJWaWRlb0J1dHRvbkVsZW1lbnQpLmZpbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIHZlY3Rvcl9pY29uXzEuVmVjdG9ySWNvbi5WSURFT19VTk1VVEVfSUNPTik7XHJcbiAgICAgICAgICAgICQodGhpcy50b29sYmFyVmlkZW9CdXR0b25FbGVtZW50KS5yZW1vdmVDbGFzcyhcIm11dGVkXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVzZXJMaXN0VG9nZ2xlQnV0dG9uRWxlbWVudC5zdHlsZS52aXNpYmlsaXR5ID0gKG15SW5mby5Jc0hvc3QpID8gXCJ2aXNpYmxlXCIgOiBcImhpZGRlblwiO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuc2V0U2NyZWVuU2hhcmUgPSBmdW5jdGlvbiAob24pIHtcclxuICAgICAgICBpZiAob24pIHtcclxuICAgICAgICAgICAgJChcIi50b29sYm94LWljb25cIiwgdGhpcy50b29sYmFyRGVza3RvcFNoYXJlQnV0dG9uRWxlbWVudCkuYWRkQ2xhc3MoXCJ0b2dnbGVkXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgJChcIi50b29sYm94LWljb25cIiwgdGhpcy50b29sYmFyRGVza3RvcFNoYXJlQnV0dG9uRWxlbWVudCkucmVtb3ZlQ2xhc3MoXCJ0b2dnbGVkXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLnNldFJlY29yZGluZyA9IGZ1bmN0aW9uIChvbikge1xyXG4gICAgICAgIGlmIChvbikge1xyXG4gICAgICAgICAgICAkKFwiLnRvb2xib3gtaWNvblwiLCB0aGlzLnRvb2xiYXJSZWNvcmRCdXR0b25FbGVtZW50KS5hZGRDbGFzcyhcInRvZ2dsZWRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAkKFwiLnRvb2xib3gtaWNvblwiLCB0aGlzLnRvb2xiYXJSZWNvcmRCdXR0b25FbGVtZW50KS5yZW1vdmVDbGFzcyhcInRvZ2dsZWRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuZ2V0U2hvcnROYW1lID0gZnVuY3Rpb24gKGZ1bGxOYW1lKSB7XHJcbiAgICAgICAgaWYgKCFmdWxsTmFtZSB8fCBmdWxsTmFtZS5sZW5ndGggPD0gMSlcclxuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICByZXR1cm4gZnVsbE5hbWUudG9VcHBlckNhc2UoKS5zdWJzdHIoMCwgMik7XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5zaG93TW9kZXJhdG9ySWNvbiA9IGZ1bmN0aW9uIChwYW5lbCwgc2hvdykge1xyXG4gICAgICAgIHRoaXMuX2dldE1vZGVyYXRvclN0YXJFbGVtZW50RnJvbVBhbmVsKHBhbmVsKS5zdHlsZS5kaXNwbGF5ID0gc2hvdyA/IFwiYmxvY2tcIiA6IFwibm9uZVwiO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuc2V0UGFuZWxTdGF0ZSA9IGZ1bmN0aW9uIChwYW5lbCwgc3RhdGUpIHtcclxuICAgICAgICBwYW5lbC5zZXRBdHRyaWJ1dGUoXCJ2aWRlby1zdGF0ZVwiLCBcIlwiICsgc3RhdGUpO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuZ2V0UGFuZWxTdGF0ZSA9IGZ1bmN0aW9uIChwYW5lbCkge1xyXG4gICAgICAgIHZhciB2aWRlb1N0YXRlID0gcGFuZWwuZ2V0QXR0cmlidXRlKFwidmlkZW8tc3RhdGVcIik7XHJcbiAgICAgICAgcmV0dXJuIHZpZGVvU3RhdGU7XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5yZWZyZXNoQ2FyZFZpZXdzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vbWFyZ2luXHJcbiAgICAgICAgdmFyIGd1dHRlciA9IDQwO1xyXG4gICAgICAgIHZhciB3aWR0aCA9ICQoXCIjY29udGVudFwiKS53aWR0aCgpIC0gZ3V0dGVyO1xyXG4gICAgICAgIHZhciBoZWlnaHQgPSAkKFwiI2NvbnRlbnRcIikuaGVpZ2h0KCkgLSBndXR0ZXI7XHJcbiAgICAgICAgLy9udW1iZXIgb2YgdmlkZW8gcGFuZWxzXHJcbiAgICAgICAgdmFyIHBhbmVsQ291bnQgPSAkKFwiLlwiICsgdGhpcy5wYW5lbENsYXNzKS5sZW5ndGg7XHJcbiAgICAgICAgLy9jaGF0dGluZyBkaWFsb2dcclxuICAgICAgICB2YXIgY2hhdHRpbmdXaWR0aCA9IDMxNTtcclxuICAgICAgICBpZiAoJChcIiN2aWRlby1wYW5lbFwiKS5oYXNDbGFzcyhcInNoaWZ0LXJpZ2h0XCIpKSB7XHJcbiAgICAgICAgICAgIHdpZHRoIC09IGNoYXR0aW5nV2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vd2lkdGgsIGhlaWdodCBvZiBlYWNoIHZpZGVvIHBhbmVsXHJcbiAgICAgICAgdmFyIHcsIGg7XHJcbiAgICAgICAgLy9pZiBmdWxsc2NyZWVuIG1vZGUsIGhpZGUgb3RoZXIgdmlkZW8gcGFuZWxzXHJcbiAgICAgICAgaWYgKCQoXCIuXCIgKyB0aGlzLnBhbmVsQ2xhc3MpLmhhc0NsYXNzKHRoaXMuZnVsbHNjcmVlbkNsYXNzKSkge1xyXG4gICAgICAgICAgICAkKFwiLlwiICsgdGhpcy5wYW5lbENsYXNzKS5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcclxuICAgICAgICAgICAgJChcIi5cIiArIHRoaXMuZnVsbHNjcmVlbkNsYXNzKS5jc3MoXCJkaXNwbGF5XCIsIFwiaW5saW5lLWJsb2NrXCIpLmNzcyhcImhlaWdodFwiLCBoZWlnaHQgKyBndXR0ZXIgLSA2KS5jc3MoXCJ3aWR0aFwiLCB3aWR0aCArIGd1dHRlcik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy9zaG93IGFsbCB2aWRlbyBwYW5lbHNcclxuICAgICAgICAkKFwiLlwiICsgdGhpcy5wYW5lbENsYXNzKS5jc3MoXCJkaXNwbGF5XCIsIFwiaW5saW5lLWJsb2NrXCIpO1xyXG4gICAgICAgIHZhciBjb2x1bW5Db3VudCA9IDE7XHJcbiAgICAgICAgdmFyIHJvd0NvdW50ID0gMTtcclxuICAgICAgICB2YXIgU00gPSA1NzY7XHJcbiAgICAgICAgdmFyIE1EID0gNzY4O1xyXG4gICAgICAgIHZhciBMRyA9IDk5MjtcclxuICAgICAgICB2YXIgWEwgPSAxMjAwO1xyXG4gICAgICAgIHZhciBYWEwgPSAxNDAwO1xyXG4gICAgICAgIGlmICh3aWR0aCA8IFNNKSB7XHJcbiAgICAgICAgICAgIGNvbHVtbkNvdW50ID0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAod2lkdGggPCBMRykge1xyXG4gICAgICAgICAgICBpZiAocGFuZWxDb3VudCA8PSAxKVxyXG4gICAgICAgICAgICAgICAgY29sdW1uQ291bnQgPSAxO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBjb2x1bW5Db3VudCA9IDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAocGFuZWxDb3VudCA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAod2lkdGggPCBYWEwpXHJcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uQ291bnQgPSAxO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbkNvdW50ID0gMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChwYW5lbENvdW50IDw9IDQpXHJcbiAgICAgICAgICAgICAgICBjb2x1bW5Db3VudCA9IDI7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHBhbmVsQ291bnQgPD0gOSlcclxuICAgICAgICAgICAgICAgIGNvbHVtbkNvdW50ID0gMztcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgY29sdW1uQ291bnQgPSA0O1xyXG4gICAgICAgIH1cclxuICAgICAgICByb3dDb3VudCA9IE1hdGguZmxvb3IoKHBhbmVsQ291bnQgLSAxKSAvIGNvbHVtbkNvdW50KSArIDE7XHJcbiAgICAgICAgaWYgKHdpZHRoIDwgNTc2KSB7XHJcbiAgICAgICAgICAgIHcgPSB3aWR0aDtcclxuICAgICAgICAgICAgaCA9IHcgKiA5IC8gMTY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBcclxuICAgICAgICAgICAgaWYgKHdpZHRoICogcm93Q291bnQgKiA5ID4gaGVpZ2h0ICogY29sdW1uQ291bnQgKiAxNikge1xyXG4gICAgICAgICAgICAgICAgaCA9IGhlaWdodCAvIHJvd0NvdW50O1xyXG4gICAgICAgICAgICAgICAgdyA9IGggKiAxNiAvIDk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB3ID0gd2lkdGggLyBjb2x1bW5Db3VudDtcclxuICAgICAgICAgICAgICAgIGggPSB3ICogOSAvIDE2O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoXCIuXCIgKyB0aGlzLnBhbmVsQ2xhc3MpXHJcbiAgICAgICAgICAgIC5jc3MoXCJ3aWR0aFwiLCB3KVxyXG4gICAgICAgICAgICAuY3NzKFwiaGVpZ2h0XCIsIGgpXHJcbiAgICAgICAgICAgIC5maW5kKFwiLmF2YXRhci1jb250YWluZXJcIilcclxuICAgICAgICAgICAgLmNzcyhcIndpZHRoXCIsIGggLyAyKVxyXG4gICAgICAgICAgICAuY3NzKFwiaGVpZ2h0XCIsIGggLyAyKTtcclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLmFkZE5ld1BhbmVsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBjb3VudCA9ICQoXCIuXCIgKyB0aGlzLnBhbmVsQ2xhc3MpLmxlbmd0aDtcclxuICAgICAgICBpZiAoY291bnQgPj0gdGhpcy5NQVhfUEFORUxTKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgdmFyIGlzU3BlYWsgPSBmYWxzZTtcclxuICAgICAgICB2YXIgaXNEaXNhYmxlQ2FtZXJhID0gdHJ1ZTtcclxuICAgICAgICB2YXIgYWN0aXZlU3BlYWtlciA9ICcnO1xyXG4gICAgICAgIGlmIChpc1NwZWFrKSB7XHJcbiAgICAgICAgICAgIGFjdGl2ZVNwZWFrZXIgPSBcImFjdGl2ZS1zcGVha2VyXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBhdmF0YXJWaXNpYmxlID0gJyc7XHJcbiAgICAgICAgdmFyIGNhbWVyYVN0YXR1cyA9ICcnO1xyXG4gICAgICAgICsrdGhpcy5uUGFuZWxJbnN0YW5jZUlkO1xyXG4gICAgICAgIHZhciB2aWRlb1RhZyA9IFwiPHZpZGVvIGF1dG9wbGF5IHBsYXlzaW5saW5lICBjbGFzcz0nXCIgKyB0aGlzLnZpZGVvRWxlbWVudENsYXNzICsgXCInIGlkPSdyZW1vdGVWaWRlb19cIiArIHRoaXMublBhbmVsSW5zdGFuY2VJZCArIFwiJz48L3ZpZGVvPlwiO1xyXG4gICAgICAgIHZhciBhdWRpb1RhZyA9IFwiPGF1ZGlvIGF1dG9wbGF5PVxcXCJcXFwiIGlkPVxcXCJyZW1vdGVBdWRpb19cIiArIHRoaXMublBhbmVsSW5zdGFuY2VJZCArIFwiXFxcIj48L2F1ZGlvPlwiO1xyXG4gICAgICAgIGlmIChpc0Rpc2FibGVDYW1lcmEpIHtcclxuICAgICAgICAgICAgYXZhdGFyVmlzaWJsZSA9ICd2aXNpYmxlJztcclxuICAgICAgICAgICAgY2FtZXJhU3RhdHVzID0gJzxkaXYgY2xhc3M9XCJpbmRpY2F0b3ItY29udGFpbmVyIHZpZGVvTXV0ZWRcIj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpbmRpY2F0b3ItaWNvbi1jb250YWluZXIgIHRvb2xiYXItaWNvblwiIGlkPVwiXCI+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJqaXRzaS1pY29uIFwiPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyBoZWlnaHQ9XCIxM1wiIGlkPVwiY2FtZXJhLWRpc2FibGVkXCIgd2lkdGg9XCIxM1wiIHZpZXdCb3g9XCIwIDAgMzIgMzJcIj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTQuMzc1IDIuNjg4TDI4IDI2LjMxM2wtMS42ODggMS42ODgtNC4yNS00LjI1Yy0uMTg4LjEyNS0uNS4yNS0uNzUuMjVoLTE2Yy0uNzUgMC0xLjMxMy0uNTYzLTEuMzEzLTEuMzEzVjkuMzEzYzAtLjc1LjU2My0xLjMxMyAxLjMxMy0xLjMxM2gxTDIuNjg3IDQuMzc1em0yMy42MjUgNnYxNC4yNUwxMy4wNjIgOGg4LjI1Yy43NSAwIDEuMzc1LjU2MyAxLjM3NSAxLjMxM3Y0LjY4OHpcIj48L3BhdGg+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBtaWNTdGF0dXMgPSAnPGRpdiBjbGFzcz1cImluZGljYXRvci1jb250YWluZXIgYXVkaW9NdXRlZFwiPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImluZGljYXRvci1pY29uLWNvbnRhaW5lciAgdG9vbGJhci1pY29uXCIgaWQ9XCJcIj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImppdHNpLWljb24gXCI+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGhlaWdodD1cIjEzXCIgaWQ9XCJtaWMtZGlzYWJsZWRcIiB3aWR0aD1cIjEzXCIgdmlld0JveD1cIjAgMCAzMiAzMlwiPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNNS42ODggNGwyMi4zMTMgMjIuMzEzLTEuNjg4IDEuNjg4LTUuNTYzLTUuNTYzYy0xIC42MjUtMi4yNSAxLTMuNDM4IDEuMTg4djQuMzc1aC0yLjYyNXYtNC4zNzVjLTQuMzc1LS42MjUtOC00LjM3NS04LTguOTM4aDIuMjVjMCA0IDMuMzc1IDYuNzUgNy4wNjMgNi43NSAxLjA2MyAwIDIuMTI1LS4yNSAzLjA2My0uNjg4bC0yLjE4OC0yLjE4OGMtLjI1LjA2My0uNTYzLjEyNS0uODc1LjEyNS0yLjE4OCAwLTQtMS44MTMtNC00di0xbC04LTh6TTIwIDE0Ljg3NWwtOC03LjkzOHYtLjI1YzAtMi4xODggMS44MTMtNCA0LTRzNCAxLjgxMyA0IDR2OC4xODh6bTUuMzEzLS4xODdhOC44MjQgOC44MjQgMCAwMS0xLjE4OCA0LjM3NUwyMi41IDE3LjM3NWMuMzc1LS44MTMuNTYzLTEuNjg4LjU2My0yLjY4OGgyLjI1elwiPjwvcGF0aD4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+JztcclxuICAgICAgICB2YXIgbW9kZXJhdG9yU3RhdHVzID0gJzxkaXYgY2xhc3M9XCJtb2RlcmF0b3ItaWNvbiByaWdodFwiPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpbmRpY2F0b3ItY29udGFpbmVyXCI+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImluZGljYXRvci1pY29uLWNvbnRhaW5lciBmb2N1c2luZGljYXRvciB0b29sYmFyLWljb25cIiBpZD1cIlwiPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJqaXRzaS1pY29uIFwiPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGhlaWdodD1cIjEzXCIgd2lkdGg9XCIxM1wiIHZpZXdCb3g9XCIwIDAgMzIgMzJcIj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMTYgMjAuNTYzbDUgMy0xLjMxMy01LjY4OEwyNC4xMjUgMTRsLTUuODc1LS41TDE2IDguMTI1IDEzLjc1IDEzLjVsLTUuODc1LjUgNC40MzggMy44NzVMMTEgMjMuNTYzem0xMy4zMTMtOC4yNWwtNy4yNSA2LjMxMyAyLjE4OCA5LjM3NS04LjI1LTUtOC4yNSA1IDIuMTg4LTkuMzc1LTcuMjUtNi4zMTMgOS41NjMtLjgxMyAzLjc1LTguODEzIDMuNzUgOC44MTN6XCI+PC9wYXRoPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4nO1xyXG4gICAgICAgIHZhciBwYW5lbEh0bWwgPSBcIlxcbiAgICAgICAgPHNwYW4gY2xhc3M9XFxcIlwiICsgdGhpcy5wYW5lbENsYXNzICsgXCIgZGlzcGxheS12aWRlbyBcIiArIGFjdGl2ZVNwZWFrZXIgKyBcIlxcXCI+XFxuICAgICAgICAgICAgXCIgKyB2aWRlb1RhZyArIFwiIFxcbiAgICAgICAgICAgIFwiICsgYXVkaW9UYWcgKyBcIlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInZpZGVvY29udGFpbmVyX190b29sYmFyXFxcIj5cXG4gICAgICAgICAgICAgICAgPGRpdj4gXCIgKyBjYW1lcmFTdGF0dXMgKyBcIiBcIiArIG1pY1N0YXR1cyArIFwiIFwiICsgbW9kZXJhdG9yU3RhdHVzICsgXCI8L2Rpdj5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ2aWRlb2NvbnRhaW5lcl9faG92ZXJPdmVybGF5XFxcIj48L2Rpdj5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJkaXNwbGF5TmFtZUNvbnRhaW5lclxcXCI+PHNwYW4gY2xhc3M9XFxcImRpc3BsYXluYW1lXFxcIiBpZD1cXFwibG9jYWxEaXNwbGF5TmFtZVxcXCI+TmFtZTwvc3Bhbj48L2Rpdj5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJhdmF0YXItY29udGFpbmVyIFwiICsgYXZhdGFyVmlzaWJsZSArIFwiXFxcIiBzdHlsZT1cXFwiaGVpZ2h0OiAxMDUuNXB4OyB3aWR0aDogMTA1LjVweDtcXFwiPlxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJhdmF0YXIgIHVzZXJBdmF0YXJcXFwiIHN0eWxlPVxcXCJiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIzNCwgMjU1LCAxMjgsIDAuNCk7IGZvbnQtc2l6ZTogMTgwJTsgaGVpZ2h0OiAxMDAlOyB3aWR0aDogMTAwJTtcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgPHN2ZyBjbGFzcz1cXFwiYXZhdGFyLXN2Z1xcXCIgdmlld0JveD1cXFwiMCAwIDEwMCAxMDBcXFwiIHhtbG5zPVxcXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1xcXCIgeG1sbnM6eGxpbms9XFxcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZXh0IGRvbWluYW50LWJhc2VsaW5lPVxcXCJjZW50cmFsXFxcIiBmaWxsPVxcXCJyZ2JhKDI1NSwyNTUsMjU1LC42KVxcXCIgZm9udC1zaXplPVxcXCI0MHB0XFxcIiB0ZXh0LWFuY2hvcj1cXFwibWlkZGxlXFxcIiB4PVxcXCI1MFxcXCIgeT1cXFwiNTBcXFwiPk5hbWU8L3RleHQ+XFxuICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgPC9kaXYgPlxcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJcIiArIHRoaXMucG9wdXBNZW51QnV0dG9uQ2xhc3MgKyBcIlxcXCI+XFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcIlxcXCIgaWQ9XFxcIlxcXCI+XFxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwicG9wb3Zlci10cmlnZ2VyIHJlbW90ZS12aWRlby1tZW51LXRyaWdnZXJcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImppdHNpLWljb25cXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGhlaWdodD1cXFwiMWVtXFxcIiB3aWR0aD1cXFwiMWVtXFxcIiB2aWV3Qm94PVxcXCIwIDAgMjQgMjRcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cXFwiTTEyIDE1Ljk4NGMxLjA3OCAwIDIuMDE2LjkzOCAyLjAxNiAyLjAxNnMtLjkzOCAyLjAxNi0yLjAxNiAyLjAxNlM5Ljk4NCAxOS4wNzggOS45ODQgMThzLjkzOC0yLjAxNiAyLjAxNi0yLjAxNnptMC02YzEuMDc4IDAgMi4wMTYuOTM4IDIuMDE2IDIuMDE2cy0uOTM4IDIuMDE2LTIuMDE2IDIuMDE2UzkuOTg0IDEzLjA3OCA5Ljk4NCAxMiAxMC45MjIgOS45ODQgMTIgOS45ODR6bTAtMS45NjhjLTEuMDc4IDAtMi4wMTYtLjkzOC0yLjAxNi0yLjAxNlMxMC45MjIgMy45ODQgMTIgMy45ODRzMi4wMTYuOTM4IDIuMDE2IDIuMDE2UzEzLjA3OCA4LjAxNiAxMiA4LjAxNnpcXFwiPjwvcGF0aD4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiXCIgKyB0aGlzLnBvcHVwTWVudUNsYXNzICsgXCJcXFwiIHN0eWxlPVxcXCJwb3NpdGlvbjogcmVsYXRpdmU7IHJpZ2h0OiAxNjhweDsgIHRvcDogMjVweDsgd2lkdGg6IDE3NXB4O1xcXCI+XFxuICAgICAgICAgICAgICAgICAgICA8dWwgYXJpYS1sYWJlbD1cXFwiTW9yZSBhY3Rpb25zIG1lbnVcXFwiIGNsYXNzPVxcXCJvdmVyZmxvdy1tZW51XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGkgYXJpYS1sYWJlbD1cXFwiR3JhbnQgTW9kZXJhdG9yXFxcIiBjbGFzcz1cXFwib3ZlcmZsb3ctbWVudS1pdGVtIGdyYW50LW1vZGVyYXRvclxcXCIgdGFiaW5kZXg9XFxcIjBcXFwiIHJvbGU9XFxcImJ1dHRvblxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJvdmVyZmxvdy1tZW51LWl0ZW0taWNvblxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJqaXRzaS1pY29uIFxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyBoZWlnaHQ9XFxcIjIyXFxcIiB3aWR0aD1cXFwiMjJcXFwiIHZpZXdCb3g9XFxcIjAgMCAyNCAyNFxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGwtcnVsZT1cXFwiZXZlbm9kZFxcXCIgY2xpcC1ydWxlPVxcXCJldmVub2RkXFxcIiBkPVxcXCJNMTQgNGEyIDIgMCAwMS0xLjI5OCAxLjg3M2wxLjUyNyA0LjA3LjcxNiAxLjkxMmMuMDYyLjA3NC4xMjYuMDc0LjE2NS4wMzVsMS40NDQtMS40NDQgMi4wMzItMi4wMzJhMiAyIDAgMTExLjI0OC41NzlMMTkgMTlhMiAyIDAgMDEtMiAySDdhMiAyIDAgMDEtMi0yTDQuMTY2IDguOTkzYTIgMiAwIDExMS4yNDgtLjU3OWwyLjAzMyAyLjAzM0w4Ljg5IDExLjg5Yy4wODcuMDQyLjE0NS4wMTYuMTY1LS4wMzVsLjcxNi0xLjkxMiAxLjUyNy00LjA3QTIgMiAwIDExMTQgNHpNNi44NCAxN2wtLjM5My00LjcyNSAxLjAyOSAxLjAzYTIuMSAyLjEgMCAwMDMuNDUxLS43NDhMMTIgOS42OTZsMS4wNzMgMi44NmEyLjEgMi4xIDAgMDAzLjQ1MS43NDhsMS4wMy0xLjAzTDE3LjE2IDE3SDYuODR6XFxcIj48L3BhdGg+ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImxhYmVsXFxcIj5HcmFudCBNb2RlcmF0b3I8L3NwYW4+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGkgYXJpYS1sYWJlbD1cXFwiTXV0ZVxcXCIgY2xhc3M9XFxcIm92ZXJmbG93LW1lbnUtaXRlbSBhdWRpby1tdXRlXFxcIiB0YWJpbmRleD1cXFwiMFxcXCIgcm9sZT1cXFwiYnV0dG9uXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcIm92ZXJmbG93LW1lbnUtaXRlbS1pY29uXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImppdHNpLWljb24gXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGZpbGw9XFxcIm5vbmVcXFwiIGhlaWdodD1cXFwiMjJcXFwiIHdpZHRoPVxcXCIyMlxcXCIgdmlld0JveD1cXFwiMCAwIDIyIDIyXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbC1ydWxlPVxcXCJldmVub2RkXFxcIiBjbGlwLXJ1bGU9XFxcImV2ZW5vZGRcXFwiIGQ9XFxcIk03LjMzMyA4LjY1VjExYTMuNjY4IDMuNjY4IDAgMDAyLjc1NyAzLjU1My45MjguOTI4IDAgMDAtLjAwNy4xMTR2MS43NTdBNS41MDEgNS41MDEgMCAwMTUuNSAxMWEuOTE3LjkxNyAwIDEwLTEuODMzIDBjMCAzLjc0IDIuNzk5IDYuODI2IDYuNDE2IDcuMjc3di45NzNhLjkxNy45MTcgMCAwMDEuODM0IDB2LS45NzNhNy4yOTcgNy4yOTcgMCAwMDMuNTY4LTEuNDc1bDMuMDkxIDMuMDkyYS45MzIuOTMyIDAgMTAxLjMxOC0xLjMxOGwtMy4wOTEtMy4wOTEuMDEtLjAxMy0xLjMxMS0xLjMxMS0uMDEuMDEzLTEuMzI1LTEuMzI1LjAwOC0uMDE0LTEuMzk1LTEuMzk1YTEuMjQgMS4yNCAwIDAxLS4wMDQuMDE4bC0zLjYxLTMuNjA5di0uMDIzTDcuMzM0IDUuOTkzdi4wMjNsLTMuOTA5LTMuOTFhLjkzMi45MzIgMCAxMC0xLjMxOCAxLjMxOEw3LjMzMyA4LjY1em0xLjgzNCAxLjgzNFYxMWExLjgzMyAxLjgzMyAwIDAwMi4yOTEgMS43NzZsLTIuMjkxLTIuMjkyem0zLjY4MiAzLjY4M2MtLjI5LjE3LS42MDYuMy0uOTQuMzg2YS45MjguOTI4IDAgMDEuMDA4LjExNHYxLjc1N2E1LjQ3IDUuNDcgMCAwMDIuMjU3LS45MzJsLTEuMzI1LTEuMzI1em0xLjgxOC0zLjQ3NmwtMS44MzQtMS44MzRWNS41YTEuODMzIDEuODMzIDAgMDAtMy42NDQtLjI4N2wtMS40My0xLjQzQTMuNjY2IDMuNjY2IDAgMDExNC42NjcgNS41djUuMTl6bTEuNjY1IDEuNjY1bDEuNDQ3IDEuNDQ3Yy4zNTctLjg2NC41NTQtMS44MS41NTQtMi44MDNhLjkxNy45MTcgMCAxMC0xLjgzMyAwYzAgLjQ2OC0uMDU4LjkyMi0uMTY4IDEuMzU2elxcXCI+PC9wYXRoPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJsYWJlbFxcXCI+TXV0ZTwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBhcmlhLWxhYmVsPVxcXCJEaXNhYmxlIGNhbWVyYVxcXCIgY2xhc3M9XFxcIm92ZXJmbG93LW1lbnUtaXRlbSB2aWRlby1tdXRlXFxcIiB0YWJpbmRleD1cXFwiMFxcXCIgcm9sZT1cXFwiYnV0dG9uXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcIm92ZXJmbG93LW1lbnUtaXRlbS1pY29uXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImppdHNpLWljb25cXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgZmlsbD1cXFwibm9uZVxcXCIgaGVpZ2h0PVxcXCIyMlxcXCIgd2lkdGg9XFxcIjIyXFxcIiB2aWV3Qm94PVxcXCIwIDAgMjIgMjJcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBjbGlwLXJ1bGU9XFxcImV2ZW5vZGRcXFwiIGQ9XFxcIk02Ljg0IDUuNWgtLjAyMkwzLjQyNCAyLjEwNmEuOTMyLjkzMiAwIDEwLTEuMzE4IDEuMzE4TDQuMTgyIDUuNWgtLjUxNWMtMS4wMTMgMC0xLjgzNC44Mi0xLjgzNCAxLjgzM3Y3LjMzNGMwIDEuMDEyLjgyMSAxLjgzMyAxLjgzNCAxLjgzM0gxMy43NWMuNDA0IDAgLjc3Ny0uMTMgMS4wOC0uMzUybDMuNzQ2IDMuNzQ2YS45MzIuOTMyIDAgMTAxLjMxOC0xLjMxOGwtNC4zMS00LjMxdi0uMDI0TDEzLjc1IDEyLjQxdi4wMjNsLTUuMS01LjA5OWguMDI0TDYuODQxIDUuNXptNi45MSA0LjI3NFY3LjMzM2gtMi40NEw5LjQ3NSA1LjVoNC4yNzRjMS4wMTIgMCAxLjgzMy44MiAxLjgzMyAxLjgzM3YuNzg2bDMuMjEyLTEuODM1YS45MTcuOTE3IDAgMDExLjM3Mi43OTZ2Ny44NGMwIC4zNDQtLjE5LjY0NC0uNDcuOGwtMy43MzYtMy43MzUgMi4zNzIgMS4zNTZWOC42NTlsLTIuNzUgMS41NzF2MS4zNzdMMTMuNzUgOS43NzR6TTMuNjY3IDcuMzM0aDIuMzQ5bDcuMzMzIDcuMzMzSDMuNjY3VjcuMzMzelxcXCI+PC9wYXRoPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJsYWJlbFxcXCI+RGlzYWJsZSBjYW1lcmE8L3NwYW4+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGkgYXJpYS1sYWJlbD1cXFwiVG9nZ2xlIGZ1bGwgc2NyZWVuXFxcIiBjbGFzcz1cXFwib3ZlcmZsb3ctbWVudS1pdGVtIGZ1bGxzY3JlZW5cXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwib3ZlcmZsb3ctbWVudS1pdGVtLWljb25cXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiaml0c2ktaWNvbiBcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgZmlsbD1cXFwibm9uZVxcXCIgaGVpZ2h0PVxcXCIyMlxcXCIgd2lkdGg9XFxcIjIyXFxcIiB2aWV3Qm94PVxcXCIwIDAgMjIgMjJcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBjbGlwLXJ1bGU9XFxcImV2ZW5vZGRcXFwiIGQ9XFxcIk04LjI1IDIuNzVIMy42NjdhLjkxNy45MTcgMCAwMC0uOTE3LjkxN1Y4LjI1aDEuODMzVjQuNTgzSDguMjVWMi43NXptNS41IDEuODMzVjIuNzVoNC41ODNjLjUwNyAwIC45MTcuNDEuOTE3LjkxN1Y4LjI1aC0xLjgzM1Y0LjU4M0gxMy43NXptMCAxMi44MzRoMy42NjdWMTMuNzVoMS44MzN2NC41ODNjMCAuNTA3LS40MS45MTctLjkxNy45MTdIMTMuNzV2LTEuODMzek00LjU4MyAxMy43NXYzLjY2N0g4LjI1djEuODMzSDMuNjY3YS45MTcuOTE3IDAgMDEtLjkxNy0uOTE3VjEzLjc1aDEuODMzelxcXCI+PC9wYXRoPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJsYWJlbCBvdmVyZmxvdy1tZW51LWl0ZW0tdGV4dFxcXCI+VmlldyBmdWxsIHNjcmVlbjwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxcbiAgICAgICAgICAgICAgICAgICAgPC91bD5cXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgPC9zcGFuPlxcbiAgICAgICAgPC9zcGFuID5cIjtcclxuICAgICAgICB2YXIgcGFuZWwgPSAkKHBhbmVsSHRtbCk7XHJcbiAgICAgICAgJChcIiNcIiArIHRoaXMucGFuZWxDb250YWluZXJJZCkuYXBwZW5kKHBhbmVsWzBdKTtcclxuICAgICAgICB0aGlzLnJlZnJlc2hDYXJkVmlld3MoKTtcclxuICAgICAgICByZXR1cm4gcGFuZWxbMF07XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5Mb2cgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgICAgIGlmICgkKFwiI2xvZ1BhbmVsXCIpLmxlbmd0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgIHZhciBsb2dQYW5lbCA9IFwiPGRpdiBpZD1cXFwibG9nUGFuZWxcXFwiIHN0eWxlPVxcXCJwb3NpdGlvbjogZml4ZWQ7d2lkdGg6IDMwMHB4O2hlaWdodDogMjAwcHg7YmFja2dyb3VuZDogYmxhY2s7Ym90dG9tOjBweDtyaWdodDogMHB4O1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgei1pbmRleDogMTAwMDAwO2JvcmRlci1sZWZ0OiAxcHggZGFzaGVkIHJlYmVjY2FwdXJwbGU7Ym9yZGVyLXRvcDogMXB4IGRhc2hlZCByZWJlY2NhcHVycGxlO292ZXJmbG93LXk6YXV0bztcXFwiPjwvZGl2PlwiO1xyXG4gICAgICAgICAgICAkKFwiYm9keVwiKS5hcHBlbmQobG9nUGFuZWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgY29sb3JzID0gWydibGFuY2hlZGFsbW9uZCcsICdob3RwaW5rJywgJ2NoYXJ0cmV1c2UnLCAnY29yYWwnLCAnZ29sZCcsICdncmVlbnllbGxvdycsICd2aW9sZXQnLCAnd2hlYXQnXTtcclxuICAgICAgICB2YXIgY29sb3IgPSBjb2xvcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKSAlIGNvbG9ycy5sZW5ndGhdO1xyXG4gICAgICAgIHZhciBtZXNzYWdlSXRtID0gXCI8ZGl2IHN0eWxlPVxcXCJjb2xvcjpcIiArIGNvbG9yICsgXCI7XFxcIj48c3Bhbj5cIiArIG1lc3NhZ2UgKyBcIjwvc3Bhbj48L2Rpdj5cIjtcclxuICAgICAgICAkKFwiI2xvZ1BhbmVsXCIpLmFwcGVuZChtZXNzYWdlSXRtKTtcclxuICAgICAgICAkKCcjbG9nUGFuZWwnKS5zY3JvbGwoKTtcclxuICAgICAgICAkKFwiI2xvZ1BhbmVsXCIpLmFuaW1hdGUoe1xyXG4gICAgICAgICAgICBzY3JvbGxUb3A6IDIwMDAwXHJcbiAgICAgICAgfSwgMjAwKTtcclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLnVwZGF0ZVRpbWUgPSBmdW5jdGlvbiAodGltZUxhYmVsKSB7XHJcbiAgICAgICAgdGhpcy50aW1lc3RhbXBFbGVtZW50LmlubmVySFRNTCA9IHRpbWVMYWJlbDtcclxuICAgICAgICBpZiAoIXRoaXMuaW5pdFRvcEluZm8pIHtcclxuICAgICAgICAgICAgdGhpcy5pbml0VG9wSW5mbyA9IHRydWU7XHJcbiAgICAgICAgICAgICQodGhpcy50b3BJbmZvYmFyRWxlbWVudCkuYWRkQ2xhc3MoXCJ2aXNpYmxlXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLnNob3dNZWV0aW5nU3ViamVjdCA9IGZ1bmN0aW9uIChzdWJqZWN0LCBob3N0TmFtZSkge1xyXG4gICAgICAgIGlmIChzdWJqZWN0ICYmIHN1YmplY3QudHJpbSgpLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgdmFyIHN1YmplY3RMYWJlbCA9IHN1YmplY3QudHJpbSgpO1xyXG4gICAgICAgICAgICBpZiAoaG9zdE5hbWUgJiYgaG9zdE5hbWUudHJpbSgpLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgICAgICBzdWJqZWN0TGFiZWwgKz0gXCIoXCIgKyBob3N0TmFtZS50cmltKCkgKyBcIilcIjtcclxuICAgICAgICAgICAgdGhpcy5zdWJqZWN0RWxlbWVudC5pbm5lckhUTUwgPSBzdWJqZWN0TGFiZWw7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuc2hvd1NldHRpbmdEaWFsb2cgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHNldHRpbmdEaWFsb2cgPSBuZXcgU2V0dGluZ0RpYWxvZ18xLlNldHRpbmdEaWFsb2coKTtcclxuICAgICAgICB2YXIgcHJvcHMgPSBuZXcgU2V0dGluZ0RpYWxvZ18xLlNldHRpbmdEaWFsb2dQcm9wcygpO1xyXG4gICAgICAgIHByb3BzLmN1ckRldmljZXMgPSB0aGlzLm1lZXRpbmcuZ2V0QWN0aXZlRGV2aWNlcygpO1xyXG4gICAgICAgIHByb3BzLm9uRGV2aWNlQ2hhbmdlID0gdGhpcy5tZWV0aW5nLm9uRGV2aWNlQ2hhbmdlLmJpbmQodGhpcy5tZWV0aW5nKTtcclxuICAgICAgICBzZXR0aW5nRGlhbG9nLmluaXQocHJvcHMpO1xyXG4gICAgICAgIHNldHRpbmdEaWFsb2cuc2hvdygpO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUub25DaGF0TWVzc2FnZSA9IGZ1bmN0aW9uIChuYW1lLCBtc2csIHRpbWVzdGFtcCkge1xyXG4gICAgICAgIHRoaXMuY2hhdHRpbmdQYW5lbC5yZWNlaXZlTWVzc2FnZShuYW1lLCBtc2csIHRpbWVzdGFtcCk7XHJcbiAgICB9O1xyXG4gICAgLy9hZGQsIHJlbW92ZSBwYXJ0aWNpcGFudCB0byBhbmQgZnJvbSBsaXN0XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLmFkZFBhcnRpY2lwYW50ID0gZnVuY3Rpb24gKGppdHNpSWQsIG5hbWUsIG1lLCB1c2VDYW1lcmEsIHVzZU1pYykge1xyXG4gICAgICAgIHRoaXMucGFydGljaXBhbnRzTGlzdFBhbmVsLmFkZFBhcnRpY2lwYW50KGppdHNpSWQsIG5hbWUsIG1lLCB1c2VDYW1lcmEsIHVzZU1pYyk7XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5yZW1vdmVQYXJ0aWNpcGFudCA9IGZ1bmN0aW9uIChqaXRzaUlkKSB7XHJcbiAgICAgICAgdGhpcy5wYXJ0aWNpcGFudHNMaXN0UGFuZWwucmVtb3ZlUGFydGljaXBhbnQoaml0c2lJZCk7XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5zaG93UGFydGljaXBhbnRMaXN0QnV0dG9uID0gZnVuY3Rpb24gKHNob3cpIHtcclxuICAgICAgICAkKFwiI29wZW4tcGFydGljaXBhbnRzLXRvZ2dsZVwiKS5jc3MoXCJ2aXNpYmlsaXR5XCIsIHNob3cgPyBcInZpc2libGVcIiA6IFwiaGlkZGVuXCIpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBNZWV0aW5nVUk7XHJcbn0oKSk7XHJcbmV4cG9ydHMuTWVldGluZ1VJID0gTWVldGluZ1VJO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tZWV0aW5nX3VpLmpzLm1hcFxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9mYWtlXzg5YTBmZTY2LmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5BY3RpdmVEZXZpY2VzID0gdm9pZCAwO1xyXG52YXIgQWN0aXZlRGV2aWNlcyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIEFjdGl2ZURldmljZXMoKSB7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gQWN0aXZlRGV2aWNlcztcclxufSgpKTtcclxuZXhwb3J0cy5BY3RpdmVEZXZpY2VzID0gQWN0aXZlRGV2aWNlcztcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9QWN0aXZlRGV2aWNlcy5qcy5tYXBcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbW9kZWxcXFxcQWN0aXZlRGV2aWNlcy5qc1wiLFwiL21vZGVsXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5yYW5kb20gPSBleHBvcnRzLmF2YXRhck5hbWUgPSBleHBvcnRzLnN0cmlwSFRNTFRhZ3MgPSB2b2lkIDA7XHJcbmZ1bmN0aW9uIHN0cmlwSFRNTFRhZ3ModGV4dCkge1xyXG4gICAgcmV0dXJuIHRleHQucmVwbGFjZSgvKDwoW14+XSspPikvZ2ksIFwiXCIpO1xyXG59XHJcbmV4cG9ydHMuc3RyaXBIVE1MVGFncyA9IHN0cmlwSFRNTFRhZ3M7XHJcbi8qXHJcbiBhamF4IGV4YW1wbGVcclxuICQuYWpheCh7XHJcbiAgICAgICAgdXJsOiBcImh0dHA6Ly9sb2NhbGhvc3QvbXlwcm9qZWN0L2FqYXhfdXJsXCIsXHJcbiAgICAgICAgdHlwZTogXCJQT1NUXCIsXHJcbiAgICAgICAgZGF0YTogJChcIiNteS1mb3JtXCIpLnNlcmlhbGl6ZSgpLFxyXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbicsIC8vIGxvd2VyY2FzZSBpcyBhbHdheXMgcHJlZmVyZXJlZCB0aG91Z2ggalF1ZXJ5IGRvZXMgaXQsIHRvby5cclxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbigpe31cclxufSk7XHJcbiBcclxuIFxyXG4gKi9cclxuZnVuY3Rpb24gYXZhdGFyTmFtZShuYW1lKSB7XHJcbiAgICB2YXIgdW5rbm93biA9IFwiP1wiO1xyXG4gICAgaWYgKCFuYW1lIHx8IG5hbWUubGVuZ3RoIDw9IDApXHJcbiAgICAgICAgcmV0dXJuIHVua25vd247XHJcbiAgICB2YXIgbmFtZVBhcnRzID0gbmFtZS5zcGxpdChcIiBcIik7XHJcbiAgICB2YXIgcmVzID0gXCJcIjtcclxuICAgIG5hbWVQYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwKSB7XHJcbiAgICAgICAgaWYgKHAubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgcmVzICs9IHBbMF07XHJcbiAgICB9KTtcclxuICAgIGlmIChyZXMubGVuZ3RoIDw9IDApXHJcbiAgICAgICAgdW5rbm93bjtcclxuICAgIHJldHVybiByZXMudG9VcHBlckNhc2UoKS5zdWJzdHIoMCwgMik7XHJcbn1cclxuZXhwb3J0cy5hdmF0YXJOYW1lID0gYXZhdGFyTmFtZTtcclxudmFyIHJhbmRvbSA9IGZ1bmN0aW9uIChtaW4sIG1heCkgeyByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluOyB9O1xyXG5leHBvcnRzLnJhbmRvbSA9IHJhbmRvbTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c25pcHBldC5qcy5tYXBcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvdXRpbFxcXFxzbmlwcGV0LmpzXCIsXCIvdXRpbFwiKSJdfQ==
