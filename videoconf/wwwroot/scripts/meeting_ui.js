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
exports.AskDialog = exports.AskDialogProps = void 0;
var random_1 = require("../util/random");
var AskDialogProps = /** @class */ (function () {
    function AskDialogProps() {
    }
    return AskDialogProps;
}());
exports.AskDialogProps = AskDialogProps;
var AskDialog = /** @class */ (function () {
    function AskDialog(props) {
        this.props = props;
    }
    AskDialog.prototype.show = function () {
        var _this = this;
        var allowButtonId = "allow-" + random_1.randomNumber();
        var denyButtonId = "deny-" + random_1.randomNumber();
        var content = this.props.message + "\n            <p>\n                <a href=\"#\" id=\"" + allowButtonId + "\" class=\"btn btn-sm\">Accept</button>\n                <a href=\"#\" id=\"" + denyButtonId + "\" class=\"btn btn-sm\">Deny</button>\n            </p>";
        $.toast({
            heading: this.props.title,
            text: content,
            showHideTransition: 'slide',
            hideAfter: false,
            bgColor: this.props.isWarning ? "#800000" : "#164157",
            icon: this.props.icon,
            stack: 5,
            loader: false,
            afterShown: function () {
                _this.allowButtonElement = document.getElementById(allowButtonId);
                _this.denyButtonElement = document.getElementById(denyButtonId);
                _this.root = $(_this.allowButtonElement).closest(".jq-toast-wrap")[0];
                _this.attachHandlers();
            }
        });
    };
    AskDialog.prototype.attachHandlers = function () {
        var _this = this;
        this.allowButtonElement.addEventListener('click', function () {
            if (typeof _this.props.allowCallback === "function")
                _this.props.allowCallback(_this.props.param);
            (_this.root).remove();
        });
        this.denyButtonElement.addEventListener('click', function () {
            if (typeof _this.props.denyCallback === "function") {
                _this.props.denyCallback(_this.props.param);
            }
            $(_this.root).remove();
        });
    };
    return AskDialog;
}());
exports.AskDialog = AskDialog;
//# sourceMappingURL=AskDialog.js.map
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/components\\AskDialog.js","/components")
},{"../util/random":15,"buffer":2,"e/U+97":4}],6:[function(require,module,exports){
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
        this.isPrivate = false;
        this.nameColors = [];
        this.remainColors = [];
    }
    ChattingPanel.prototype.init = function (props) {
        this.props = props;
        this.root = document.getElementById("sideToolbarContainer");
        this.closeButton = document.querySelector(".chat-close-button");
        this.inputField = document.querySelector("#chat-input #usermsg");
        this.sendButton = document.querySelector(".send-button");
        this.privatePanel = document.querySelector("#chat-recipient");
        this.privateLabelElement = $(this.privatePanel).find(">span")[0];
        this.privateCloseElement = $(this.privatePanel).find(">div")[0];
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
                    _this_1.onSend();
                }
            }
        });
        $(this.sendButton).on('click', function () {
            _this_1.onSend();
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
        $(this.privateCloseElement).click(function (_) {
            _this_1.clearPrivateState();
        });
    };
    ChattingPanel.prototype.open = function (opened) {
        if (opened) {
            $("#video-panel").addClass("shift-right");
            $("#new-toolbox").addClass("shift-right");
            $(this.root).removeClass("invisible");
            $(this.inputField).focus();
            $(".toolbox-icon", this.props.chatOpenButton).addClass("toggled");
        }
        else {
            $("#video-panel").removeClass("shift-right");
            $("#new-toolbox").removeClass("shift-right");
            $(this.root).addClass("invisible");
            $(".toolbox-icon", this.props.chatOpenButton).removeClass("toggled");
        }
        this.unreadCount = 0;
        this.showUnreadBadge(false);
        this.opened = opened;
        this.props.openCallback();
    };
    ChattingPanel.prototype.clearInput = function () {
        $(this.inputField).val('');
    };
    ChattingPanel.prototype.showUnreadBadge = function (show) {
        this.props.unreadBadgeElement.style.display = !!show ? "flex" : "none";
    };
    ChattingPanel.prototype.toggleOpen = function () {
        this.opened = !this.opened;
        this.open(this.opened);
    };
    ChattingPanel.prototype.onSend = function () {
        var msg = $(this.inputField).val().toString().trim();
        this.clearInput();
        if (!msg)
            return;
        msg = this.emonameToEmoicon(msg);
        var time = this.getCurTime();
        var privateClass = this.isPrivate ? "private" : "";
        var privateDetail = "";
        if (this.isPrivate) {
            privateDetail = "<div style=\"color:#778899\">private: " + this.privateSenderName + "</div>";
        }
        var sel = $("#chatconversation div.chat-message-group:last-child");
        if (sel.hasClass("local")) {
            sel.find(".timestamp").remove();
            sel.append("<div class= \"chatmessage-wrapper\" >                            <div class=\"chatmessage " + privateClass + "\">                                <div class=\"replywrapper\">                                    <div class=\"messagecontent\">                                        <div class=\"usermessage\"> " + msg + " </div>                                        " + privateDetail + "\n                                    </div>                                </div>                            </div>                            <div class=\"timestamp\"> " + time + " </div>                        </div >");
        }
        else {
            $("#chatconversation").append("<div class=\"chat-message-group local\">                     <div class= \"chatmessage-wrapper\" >                        <div class=\"chatmessage " + privateClass + "\">                            <div class=\"replywrapper\">                                <div class=\"messagecontent\">                                    <div class=\"usermessage\"> " + msg + " </div>                                    " + privateDetail + "\n                                </div>                            </div>                        </div>                        <div class=\"timestamp\"> " + time + " </div>                    </div >                </div>");
        }
        this.scrollToBottom();
        if (this.isPrivate) {
            this.props.sendPrivateChat(this.privateSenderId, msg);
        }
        else {
            this.props.sendChat(msg);
        }
    };
    //chat
    ChattingPanel.prototype.receiveMessage = function (id, username, message, isPrivate) {
        if (isPrivate === void 0) { isPrivate = false; }
        //update unread count
        if (!this.opened) {
            this.unreadCount++;
            $(this.props.unreadBadgeElement).html("" + this.unreadCount);
            this.showUnreadBadge(true);
        }
        //update ui
        var emoMessage = this.emonameToEmoicon(message);
        var nameColor = this.getNameColor(username);
        var privateClass = isPrivate ? "private" : "";
        var replyElem = "";
        if (isPrivate) {
            replyElem = "\n                <span class=\"jitsi-icon\" jitsi-id=\"" + id + "\" jitsi-name=\"" + username + "\">\n                    <svg height=\"22\" width=\"22\" viewBox=\"0 0 36 36\">\n                        <path d=\"M30,29a1,1,0,0,1-.81-.41l-2.12-2.92A18.66,18.66,0,0,0,15,18.25V22a1,1,0,0,1-1.6.8l-12-9a1,1,0,0,1,0-1.6l12-9A1,1,0,0,1,15,4V8.24A19,19,0,0,1,31,27v1a1,1,0,0,1-.69.95A1.12,1.12,0,0,1,30,29ZM14,16.11h.1A20.68,20.68,0,0,1,28.69,24.5l.16.21a17,17,0,0,0-15-14.6,1,1,0,0,1-.89-1V6L3.67,13,13,20V17.11a1,1,0,0,1,.33-.74A1,1,0,0,1,14,16.11Z\"></path>\n                    </svg>\n                </span>";
        }
        var $chatitem = $("<div class=\"chat-message-group remote\">         <div class= \"chatmessage-wrapper\" >                <div class=\"chatmessage " + privateClass + "\">                    <div class=\"replywrapper\">                        <div class=\"messagecontent\">                            <div class=\"display-name\" style=\"color:" + nameColor + "\">" + username + replyElem + '</div>\
                            <div class="usermessage">' + emoMessage + '</div>\
                        </div>\
                    </div>\
                </div>\
                <div class="timestamp">' + this.getCurTime() + '</div>\
            </div >\
        </div>');
        $("#chatconversation").append($chatitem);
        if (isPrivate) {
            var _this_2 = this;
            $chatitem.find(".jitsi-icon").click(function (e) {
                var id = $(this).attr("jitsi-id");
                var name = $(this).attr("jitsi-name");
                _this_2.setPrivateState(id, name);
            });
        }
        this.scrollToBottom();
        if (isPrivate)
            this.setPrivateState(id, username);
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
    ChattingPanel.prototype.setPrivateState = function (jitsiId, name) {
        this.isPrivate = true;
        this.privateSenderId = jitsiId;
        this.privateSenderName = name;
        this.privatePanel.style.display = "flex";
        this.privateLabelElement.innerHTML = "Private message to " + name;
    };
    ChattingPanel.prototype.clearPrivateState = function () {
        this.isPrivate = false;
        this.privateSenderId = null;
        this.privatePanel.style.display = "none";
    };
    return ChattingPanel;
}());
exports.ChattingPanel = ChattingPanel;
//# sourceMappingURL=ChattingPanel.js.map
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/components\\ChattingPanel.js","/components")
},{"../util/snippet":16,"buffer":2,"e/U+97":4}],7:[function(require,module,exports){
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
        if (this.props.me)
            $(this.nameElement).html(this.props.name + " (Me)");
        else
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
        if (!this.isHost)
            return;
        this.useCamera = !this.useCamera;
        this.updateCameraIcon();
        this.props.onUseCamera(this.props.jitsiId, this.useCamera);
    };
    ParticipantItem.prototype.onToggleMic = function () {
        if (!this.isHost)
            return;
        this.useMic = !this.useMic;
        this.updateMicIcon();
        this.props.onUseMic(this.props.jitsiId, this.useMic);
    };
    ParticipantItem.prototype.blockMic = function () {
        if (this.useMic)
            this.onToggleMic();
    };
    ParticipantItem.prototype.setMicState = function (use) {
        this.useMic = use;
        this.updateMicIcon();
    };
    ParticipantItem.prototype.setCameraState = function (use) {
        this.useCamera = use;
        this.updateCameraIcon();
    };
    ParticipantItem.prototype.setRole = function (isHost) {
        this.isHost = isHost;
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
        this.isHost = false;
        this.rootElement = document.getElementById("participants-list");
        var $root = $(this.rootElement);
        this.participantCountElement = $root.find("#participant-count")[0];
        this.participantListElement = $root.find("#participants-list-body")[0];
        this.muteAllButtonElement = $root.find("#participants-list-footer>.btn")[0];
    }
    ParticipantListPanel.prototype.init = function (props) {
        this.props = props;
        this.updateParticipantCount();
        this.attachHandlers();
    };
    ParticipantListPanel.prototype.attachHandlers = function () {
        var _this = this;
        $(this.muteAllButtonElement).on('click', function () {
            if (_this.isHost)
                _this.participantItemMap.forEach(function (participantItem, key) {
                    participantItem.blockMic();
                });
        });
    };
    ParticipantListPanel.prototype.addParticipant = function (jitsiId, name, me, useCamera, useMic) {
        if (this.participantItemMap.has(jitsiId)) {
            this.removeParticipant(jitsiId);
        }
        var props = new ParticipantItemProps();
        props.jitsiId = jitsiId;
        props.name = name;
        props.me = me;
        props.useCamera = useCamera;
        props.useMic = useMic;
        props.onUseCamera = this.props.onUseCamera;
        props.onUseMic = this.props.onUseMic;
        var item = new ParticipantItem(props);
        item.setRole(this.isHost);
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
        if (!this.participantItemMap.has(jitsiId))
            return;
        this.participantItemMap.get(jitsiId).removeSelf();
        this.participantItemMap.delete(jitsiId);
        this.updateParticipantCount();
    };
    ParticipantListPanel.prototype.updateParticipantCount = function () {
        this.participantCountElement.innerHTML = "" + this.participantItemMap.size;
    };
    ParticipantListPanel.prototype.setCameraMediaPolicy = function (jitsiId, useCamera) {
        var item = this.participantItemMap.get(jitsiId);
        if (item)
            item.setCameraState(useCamera);
    };
    ParticipantListPanel.prototype.setMicMediaPolicy = function (jitsiId, useMic) {
        var item = this.participantItemMap.get(jitsiId);
        if (item)
            item.setMicState(useMic);
    };
    ParticipantListPanel.prototype.updateByRole = function (isHost) {
        this.isHost = isHost;
        if (isHost)
            $(this.rootElement).addClass("is-host");
        else
            $(this.rootElement).removeClass("is-host");
        this.muteAllButtonElement.style.visibility = isHost ? "visible" : "hidden";
        this.participantItemMap.forEach(function (participantItem, key) {
            participantItem.setRole(isHost);
        });
    };
    return ParticipantListPanel;
}());
exports.ParticipantListPanel = ParticipantListPanel;
//# sourceMappingURL=ParticipantListPanel.js.map
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/components\\ParticipantListPanel.js","/components")
},{"../util/snippet":16,"./vector_icon":9,"buffer":2,"e/U+97":4}],8:[function(require,module,exports){
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
},{"../enum/MediaType":10,"../model/ActiveDevices":14,"buffer":2,"e/U+97":4}],9:[function(require,module,exports){
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
},{"buffer":2,"e/U+97":4}],10:[function(require,module,exports){
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
},{"buffer":2,"e/U+97":4}],11:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = void 0;
var NotificationType;
(function (NotificationType) {
    NotificationType["User"] = "user";
    NotificationType["GrantHost"] = "host";
    NotificationType["Video"] = "video";
    NotificationType["VideoMute"] = "video-mute";
    NotificationType["Audio"] = "audio";
    NotificationType["AudioMute"] = "audio-mute";
    NotificationType["Recording"] = "recording";
    NotificationType["Chat"] = "chat";
    NotificationType["Info"] = "info";
    NotificationType["Warning"] = "warning";
})(NotificationType = exports.NotificationType || (exports.NotificationType = {}));
;
//# sourceMappingURL=NotificationType.js.map
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/enum\\NotificationType.js","/enum")
},{"buffer":2,"e/U+97":4}],12:[function(require,module,exports){
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
},{"buffer":2,"e/U+97":4}],13:[function(require,module,exports){
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
var NotificationType_1 = require("./enum/NotificationType");
var snippet_1 = require("./util/snippet");
var AskDialog_1 = require("./components/AskDialog");
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
        this.privateChatClass = "private-chat";
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
        props.sendPrivateChat = this.meeting.sendPrivateChatMessage.bind(this.meeting);
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
            document.addEventListener('click', function (e) {
                var inside = $(e.target).closest("." + _this_1.popupMenuClass).length > 0;
                if (!inside) {
                    $("." + _this_1.popupMenuClass).removeClass("visible");
                }
            });
        });
    };
    MeetingUI.prototype.updateByRole = function (isHost) {
        var isWebinar = this.meeting.roomInfo.IsWebinar;
        if (isWebinar && !isHost)
            this.showParticipantListButton(false);
        else
            this.showParticipantListButton(true);
        this.participantsListPanel.updateByRole(isHost);
    };
    MeetingUI.prototype.registerPanelEventHandler = function (panel) {
        var _this = this;
        $(panel)
            .on('click', "." + _this.popupMenuButtonClass, function (e) {
            $("." + _this.popupMenuClass).removeClass("visible");
            $(this).find("." + _this.popupMenuClass).addClass("visible").focus();
            e.stopPropagation();
        })
            .on('click', 'li.overflow-menu-item', function (e) {
            $(this).closest("." + _this.popupMenuClass).removeClass("visible");
            e.stopPropagation();
        })
            .on('click', '.fullscreen', function (e) {
            $(panel).toggleClass(_this.fullscreenClass);
            _this.refreshCardViews();
            var label = $(this).find(".label");
            if ($(panel).hasClass(_this.fullscreenClass)) {
                label.html("Exit full screen");
            }
            else {
                label.html("View full screen");
            }
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
            $(this).find(".fullscreen").trigger("click");
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
        //private chat handler
        $(panel).find("." + this.privateChatClass).click(function (_) {
            _this_1.chattingPanel.open(true);
            _this_1.chattingPanel.setPrivateState(user.getId(), user.getDisplayName());
        });
        //active speaker(blue border)
        $(panel).removeClass(this.activeSpeakerClass);
    };
    MeetingUI.prototype.updatePanelOnMyBGUser = function (videoElem, myInfo, localTracks) {
        var _this_1 = this;
        var panel = this._getPanelFromVideoElement(videoElem);
        if (!panel)
            return;
        var audioMuted = true, videoMuted = true;
        localTracks.forEach(function (track) {
            if (track.getType() === MediaType_1.MediaType.VIDEO && !track.isMuted())
                videoMuted = false;
            else if (track.getType() === MediaType_1.MediaType.AUDIO && !track.isMuted())
                audioMuted = false;
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
        //bottom small icons
        this._getVideoMuteElementFromPanel(panel).style.display = videoMuted ? "block" : "none";
        this._getAudioMuteElementFromPanel(panel).style.display = audioMuted ? "block" : "none";
        this._getModeratorStarElementFromPanel(panel).style.display = myInfo.IsHost ? "block" : "none";
        //popup menu
        var audioMutePopupMenu = this._getPopupMenuAudioMuteFromPanel(panel);
        var videoMutePopupMenu = this._getPopupMenuVideoMuteFromPanel(panel);
        var grantModeratorPopupMenu = this._getPopupMenuGrantModeratorFromPanel(panel);
        if (myInfo.IsHost) {
            videoMutePopupMenu.style.display = myInfo.mediaPolicy.useCamera ? "flex" : "none";
            audioMutePopupMenu.style.display = myInfo.mediaPolicy.useMic ? "flex" : "none";
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
            if (audioMuted) {
                $(audioMutePopupMenu).find(".label").html("Unmute Audio");
                $(audioMutePopupMenu).find("path").attr("d", vector_icon_1.VectorIcon.AUDIO_MUTE_ICON);
            }
            else {
                $(audioMutePopupMenu).find(".label").html("Mute Audio");
                $(audioMutePopupMenu).find("path").attr("d", vector_icon_1.VectorIcon.AUDIO_UNMUTE_ICON);
            }
        }
        if (videoMutePopupMenu.style.display === 'flex') {
            if (videoMuted) {
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
        //hide private-chat item
        $(panel).find("." + this.privateChatClass).hide();
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
        $("text", shortNamePanel).html(snippet_1.avatarName(name));
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
        var panelHtml = "\n        <span class=\"" + this.panelClass + " display-video " + activeSpeaker + "\">\n            " + videoTag + " \n            " + audioTag + "\n            <div class=\"videocontainer__toolbar\">\n                <div> " + cameraStatus + " " + micStatus + " " + moderatorStatus + "</div>\n            </div>\n            <div class=\"videocontainer__hoverOverlay\"></div>\n            <div class=\"displayNameContainer\"><span class=\"displayname\" id=\"localDisplayName\">Name</span></div>\n            <div class=\"avatar-container " + avatarVisible + "\" style=\"height: 105.5px; width: 105.5px;\">\n                <div class=\"avatar  userAvatar\" style=\"background-color: rgba(234, 255, 128, 0.4); font-size: 180%; height: 100%; width: 100%;\">\n                    <svg class=\"avatar-svg\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n                        <text dominant-baseline=\"central\" fill=\"rgba(255,255,255,.6)\" font-size=\"40pt\" text-anchor=\"middle\" x=\"50\" y=\"50\">Name</text>\n                    </svg>\n                </div>\n            </div >\n            <span class=\"" + this.popupMenuButtonClass + "\">\n                <div class=\"\" id=\"\">\n                    <span class=\"popover-trigger remote-video-menu-trigger\">\n                        <div class=\"jitsi-icon\">\n                            <svg height=\"1em\" width=\"1em\" viewBox=\"0 0 24 24\">\n                                <path d=\"M12 15.984c1.078 0 2.016.938 2.016 2.016s-.938 2.016-2.016 2.016S9.984 19.078 9.984 18s.938-2.016 2.016-2.016zm0-6c1.078 0 2.016.938 2.016 2.016s-.938 2.016-2.016 2.016S9.984 13.078 9.984 12 10.922 9.984 12 9.984zm0-1.968c-1.078 0-2.016-.938-2.016-2.016S10.922 3.984 12 3.984s2.016.938 2.016 2.016S13.078 8.016 12 8.016z\"></path>                             </svg>\n                        </div>\n                    </span>\n                </div>\n                <div class=\"" + this.popupMenuClass + "\" tabIndex=-1 style=\"position: relative; right: 168px;  top: 25px; width: 175px;\">\n                    <ul aria-label=\"More actions menu\" class=\"overflow-menu\">\n                        <li aria-label=\"Grant Moderator\" class=\"overflow-menu-item grant-moderator\" tabindex=\"0\" role=\"button\">\n                            <span class=\"overflow-menu-item-icon\">\n                                <div class=\"jitsi-icon \">\n                                    <svg height=\"22\" width=\"22\" viewBox=\"0 0 24 24\">\n                                        <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M14 4a2 2 0 01-1.298 1.873l1.527 4.07.716 1.912c.062.074.126.074.165.035l1.444-1.444 2.032-2.032a2 2 0 111.248.579L19 19a2 2 0 01-2 2H7a2 2 0 01-2-2L4.166 8.993a2 2 0 111.248-.579l2.033 2.033L8.89 11.89c.087.042.145.016.165-.035l.716-1.912 1.527-4.07A2 2 0 1114 4zM6.84 17l-.393-4.725 1.029 1.03a2.1 2.1 0 003.451-.748L12 9.696l1.073 2.86a2.1 2.1 0 003.451.748l1.03-1.03L17.16 17H6.84z\"></path>                                     </svg>\n                                </div>\n                            </span>\n                            <span class=\"label\">Grant Moderator</span>\n                        </li>\n                        <li aria-label=\"Mute\" class=\"overflow-menu-item audio-mute\" tabindex=\"0\" role=\"button\">\n                            <span class=\"overflow-menu-item-icon\">\n                                <div class=\"jitsi-icon \">\n                                    <svg fill=\"none\" height=\"22\" width=\"22\" viewBox=\"0 0 22 22\">\n                                        <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M7.333 8.65V11a3.668 3.668 0 002.757 3.553.928.928 0 00-.007.114v1.757A5.501 5.501 0 015.5 11a.917.917 0 10-1.833 0c0 3.74 2.799 6.826 6.416 7.277v.973a.917.917 0 001.834 0v-.973a7.297 7.297 0 003.568-1.475l3.091 3.092a.932.932 0 101.318-1.318l-3.091-3.091.01-.013-1.311-1.311-.01.013-1.325-1.325.008-.014-1.395-1.395a1.24 1.24 0 01-.004.018l-3.61-3.609v-.023L7.334 5.993v.023l-3.909-3.91a.932.932 0 10-1.318 1.318L7.333 8.65zm1.834 1.834V11a1.833 1.833 0 002.291 1.776l-2.291-2.292zm3.682 3.683c-.29.17-.606.3-.94.386a.928.928 0 01.008.114v1.757a5.47 5.47 0 002.257-.932l-1.325-1.325zm1.818-3.476l-1.834-1.834V5.5a1.833 1.833 0 00-3.644-.287l-1.43-1.43A3.666 3.666 0 0114.667 5.5v5.19zm1.665 1.665l1.447 1.447c.357-.864.554-1.81.554-2.803a.917.917 0 10-1.833 0c0 .468-.058.922-.168 1.356z\"></path>                                     </svg>\n                                </div>\n                            </span>\n                            <span class=\"label\">Mute</span>\n                        </li>\n                        <li aria-label=\"Disable camera\" class=\"overflow-menu-item video-mute\" tabindex=\"0\" role=\"button\">\n                            <span class=\"overflow-menu-item-icon\">\n                                <div class=\"jitsi-icon\">\n                                    <svg fill=\"none\" height=\"22\" width=\"22\" viewBox=\"0 0 22 22\">\n                                        <path clip-rule=\"evenodd\" d=\"M6.84 5.5h-.022L3.424 2.106a.932.932 0 10-1.318 1.318L4.182 5.5h-.515c-1.013 0-1.834.82-1.834 1.833v7.334c0 1.012.821 1.833 1.834 1.833H13.75c.404 0 .777-.13 1.08-.352l3.746 3.746a.932.932 0 101.318-1.318l-4.31-4.31v-.024L13.75 12.41v.023l-5.1-5.099h.024L6.841 5.5zm6.91 4.274V7.333h-2.44L9.475 5.5h4.274c1.012 0 1.833.82 1.833 1.833v.786l3.212-1.835a.917.917 0 011.372.796v7.84c0 .344-.19.644-.47.8l-3.736-3.735 2.372 1.356V8.659l-2.75 1.571v1.377L13.75 9.774zM3.667 7.334h2.349l7.333 7.333H3.667V7.333z\"></path>                                     </svg>\n                                </div>\n                            </span>\n                            <span class=\"label\">Disable camera</span>\n                        </li>\n                        <li aria-label=\"Toggle full screen\" class=\"overflow-menu-item fullscreen\">\n                            <span class=\"overflow-menu-item-icon\">\n                                <div class=\"jitsi-icon \">\n                                    <svg fill=\"none\" height=\"22\" width=\"22\" viewBox=\"0 0 22 22\">\n                                        <path clip-rule=\"evenodd\" d=\"M8.25 2.75H3.667a.917.917 0 00-.917.917V8.25h1.833V4.583H8.25V2.75zm5.5 1.833V2.75h4.583c.507 0 .917.41.917.917V8.25h-1.833V4.583H13.75zm0 12.834h3.667V13.75h1.833v4.583c0 .507-.41.917-.917.917H13.75v-1.833zM4.583 13.75v3.667H8.25v1.833H3.667a.917.917 0 01-.917-.917V13.75h1.833z\"></path>                                     </svg>\n                                </div>\n                            </span>\n                            <span class=\"label overflow-menu-item-text\">View full screen</span>\n                        </li>\n                        <li aria-label=\"Private Chat\" class=\"overflow-menu-item private-chat\">\n                            <span class=\"overflow-menu-item-icon\">\n                                <div class=\"jitsi-icon \">\n                                    <svg fill=\"none\" height=\"22\" width=\"22\" viewBox=\"0 0 22 22\">\n                                        <path clip-rule=\"evenodd\" d=\"M19,8H18V5a3,3,0,0,0-3-3H5A3,3,0,0,0,2,5V17a1,1,0,0,0,.62.92A.84.84,0,0,0,3,18a1,1,0,0,0,.71-.29l2.81-2.82H8v1.44a3,3,0,0,0,3,3h6.92l2.37,2.38A1,1,0,0,0,21,22a.84.84,0,0,0,.38-.08A1,1,0,0,0,22,21V11A3,3,0,0,0,19,8ZM8,11v1.89H6.11a1,1,0,0,0-.71.29L4,14.59V5A1,1,0,0,1,5,4H15a1,1,0,0,1,1,1V8H11A3,3,0,0,0,8,11Zm12,7.59-1-1a1,1,0,0,0-.71-.3H11a1,1,0,0,1-1-1V11a1,1,0,0,1,1-1h8a1,1,0,0,1,1,1Z\"></path>                                     </svg>\n                                </div>\n                            </span>\n                            <span class=\"label overflow-menu-item-text\">Private chat</span>\n                        </li>\n                    </ul>\n                </div>\n            </span>\n        </span >";
        var panel = $(panelHtml);
        $("#" + this.panelContainerId).append(panel[0]);
        this.refreshCardViews();
        return panel[0];
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
    MeetingUI.prototype.Log = function (message) {
        if ($("#logPanel").length <= 0) {
            var logPanel = "<div id=\"logPanel\" style=\"position: fixed;width: 300px;height: 200px;background: black;top:0px;left: 0px;\n                                z-index: 100000;border-right: 1px dashed rebeccapurple;border-bottom: 1px dashed rebeccapurple;overflow-y:auto;\"></div>";
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
    MeetingUI.prototype.askDialog = function (title, message, icon, allowCallback, denyCallback, param) {
        var props = new AskDialog_1.AskDialogProps();
        props.title = title;
        props.message = message;
        props.icon = icon;
        props.isWarning = true;
        props.allowCallback = allowCallback;
        props.denyCallback = denyCallback;
        props.param = param;
        var dlg = new AskDialog_1.AskDialog(props);
        dlg.show();
    };
    MeetingUI.prototype.notification = function (title, message, icon) {
        if (!icon)
            icon = NotificationType_1.NotificationType.Info;
        $.toast({
            heading: title,
            text: message,
            showHideTransition: 'slide',
            hideAfter: false,
            bgColor: "#164157",
            icon: icon,
            stack: 5,
            loader: false,
        });
    };
    MeetingUI.prototype.notification_warning = function (title, message, icon) {
        if (!icon)
            icon = NotificationType_1.NotificationType.Warning;
        $.toast({
            heading: title,
            text: message,
            showHideTransition: 'slide',
            hideAfter: 7000,
            bgColor: "#800000",
            icon: icon,
            stack: 5,
            loader: false
        });
    };
    return MeetingUI;
}());
exports.MeetingUI = MeetingUI;
//# sourceMappingURL=meeting_ui.js.map
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_66af84f7.js","/")
},{"./components/AskDialog":5,"./components/ChattingPanel":6,"./components/ParticipantListPanel":7,"./components/SettingDialog":8,"./components/vector_icon":9,"./enum/MediaType":10,"./enum/NotificationType":11,"./enum/UserProperty":12,"./util/snippet":16,"buffer":2,"e/U+97":4}],14:[function(require,module,exports){
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
},{"buffer":2,"e/U+97":4}],15:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomNumber = void 0;
function randomNumber() {
    return randomFromInterval(1, 100000000);
}
exports.randomNumber = randomNumber;
function randomFromInterval(from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
}
/*interface ProvideFeedbackFormProps {
    feedbackNature: FormikDropdownProps
    waybillNumber: FormikDropdownProps
    provideFeedback: FormikDropdownProps
    editorState?: string
    attachments?: string[]
}


interface FormikDropdownProps {
    id: number
    value: string
}

const values: ProvideFeedbackFormProps = {};
const customFields: string[] = [];

for (const property in values) {
    const customField = values[property as keyof ProvideFeedbackFormProps]
    customFields.push(customField)
}*/ 
//# sourceMappingURL=random.js.map
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/util\\random.js","/util")
},{"buffer":2,"e/U+97":4}],16:[function(require,module,exports){
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
},{"buffer":2,"e/U+97":4}]},{},[13])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkY6XFwxX0JpemdhemVfd2VicnRjXFxfUHJvamVjdFxcYml6Z2F6ZV9tZWV0aW5nXFx2aWRlb2NvbmZcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkY6LzFfQml6Z2F6ZV93ZWJydGMvX1Byb2plY3QvYml6Z2F6ZV9tZWV0aW5nL3ZpZGVvY29uZi9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYi9iNjQuanMiLCJGOi8xX0JpemdhemVfd2VicnRjL19Qcm9qZWN0L2JpemdhemVfbWVldGluZy92aWRlb2NvbmYvbm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qcyIsIkY6LzFfQml6Z2F6ZV93ZWJydGMvX1Byb2plY3QvYml6Z2F6ZV9tZWV0aW5nL3ZpZGVvY29uZi9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIkY6LzFfQml6Z2F6ZV93ZWJydGMvX1Byb2plY3QvYml6Z2F6ZV9tZWV0aW5nL3ZpZGVvY29uZi9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiRjovMV9CaXpnYXplX3dlYnJ0Yy9fUHJvamVjdC9iaXpnYXplX21lZXRpbmcvdmlkZW9jb25mL3NjcmlwdHMvYnVpbGQvY29tcG9uZW50cy9Bc2tEaWFsb2cuanMiLCJGOi8xX0JpemdhemVfd2VicnRjL19Qcm9qZWN0L2JpemdhemVfbWVldGluZy92aWRlb2NvbmYvc2NyaXB0cy9idWlsZC9jb21wb25lbnRzL0NoYXR0aW5nUGFuZWwuanMiLCJGOi8xX0JpemdhemVfd2VicnRjL19Qcm9qZWN0L2JpemdhemVfbWVldGluZy92aWRlb2NvbmYvc2NyaXB0cy9idWlsZC9jb21wb25lbnRzL1BhcnRpY2lwYW50TGlzdFBhbmVsLmpzIiwiRjovMV9CaXpnYXplX3dlYnJ0Yy9fUHJvamVjdC9iaXpnYXplX21lZXRpbmcvdmlkZW9jb25mL3NjcmlwdHMvYnVpbGQvY29tcG9uZW50cy9TZXR0aW5nRGlhbG9nLmpzIiwiRjovMV9CaXpnYXplX3dlYnJ0Yy9fUHJvamVjdC9iaXpnYXplX21lZXRpbmcvdmlkZW9jb25mL3NjcmlwdHMvYnVpbGQvY29tcG9uZW50cy92ZWN0b3JfaWNvbi5qcyIsIkY6LzFfQml6Z2F6ZV93ZWJydGMvX1Byb2plY3QvYml6Z2F6ZV9tZWV0aW5nL3ZpZGVvY29uZi9zY3JpcHRzL2J1aWxkL2VudW0vTWVkaWFUeXBlLmpzIiwiRjovMV9CaXpnYXplX3dlYnJ0Yy9fUHJvamVjdC9iaXpnYXplX21lZXRpbmcvdmlkZW9jb25mL3NjcmlwdHMvYnVpbGQvZW51bS9Ob3RpZmljYXRpb25UeXBlLmpzIiwiRjovMV9CaXpnYXplX3dlYnJ0Yy9fUHJvamVjdC9iaXpnYXplX21lZXRpbmcvdmlkZW9jb25mL3NjcmlwdHMvYnVpbGQvZW51bS9Vc2VyUHJvcGVydHkuanMiLCJGOi8xX0JpemdhemVfd2VicnRjL19Qcm9qZWN0L2JpemdhemVfbWVldGluZy92aWRlb2NvbmYvc2NyaXB0cy9idWlsZC9mYWtlXzY2YWY4NGY3LmpzIiwiRjovMV9CaXpnYXplX3dlYnJ0Yy9fUHJvamVjdC9iaXpnYXplX21lZXRpbmcvdmlkZW9jb25mL3NjcmlwdHMvYnVpbGQvbW9kZWwvQWN0aXZlRGV2aWNlcy5qcyIsIkY6LzFfQml6Z2F6ZV93ZWJydGMvX1Byb2plY3QvYml6Z2F6ZV9tZWV0aW5nL3ZpZGVvY29uZi9zY3JpcHRzL2J1aWxkL3V0aWwvcmFuZG9tLmpzIiwiRjovMV9CaXpnYXplX3dlYnJ0Yy9fUHJvamVjdC9iaXpnYXplX21lZXRpbmcvdmlkZW9jb25mL3NjcmlwdHMvYnVpbGQvdXRpbC9zbmlwcGV0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmxDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN09BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6dEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBsb29rdXAgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7XG5cbjsoZnVuY3Rpb24gKGV4cG9ydHMpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG4gIHZhciBBcnIgPSAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnKVxuICAgID8gVWludDhBcnJheVxuICAgIDogQXJyYXlcblxuXHR2YXIgUExVUyAgID0gJysnLmNoYXJDb2RlQXQoMClcblx0dmFyIFNMQVNIICA9ICcvJy5jaGFyQ29kZUF0KDApXG5cdHZhciBOVU1CRVIgPSAnMCcuY2hhckNvZGVBdCgwKVxuXHR2YXIgTE9XRVIgID0gJ2EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFVQUEVSICA9ICdBJy5jaGFyQ29kZUF0KDApXG5cdHZhciBQTFVTX1VSTF9TQUZFID0gJy0nLmNoYXJDb2RlQXQoMClcblx0dmFyIFNMQVNIX1VSTF9TQUZFID0gJ18nLmNoYXJDb2RlQXQoMClcblxuXHRmdW5jdGlvbiBkZWNvZGUgKGVsdCkge1xuXHRcdHZhciBjb2RlID0gZWx0LmNoYXJDb2RlQXQoMClcblx0XHRpZiAoY29kZSA9PT0gUExVUyB8fFxuXHRcdCAgICBjb2RlID09PSBQTFVTX1VSTF9TQUZFKVxuXHRcdFx0cmV0dXJuIDYyIC8vICcrJ1xuXHRcdGlmIChjb2RlID09PSBTTEFTSCB8fFxuXHRcdCAgICBjb2RlID09PSBTTEFTSF9VUkxfU0FGRSlcblx0XHRcdHJldHVybiA2MyAvLyAnLydcblx0XHRpZiAoY29kZSA8IE5VTUJFUilcblx0XHRcdHJldHVybiAtMSAvL25vIG1hdGNoXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIgKyAxMClcblx0XHRcdHJldHVybiBjb2RlIC0gTlVNQkVSICsgMjYgKyAyNlxuXHRcdGlmIChjb2RlIDwgVVBQRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gVVBQRVJcblx0XHRpZiAoY29kZSA8IExPV0VSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIExPV0VSICsgMjZcblx0fVxuXG5cdGZ1bmN0aW9uIGI2NFRvQnl0ZUFycmF5IChiNjQpIHtcblx0XHR2YXIgaSwgaiwgbCwgdG1wLCBwbGFjZUhvbGRlcnMsIGFyclxuXG5cdFx0aWYgKGI2NC5sZW5ndGggJSA0ID4gMCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN0cmluZy4gTGVuZ3RoIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA0Jylcblx0XHR9XG5cblx0XHQvLyB0aGUgbnVtYmVyIG9mIGVxdWFsIHNpZ25zIChwbGFjZSBob2xkZXJzKVxuXHRcdC8vIGlmIHRoZXJlIGFyZSB0d28gcGxhY2Vob2xkZXJzLCB0aGFuIHRoZSB0d28gY2hhcmFjdGVycyBiZWZvcmUgaXRcblx0XHQvLyByZXByZXNlbnQgb25lIGJ5dGVcblx0XHQvLyBpZiB0aGVyZSBpcyBvbmx5IG9uZSwgdGhlbiB0aGUgdGhyZWUgY2hhcmFjdGVycyBiZWZvcmUgaXQgcmVwcmVzZW50IDIgYnl0ZXNcblx0XHQvLyB0aGlzIGlzIGp1c3QgYSBjaGVhcCBoYWNrIHRvIG5vdCBkbyBpbmRleE9mIHR3aWNlXG5cdFx0dmFyIGxlbiA9IGI2NC5sZW5ndGhcblx0XHRwbGFjZUhvbGRlcnMgPSAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMikgPyAyIDogJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDEpID8gMSA6IDBcblxuXHRcdC8vIGJhc2U2NCBpcyA0LzMgKyB1cCB0byB0d28gY2hhcmFjdGVycyBvZiB0aGUgb3JpZ2luYWwgZGF0YVxuXHRcdGFyciA9IG5ldyBBcnIoYjY0Lmxlbmd0aCAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzKVxuXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuXHRcdGwgPSBwbGFjZUhvbGRlcnMgPiAwID8gYjY0Lmxlbmd0aCAtIDQgOiBiNjQubGVuZ3RoXG5cblx0XHR2YXIgTCA9IDBcblxuXHRcdGZ1bmN0aW9uIHB1c2ggKHYpIHtcblx0XHRcdGFycltMKytdID0gdlxuXHRcdH1cblxuXHRcdGZvciAoaSA9IDAsIGogPSAwOyBpIDwgbDsgaSArPSA0LCBqICs9IDMpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTgpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgMTIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPDwgNikgfCBkZWNvZGUoYjY0LmNoYXJBdChpICsgMykpXG5cdFx0XHRwdXNoKCh0bXAgJiAweEZGMDAwMCkgPj4gMTYpXG5cdFx0XHRwdXNoKCh0bXAgJiAweEZGMDApID4+IDgpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0aWYgKHBsYWNlSG9sZGVycyA9PT0gMikge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpID4+IDQpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTApIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgNCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA+PiAyKVxuXHRcdFx0cHVzaCgodG1wID4+IDgpICYgMHhGRilcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRyZXR1cm4gYXJyXG5cdH1cblxuXHRmdW5jdGlvbiB1aW50OFRvQmFzZTY0ICh1aW50OCkge1xuXHRcdHZhciBpLFxuXHRcdFx0ZXh0cmFCeXRlcyA9IHVpbnQ4Lmxlbmd0aCAlIDMsIC8vIGlmIHdlIGhhdmUgMSBieXRlIGxlZnQsIHBhZCAyIGJ5dGVzXG5cdFx0XHRvdXRwdXQgPSBcIlwiLFxuXHRcdFx0dGVtcCwgbGVuZ3RoXG5cblx0XHRmdW5jdGlvbiBlbmNvZGUgKG51bSkge1xuXHRcdFx0cmV0dXJuIGxvb2t1cC5jaGFyQXQobnVtKVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NCAobnVtKSB7XG5cdFx0XHRyZXR1cm4gZW5jb2RlKG51bSA+PiAxOCAmIDB4M0YpICsgZW5jb2RlKG51bSA+PiAxMiAmIDB4M0YpICsgZW5jb2RlKG51bSA+PiA2ICYgMHgzRikgKyBlbmNvZGUobnVtICYgMHgzRilcblx0XHR9XG5cblx0XHQvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXG5cdFx0Zm9yIChpID0gMCwgbGVuZ3RoID0gdWludDgubGVuZ3RoIC0gZXh0cmFCeXRlczsgaSA8IGxlbmd0aDsgaSArPSAzKSB7XG5cdFx0XHR0ZW1wID0gKHVpbnQ4W2ldIDw8IDE2KSArICh1aW50OFtpICsgMV0gPDwgOCkgKyAodWludDhbaSArIDJdKVxuXHRcdFx0b3V0cHV0ICs9IHRyaXBsZXRUb0Jhc2U2NCh0ZW1wKVxuXHRcdH1cblxuXHRcdC8vIHBhZCB0aGUgZW5kIHdpdGggemVyb3MsIGJ1dCBtYWtlIHN1cmUgdG8gbm90IGZvcmdldCB0aGUgZXh0cmEgYnl0ZXNcblx0XHRzd2l0Y2ggKGV4dHJhQnl0ZXMpIHtcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0dGVtcCA9IHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAyKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDQpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9PSdcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgMjpcblx0XHRcdFx0dGVtcCA9ICh1aW50OFt1aW50OC5sZW5ndGggLSAyXSA8PCA4KSArICh1aW50OFt1aW50OC5sZW5ndGggLSAxXSlcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDEwKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wID4+IDQpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCAyKSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPSdcblx0XHRcdFx0YnJlYWtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0XG5cdH1cblxuXHRleHBvcnRzLnRvQnl0ZUFycmF5ID0gYjY0VG9CeXRlQXJyYXlcblx0ZXhwb3J0cy5mcm9tQnl0ZUFycmF5ID0gdWludDhUb0Jhc2U2NFxufSh0eXBlb2YgZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcgPyAodGhpcy5iYXNlNjRqcyA9IHt9KSA6IGV4cG9ydHMpKVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxiYXNlNjQtanNcXFxcbGliXFxcXGI2NC5qc1wiLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxiYXNlNjQtanNcXFxcbGliXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbnZhciBpZWVlNzU0ID0gcmVxdWlyZSgnaWVlZTc1NCcpXG5cbmV4cG9ydHMuQnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLlNsb3dCdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxuQnVmZmVyLnBvb2xTaXplID0gODE5MlxuXG4vKipcbiAqIElmIGBCdWZmZXIuX3VzZVR5cGVkQXJyYXlzYDpcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXG4gKiAgID09PSBmYWxzZSAgIFVzZSBPYmplY3QgaW1wbGVtZW50YXRpb24gKGNvbXBhdGlibGUgZG93biB0byBJRTYpXG4gKi9cbkJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgPSAoZnVuY3Rpb24gKCkge1xuICAvLyBEZXRlY3QgaWYgYnJvd3NlciBzdXBwb3J0cyBUeXBlZCBBcnJheXMuIFN1cHBvcnRlZCBicm93c2VycyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLFxuICAvLyBDaHJvbWUgNyssIFNhZmFyaSA1LjErLCBPcGVyYSAxMS42KywgaU9TIDQuMisuIElmIHRoZSBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgYWRkaW5nXG4gIC8vIHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgIGluc3RhbmNlcywgdGhlbiB0aGF0J3MgdGhlIHNhbWUgYXMgbm8gYFVpbnQ4QXJyYXlgIHN1cHBvcnRcbiAgLy8gYmVjYXVzZSB3ZSBuZWVkIHRvIGJlIGFibGUgdG8gYWRkIGFsbCB0aGUgbm9kZSBCdWZmZXIgQVBJIG1ldGhvZHMuIFRoaXMgaXMgYW4gaXNzdWVcbiAgLy8gaW4gRmlyZWZveCA0LTI5LiBOb3cgZml4ZWQ6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTY5NTQzOFxuICB0cnkge1xuICAgIHZhciBidWYgPSBuZXcgQXJyYXlCdWZmZXIoMClcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICAgIGFyci5mb28gPSBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9XG4gICAgcmV0dXJuIDQyID09PSBhcnIuZm9vKCkgJiZcbiAgICAgICAgdHlwZW9mIGFyci5zdWJhcnJheSA9PT0gJ2Z1bmN0aW9uJyAvLyBDaHJvbWUgOS0xMCBsYWNrIGBzdWJhcnJheWBcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59KSgpXG5cbi8qKlxuICogQ2xhc3M6IEJ1ZmZlclxuICogPT09PT09PT09PT09PVxuICpcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgYXJlIGF1Z21lbnRlZFxuICogd2l0aCBmdW5jdGlvbiBwcm9wZXJ0aWVzIGZvciBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgQVBJIGZ1bmN0aW9ucy4gV2UgdXNlXG4gKiBgVWludDhBcnJheWAgc28gdGhhdCBzcXVhcmUgYnJhY2tldCBub3RhdGlvbiB3b3JrcyBhcyBleHBlY3RlZCAtLSBpdCByZXR1cm5zXG4gKiBhIHNpbmdsZSBvY3RldC5cbiAqXG4gKiBCeSBhdWdtZW50aW5nIHRoZSBpbnN0YW5jZXMsIHdlIGNhbiBhdm9pZCBtb2RpZnlpbmcgdGhlIGBVaW50OEFycmF5YFxuICogcHJvdG90eXBlLlxuICovXG5mdW5jdGlvbiBCdWZmZXIgKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEJ1ZmZlcikpXG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybylcblxuICB2YXIgdHlwZSA9IHR5cGVvZiBzdWJqZWN0XG5cbiAgLy8gV29ya2Fyb3VuZDogbm9kZSdzIGJhc2U2NCBpbXBsZW1lbnRhdGlvbiBhbGxvd3MgZm9yIG5vbi1wYWRkZWQgc3RyaW5nc1xuICAvLyB3aGlsZSBiYXNlNjQtanMgZG9lcyBub3QuXG4gIGlmIChlbmNvZGluZyA9PT0gJ2Jhc2U2NCcgJiYgdHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBzdWJqZWN0ID0gc3RyaW5ndHJpbShzdWJqZWN0KVxuICAgIHdoaWxlIChzdWJqZWN0Lmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICAgIHN1YmplY3QgPSBzdWJqZWN0ICsgJz0nXG4gICAgfVxuICB9XG5cbiAgLy8gRmluZCB0aGUgbGVuZ3RoXG4gIHZhciBsZW5ndGhcbiAgaWYgKHR5cGUgPT09ICdudW1iZXInKVxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0KVxuICBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJylcbiAgICBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChzdWJqZWN0LCBlbmNvZGluZylcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ29iamVjdCcpXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QubGVuZ3RoKSAvLyBhc3N1bWUgdGhhdCBvYmplY3QgaXMgYXJyYXktbGlrZVxuICBlbHNlXG4gICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCBuZWVkcyB0byBiZSBhIG51bWJlciwgYXJyYXkgb3Igc3RyaW5nLicpXG5cbiAgdmFyIGJ1ZlxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIC8vIFByZWZlcnJlZDogUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2UgZm9yIGJlc3QgcGVyZm9ybWFuY2VcbiAgICBidWYgPSBCdWZmZXIuX2F1Z21lbnQobmV3IFVpbnQ4QXJyYXkobGVuZ3RoKSlcbiAgfSBlbHNlIHtcbiAgICAvLyBGYWxsYmFjazogUmV0dXJuIFRISVMgaW5zdGFuY2Ugb2YgQnVmZmVyIChjcmVhdGVkIGJ5IGBuZXdgKVxuICAgIGJ1ZiA9IHRoaXNcbiAgICBidWYubGVuZ3RoID0gbGVuZ3RoXG4gICAgYnVmLl9pc0J1ZmZlciA9IHRydWVcbiAgfVxuXG4gIHZhciBpXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmIHR5cGVvZiBzdWJqZWN0LmJ5dGVMZW5ndGggPT09ICdudW1iZXInKSB7XG4gICAgLy8gU3BlZWQgb3B0aW1pemF0aW9uIC0tIHVzZSBzZXQgaWYgd2UncmUgY29weWluZyBmcm9tIGEgdHlwZWQgYXJyYXlcbiAgICBidWYuX3NldChzdWJqZWN0KVxuICB9IGVsc2UgaWYgKGlzQXJyYXlpc2goc3ViamVjdCkpIHtcbiAgICAvLyBUcmVhdCBhcnJheS1pc2ggb2JqZWN0cyBhcyBhIGJ5dGUgYXJyYXlcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkpXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3QucmVhZFVJbnQ4KGkpXG4gICAgICBlbHNlXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3RbaV1cbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBidWYud3JpdGUoc3ViamVjdCwgMCwgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicgJiYgIUJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgIW5vWmVybykge1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgYnVmW2ldID0gMFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWZcbn1cblxuLy8gU1RBVElDIE1FVEhPRFNcbi8vID09PT09PT09PT09PT09XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICdyYXcnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuaXNCdWZmZXIgPSBmdW5jdGlvbiAoYikge1xuICByZXR1cm4gISEoYiAhPT0gbnVsbCAmJiBiICE9PSB1bmRlZmluZWQgJiYgYi5faXNCdWZmZXIpXG59XG5cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gZnVuY3Rpb24gKHN0ciwgZW5jb2RpbmcpIHtcbiAgdmFyIHJldFxuICBzdHIgPSBzdHIgKyAnJ1xuICBzd2l0Y2ggKGVuY29kaW5nIHx8ICd1dGY4Jykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoIC8gMlxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSB1dGY4VG9CeXRlcyhzdHIpLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdyYXcnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gYmFzZTY0VG9CeXRlcyhzdHIpLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAqIDJcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gKGxpc3QsIHRvdGFsTGVuZ3RoKSB7XG4gIGFzc2VydChpc0FycmF5KGxpc3QpLCAnVXNhZ2U6IEJ1ZmZlci5jb25jYXQobGlzdCwgW3RvdGFsTGVuZ3RoXSlcXG4nICtcbiAgICAgICdsaXN0IHNob3VsZCBiZSBhbiBBcnJheS4nKVxuXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBuZXcgQnVmZmVyKDApXG4gIH0gZWxzZSBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gbGlzdFswXVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB0b3RhbExlbmd0aCAhPT0gJ251bWJlcicpIHtcbiAgICB0b3RhbExlbmd0aCA9IDBcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgdG90YWxMZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcbiAgICB9XG4gIH1cblxuICB2YXIgYnVmID0gbmV3IEJ1ZmZlcih0b3RhbExlbmd0aClcbiAgdmFyIHBvcyA9IDBcbiAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV1cbiAgICBpdGVtLmNvcHkoYnVmLCBwb3MpXG4gICAgcG9zICs9IGl0ZW0ubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIGJ1ZlxufVxuXG4vLyBCVUZGRVIgSU5TVEFOQ0UgTUVUSE9EU1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gX2hleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBkaWdpdHNcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcbiAgYXNzZXJ0KHN0ckxlbiAlIDIgPT09IDAsICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XG4gICAgbGVuZ3RoID0gc3RyTGVuIC8gMlxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYnl0ZSA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNilcbiAgICBhc3NlcnQoIWlzTmFOKGJ5dGUpLCAnSW52YWxpZCBoZXggc3RyaW5nJylcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSBieXRlXG4gIH1cbiAgQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPSBpICogMlxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBfdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX2FzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIoYXNjaWlUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX2JpbmFyeVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIF9hc2NpaVdyaXRlKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gX2Jhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfdXRmMTZsZVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKHV0ZjE2bGVUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xuICAvLyBTdXBwb3J0IGJvdGggKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKVxuICAvLyBhbmQgdGhlIGxlZ2FjeSAoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0LCBsZW5ndGgpXG4gIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgaWYgKCFpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICB9IGVsc2UgeyAgLy8gbGVnYWN5XG4gICAgdmFyIHN3YXAgPSBlbmNvZGluZ1xuICAgIGVuY29kaW5nID0gb2Zmc2V0XG4gICAgb2Zmc2V0ID0gbGVuZ3RoXG4gICAgbGVuZ3RoID0gc3dhcFxuICB9XG5cbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcblxuICB2YXIgcmV0XG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gX2hleFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IF91dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gX2FzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldCA9IF9iaW5hcnlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gX2Jhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBfdXRmMTZsZVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIChlbmNvZGluZywgc3RhcnQsIGVuZCkge1xuICB2YXIgc2VsZiA9IHRoaXNcblxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcbiAgc3RhcnQgPSBOdW1iZXIoc3RhcnQpIHx8IDBcbiAgZW5kID0gKGVuZCAhPT0gdW5kZWZpbmVkKVxuICAgID8gTnVtYmVyKGVuZClcbiAgICA6IGVuZCA9IHNlbGYubGVuZ3RoXG5cbiAgLy8gRmFzdHBhdGggZW1wdHkgc3RyaW5nc1xuICBpZiAoZW5kID09PSBzdGFydClcbiAgICByZXR1cm4gJydcblxuICB2YXIgcmV0XG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gX2hleFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IF91dGY4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gX2FzY2lpU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldCA9IF9iaW5hcnlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gX2Jhc2U2NFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBfdXRmMTZsZVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1ZmZlcicsXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXG4gIH1cbn1cblxuLy8gY29weSh0YXJnZXRCdWZmZXIsIHRhcmdldFN0YXJ0PTAsIHNvdXJjZVN0YXJ0PTAsIHNvdXJjZUVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gKHRhcmdldCwgdGFyZ2V0X3N0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIHZhciBzb3VyY2UgPSB0aGlzXG5cbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kICYmIGVuZCAhPT0gMCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKCF0YXJnZXRfc3RhcnQpIHRhcmdldF9zdGFydCA9IDBcblxuICAvLyBDb3B5IDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGFyZ2V0Lmxlbmd0aCA9PT0gMCB8fCBzb3VyY2UubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICAvLyBGYXRhbCBlcnJvciBjb25kaXRpb25zXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdzb3VyY2VFbmQgPCBzb3VyY2VTdGFydCcpXG4gIGFzc2VydCh0YXJnZXRfc3RhcnQgPj0gMCAmJiB0YXJnZXRfc3RhcnQgPCB0YXJnZXQubGVuZ3RoLFxuICAgICAgJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSBzb3VyY2UubGVuZ3RoLCAnc291cmNlRW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIC8vIEFyZSB3ZSBvb2I/XG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aClcbiAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCA8IGVuZCAtIHN0YXJ0KVxuICAgIGVuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgKyBzdGFydFxuXG4gIHZhciBsZW4gPSBlbmQgLSBzdGFydFxuXG4gIGlmIChsZW4gPCAxMDAgfHwgIUJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRfc3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gIH0gZWxzZSB7XG4gICAgdGFyZ2V0Ll9zZXQodGhpcy5zdWJhcnJheShzdGFydCwgc3RhcnQgKyBsZW4pLCB0YXJnZXRfc3RhcnQpXG4gIH1cbn1cblxuZnVuY3Rpb24gX2Jhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcbiAgfVxufVxuXG5mdW5jdGlvbiBfdXRmOFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJlcyA9ICcnXG4gIHZhciB0bXAgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBpZiAoYnVmW2ldIDw9IDB4N0YpIHtcbiAgICAgIHJlcyArPSBkZWNvZGVVdGY4Q2hhcih0bXApICsgU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gICAgICB0bXAgPSAnJ1xuICAgIH0gZWxzZSB7XG4gICAgICB0bXAgKz0gJyUnICsgYnVmW2ldLnRvU3RyaW5nKDE2KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXMgKyBkZWNvZGVVdGY4Q2hhcih0bXApXG59XG5cbmZ1bmN0aW9uIF9hc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKylcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gX2JpbmFyeVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgcmV0dXJuIF9hc2NpaVNsaWNlKGJ1Ziwgc3RhcnQsIGVuZClcbn1cblxuZnVuY3Rpb24gX2hleFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cblxuICB2YXIgb3V0ID0gJydcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBvdXQgKz0gdG9IZXgoYnVmW2ldKVxuICB9XG4gIHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gX3V0ZjE2bGVTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBieXRlcyA9IGJ1Zi5zbGljZShzdGFydCwgZW5kKVxuICB2YXIgcmVzID0gJydcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldICsgYnl0ZXNbaSsxXSAqIDI1NilcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSBjbGFtcChzdGFydCwgbGVuLCAwKVxuICBlbmQgPSBjbGFtcChlbmQsIGxlbiwgbGVuKVxuXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5fYXVnbWVudCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpKVxuICB9IGVsc2Uge1xuICAgIHZhciBzbGljZUxlbiA9IGVuZCAtIHN0YXJ0XG4gICAgdmFyIG5ld0J1ZiA9IG5ldyBCdWZmZXIoc2xpY2VMZW4sIHVuZGVmaW5lZCwgdHJ1ZSlcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWNlTGVuOyBpKyspIHtcbiAgICAgIG5ld0J1ZltpXSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgICByZXR1cm4gbmV3QnVmXG4gIH1cbn1cblxuLy8gYGdldGAgd2lsbCBiZSByZW1vdmVkIGluIE5vZGUgMC4xMytcbkJ1ZmZlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLmdldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMucmVhZFVJbnQ4KG9mZnNldClcbn1cblxuLy8gYHNldGAgd2lsbCBiZSByZW1vdmVkIGluIE5vZGUgMC4xMytcbkJ1ZmZlci5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKHYsIG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLnNldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMud3JpdGVVSW50OCh2LCBvZmZzZXQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbmZ1bmN0aW9uIF9yZWFkVUludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbFxuICBpZiAobGl0dGxlRW5kaWFuKSB7XG4gICAgdmFsID0gYnVmW29mZnNldF1cbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxuICB9IGVsc2Uge1xuICAgIHZhbCA9IGJ1ZltvZmZzZXRdIDw8IDhcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV1cbiAgfVxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZFVJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWxcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDJdIDw8IDE2XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcbiAgICB2YWwgfD0gYnVmW29mZnNldF1cbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcbiAgICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0ICsgM10gPDwgMjQgPj4+IDApXG4gIH0gZWxzZSB7XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMV0gPDwgMTZcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMl0gPDwgOFxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAzXVxuICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0XSA8PCAyNCA+Pj4gMClcbiAgfVxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICB2YXIgbmVnID0gdGhpc1tvZmZzZXRdICYgMHg4MFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZiAtIHRoaXNbb2Zmc2V0XSArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuZnVuY3Rpb24gX3JlYWRJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQxNihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmZmYgLSB2YWwgKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsID0gX3JlYWRVSW50MzIoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMDAwMDBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmZmZmZmZmYgLSB2YWwgKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkRmxvYXQgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWREb3VibGUgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aCkgcmV0dXJuXG5cbiAgdGhpc1tvZmZzZXRdID0gdmFsdWVcbn1cblxuZnVuY3Rpb24gX3dyaXRlVUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZilcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCAyKTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkpKSkgPj4+XG4gICAgICAgICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlVUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZmZmZmYpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgNCk7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgPj4+IChsaXR0bGVFbmRpYW4gPyBpIDogMyAtIGkpICogOCkgJiAweGZmXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2YsIC0weDgwKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICB0aGlzLndyaXRlVUludDgodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICB0aGlzLndyaXRlVUludDgoMHhmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmLCAtMHg4MDAwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbiAgZWxzZVxuICAgIF93cml0ZVVJbnQxNihidWYsIDB4ZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIF93cml0ZVVJbnQzMihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICBfd3JpdGVVSW50MzIoYnVmLCAweGZmZmZmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUZsb2F0IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgsIC0zLjQwMjgyMzQ2NjM4NTI4ODZlKzM4KVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCxcbiAgICAgICAgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAxLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCwgLTEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4KVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBmaWxsKHZhbHVlLCBzdGFydD0wLCBlbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uICh2YWx1ZSwgc3RhcnQsIGVuZCkge1xuICBpZiAoIXZhbHVlKSB2YWx1ZSA9IDBcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kKSBlbmQgPSB0aGlzLmxlbmd0aFxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsdWUgPSB2YWx1ZS5jaGFyQ29kZUF0KDApXG4gIH1cblxuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiAhaXNOYU4odmFsdWUpLCAndmFsdWUgaXMgbm90IGEgbnVtYmVyJylcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ2VuZCA8IHN0YXJ0JylcblxuICAvLyBGaWxsIDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgdGhpcy5sZW5ndGgsICdzdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSB0aGlzLmxlbmd0aCwgJ2VuZCBvdXQgb2YgYm91bmRzJylcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIHRoaXNbaV0gPSB2YWx1ZVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG91dCA9IFtdXG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgb3V0W2ldID0gdG9IZXgodGhpc1tpXSlcbiAgICBpZiAoaSA9PT0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUykge1xuICAgICAgb3V0W2kgKyAxXSA9ICcuLi4nXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuICByZXR1cm4gJzxCdWZmZXIgJyArIG91dC5qb2luKCcgJykgKyAnPidcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGBBcnJheUJ1ZmZlcmAgd2l0aCB0aGUgKmNvcGllZCogbWVtb3J5IG9mIHRoZSBidWZmZXIgaW5zdGFuY2UuXG4gKiBBZGRlZCBpbiBOb2RlIDAuMTIuIE9ubHkgYXZhaWxhYmxlIGluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBBcnJheUJ1ZmZlci5cbiAqL1xuQnVmZmVyLnByb3RvdHlwZS50b0FycmF5QnVmZmVyID0gZnVuY3Rpb24gKCkge1xuICBpZiAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICAgIHJldHVybiAobmV3IEJ1ZmZlcih0aGlzKSkuYnVmZmVyXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBidWYgPSBuZXcgVWludDhBcnJheSh0aGlzLmxlbmd0aClcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBidWYubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpXG4gICAgICAgIGJ1ZltpXSA9IHRoaXNbaV1cbiAgICAgIHJldHVybiBidWYuYnVmZmVyXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignQnVmZmVyLnRvQXJyYXlCdWZmZXIgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXInKVxuICB9XG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gc3RyaW5ndHJpbSAoc3RyKSB7XG4gIGlmIChzdHIudHJpbSkgcmV0dXJuIHN0ci50cmltKClcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbn1cblxudmFyIEJQID0gQnVmZmVyLnByb3RvdHlwZVxuXG4vKipcbiAqIEF1Z21lbnQgYSBVaW50OEFycmF5ICppbnN0YW5jZSogKG5vdCB0aGUgVWludDhBcnJheSBjbGFzcyEpIHdpdGggQnVmZmVyIG1ldGhvZHNcbiAqL1xuQnVmZmVyLl9hdWdtZW50ID0gZnVuY3Rpb24gKGFycikge1xuICBhcnIuX2lzQnVmZmVyID0gdHJ1ZVxuXG4gIC8vIHNhdmUgcmVmZXJlbmNlIHRvIG9yaWdpbmFsIFVpbnQ4QXJyYXkgZ2V0L3NldCBtZXRob2RzIGJlZm9yZSBvdmVyd3JpdGluZ1xuICBhcnIuX2dldCA9IGFyci5nZXRcbiAgYXJyLl9zZXQgPSBhcnIuc2V0XG5cbiAgLy8gZGVwcmVjYXRlZCwgd2lsbCBiZSByZW1vdmVkIGluIG5vZGUgMC4xMytcbiAgYXJyLmdldCA9IEJQLmdldFxuICBhcnIuc2V0ID0gQlAuc2V0XG5cbiAgYXJyLndyaXRlID0gQlAud3JpdGVcbiAgYXJyLnRvU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvTG9jYWxlU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvSlNPTiA9IEJQLnRvSlNPTlxuICBhcnIuY29weSA9IEJQLmNvcHlcbiAgYXJyLnNsaWNlID0gQlAuc2xpY2VcbiAgYXJyLnJlYWRVSW50OCA9IEJQLnJlYWRVSW50OFxuICBhcnIucmVhZFVJbnQxNkxFID0gQlAucmVhZFVJbnQxNkxFXG4gIGFyci5yZWFkVUludDE2QkUgPSBCUC5yZWFkVUludDE2QkVcbiAgYXJyLnJlYWRVSW50MzJMRSA9IEJQLnJlYWRVSW50MzJMRVxuICBhcnIucmVhZFVJbnQzMkJFID0gQlAucmVhZFVJbnQzMkJFXG4gIGFyci5yZWFkSW50OCA9IEJQLnJlYWRJbnQ4XG4gIGFyci5yZWFkSW50MTZMRSA9IEJQLnJlYWRJbnQxNkxFXG4gIGFyci5yZWFkSW50MTZCRSA9IEJQLnJlYWRJbnQxNkJFXG4gIGFyci5yZWFkSW50MzJMRSA9IEJQLnJlYWRJbnQzMkxFXG4gIGFyci5yZWFkSW50MzJCRSA9IEJQLnJlYWRJbnQzMkJFXG4gIGFyci5yZWFkRmxvYXRMRSA9IEJQLnJlYWRGbG9hdExFXG4gIGFyci5yZWFkRmxvYXRCRSA9IEJQLnJlYWRGbG9hdEJFXG4gIGFyci5yZWFkRG91YmxlTEUgPSBCUC5yZWFkRG91YmxlTEVcbiAgYXJyLnJlYWREb3VibGVCRSA9IEJQLnJlYWREb3VibGVCRVxuICBhcnIud3JpdGVVSW50OCA9IEJQLndyaXRlVUludDhcbiAgYXJyLndyaXRlVUludDE2TEUgPSBCUC53cml0ZVVJbnQxNkxFXG4gIGFyci53cml0ZVVJbnQxNkJFID0gQlAud3JpdGVVSW50MTZCRVxuICBhcnIud3JpdGVVSW50MzJMRSA9IEJQLndyaXRlVUludDMyTEVcbiAgYXJyLndyaXRlVUludDMyQkUgPSBCUC53cml0ZVVJbnQzMkJFXG4gIGFyci53cml0ZUludDggPSBCUC53cml0ZUludDhcbiAgYXJyLndyaXRlSW50MTZMRSA9IEJQLndyaXRlSW50MTZMRVxuICBhcnIud3JpdGVJbnQxNkJFID0gQlAud3JpdGVJbnQxNkJFXG4gIGFyci53cml0ZUludDMyTEUgPSBCUC53cml0ZUludDMyTEVcbiAgYXJyLndyaXRlSW50MzJCRSA9IEJQLndyaXRlSW50MzJCRVxuICBhcnIud3JpdGVGbG9hdExFID0gQlAud3JpdGVGbG9hdExFXG4gIGFyci53cml0ZUZsb2F0QkUgPSBCUC53cml0ZUZsb2F0QkVcbiAgYXJyLndyaXRlRG91YmxlTEUgPSBCUC53cml0ZURvdWJsZUxFXG4gIGFyci53cml0ZURvdWJsZUJFID0gQlAud3JpdGVEb3VibGVCRVxuICBhcnIuZmlsbCA9IEJQLmZpbGxcbiAgYXJyLmluc3BlY3QgPSBCUC5pbnNwZWN0XG4gIGFyci50b0FycmF5QnVmZmVyID0gQlAudG9BcnJheUJ1ZmZlclxuXG4gIHJldHVybiBhcnJcbn1cblxuLy8gc2xpY2Uoc3RhcnQsIGVuZClcbmZ1bmN0aW9uIGNsYW1wIChpbmRleCwgbGVuLCBkZWZhdWx0VmFsdWUpIHtcbiAgaWYgKHR5cGVvZiBpbmRleCAhPT0gJ251bWJlcicpIHJldHVybiBkZWZhdWx0VmFsdWVcbiAgaW5kZXggPSB+fmluZGV4OyAgLy8gQ29lcmNlIHRvIGludGVnZXIuXG4gIGlmIChpbmRleCA+PSBsZW4pIHJldHVybiBsZW5cbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxuICBpbmRleCArPSBsZW5cbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxuICByZXR1cm4gMFxufVxuXG5mdW5jdGlvbiBjb2VyY2UgKGxlbmd0aCkge1xuICAvLyBDb2VyY2UgbGVuZ3RoIHRvIGEgbnVtYmVyIChwb3NzaWJseSBOYU4pLCByb3VuZCB1cFxuICAvLyBpbiBjYXNlIGl0J3MgZnJhY3Rpb25hbCAoZS5nLiAxMjMuNDU2KSB0aGVuIGRvIGFcbiAgLy8gZG91YmxlIG5lZ2F0ZSB0byBjb2VyY2UgYSBOYU4gdG8gMC4gRWFzeSwgcmlnaHQ/XG4gIGxlbmd0aCA9IH5+TWF0aC5jZWlsKCtsZW5ndGgpXG4gIHJldHVybiBsZW5ndGggPCAwID8gMCA6IGxlbmd0aFxufVxuXG5mdW5jdGlvbiBpc0FycmF5IChzdWJqZWN0KSB7XG4gIHJldHVybiAoQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoc3ViamVjdCkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3ViamVjdCkgPT09ICdbb2JqZWN0IEFycmF5XSdcbiAgfSkoc3ViamVjdClcbn1cblxuZnVuY3Rpb24gaXNBcnJheWlzaCAoc3ViamVjdCkge1xuICByZXR1cm4gaXNBcnJheShzdWJqZWN0KSB8fCBCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkgfHxcbiAgICAgIHN1YmplY3QgJiYgdHlwZW9mIHN1YmplY3QgPT09ICdvYmplY3QnICYmXG4gICAgICB0eXBlb2Ygc3ViamVjdC5sZW5ndGggPT09ICdudW1iZXInXG59XG5cbmZ1bmN0aW9uIHRvSGV4IChuKSB7XG4gIGlmIChuIDwgMTYpIHJldHVybiAnMCcgKyBuLnRvU3RyaW5nKDE2KVxuICByZXR1cm4gbi50b1N0cmluZygxNilcbn1cblxuZnVuY3Rpb24gdXRmOFRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYiA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaWYgKGIgPD0gMHg3RilcbiAgICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpKVxuICAgIGVsc2Uge1xuICAgICAgdmFyIHN0YXJ0ID0gaVxuICAgICAgaWYgKGIgPj0gMHhEODAwICYmIGIgPD0gMHhERkZGKSBpKytcbiAgICAgIHZhciBoID0gZW5jb2RlVVJJQ29tcG9uZW50KHN0ci5zbGljZShzdGFydCwgaSsxKSkuc3Vic3RyKDEpLnNwbGl0KCclJylcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgaC5sZW5ndGg7IGorKylcbiAgICAgICAgYnl0ZUFycmF5LnB1c2gocGFyc2VJbnQoaFtqXSwgMTYpKVxuICAgIH1cbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIC8vIE5vZGUncyBjb2RlIHNlZW1zIHRvIGJlIGRvaW5nIHRoaXMgYW5kIG5vdCAmIDB4N0YuLlxuICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRilcbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGMsIGhpLCBsb1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICBjID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBoaSA9IGMgPj4gOFxuICAgIGxvID0gYyAlIDI1NlxuICAgIGJ5dGVBcnJheS5wdXNoKGxvKVxuICAgIGJ5dGVBcnJheS5wdXNoKGhpKVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0J5dGVzIChzdHIpIHtcbiAgcmV0dXJuIGJhc2U2NC50b0J5dGVBcnJheShzdHIpXG59XG5cbmZ1bmN0aW9uIGJsaXRCdWZmZXIgKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgcG9zXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoKGkgKyBvZmZzZXQgPj0gZHN0Lmxlbmd0aCkgfHwgKGkgPj0gc3JjLmxlbmd0aCkpXG4gICAgICBicmVha1xuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIGRlY29kZVV0ZjhDaGFyIChzdHIpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHN0cilcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoMHhGRkZEKSAvLyBVVEYgOCBpbnZhbGlkIGNoYXJcbiAgfVxufVxuXG4vKlxuICogV2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhhdCB0aGUgdmFsdWUgaXMgYSB2YWxpZCBpbnRlZ2VyLiBUaGlzIG1lYW5zIHRoYXQgaXRcbiAqIGlzIG5vbi1uZWdhdGl2ZS4gSXQgaGFzIG5vIGZyYWN0aW9uYWwgY29tcG9uZW50IGFuZCB0aGF0IGl0IGRvZXMgbm90XG4gKiBleGNlZWQgdGhlIG1heGltdW0gYWxsb3dlZCB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gdmVyaWZ1aW50ICh2YWx1ZSwgbWF4KSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA+PSAwLCAnc3BlY2lmaWVkIGEgbmVnYXRpdmUgdmFsdWUgZm9yIHdyaXRpbmcgYW4gdW5zaWduZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgaXMgbGFyZ2VyIHRoYW4gbWF4aW11bSB2YWx1ZSBmb3IgdHlwZScpXG4gIGFzc2VydChNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpXG59XG5cbmZ1bmN0aW9uIHZlcmlmc2ludCAodmFsdWUsIG1heCwgbWluKSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydChNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpXG59XG5cbmZ1bmN0aW9uIHZlcmlmSUVFRTc1NCAodmFsdWUsIG1heCwgbWluKSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpXG59XG5cbmZ1bmN0aW9uIGFzc2VydCAodGVzdCwgbWVzc2FnZSkge1xuICBpZiAoIXRlc3QpIHRocm93IG5ldyBFcnJvcihtZXNzYWdlIHx8ICdGYWlsZWQgYXNzZXJ0aW9uJylcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcYnVmZmVyXFxcXGluZGV4LmpzXCIsXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJ1ZmZlclwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbmV4cG9ydHMucmVhZCA9IGZ1bmN0aW9uIChidWZmZXIsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtXG4gIHZhciBlTGVuID0gKG5CeXRlcyAqIDgpIC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBuQml0cyA9IC03XG4gIHZhciBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDBcbiAgdmFyIGQgPSBpc0xFID8gLTEgOiAxXG4gIHZhciBzID0gYnVmZmVyW29mZnNldCArIGldXG5cbiAgaSArPSBkXG5cbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgcyA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gZUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gKGUgKiAyNTYpICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgZSA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gbUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gKG0gKiAyNTYpICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzXG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KVxuICB9IGVsc2Uge1xuICAgIG0gPSBtICsgTWF0aC5wb3coMiwgbUxlbilcbiAgICBlID0gZSAtIGVCaWFzXG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbilcbn1cblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uIChidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSwgY1xuICB2YXIgZUxlbiA9IChuQnl0ZXMgKiA4KSAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApXG4gIHZhciBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSlcbiAgdmFyIGQgPSBpc0xFID8gMSA6IC0xXG4gIHZhciBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwXG5cbiAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSlcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMFxuICAgIGUgPSBlTWF4XG4gIH0gZWxzZSB7XG4gICAgZSA9IE1hdGguZmxvb3IoTWF0aC5sb2codmFsdWUpIC8gTWF0aC5MTjIpXG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tXG4gICAgICBjICo9IDJcbiAgICB9XG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICB2YWx1ZSArPSBydCAvIGNcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpXG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrXG4gICAgICBjIC89IDJcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwXG4gICAgICBlID0gZU1heFxuICAgIH0gZWxzZSBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIG0gPSAoKHZhbHVlICogYykgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gZSArIGVCaWFzXG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSB2YWx1ZSAqIE1hdGgucG93KDIsIGVCaWFzIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IDBcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KSB7fVxuXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG1cbiAgZUxlbiArPSBtTGVuXG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCkge31cblxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjhcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcaWVlZTc1NFxcXFxpbmRleC5qc1wiLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxpZWVlNzU0XCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXHByb2Nlc3NcXFxcYnJvd3Nlci5qc1wiLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxwcm9jZXNzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5Bc2tEaWFsb2cgPSBleHBvcnRzLkFza0RpYWxvZ1Byb3BzID0gdm9pZCAwO1xyXG52YXIgcmFuZG9tXzEgPSByZXF1aXJlKFwiLi4vdXRpbC9yYW5kb21cIik7XHJcbnZhciBBc2tEaWFsb2dQcm9wcyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIEFza0RpYWxvZ1Byb3BzKCkge1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIEFza0RpYWxvZ1Byb3BzO1xyXG59KCkpO1xyXG5leHBvcnRzLkFza0RpYWxvZ1Byb3BzID0gQXNrRGlhbG9nUHJvcHM7XHJcbnZhciBBc2tEaWFsb2cgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBBc2tEaWFsb2cocHJvcHMpIHtcclxuICAgICAgICB0aGlzLnByb3BzID0gcHJvcHM7XHJcbiAgICB9XHJcbiAgICBBc2tEaWFsb2cucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgYWxsb3dCdXR0b25JZCA9IFwiYWxsb3ctXCIgKyByYW5kb21fMS5yYW5kb21OdW1iZXIoKTtcclxuICAgICAgICB2YXIgZGVueUJ1dHRvbklkID0gXCJkZW55LVwiICsgcmFuZG9tXzEucmFuZG9tTnVtYmVyKCk7XHJcbiAgICAgICAgdmFyIGNvbnRlbnQgPSB0aGlzLnByb3BzLm1lc3NhZ2UgKyBcIlxcbiAgICAgICAgICAgIDxwPlxcbiAgICAgICAgICAgICAgICA8YSBocmVmPVxcXCIjXFxcIiBpZD1cXFwiXCIgKyBhbGxvd0J1dHRvbklkICsgXCJcXFwiIGNsYXNzPVxcXCJidG4gYnRuLXNtXFxcIj5BY2NlcHQ8L2J1dHRvbj5cXG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cXFwiI1xcXCIgaWQ9XFxcIlwiICsgZGVueUJ1dHRvbklkICsgXCJcXFwiIGNsYXNzPVxcXCJidG4gYnRuLXNtXFxcIj5EZW55PC9idXR0b24+XFxuICAgICAgICAgICAgPC9wPlwiO1xyXG4gICAgICAgICQudG9hc3Qoe1xyXG4gICAgICAgICAgICBoZWFkaW5nOiB0aGlzLnByb3BzLnRpdGxlLFxyXG4gICAgICAgICAgICB0ZXh0OiBjb250ZW50LFxyXG4gICAgICAgICAgICBzaG93SGlkZVRyYW5zaXRpb246ICdzbGlkZScsXHJcbiAgICAgICAgICAgIGhpZGVBZnRlcjogZmFsc2UsXHJcbiAgICAgICAgICAgIGJnQ29sb3I6IHRoaXMucHJvcHMuaXNXYXJuaW5nID8gXCIjODAwMDAwXCIgOiBcIiMxNjQxNTdcIixcclxuICAgICAgICAgICAgaWNvbjogdGhpcy5wcm9wcy5pY29uLFxyXG4gICAgICAgICAgICBzdGFjazogNSxcclxuICAgICAgICAgICAgbG9hZGVyOiBmYWxzZSxcclxuICAgICAgICAgICAgYWZ0ZXJTaG93bjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuYWxsb3dCdXR0b25FbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYWxsb3dCdXR0b25JZCk7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5kZW55QnV0dG9uRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRlbnlCdXR0b25JZCk7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5yb290ID0gJChfdGhpcy5hbGxvd0J1dHRvbkVsZW1lbnQpLmNsb3Nlc3QoXCIuanEtdG9hc3Qtd3JhcFwiKVswXTtcclxuICAgICAgICAgICAgICAgIF90aGlzLmF0dGFjaEhhbmRsZXJzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBBc2tEaWFsb2cucHJvdG90eXBlLmF0dGFjaEhhbmRsZXJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5hbGxvd0J1dHRvbkVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgX3RoaXMucHJvcHMuYWxsb3dDYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKVxyXG4gICAgICAgICAgICAgICAgX3RoaXMucHJvcHMuYWxsb3dDYWxsYmFjayhfdGhpcy5wcm9wcy5wYXJhbSk7XHJcbiAgICAgICAgICAgIChfdGhpcy5yb290KS5yZW1vdmUoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmRlbnlCdXR0b25FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIF90aGlzLnByb3BzLmRlbnlDYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5wcm9wcy5kZW55Q2FsbGJhY2soX3RoaXMucHJvcHMucGFyYW0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICQoX3RoaXMucm9vdCkucmVtb3ZlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIEFza0RpYWxvZztcclxufSgpKTtcclxuZXhwb3J0cy5Bc2tEaWFsb2cgPSBBc2tEaWFsb2c7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUFza0RpYWxvZy5qcy5tYXBcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvY29tcG9uZW50c1xcXFxBc2tEaWFsb2cuanNcIixcIi9jb21wb25lbnRzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBfX3NwcmVhZEFycmF5ID0gKHRoaXMgJiYgdGhpcy5fX3NwcmVhZEFycmF5KSB8fCBmdW5jdGlvbiAodG8sIGZyb20pIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBpbCA9IGZyb20ubGVuZ3RoLCBqID0gdG8ubGVuZ3RoOyBpIDwgaWw7IGkrKywgaisrKVxyXG4gICAgICAgIHRvW2pdID0gZnJvbVtpXTtcclxuICAgIHJldHVybiB0bztcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLkNoYXR0aW5nUGFuZWwgPSBleHBvcnRzLkNoYXR0aW5nUGFuZWxQcm9wcyA9IHZvaWQgMDtcclxudmFyIHNuaXBwZXRfMSA9IHJlcXVpcmUoXCIuLi91dGlsL3NuaXBwZXRcIik7XHJcbnZhciBDaGF0dGluZ1BhbmVsUHJvcHMgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBDaGF0dGluZ1BhbmVsUHJvcHMoKSB7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gQ2hhdHRpbmdQYW5lbFByb3BzO1xyXG59KCkpO1xyXG5leHBvcnRzLkNoYXR0aW5nUGFuZWxQcm9wcyA9IENoYXR0aW5nUGFuZWxQcm9wcztcclxudmFyIENoYXR0aW5nUGFuZWwgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBDaGF0dGluZ1BhbmVsKCkge1xyXG4gICAgICAgIHRoaXMudW5yZWFkQ291bnQgPSAwO1xyXG4gICAgICAgIHRoaXMuaXNQcml2YXRlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5uYW1lQ29sb3JzID0gW107XHJcbiAgICAgICAgdGhpcy5yZW1haW5Db2xvcnMgPSBbXTtcclxuICAgIH1cclxuICAgIENoYXR0aW5nUGFuZWwucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAocHJvcHMpIHtcclxuICAgICAgICB0aGlzLnByb3BzID0gcHJvcHM7XHJcbiAgICAgICAgdGhpcy5yb290ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzaWRlVG9vbGJhckNvbnRhaW5lclwiKTtcclxuICAgICAgICB0aGlzLmNsb3NlQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LWNsb3NlLWJ1dHRvblwiKTtcclxuICAgICAgICB0aGlzLmlucHV0RmllbGQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NoYXQtaW5wdXQgI3VzZXJtc2dcIik7XHJcbiAgICAgICAgdGhpcy5zZW5kQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zZW5kLWJ1dHRvblwiKTtcclxuICAgICAgICB0aGlzLnByaXZhdGVQYW5lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2hhdC1yZWNpcGllbnRcIik7XHJcbiAgICAgICAgdGhpcy5wcml2YXRlTGFiZWxFbGVtZW50ID0gJCh0aGlzLnByaXZhdGVQYW5lbCkuZmluZChcIj5zcGFuXCIpWzBdO1xyXG4gICAgICAgIHRoaXMucHJpdmF0ZUNsb3NlRWxlbWVudCA9ICQodGhpcy5wcml2YXRlUGFuZWwpLmZpbmQoXCI+ZGl2XCIpWzBdO1xyXG4gICAgICAgIHRoaXMubmFtZUNvbG9ycy5wdXNoKFwiIzAwYmZmZlwiKTsgLy9kZWVwc2t5Ymx1ZVxyXG4gICAgICAgIHRoaXMubmFtZUNvbG9ycy5wdXNoKFwiIzlhY2QzMlwiKTsgLy95ZWxsb3dncmVlblxyXG4gICAgICAgIHRoaXMubmFtZUNvbG9ycy5wdXNoKFwiI2QyNjkxZVwiKTsgLy9jaG9jb2xhdGVcclxuICAgICAgICB0aGlzLm5hbWVDb2xvcnMucHVzaChcIiNlZTgyZWVcIik7IC8vdmlvbGV0XHJcbiAgICAgICAgdGhpcy5uYW1lQ29sb3JzLnB1c2goXCIjNjQ5NWVkXCIpOyAvL2Nvcm5mbG93ZXJibHVlXHJcbiAgICAgICAgdGhpcy5uYW1lQ29sb3JzLnB1c2goXCIjZmZkNzAwXCIpOyAvL2dvbGRcclxuICAgICAgICB0aGlzLm5hbWVDb2xvcnMucHVzaChcIiM4MDgwMDBcIik7IC8vb2xpdmVcclxuICAgICAgICB0aGlzLm5hbWVDb2xvcnMucHVzaChcIiNjZDg1M2ZcIik7IC8vcGVydVxyXG4gICAgICAgIHRoaXMucmVtYWluQ29sb3JzID0gX19zcHJlYWRBcnJheShbXSwgdGhpcy5uYW1lQ29sb3JzKTtcclxuICAgICAgICB0aGlzLm5hbWVDb2xvck1hcCA9IG5ldyBNYXAoKTtcclxuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50SGFuZGxlcnMoKTtcclxuICAgICAgICB0aGlzLm9wZW4odGhpcy5vcGVuZWQpO1xyXG4gICAgfTtcclxuICAgIENoYXR0aW5nUGFuZWwucHJvdG90eXBlLmF0dGFjaEV2ZW50SGFuZGxlcnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzXzEgPSB0aGlzO1xyXG4gICAgICAgICQodGhpcy5jbG9zZUJ1dHRvbikub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBfdGhpc18xLm9wZW4oZmFsc2UpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQodGhpcy5pbnB1dEZpZWxkKS5rZXlwcmVzcyhmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBpZiAoKGUua2V5Q29kZSB8fCBlLndoaWNoKSA9PSAxMykgeyAvL0VudGVyIGtleWNvZGVcclxuICAgICAgICAgICAgICAgIGlmICghZS5zaGlmdEtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpc18xLm9uU2VuZCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCh0aGlzLnNlbmRCdXR0b24pLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgX3RoaXNfMS5vblNlbmQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgICQoXCIuc21pbGV5Q29udGFpbmVyXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGlkID0gJCh0aGlzKS5hdHRyKFwiaWRcIik7XHJcbiAgICAgICAgICAgIHZhciBpbW9uYW1lID0gX3RoaXMuaWRUb0Vtb25hbWUoaWQpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhpbW9uYW1lKTtcclxuICAgICAgICAgICAgdmFyIHNlbmRlbCA9ICQoXCIjdXNlcm1zZ1wiKTtcclxuICAgICAgICAgICAgdmFyIHNtcyA9IHNlbmRlbC52YWwoKTtcclxuICAgICAgICAgICAgc21zICs9IGltb25hbWU7XHJcbiAgICAgICAgICAgIHNlbmRlbC52YWwoc21zKTtcclxuICAgICAgICAgICAgdmFyIGVsID0gJChcIi5zbWlsZXlzLXBhbmVsXCIpO1xyXG4gICAgICAgICAgICBlbC5yZW1vdmVDbGFzcyhcInNob3ctc21pbGV5c1wiKTtcclxuICAgICAgICAgICAgZWwuYWRkQ2xhc3MoXCJoaWRlLXNtaWxleXNcIik7XHJcbiAgICAgICAgICAgIHNlbmRlbC5mb2N1cygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoXCIjc21pbGV5c1wiKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBlbCA9ICQoXCIuc21pbGV5cy1wYW5lbFwiKTtcclxuICAgICAgICAgICAgaWYgKGVsLmhhc0NsYXNzKFwiaGlkZS1zbWlsZXlzXCIpKSB7XHJcbiAgICAgICAgICAgICAgICBlbC5yZW1vdmVDbGFzcyhcImhpZGUtc21pbGV5c1wiKTtcclxuICAgICAgICAgICAgICAgIGVsLmFkZENsYXNzKFwic2hvdy1zbWlsZXlzXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZWwucmVtb3ZlQ2xhc3MoXCJzaG93LXNtaWxleXNcIik7XHJcbiAgICAgICAgICAgICAgICBlbC5hZGRDbGFzcyhcImhpZGUtc21pbGV5c1wiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQodGhpcy5wcml2YXRlQ2xvc2VFbGVtZW50KS5jbGljayhmdW5jdGlvbiAoXykge1xyXG4gICAgICAgICAgICBfdGhpc18xLmNsZWFyUHJpdmF0ZVN0YXRlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgQ2hhdHRpbmdQYW5lbC5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uIChvcGVuZWQpIHtcclxuICAgICAgICBpZiAob3BlbmVkKSB7XHJcbiAgICAgICAgICAgICQoXCIjdmlkZW8tcGFuZWxcIikuYWRkQ2xhc3MoXCJzaGlmdC1yaWdodFwiKTtcclxuICAgICAgICAgICAgJChcIiNuZXctdG9vbGJveFwiKS5hZGRDbGFzcyhcInNoaWZ0LXJpZ2h0XCIpO1xyXG4gICAgICAgICAgICAkKHRoaXMucm9vdCkucmVtb3ZlQ2xhc3MoXCJpbnZpc2libGVcIik7XHJcbiAgICAgICAgICAgICQodGhpcy5pbnB1dEZpZWxkKS5mb2N1cygpO1xyXG4gICAgICAgICAgICAkKFwiLnRvb2xib3gtaWNvblwiLCB0aGlzLnByb3BzLmNoYXRPcGVuQnV0dG9uKS5hZGRDbGFzcyhcInRvZ2dsZWRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAkKFwiI3ZpZGVvLXBhbmVsXCIpLnJlbW92ZUNsYXNzKFwic2hpZnQtcmlnaHRcIik7XHJcbiAgICAgICAgICAgICQoXCIjbmV3LXRvb2xib3hcIikucmVtb3ZlQ2xhc3MoXCJzaGlmdC1yaWdodFwiKTtcclxuICAgICAgICAgICAgJCh0aGlzLnJvb3QpLmFkZENsYXNzKFwiaW52aXNpYmxlXCIpO1xyXG4gICAgICAgICAgICAkKFwiLnRvb2xib3gtaWNvblwiLCB0aGlzLnByb3BzLmNoYXRPcGVuQnV0dG9uKS5yZW1vdmVDbGFzcyhcInRvZ2dsZWRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudW5yZWFkQ291bnQgPSAwO1xyXG4gICAgICAgIHRoaXMuc2hvd1VucmVhZEJhZGdlKGZhbHNlKTtcclxuICAgICAgICB0aGlzLm9wZW5lZCA9IG9wZW5lZDtcclxuICAgICAgICB0aGlzLnByb3BzLm9wZW5DYWxsYmFjaygpO1xyXG4gICAgfTtcclxuICAgIENoYXR0aW5nUGFuZWwucHJvdG90eXBlLmNsZWFySW5wdXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJCh0aGlzLmlucHV0RmllbGQpLnZhbCgnJyk7XHJcbiAgICB9O1xyXG4gICAgQ2hhdHRpbmdQYW5lbC5wcm90b3R5cGUuc2hvd1VucmVhZEJhZGdlID0gZnVuY3Rpb24gKHNob3cpIHtcclxuICAgICAgICB0aGlzLnByb3BzLnVucmVhZEJhZGdlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gISFzaG93ID8gXCJmbGV4XCIgOiBcIm5vbmVcIjtcclxuICAgIH07XHJcbiAgICBDaGF0dGluZ1BhbmVsLnByb3RvdHlwZS50b2dnbGVPcGVuID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMub3BlbmVkID0gIXRoaXMub3BlbmVkO1xyXG4gICAgICAgIHRoaXMub3Blbih0aGlzLm9wZW5lZCk7XHJcbiAgICB9O1xyXG4gICAgQ2hhdHRpbmdQYW5lbC5wcm90b3R5cGUub25TZW5kID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBtc2cgPSAkKHRoaXMuaW5wdXRGaWVsZCkudmFsKCkudG9TdHJpbmcoKS50cmltKCk7XHJcbiAgICAgICAgdGhpcy5jbGVhcklucHV0KCk7XHJcbiAgICAgICAgaWYgKCFtc2cpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBtc2cgPSB0aGlzLmVtb25hbWVUb0Vtb2ljb24obXNnKTtcclxuICAgICAgICB2YXIgdGltZSA9IHRoaXMuZ2V0Q3VyVGltZSgpO1xyXG4gICAgICAgIHZhciBwcml2YXRlQ2xhc3MgPSB0aGlzLmlzUHJpdmF0ZSA/IFwicHJpdmF0ZVwiIDogXCJcIjtcclxuICAgICAgICB2YXIgcHJpdmF0ZURldGFpbCA9IFwiXCI7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNQcml2YXRlKSB7XHJcbiAgICAgICAgICAgIHByaXZhdGVEZXRhaWwgPSBcIjxkaXYgc3R5bGU9XFxcImNvbG9yOiM3Nzg4OTlcXFwiPnByaXZhdGU6IFwiICsgdGhpcy5wcml2YXRlU2VuZGVyTmFtZSArIFwiPC9kaXY+XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBzZWwgPSAkKFwiI2NoYXRjb252ZXJzYXRpb24gZGl2LmNoYXQtbWVzc2FnZS1ncm91cDpsYXN0LWNoaWxkXCIpO1xyXG4gICAgICAgIGlmIChzZWwuaGFzQ2xhc3MoXCJsb2NhbFwiKSkge1xyXG4gICAgICAgICAgICBzZWwuZmluZChcIi50aW1lc3RhbXBcIikucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHNlbC5hcHBlbmQoXCI8ZGl2IGNsYXNzPSBcXFwiY2hhdG1lc3NhZ2Utd3JhcHBlclxcXCIgPiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjaGF0bWVzc2FnZSBcIiArIHByaXZhdGVDbGFzcyArIFwiXFxcIj4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInJlcGx5d3JhcHBlclxcXCI+ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwibWVzc2FnZWNvbnRlbnRcXFwiPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ1c2VybWVzc2FnZVxcXCI+IFwiICsgbXNnICsgXCIgPC9kaXY+ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiICsgcHJpdmF0ZURldGFpbCArIFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+ICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInRpbWVzdGFtcFxcXCI+IFwiICsgdGltZSArIFwiIDwvZGl2PiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2ID5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAkKFwiI2NoYXRjb252ZXJzYXRpb25cIikuYXBwZW5kKFwiPGRpdiBjbGFzcz1cXFwiY2hhdC1tZXNzYWdlLWdyb3VwIGxvY2FsXFxcIj4gICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSBcXFwiY2hhdG1lc3NhZ2Utd3JhcHBlclxcXCIgPiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImNoYXRtZXNzYWdlIFwiICsgcHJpdmF0ZUNsYXNzICsgXCJcXFwiPiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBseXdyYXBwZXJcXFwiPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwibWVzc2FnZWNvbnRlbnRcXFwiPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInVzZXJtZXNzYWdlXFxcIj4gXCIgKyBtc2cgKyBcIiA8L2Rpdj4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiArIHByaXZhdGVEZXRhaWwgKyBcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+ICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInRpbWVzdGFtcFxcXCI+IFwiICsgdGltZSArIFwiIDwvZGl2PiAgICAgICAgICAgICAgICAgICAgPC9kaXYgPiAgICAgICAgICAgICAgICA8L2Rpdj5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2Nyb2xsVG9Cb3R0b20oKTtcclxuICAgICAgICBpZiAodGhpcy5pc1ByaXZhdGUpIHtcclxuICAgICAgICAgICAgdGhpcy5wcm9wcy5zZW5kUHJpdmF0ZUNoYXQodGhpcy5wcml2YXRlU2VuZGVySWQsIG1zZyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnByb3BzLnNlbmRDaGF0KG1zZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8vY2hhdFxyXG4gICAgQ2hhdHRpbmdQYW5lbC5wcm90b3R5cGUucmVjZWl2ZU1lc3NhZ2UgPSBmdW5jdGlvbiAoaWQsIHVzZXJuYW1lLCBtZXNzYWdlLCBpc1ByaXZhdGUpIHtcclxuICAgICAgICBpZiAoaXNQcml2YXRlID09PSB2b2lkIDApIHsgaXNQcml2YXRlID0gZmFsc2U7IH1cclxuICAgICAgICAvL3VwZGF0ZSB1bnJlYWQgY291bnRcclxuICAgICAgICBpZiAoIXRoaXMub3BlbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMudW5yZWFkQ291bnQrKztcclxuICAgICAgICAgICAgJCh0aGlzLnByb3BzLnVucmVhZEJhZGdlRWxlbWVudCkuaHRtbChcIlwiICsgdGhpcy51bnJlYWRDb3VudCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd1VucmVhZEJhZGdlKHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL3VwZGF0ZSB1aVxyXG4gICAgICAgIHZhciBlbW9NZXNzYWdlID0gdGhpcy5lbW9uYW1lVG9FbW9pY29uKG1lc3NhZ2UpO1xyXG4gICAgICAgIHZhciBuYW1lQ29sb3IgPSB0aGlzLmdldE5hbWVDb2xvcih1c2VybmFtZSk7XHJcbiAgICAgICAgdmFyIHByaXZhdGVDbGFzcyA9IGlzUHJpdmF0ZSA/IFwicHJpdmF0ZVwiIDogXCJcIjtcclxuICAgICAgICB2YXIgcmVwbHlFbGVtID0gXCJcIjtcclxuICAgICAgICBpZiAoaXNQcml2YXRlKSB7XHJcbiAgICAgICAgICAgIHJlcGx5RWxlbSA9IFwiXFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJqaXRzaS1pY29uXFxcIiBqaXRzaS1pZD1cXFwiXCIgKyBpZCArIFwiXFxcIiBqaXRzaS1uYW1lPVxcXCJcIiArIHVzZXJuYW1lICsgXCJcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgPHN2ZyBoZWlnaHQ9XFxcIjIyXFxcIiB3aWR0aD1cXFwiMjJcXFwiIHZpZXdCb3g9XFxcIjAgMCAzNiAzNlxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cXFwiTTMwLDI5YTEsMSwwLDAsMS0uODEtLjQxbC0yLjEyLTIuOTJBMTguNjYsMTguNjYsMCwwLDAsMTUsMTguMjVWMjJhMSwxLDAsMCwxLTEuNi44bC0xMi05YTEsMSwwLDAsMSwwLTEuNmwxMi05QTEsMSwwLDAsMSwxNSw0VjguMjRBMTksMTksMCwwLDEsMzEsMjd2MWExLDEsMCwwLDEtLjY5Ljk1QTEuMTIsMS4xMiwwLDAsMSwzMCwyOVpNMTQsMTYuMTFoLjFBMjAuNjgsMjAuNjgsMCwwLDEsMjguNjksMjQuNWwuMTYuMjFhMTcsMTcsMCwwLDAtMTUtMTQuNiwxLDEsMCwwLDEtLjg5LTFWNkwzLjY3LDEzLDEzLDIwVjE3LjExYTEsMSwwLDAsMSwuMzMtLjc0QTEsMSwwLDAsMSwxNCwxNi4xMVpcXFwiPjwvcGF0aD5cXG4gICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxcbiAgICAgICAgICAgICAgICA8L3NwYW4+XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciAkY2hhdGl0ZW0gPSAkKFwiPGRpdiBjbGFzcz1cXFwiY2hhdC1tZXNzYWdlLWdyb3VwIHJlbW90ZVxcXCI+ICAgICAgICAgPGRpdiBjbGFzcz0gXFxcImNoYXRtZXNzYWdlLXdyYXBwZXJcXFwiID4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiY2hhdG1lc3NhZ2UgXCIgKyBwcml2YXRlQ2xhc3MgKyBcIlxcXCI+ICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBseXdyYXBwZXJcXFwiPiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcIm1lc3NhZ2Vjb250ZW50XFxcIj4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZGlzcGxheS1uYW1lXFxcIiBzdHlsZT1cXFwiY29sb3I6XCIgKyBuYW1lQ29sb3IgKyBcIlxcXCI+XCIgKyB1c2VybmFtZSArIHJlcGx5RWxlbSArICc8L2Rpdj5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVzZXJtZXNzYWdlXCI+JyArIGVtb01lc3NhZ2UgKyAnPC9kaXY+XFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxcclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXFxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxcclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aW1lc3RhbXBcIj4nICsgdGhpcy5nZXRDdXJUaW1lKCkgKyAnPC9kaXY+XFxcclxuICAgICAgICAgICAgPC9kaXYgPlxcXHJcbiAgICAgICAgPC9kaXY+Jyk7XHJcbiAgICAgICAgJChcIiNjaGF0Y29udmVyc2F0aW9uXCIpLmFwcGVuZCgkY2hhdGl0ZW0pO1xyXG4gICAgICAgIGlmIChpc1ByaXZhdGUpIHtcclxuICAgICAgICAgICAgdmFyIF90aGlzXzIgPSB0aGlzO1xyXG4gICAgICAgICAgICAkY2hhdGl0ZW0uZmluZChcIi5qaXRzaS1pY29uXCIpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmF0dHIoXCJqaXRzaS1pZFwiKTtcclxuICAgICAgICAgICAgICAgIHZhciBuYW1lID0gJCh0aGlzKS5hdHRyKFwiaml0c2ktbmFtZVwiKTtcclxuICAgICAgICAgICAgICAgIF90aGlzXzIuc2V0UHJpdmF0ZVN0YXRlKGlkLCBuYW1lKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2Nyb2xsVG9Cb3R0b20oKTtcclxuICAgICAgICBpZiAoaXNQcml2YXRlKVxyXG4gICAgICAgICAgICB0aGlzLnNldFByaXZhdGVTdGF0ZShpZCwgdXNlcm5hbWUpO1xyXG4gICAgfTtcclxuICAgIENoYXR0aW5nUGFuZWwucHJvdG90eXBlLnNjcm9sbFRvQm90dG9tID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBvdmVyaGVpZ2h0ID0gMDtcclxuICAgICAgICAkKFwiLmNoYXQtbWVzc2FnZS1ncm91cFwiKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgb3ZlcmhlaWdodCArPSAkKHRoaXMpLmhlaWdodCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBsaW1pdCA9ICQoJyNjaGF0Y29udmVyc2F0aW9uJykuaGVpZ2h0KCk7XHJcbiAgICAgICAgdmFyIHBvcyA9IG92ZXJoZWlnaHQgLSBsaW1pdDtcclxuICAgICAgICAkKFwiI2NoYXRjb252ZXJzYXRpb25cIikuYW5pbWF0ZSh7IHNjcm9sbFRvcDogcG9zIH0sIDIwMCk7XHJcbiAgICB9O1xyXG4gICAgQ2hhdHRpbmdQYW5lbC5wcm90b3R5cGUuZ2V0Q3VyVGltZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgdmFyIGggPSBkYXRlLmdldEhvdXJzKCk7XHJcbiAgICAgICAgdmFyIG0gPSBkYXRlLmdldE1pbnV0ZXMoKTtcclxuICAgICAgICB2YXIgbV8yID0gKFwiMFwiICsgbSkuc2xpY2UoLTIpO1xyXG4gICAgICAgIHZhciBoXzIgPSAoXCIwXCIgKyBoKS5zbGljZSgtMik7XHJcbiAgICAgICAgdmFyIHRpbWUgPSBoXzIgKyBcIjpcIiArIG1fMjtcclxuICAgICAgICByZXR1cm4gdGltZTtcclxuICAgIH07XHJcbiAgICBDaGF0dGluZ1BhbmVsLnByb3RvdHlwZS5pZFRvRW1vbmFtZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgIGlmIChpZCA9PSAnc21pbGV5MScpXHJcbiAgICAgICAgICAgIHJldHVybiAnOiknO1xyXG4gICAgICAgIGlmIChpZCA9PSAnc21pbGV5MicpXHJcbiAgICAgICAgICAgIHJldHVybiAnOignO1xyXG4gICAgICAgIGlmIChpZCA9PSAnc21pbGV5MycpXHJcbiAgICAgICAgICAgIHJldHVybiAnOkQnO1xyXG4gICAgICAgIGlmIChpZCA9PSAnc21pbGV5NCcpXHJcbiAgICAgICAgICAgIHJldHVybiAnOisxOic7XHJcbiAgICAgICAgaWYgKGlkID09ICdzbWlsZXk1JylcclxuICAgICAgICAgICAgcmV0dXJuICc6UCc7XHJcbiAgICAgICAgaWYgKGlkID09ICdzbWlsZXk2JylcclxuICAgICAgICAgICAgcmV0dXJuICc6d2F2ZTonO1xyXG4gICAgICAgIGlmIChpZCA9PSAnc21pbGV5NycpXHJcbiAgICAgICAgICAgIHJldHVybiAnOmJsdXNoOic7XHJcbiAgICAgICAgaWYgKGlkID09ICdzbWlsZXk4JylcclxuICAgICAgICAgICAgcmV0dXJuICc6c2xpZ2h0bHlfc21pbGluZ19mYWNlOic7XHJcbiAgICAgICAgaWYgKGlkID09ICdzbWlsZXk5JylcclxuICAgICAgICAgICAgcmV0dXJuICc6c2NyZWFtOic7XHJcbiAgICAgICAgaWYgKGlkID09ICdzbWlsZXkxMCcpXHJcbiAgICAgICAgICAgIHJldHVybiAnOionO1xyXG4gICAgICAgIGlmIChpZCA9PSAnc21pbGV5MTEnKVxyXG4gICAgICAgICAgICByZXR1cm4gJzotMTonO1xyXG4gICAgICAgIGlmIChpZCA9PSAnc21pbGV5MTInKVxyXG4gICAgICAgICAgICByZXR1cm4gJzptYWc6JztcclxuICAgICAgICBpZiAoaWQgPT0gJ3NtaWxleTEzJylcclxuICAgICAgICAgICAgcmV0dXJuICc6aGVhcnQ6JztcclxuICAgICAgICBpZiAoaWQgPT0gJ3NtaWxleTE0JylcclxuICAgICAgICAgICAgcmV0dXJuICc6aW5ub2NlbnQ6JztcclxuICAgICAgICBpZiAoaWQgPT0gJ3NtaWxleTE1JylcclxuICAgICAgICAgICAgcmV0dXJuICc6YW5ncnk6JztcclxuICAgICAgICBpZiAoaWQgPT0gJ3NtaWxleTE2JylcclxuICAgICAgICAgICAgcmV0dXJuICc6YW5nZWw6JztcclxuICAgICAgICBpZiAoaWQgPT0gJ3NtaWxleTE3JylcclxuICAgICAgICAgICAgcmV0dXJuICc7KCc7XHJcbiAgICAgICAgaWYgKGlkID09ICdzbWlsZXkxOCcpXHJcbiAgICAgICAgICAgIHJldHVybiAnOmNsYXA6JztcclxuICAgICAgICBpZiAoaWQgPT0gJ3NtaWxleTE5JylcclxuICAgICAgICAgICAgcmV0dXJuICc7KSc7XHJcbiAgICAgICAgaWYgKGlkID09ICdzbWlsZXkyMCcpXHJcbiAgICAgICAgICAgIHJldHVybiAnOmJlZXI6JztcclxuICAgIH07XHJcbiAgICBDaGF0dGluZ1BhbmVsLnByb3RvdHlwZS5lbW9uYW1lVG9FbW9pY29uID0gZnVuY3Rpb24gKHNtcykge1xyXG4gICAgICAgIHZhciBzbXNvdXQgPSBzbXM7XHJcbiAgICAgICAgc21zb3V0ID0gc21zb3V0LnJlcGxhY2UoJzopJywgJzxzcGFuIGNsYXNzPVwic21pbGV5XCIgc3R5bGU9XCJ3aWR0aDogMjBweDsgaGVpZ2h0OjIwcHg7XCI+8J+Ygzwvc3Bhbj4nKTtcclxuICAgICAgICBzbXNvdXQgPSBzbXNvdXQucmVwbGFjZSgnOignLCAnPHNwYW4gY2xhc3M9XCJzbWlsZXlcIj7wn5imPC9zcGFuPicpO1xyXG4gICAgICAgIHNtc291dCA9IHNtc291dC5yZXBsYWNlKCc6RCcsICc8c3BhbiBjbGFzcz1cInNtaWxleVwiPvCfmIQ8L3NwYW4+Jyk7XHJcbiAgICAgICAgc21zb3V0ID0gc21zb3V0LnJlcGxhY2UoJzorMTonLCAnPHNwYW4gY2xhc3M9XCJzbWlsZXlcIj7wn5GNPC9zcGFuPicpO1xyXG4gICAgICAgIHNtc291dCA9IHNtc291dC5yZXBsYWNlKCc6UCcsICc8c3BhbiBjbGFzcz1cInNtaWxleVwiPvCfmJs8L3NwYW4+Jyk7XHJcbiAgICAgICAgc21zb3V0ID0gc21zb3V0LnJlcGxhY2UoJzp3YXZlOicsICc8c3BhbiBjbGFzcz1cInNtaWxleVwiPvCfkYs8L3NwYW4+Jyk7XHJcbiAgICAgICAgc21zb3V0ID0gc21zb3V0LnJlcGxhY2UoJzpibHVzaDonLCAnPHNwYW4gY2xhc3M9XCJzbWlsZXlcIj7wn5iKPC9zcGFuPicpO1xyXG4gICAgICAgIHNtc291dCA9IHNtc291dC5yZXBsYWNlKCc6c2xpZ2h0bHlfc21pbGluZ19mYWNlOicsICc8c3BhbiBjbGFzcz1cInNtaWxleVwiPvCfmYI8L3NwYW4+Jyk7XHJcbiAgICAgICAgc21zb3V0ID0gc21zb3V0LnJlcGxhY2UoJzpzY3JlYW06JywgJzxzcGFuIGNsYXNzPVwic21pbGV5XCI+8J+YsTwvc3Bhbj4nKTtcclxuICAgICAgICBzbXNvdXQgPSBzbXNvdXQucmVwbGFjZSgnOionLCAnPHNwYW4gY2xhc3M9XCJzbWlsZXlcIj7wn5iXPC9zcGFuPicpO1xyXG4gICAgICAgIHNtc291dCA9IHNtc291dC5yZXBsYWNlKCc6LTE6JywgJzxzcGFuIGNsYXNzPVwic21pbGV5XCI+8J+Rjjwvc3Bhbj4nKTtcclxuICAgICAgICBzbXNvdXQgPSBzbXNvdXQucmVwbGFjZSgnOm1hZzonLCAnPHNwYW4gY2xhc3M9XCJzbWlsZXlcIj7wn5SNPC9zcGFuPicpO1xyXG4gICAgICAgIHNtc291dCA9IHNtc291dC5yZXBsYWNlKCc6aGVhcnQ6JywgJzxzcGFuIGNsYXNzPVwic21pbGV5XCI+4p2k77iPPC9zcGFuPicpO1xyXG4gICAgICAgIHNtc291dCA9IHNtc291dC5yZXBsYWNlKCc6aW5ub2NlbnQ6JywgJzxzcGFuIGNsYXNzPVwic21pbGV5XCI+8J+Yhzwvc3Bhbj4nKTtcclxuICAgICAgICBzbXNvdXQgPSBzbXNvdXQucmVwbGFjZSgnOmFuZ3J5OicsICc8c3BhbiBjbGFzcz1cInNtaWxleVwiPvCfmKA8L3NwYW4+Jyk7XHJcbiAgICAgICAgc21zb3V0ID0gc21zb3V0LnJlcGxhY2UoJzphbmdlbDonLCAnPHNwYW4gY2xhc3M9XCJzbWlsZXlcIj7wn5G8PC9zcGFuPicpO1xyXG4gICAgICAgIHNtc291dCA9IHNtc291dC5yZXBsYWNlKCc7KCcsICc8c3BhbiBjbGFzcz1cInNtaWxleVwiPvCfmK08L3NwYW4+Jyk7XHJcbiAgICAgICAgc21zb3V0ID0gc21zb3V0LnJlcGxhY2UoJzpjbGFwOicsICc8c3BhbiBjbGFzcz1cInNtaWxleVwiPvCfkY88L3NwYW4+Jyk7XHJcbiAgICAgICAgc21zb3V0ID0gc21zb3V0LnJlcGxhY2UoJzspJywgJzxzcGFuIGNsYXNzPVwic21pbGV5XCI+8J+YiTwvc3Bhbj4nKTtcclxuICAgICAgICBzbXNvdXQgPSBzbXNvdXQucmVwbGFjZSgnOmJlZXI6JywgJzxzcGFuIGNsYXNzPVwic21pbGV5XCI+8J+Nujwvc3Bhbj4nKTtcclxuICAgICAgICByZXR1cm4gc21zb3V0O1xyXG4gICAgfTtcclxuICAgIENoYXR0aW5nUGFuZWwucHJvdG90eXBlLmdldE5hbWVDb2xvciA9IGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubmFtZUNvbG9yTWFwLmhhcyhuYW1lKSlcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubmFtZUNvbG9yTWFwLmdldChuYW1lKTtcclxuICAgICAgICBpZiAodGhpcy5yZW1haW5Db2xvcnMubGVuZ3RoIDw9IDApXHJcbiAgICAgICAgICAgIHRoaXMucmVtYWluQ29sb3JzID0gX19zcHJlYWRBcnJheShbXSwgdGhpcy5uYW1lQ29sb3JzKTtcclxuICAgICAgICAvL1ttaW4sIG1heClcclxuICAgICAgICB2YXIgcmFuZEluZGV4ID0gc25pcHBldF8xLnJhbmRvbSgwLCB0aGlzLnJlbWFpbkNvbG9ycy5sZW5ndGgpO1xyXG4gICAgICAgIHZhciByYW5kb21Db2xvciA9IHRoaXMucmVtYWluQ29sb3JzW3JhbmRJbmRleF07XHJcbiAgICAgICAgdGhpcy5yZW1haW5Db2xvcnMuc3BsaWNlKHJhbmRJbmRleCwgMSk7XHJcbiAgICAgICAgdGhpcy5uYW1lQ29sb3JNYXAuc2V0KG5hbWUsIHJhbmRvbUNvbG9yKTtcclxuICAgICAgICByZXR1cm4gcmFuZG9tQ29sb3I7XHJcbiAgICB9O1xyXG4gICAgQ2hhdHRpbmdQYW5lbC5wcm90b3R5cGUuc2V0UHJpdmF0ZVN0YXRlID0gZnVuY3Rpb24gKGppdHNpSWQsIG5hbWUpIHtcclxuICAgICAgICB0aGlzLmlzUHJpdmF0ZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5wcml2YXRlU2VuZGVySWQgPSBqaXRzaUlkO1xyXG4gICAgICAgIHRoaXMucHJpdmF0ZVNlbmRlck5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMucHJpdmF0ZVBhbmVsLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcclxuICAgICAgICB0aGlzLnByaXZhdGVMYWJlbEVsZW1lbnQuaW5uZXJIVE1MID0gXCJQcml2YXRlIG1lc3NhZ2UgdG8gXCIgKyBuYW1lO1xyXG4gICAgfTtcclxuICAgIENoYXR0aW5nUGFuZWwucHJvdG90eXBlLmNsZWFyUHJpdmF0ZVN0YXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuaXNQcml2YXRlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5wcml2YXRlU2VuZGVySWQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMucHJpdmF0ZVBhbmVsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgIH07XHJcbiAgICByZXR1cm4gQ2hhdHRpbmdQYW5lbDtcclxufSgpKTtcclxuZXhwb3J0cy5DaGF0dGluZ1BhbmVsID0gQ2hhdHRpbmdQYW5lbDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Q2hhdHRpbmdQYW5lbC5qcy5tYXBcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvY29tcG9uZW50c1xcXFxDaGF0dGluZ1BhbmVsLmpzXCIsXCIvY29tcG9uZW50c1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcblwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuUGFydGljaXBhbnRMaXN0UGFuZWwgPSBleHBvcnRzLlBhcnRpY2lwYW50TGlzdFBhbmVsUHJvcHMgPSB2b2lkIDA7XHJcbnZhciBzbmlwcGV0XzEgPSByZXF1aXJlKFwiLi4vdXRpbC9zbmlwcGV0XCIpO1xyXG52YXIgdmVjdG9yX2ljb25fMSA9IHJlcXVpcmUoXCIuL3ZlY3Rvcl9pY29uXCIpO1xyXG52YXIgUGFydGljaXBhbnRJdGVtUHJvcHMgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBQYXJ0aWNpcGFudEl0ZW1Qcm9wcygpIHtcclxuICAgIH1cclxuICAgIHJldHVybiBQYXJ0aWNpcGFudEl0ZW1Qcm9wcztcclxufSgpKTtcclxudmFyIFBhcnRpY2lwYW50SXRlbSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFBhcnRpY2lwYW50SXRlbShwcm9wcykge1xyXG4gICAgICAgIHRoaXMucHJvcHMgPSBwcm9wcztcclxuICAgICAgICB0aGlzLnVzZUNhbWVyYSA9IHRoaXMucHJvcHMudXNlQ2FtZXJhO1xyXG4gICAgICAgIHRoaXMudXNlTWljID0gdGhpcy5wcm9wcy51c2VNaWM7XHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICB9XHJcbiAgICBQYXJ0aWNpcGFudEl0ZW0ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgYm9keSA9IFwiXFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiaml0c2ktcGFydGljaXBhbnRcXFwiPlxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJwYXJ0aWNpcGFudC1hdmF0YXJcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiYXZhdGFyICB1c2VyQXZhdGFyIHctNDBweCBoLTQwcHhcXFwiIHN0eWxlPVxcXCJiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIzNCwgMjU1LCAxMjgsIDAuNCk7XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGNsYXNzPVxcXCJhdmF0YXItc3ZnXFxcIiB2aWV3Qm94PVxcXCIwIDAgMTAwIDEwMFxcXCIgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIiB4bWxuczp4bGluaz1cXFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1xcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZXh0IGRvbWluYW50LWJhc2VsaW5lPVxcXCJjZW50cmFsXFxcIiBmaWxsPVxcXCJyZ2JhKDI1NSwyNTUsMjU1LC42KVxcXCIgZm9udC1zaXplPVxcXCI0MHB0XFxcIiB0ZXh0LWFuY2hvcj1cXFwibWlkZGxlXFxcIiB4PVxcXCI1MFxcXCIgeT1cXFwiNTBcXFwiPj88L3RleHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInBhcnRpY2lwYW50LWNvbnRlbnRcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcIm5hbWVcXFwiIGNsYXNzPVxcXCJmcy0yIGZ3LWJvbGRlclxcXCI+Pzwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJzcGFjZXJcXFwiPjwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImppdHNpLWljb24gY2FtZXJhLXRvZ2dsZS1idXR0b25cXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgaWQ9XFxcImNhbWVyYS1kaXNhYmxlZFxcXCIgd2lkdGg9XFxcIjIwXFxcIiBoZWlnaHQ9XFxcIjIwXFxcIiB2aWV3Qm94PVxcXCIwIDAgMjAgMjBcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVxcXCJcXFwiPjwvcGF0aD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiaml0c2ktaWNvbiBtaWMtdG9nZ2xlLWJ1dHRvblxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyBpZD1cXFwibWljLWRpc2FibGVkXFxcIiB3aWR0aD1cXFwiMjBcXFwiIGhlaWdodD1cXFwiMjBcXFwiIHZpZXdCb3g9XFxcIjAgMCAyMCAyMFxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XFxcIlxcXCI+PC9wYXRoPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgXCI7XHJcbiAgICAgICAgdmFyICRyb290ID0gJChib2R5KTtcclxuICAgICAgICB0aGlzLnJvb3RFbGVtZW50ID0gJHJvb3RbMF07XHJcbiAgICAgICAgdGhpcy5hdmF0YXJFbGVtZW50ID0gJHJvb3QuZmluZChcIi5hdmF0YXJcIilbMF07XHJcbiAgICAgICAgdGhpcy5hdmF0YXJUZXh0RWxlbWVudCA9ICQodGhpcy5hdmF0YXJFbGVtZW50KS5maW5kKFwidGV4dFwiKVswXTtcclxuICAgICAgICB0aGlzLm5hbWVFbGVtZW50ID0gJHJvb3QuZmluZChcIi5uYW1lXCIpWzBdO1xyXG4gICAgICAgIHRoaXMuY2FtZXJhQnV0dG9uRWxlbWVudCA9ICRyb290LmZpbmQoXCIuY2FtZXJhLXRvZ2dsZS1idXR0b25cIilbMF07XHJcbiAgICAgICAgdGhpcy5taWNCdXR0b25FbGVtZW50ID0gJHJvb3QuZmluZChcIi5taWMtdG9nZ2xlLWJ1dHRvblwiKVswXTtcclxuICAgICAgICB0aGlzLmNhbWVyYUljb25FbGVtZW50ID0gJCh0aGlzLmNhbWVyYUJ1dHRvbkVsZW1lbnQpLmZpbmQoXCJwYXRoXCIpWzBdO1xyXG4gICAgICAgIHRoaXMubWljSWNvbkVsZW1lbnQgPSAkKHRoaXMubWljQnV0dG9uRWxlbWVudCkuZmluZChcInBhdGhcIilbMF07XHJcbiAgICAgICAgLy9hdmF0YXJcclxuICAgICAgICB0aGlzLmF2YXRhclRleHRFbGVtZW50LmlubmVySFRNTCA9IHNuaXBwZXRfMS5hdmF0YXJOYW1lKHRoaXMucHJvcHMubmFtZSk7XHJcbiAgICAgICAgdmFyIGF2YXRhckNvbG9ycyA9IFtcclxuICAgICAgICAgICAgXCJyZ2JhKDIzNCwgMjU1LCAxMjgsIDAuNClcIixcclxuICAgICAgICAgICAgXCJyZ2JhKDExNCwgOTEsIDYwLCAxLjApXCIsXHJcbiAgICAgICAgICAgIFwicmdiYSg2MywgNjUsIDExMywgMS4wKVwiLFxyXG4gICAgICAgICAgICBcInJnYmEoNTYsIDEwNSwgOTEsIDEuMClcIlxyXG4gICAgICAgIF07XHJcbiAgICAgICAgJCh0aGlzLmF2YXRhckVsZW1lbnQpLmNzcyhcImJhY2tncm91bmQtY29sb3JcIiwgYXZhdGFyQ29sb3JzW3NuaXBwZXRfMS5yYW5kb20oMCwgYXZhdGFyQ29sb3JzLmxlbmd0aCldKTtcclxuICAgICAgICAvL25hbWVcclxuICAgICAgICBpZiAodGhpcy5wcm9wcy5tZSlcclxuICAgICAgICAgICAgJCh0aGlzLm5hbWVFbGVtZW50KS5odG1sKHRoaXMucHJvcHMubmFtZSArIFwiIChNZSlcIik7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAkKHRoaXMubmFtZUVsZW1lbnQpLmh0bWwodGhpcy5wcm9wcy5uYW1lKTtcclxuICAgICAgICAvL2ljb25cclxuICAgICAgICB0aGlzLnVwZGF0ZUNhbWVyYUljb24oKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZU1pY0ljb24oKTtcclxuICAgICAgICAkKHRoaXMuY2FtZXJhQnV0dG9uRWxlbWVudCkub24oJ2NsaWNrJywgZnVuY3Rpb24gKF8pIHtcclxuICAgICAgICAgICAgX3RoaXMub25Ub2dnbGVDYW1lcmEoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKHRoaXMubWljQnV0dG9uRWxlbWVudCkub24oJ2NsaWNrJywgZnVuY3Rpb24gKF8pIHtcclxuICAgICAgICAgICAgX3RoaXMub25Ub2dnbGVNaWMoKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBQYXJ0aWNpcGFudEl0ZW0ucHJvdG90eXBlLmVsZW1lbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucm9vdEVsZW1lbnQ7XHJcbiAgICB9O1xyXG4gICAgUGFydGljaXBhbnRJdGVtLnByb3RvdHlwZS5yZW1vdmVTZWxmID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICQodGhpcy5yb290RWxlbWVudCkucmVtb3ZlKCk7XHJcbiAgICB9O1xyXG4gICAgUGFydGljaXBhbnRJdGVtLnByb3RvdHlwZS5vblRvZ2dsZUNhbWVyYSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuaXNIb3N0KVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgdGhpcy51c2VDYW1lcmEgPSAhdGhpcy51c2VDYW1lcmE7XHJcbiAgICAgICAgdGhpcy51cGRhdGVDYW1lcmFJY29uKCk7XHJcbiAgICAgICAgdGhpcy5wcm9wcy5vblVzZUNhbWVyYSh0aGlzLnByb3BzLmppdHNpSWQsIHRoaXMudXNlQ2FtZXJhKTtcclxuICAgIH07XHJcbiAgICBQYXJ0aWNpcGFudEl0ZW0ucHJvdG90eXBlLm9uVG9nZ2xlTWljID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5pc0hvc3QpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB0aGlzLnVzZU1pYyA9ICF0aGlzLnVzZU1pYztcclxuICAgICAgICB0aGlzLnVwZGF0ZU1pY0ljb24oKTtcclxuICAgICAgICB0aGlzLnByb3BzLm9uVXNlTWljKHRoaXMucHJvcHMuaml0c2lJZCwgdGhpcy51c2VNaWMpO1xyXG4gICAgfTtcclxuICAgIFBhcnRpY2lwYW50SXRlbS5wcm90b3R5cGUuYmxvY2tNaWMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMudXNlTWljKVxyXG4gICAgICAgICAgICB0aGlzLm9uVG9nZ2xlTWljKCk7XHJcbiAgICB9O1xyXG4gICAgUGFydGljaXBhbnRJdGVtLnByb3RvdHlwZS5zZXRNaWNTdGF0ZSA9IGZ1bmN0aW9uICh1c2UpIHtcclxuICAgICAgICB0aGlzLnVzZU1pYyA9IHVzZTtcclxuICAgICAgICB0aGlzLnVwZGF0ZU1pY0ljb24oKTtcclxuICAgIH07XHJcbiAgICBQYXJ0aWNpcGFudEl0ZW0ucHJvdG90eXBlLnNldENhbWVyYVN0YXRlID0gZnVuY3Rpb24gKHVzZSkge1xyXG4gICAgICAgIHRoaXMudXNlQ2FtZXJhID0gdXNlO1xyXG4gICAgICAgIHRoaXMudXBkYXRlQ2FtZXJhSWNvbigpO1xyXG4gICAgfTtcclxuICAgIFBhcnRpY2lwYW50SXRlbS5wcm90b3R5cGUuc2V0Um9sZSA9IGZ1bmN0aW9uIChpc0hvc3QpIHtcclxuICAgICAgICB0aGlzLmlzSG9zdCA9IGlzSG9zdDtcclxuICAgIH07XHJcbiAgICBQYXJ0aWNpcGFudEl0ZW0ucHJvdG90eXBlLnVwZGF0ZUNhbWVyYUljb24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGljb24gPSB0aGlzLnVzZUNhbWVyYSA/IHZlY3Rvcl9pY29uXzEuVmVjdG9ySWNvbi5WSURFT19VTk1VVEVfSUNPTiA6IHZlY3Rvcl9pY29uXzEuVmVjdG9ySWNvbi5WSURFT19NVVRFX0lDT047XHJcbiAgICAgICAgJCh0aGlzLmNhbWVyYUljb25FbGVtZW50KS5hdHRyKFwiZFwiLCBpY29uKTtcclxuICAgIH07XHJcbiAgICBQYXJ0aWNpcGFudEl0ZW0ucHJvdG90eXBlLnVwZGF0ZU1pY0ljb24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGljb24gPSB0aGlzLnVzZU1pYyA/IHZlY3Rvcl9pY29uXzEuVmVjdG9ySWNvbi5BVURJT19VTk1VVEVfSUNPTiA6IHZlY3Rvcl9pY29uXzEuVmVjdG9ySWNvbi5BVURJT19NVVRFX0lDT047XHJcbiAgICAgICAgJCh0aGlzLm1pY0ljb25FbGVtZW50KS5hdHRyKFwiZFwiLCBpY29uKTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gUGFydGljaXBhbnRJdGVtO1xyXG59KCkpO1xyXG52YXIgUGFydGljaXBhbnRMaXN0UGFuZWxQcm9wcyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFBhcnRpY2lwYW50TGlzdFBhbmVsUHJvcHMoKSB7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gUGFydGljaXBhbnRMaXN0UGFuZWxQcm9wcztcclxufSgpKTtcclxuZXhwb3J0cy5QYXJ0aWNpcGFudExpc3RQYW5lbFByb3BzID0gUGFydGljaXBhbnRMaXN0UGFuZWxQcm9wcztcclxudmFyIFBhcnRpY2lwYW50TGlzdFBhbmVsID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gUGFydGljaXBhbnRMaXN0UGFuZWwoKSB7XHJcbiAgICAgICAgLy9zdGF0ZXNcclxuICAgICAgICB0aGlzLnBhcnRpY2lwYW50SXRlbU1hcCA9IG5ldyBNYXAoKTtcclxuICAgICAgICB0aGlzLmlzSG9zdCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMucm9vdEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhcnRpY2lwYW50cy1saXN0XCIpO1xyXG4gICAgICAgIHZhciAkcm9vdCA9ICQodGhpcy5yb290RWxlbWVudCk7XHJcbiAgICAgICAgdGhpcy5wYXJ0aWNpcGFudENvdW50RWxlbWVudCA9ICRyb290LmZpbmQoXCIjcGFydGljaXBhbnQtY291bnRcIilbMF07XHJcbiAgICAgICAgdGhpcy5wYXJ0aWNpcGFudExpc3RFbGVtZW50ID0gJHJvb3QuZmluZChcIiNwYXJ0aWNpcGFudHMtbGlzdC1ib2R5XCIpWzBdO1xyXG4gICAgICAgIHRoaXMubXV0ZUFsbEJ1dHRvbkVsZW1lbnQgPSAkcm9vdC5maW5kKFwiI3BhcnRpY2lwYW50cy1saXN0LWZvb3Rlcj4uYnRuXCIpWzBdO1xyXG4gICAgfVxyXG4gICAgUGFydGljaXBhbnRMaXN0UGFuZWwucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAocHJvcHMpIHtcclxuICAgICAgICB0aGlzLnByb3BzID0gcHJvcHM7XHJcbiAgICAgICAgdGhpcy51cGRhdGVQYXJ0aWNpcGFudENvdW50KCk7XHJcbiAgICAgICAgdGhpcy5hdHRhY2hIYW5kbGVycygpO1xyXG4gICAgfTtcclxuICAgIFBhcnRpY2lwYW50TGlzdFBhbmVsLnByb3RvdHlwZS5hdHRhY2hIYW5kbGVycyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgICQodGhpcy5tdXRlQWxsQnV0dG9uRWxlbWVudCkub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoX3RoaXMuaXNIb3N0KVxyXG4gICAgICAgICAgICAgICAgX3RoaXMucGFydGljaXBhbnRJdGVtTWFwLmZvckVhY2goZnVuY3Rpb24gKHBhcnRpY2lwYW50SXRlbSwga2V5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnRJdGVtLmJsb2NrTWljKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBQYXJ0aWNpcGFudExpc3RQYW5lbC5wcm90b3R5cGUuYWRkUGFydGljaXBhbnQgPSBmdW5jdGlvbiAoaml0c2lJZCwgbmFtZSwgbWUsIHVzZUNhbWVyYSwgdXNlTWljKSB7XHJcbiAgICAgICAgaWYgKHRoaXMucGFydGljaXBhbnRJdGVtTWFwLmhhcyhqaXRzaUlkKSkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZVBhcnRpY2lwYW50KGppdHNpSWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcHJvcHMgPSBuZXcgUGFydGljaXBhbnRJdGVtUHJvcHMoKTtcclxuICAgICAgICBwcm9wcy5qaXRzaUlkID0gaml0c2lJZDtcclxuICAgICAgICBwcm9wcy5uYW1lID0gbmFtZTtcclxuICAgICAgICBwcm9wcy5tZSA9IG1lO1xyXG4gICAgICAgIHByb3BzLnVzZUNhbWVyYSA9IHVzZUNhbWVyYTtcclxuICAgICAgICBwcm9wcy51c2VNaWMgPSB1c2VNaWM7XHJcbiAgICAgICAgcHJvcHMub25Vc2VDYW1lcmEgPSB0aGlzLnByb3BzLm9uVXNlQ2FtZXJhO1xyXG4gICAgICAgIHByb3BzLm9uVXNlTWljID0gdGhpcy5wcm9wcy5vblVzZU1pYztcclxuICAgICAgICB2YXIgaXRlbSA9IG5ldyBQYXJ0aWNpcGFudEl0ZW0ocHJvcHMpO1xyXG4gICAgICAgIGl0ZW0uc2V0Um9sZSh0aGlzLmlzSG9zdCk7XHJcbiAgICAgICAgdGhpcy5wYXJ0aWNpcGFudEl0ZW1NYXAuc2V0KGppdHNpSWQsIGl0ZW0pO1xyXG4gICAgICAgIHRoaXMudXBkYXRlUGFydGljaXBhbnRDb3VudCgpO1xyXG4gICAgICAgIGlmIChtZSkge1xyXG4gICAgICAgICAgICAkKHRoaXMucGFydGljaXBhbnRMaXN0RWxlbWVudCkucHJlcGVuZChpdGVtLmVsZW1lbnQoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAkKHRoaXMucGFydGljaXBhbnRMaXN0RWxlbWVudCkuYXBwZW5kKGl0ZW0uZWxlbWVudCgpKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgUGFydGljaXBhbnRMaXN0UGFuZWwucHJvdG90eXBlLnJlbW92ZVBhcnRpY2lwYW50ID0gZnVuY3Rpb24gKGppdHNpSWQpIHtcclxuICAgICAgICBpZiAoIXRoaXMucGFydGljaXBhbnRJdGVtTWFwLmhhcyhqaXRzaUlkKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMucGFydGljaXBhbnRJdGVtTWFwLmdldChqaXRzaUlkKS5yZW1vdmVTZWxmKCk7XHJcbiAgICAgICAgdGhpcy5wYXJ0aWNpcGFudEl0ZW1NYXAuZGVsZXRlKGppdHNpSWQpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlUGFydGljaXBhbnRDb3VudCgpO1xyXG4gICAgfTtcclxuICAgIFBhcnRpY2lwYW50TGlzdFBhbmVsLnByb3RvdHlwZS51cGRhdGVQYXJ0aWNpcGFudENvdW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMucGFydGljaXBhbnRDb3VudEVsZW1lbnQuaW5uZXJIVE1MID0gXCJcIiArIHRoaXMucGFydGljaXBhbnRJdGVtTWFwLnNpemU7XHJcbiAgICB9O1xyXG4gICAgUGFydGljaXBhbnRMaXN0UGFuZWwucHJvdG90eXBlLnNldENhbWVyYU1lZGlhUG9saWN5ID0gZnVuY3Rpb24gKGppdHNpSWQsIHVzZUNhbWVyYSkge1xyXG4gICAgICAgIHZhciBpdGVtID0gdGhpcy5wYXJ0aWNpcGFudEl0ZW1NYXAuZ2V0KGppdHNpSWQpO1xyXG4gICAgICAgIGlmIChpdGVtKVxyXG4gICAgICAgICAgICBpdGVtLnNldENhbWVyYVN0YXRlKHVzZUNhbWVyYSk7XHJcbiAgICB9O1xyXG4gICAgUGFydGljaXBhbnRMaXN0UGFuZWwucHJvdG90eXBlLnNldE1pY01lZGlhUG9saWN5ID0gZnVuY3Rpb24gKGppdHNpSWQsIHVzZU1pYykge1xyXG4gICAgICAgIHZhciBpdGVtID0gdGhpcy5wYXJ0aWNpcGFudEl0ZW1NYXAuZ2V0KGppdHNpSWQpO1xyXG4gICAgICAgIGlmIChpdGVtKVxyXG4gICAgICAgICAgICBpdGVtLnNldE1pY1N0YXRlKHVzZU1pYyk7XHJcbiAgICB9O1xyXG4gICAgUGFydGljaXBhbnRMaXN0UGFuZWwucHJvdG90eXBlLnVwZGF0ZUJ5Um9sZSA9IGZ1bmN0aW9uIChpc0hvc3QpIHtcclxuICAgICAgICB0aGlzLmlzSG9zdCA9IGlzSG9zdDtcclxuICAgICAgICBpZiAoaXNIb3N0KVxyXG4gICAgICAgICAgICAkKHRoaXMucm9vdEVsZW1lbnQpLmFkZENsYXNzKFwiaXMtaG9zdFwiKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICQodGhpcy5yb290RWxlbWVudCkucmVtb3ZlQ2xhc3MoXCJpcy1ob3N0XCIpO1xyXG4gICAgICAgIHRoaXMubXV0ZUFsbEJ1dHRvbkVsZW1lbnQuc3R5bGUudmlzaWJpbGl0eSA9IGlzSG9zdCA/IFwidmlzaWJsZVwiIDogXCJoaWRkZW5cIjtcclxuICAgICAgICB0aGlzLnBhcnRpY2lwYW50SXRlbU1hcC5mb3JFYWNoKGZ1bmN0aW9uIChwYXJ0aWNpcGFudEl0ZW0sIGtleSkge1xyXG4gICAgICAgICAgICBwYXJ0aWNpcGFudEl0ZW0uc2V0Um9sZShpc0hvc3QpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBQYXJ0aWNpcGFudExpc3RQYW5lbDtcclxufSgpKTtcclxuZXhwb3J0cy5QYXJ0aWNpcGFudExpc3RQYW5lbCA9IFBhcnRpY2lwYW50TGlzdFBhbmVsO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1QYXJ0aWNpcGFudExpc3RQYW5lbC5qcy5tYXBcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvY29tcG9uZW50c1xcXFxQYXJ0aWNpcGFudExpc3RQYW5lbC5qc1wiLFwiL2NvbXBvbmVudHNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLlNldHRpbmdEaWFsb2cgPSBleHBvcnRzLlNldHRpbmdEaWFsb2dQcm9wcyA9IHZvaWQgMDtcclxudmFyIE1lZGlhVHlwZV8xID0gcmVxdWlyZShcIi4uL2VudW0vTWVkaWFUeXBlXCIpO1xyXG52YXIgQWN0aXZlRGV2aWNlc18xID0gcmVxdWlyZShcIi4uL21vZGVsL0FjdGl2ZURldmljZXNcIik7XHJcbnZhciBTZXR0aW5nRGlhbG9nUHJvcHMgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBTZXR0aW5nRGlhbG9nUHJvcHMoKSB7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gU2V0dGluZ0RpYWxvZ1Byb3BzO1xyXG59KCkpO1xyXG5leHBvcnRzLlNldHRpbmdEaWFsb2dQcm9wcyA9IFNldHRpbmdEaWFsb2dQcm9wcztcclxudmFyIFNldHRpbmdEaWFsb2cgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBTZXR0aW5nRGlhbG9nKCkge1xyXG4gICAgICAgIHRoaXMuSml0c2lNZWV0SlMgPSB3aW5kb3cuSml0c2lNZWV0SlM7XHJcbiAgICAgICAgdGhpcy5hdWRpb1RyYWNrRXJyb3IgPSBudWxsO1xyXG4gICAgICAgIHRoaXMudmlkZW9UcmFja0Vycm9yID0gbnVsbDtcclxuICAgICAgICB0aGlzLmFjdGl2ZUNhbWVyYURldmljZUlkID0gbnVsbDtcclxuICAgICAgICB0aGlzLmFjdGl2ZU1pY0RldmljZUlkID0gbnVsbDtcclxuICAgICAgICB0aGlzLmFjdGl2ZVNwZWFrZXJEZXZpY2VJZCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5sb2NhbFRyYWNrcyA9IFtdO1xyXG4gICAgfVxyXG4gICAgU2V0dGluZ0RpYWxvZy5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChwcm9wcykge1xyXG4gICAgICAgIHRoaXMucHJvcHMgPSBwcm9wcztcclxuICAgICAgICB0aGlzLmRpYWxvZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2V0dGluZy1kaWFsb2ctd3JhcHBlclwiKTtcclxuICAgICAgICB0aGlzLnNob3dCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnNldHRpbmctZGlhbG9nLXdyYXBwZXI+YnV0dG9uXCIpO1xyXG4gICAgICAgICQodGhpcy5kaWFsb2cpLmFkZENsYXNzKFwiZC1ub25lXCIpO1xyXG4gICAgICAgIHRoaXMub2tCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3NldHRpbmctZGlhbG9nLW9rLWJ1dHRvblwiKTtcclxuICAgICAgICB0aGlzLmNsb3NlQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzZXR0aW5nLWRpYWxvZy1jYW5jZWwtYnV0dG9uXCIpO1xyXG4gICAgICAgIHRoaXMudmlkZW9QcmV2aWV3RWxlbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FtZXJhLXByZXZpZXdcIik7XHJcbiAgICAgICAgdGhpcy5hdWRpb1ByZXZpZXdFbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtaWMtcHJldmlld1wiKTtcclxuICAgICAgICB0aGlzLmNhbWVyYUxpc3RFbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW1lcmEtbGlzdFwiKTtcclxuICAgICAgICB0aGlzLm1pY0xpc3RFbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtaWMtbGlzdFwiKTtcclxuICAgICAgICB0aGlzLnNwZWFrZXJMaXN0RWxlbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3BlYWtlci1saXN0XCIpO1xyXG4gICAgICAgIHRoaXMuYXR0YWNoRXZlbnRIYW5kbGVycygpO1xyXG4gICAgICAgIHRoaXMucmVmcmVzaERldmljZUxpc3QoKTtcclxuICAgIH07XHJcbiAgICBTZXR0aW5nRGlhbG9nLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICQodGhpcy5kaWFsb2cpLnJlbW92ZUNsYXNzKFwiZC1ub25lXCIpO1xyXG4gICAgICAgICQodGhpcy5zaG93QnV0dG9uKS50cmlnZ2VyKFwiY2xpY2tcIik7XHJcbiAgICB9O1xyXG4gICAgU2V0dGluZ0RpYWxvZy5wcm90b3R5cGUuYXR0YWNoRXZlbnRIYW5kbGVycyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgX3RoaXNfMSA9IHRoaXM7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICAkKHRoaXMuY2FtZXJhTGlzdEVsZW0pLm9mZignY2hhbmdlJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgX3RoaXMub25DYW1lcmFDaGFuZ2VkKCQodGhpcykudmFsKCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQodGhpcy5taWNMaXN0RWxlbSkub2ZmKCdjaGFuZ2UnKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBfdGhpcy5vbk1pY0NoYW5nZWQoJCh0aGlzKS52YWwoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCh0aGlzLnNwZWFrZXJMaXN0RWxlbSkub2ZmKCdjaGFuZ2UnKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBfdGhpcy5vblNwZWFrZXJDaGFuZ2VkKCQodGhpcykudmFsKCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQodGhpcy5va0J1dHRvbikub2ZmKCdjbGljaycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgX3RoaXNfMS5vbk9LKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgU2V0dGluZ0RpYWxvZy5wcm90b3R5cGUucmVmcmVzaERldmljZUxpc3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzXzEgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuSml0c2lNZWV0SlMubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMoZnVuY3Rpb24gKGRldmljZXMpIHtcclxuICAgICAgICAgICAgX3RoaXNfMS5jYW1lcmFMaXN0ID0gZGV2aWNlcy5maWx0ZXIoZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQua2luZCA9PT0gJ3ZpZGVvaW5wdXQnOyB9KTtcclxuICAgICAgICAgICAgX3RoaXNfMS5taWNMaXN0ID0gZGV2aWNlcy5maWx0ZXIoZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQua2luZCA9PT0gJ2F1ZGlvaW5wdXQnOyB9KTtcclxuICAgICAgICAgICAgX3RoaXNfMS5zcGVha2VyTGlzdCA9IGRldmljZXMuZmlsdGVyKGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLmtpbmQgPT09ICdhdWRpb291dHB1dCc7IH0pO1xyXG4gICAgICAgICAgICBfdGhpc18xLnJlbmRlckRldmljZXMoKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBTZXR0aW5nRGlhbG9nLnByb3RvdHlwZS5yZW5kZXJEZXZpY2VzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBfdGhpc18xID0gdGhpcztcclxuICAgICAgICB0aGlzLmFjdGl2ZUNhbWVyYURldmljZUlkID0gdGhpcy5wcm9wcy5jdXJEZXZpY2VzLmNhbWVyYUlkO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlTWljRGV2aWNlSWQgPSB0aGlzLnByb3BzLmN1ckRldmljZXMubWljSWQ7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVTcGVha2VyRGV2aWNlSWQgPSB0aGlzLnByb3BzLmN1ckRldmljZXMuc3BlYWtlcklkO1xyXG4gICAgICAgIHRoaXMuY2xlYXJET01FbGVtZW50KHRoaXMuY2FtZXJhTGlzdEVsZW0pO1xyXG4gICAgICAgIHRoaXMuY2FtZXJhTGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChjYW1lcmEpIHtcclxuICAgICAgICAgICAgdmFyIHNlbGVjdGVkID0gKF90aGlzXzEuYWN0aXZlQ2FtZXJhRGV2aWNlSWQgJiYgY2FtZXJhLmRldmljZUlkID09PSBfdGhpc18xLmFjdGl2ZUNhbWVyYURldmljZUlkKVxyXG4gICAgICAgICAgICAgICAgPyBcInNlbGVjdGVkXCIgOiBcIlwiO1xyXG4gICAgICAgICAgICAkKF90aGlzXzEuY2FtZXJhTGlzdEVsZW0pLmFwcGVuZChcIjxvcHRpb24gdmFsdWU9XFxcIlwiICsgY2FtZXJhLmRldmljZUlkICsgXCJcXFwiIFwiICsgc2VsZWN0ZWQgKyBcIj5cIiArIGNhbWVyYS5sYWJlbCArIFwiPC9vcHRpb24+XCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuY2xlYXJET01FbGVtZW50KHRoaXMubWljTGlzdEVsZW0pO1xyXG4gICAgICAgIHRoaXMubWljTGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChtaWMpIHtcclxuICAgICAgICAgICAgdmFyIHNlbGVjdGVkID0gKF90aGlzXzEuYWN0aXZlTWljRGV2aWNlSWQgJiYgbWljLmRldmljZUlkID09PSBfdGhpc18xLmFjdGl2ZU1pY0RldmljZUlkKVxyXG4gICAgICAgICAgICAgICAgPyBcInNlbGVjdGVkXCIgOiBcIlwiO1xyXG4gICAgICAgICAgICAkKF90aGlzXzEubWljTGlzdEVsZW0pLmFwcGVuZChcIjxvcHRpb24gdmFsdWU9XFxcIlwiICsgbWljLmRldmljZUlkICsgXCJcXFwiIFwiICsgc2VsZWN0ZWQgKyBcIj5cIiArIG1pYy5sYWJlbCArIFwiPC9vcHRpb24+XCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuY2xlYXJET01FbGVtZW50KHRoaXMuc3BlYWtlckxpc3RFbGVtKTtcclxuICAgICAgICB0aGlzLnNwZWFrZXJMaXN0LmZvckVhY2goZnVuY3Rpb24gKHNwZWFrZXIpIHtcclxuICAgICAgICAgICAgdmFyIHNlbGVjdGVkID0gKF90aGlzXzEuYWN0aXZlU3BlYWtlckRldmljZUlkICYmIHNwZWFrZXIuZGV2aWNlSWQgPT09IF90aGlzXzEuYWN0aXZlU3BlYWtlckRldmljZUlkKVxyXG4gICAgICAgICAgICAgICAgPyBcInNlbGVjdGVkXCIgOiBcIlwiO1xyXG4gICAgICAgICAgICAkKF90aGlzXzEuc3BlYWtlckxpc3RFbGVtKS5hcHBlbmQoXCI8b3B0aW9uIHZhbHVlPVxcXCJcIiArIHNwZWFrZXIuZGV2aWNlSWQgKyBcIlxcXCIgXCIgKyBzZWxlY3RlZCArIFwiPlwiICsgc3BlYWtlci5sYWJlbCArIFwiPC9vcHRpb24+XCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoXCIuZm9ybS1zZWxlY3RcIikuc2VsZWN0MigpO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlTG9jYWxUcmFja3ModGhpcy5hY3RpdmVDYW1lcmFEZXZpY2VJZCwgdGhpcy5hY3RpdmVNaWNEZXZpY2VJZClcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHRyYWNrcykge1xyXG4gICAgICAgICAgICB0cmFja3MuZm9yRWFjaChmdW5jdGlvbiAodCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHQuZ2V0VHlwZSgpID09PSBNZWRpYVR5cGVfMS5NZWRpYVR5cGUuVklERU8pIHtcclxuICAgICAgICAgICAgICAgICAgICB0LmF0dGFjaChfdGhpc18xLnZpZGVvUHJldmlld0VsZW0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodC5nZXRUeXBlKCkgPT09IE1lZGlhVHlwZV8xLk1lZGlhVHlwZS5BVURJTykge1xyXG4gICAgICAgICAgICAgICAgICAgIHQuYXR0YWNoKF90aGlzXzEuYXVkaW9QcmV2aWV3RWxlbSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBfdGhpc18xLmxvY2FsVHJhY2tzID0gdHJhY2tzO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIFNldHRpbmdEaWFsb2cucHJvdG90eXBlLmluaXRDdXJyZW50RGV2aWNlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgX3RoaXNfMSA9IHRoaXM7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICAkKFwib3B0aW9uXCIsIHRoaXMuY2FtZXJhTGlzdEVsZW0pLmVhY2goZnVuY3Rpb24gKF8pIHtcclxuICAgICAgICAgICAgaWYgKCQoX3RoaXNfMSkudmFsKCkgPT09IF90aGlzLnByb3BzLmN1ckRldmljZXMubWljSWQpXHJcbiAgICAgICAgICAgICAgICAkKF90aGlzXzEpLmF0dHIoXCJzZWxlY3RlZFwiLCBcInNlbGVjdGVkXCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIFNldHRpbmdEaWFsb2cucHJvdG90eXBlLmNsZWFyRE9NRWxlbWVudCA9IGZ1bmN0aW9uIChlbGVtKSB7XHJcbiAgICAgICAgd2hpbGUgKGVsZW0uZmlyc3RDaGlsZCkge1xyXG4gICAgICAgICAgICBlbGVtLnJlbW92ZUNoaWxkKGVsZW0uZmlyc3RDaGlsZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFNldHRpbmdEaWFsb2cucHJvdG90eXBlLmNyZWF0ZUxvY2FsVHJhY2tzID0gZnVuY3Rpb24gKGNhbWVyYURldmljZUlkLCBtaWNEZXZpY2VJZCkge1xyXG4gICAgICAgIHZhciBfdGhpc18xID0gdGhpcztcclxuICAgICAgICB0aGlzLnZpZGVvVHJhY2tFcnJvciA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5hdWRpb1RyYWNrRXJyb3IgPSBudWxsO1xyXG4gICAgICAgIGlmIChjYW1lcmFEZXZpY2VJZCAhPSBudWxsICYmIG1pY0RldmljZUlkICE9IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuSml0c2lNZWV0SlMuY3JlYXRlTG9jYWxUcmFja3Moe1xyXG4gICAgICAgICAgICAgICAgZGV2aWNlczogWydhdWRpbycsICd2aWRlbyddLFxyXG4gICAgICAgICAgICAgICAgY2FtZXJhRGV2aWNlSWQ6IGNhbWVyYURldmljZUlkLFxyXG4gICAgICAgICAgICAgICAgbWljRGV2aWNlSWQ6IG1pY0RldmljZUlkXHJcbiAgICAgICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uICgpIHsgcmV0dXJuIFByb21pc2UuYWxsKFtcclxuICAgICAgICAgICAgICAgIF90aGlzXzEuY3JlYXRlQXVkaW9UcmFjayhtaWNEZXZpY2VJZCkudGhlbihmdW5jdGlvbiAoX2EpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RyZWFtID0gX2FbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0cmVhbTtcclxuICAgICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAgICAgX3RoaXNfMS5jcmVhdGVWaWRlb1RyYWNrKGNhbWVyYURldmljZUlkKS50aGVuKGZ1bmN0aW9uIChfYSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdHJlYW0gPSBfYVswXTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyZWFtO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgXSk7IH0pLnRoZW4oZnVuY3Rpb24gKHRyYWNrcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKF90aGlzXzEuYXVkaW9UcmFja0Vycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9kaXNwbGF5IGVycm9yXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoX3RoaXNfMS52aWRlb1RyYWNrRXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL2Rpc3BsYXkgZXJyb3JcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cmFja3MuZmlsdGVyKGZ1bmN0aW9uICh0KSB7IHJldHVybiB0eXBlb2YgdCAhPT0gJ3VuZGVmaW5lZCc7IH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoY2FtZXJhRGV2aWNlSWQgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVWaWRlb1RyYWNrKGNhbWVyYURldmljZUlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAobWljRGV2aWNlSWQgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVBdWRpb1RyYWNrKG1pY0RldmljZUlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XHJcbiAgICB9O1xyXG4gICAgU2V0dGluZ0RpYWxvZy5wcm90b3R5cGUuY3JlYXRlVmlkZW9UcmFjayA9IGZ1bmN0aW9uIChjYW1lcmFEZXZpY2VJZCkge1xyXG4gICAgICAgIHZhciBfdGhpc18xID0gdGhpcztcclxuICAgICAgICByZXR1cm4gdGhpcy5KaXRzaU1lZXRKUy5jcmVhdGVMb2NhbFRyYWNrcyh7XHJcbiAgICAgICAgICAgIGRldmljZXM6IFsndmlkZW8nXSxcclxuICAgICAgICAgICAgY2FtZXJhRGV2aWNlSWQ6IGNhbWVyYURldmljZUlkLFxyXG4gICAgICAgICAgICBtaWNEZXZpY2VJZDogbnVsbFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgX3RoaXNfMS52aWRlb1RyYWNrRXJyb3IgPSBlcnJvcjtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgU2V0dGluZ0RpYWxvZy5wcm90b3R5cGUuY3JlYXRlQXVkaW9UcmFjayA9IGZ1bmN0aW9uIChtaWNEZXZpY2VJZCkge1xyXG4gICAgICAgIHZhciBfdGhpc18xID0gdGhpcztcclxuICAgICAgICByZXR1cm4gKHRoaXMuSml0c2lNZWV0SlMuY3JlYXRlTG9jYWxUcmFja3Moe1xyXG4gICAgICAgICAgICBkZXZpY2VzOiBbJ2F1ZGlvJ10sXHJcbiAgICAgICAgICAgIGNhbWVyYURldmljZUlkOiBudWxsLFxyXG4gICAgICAgICAgICBtaWNEZXZpY2VJZDogbWljRGV2aWNlSWRcclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgIF90aGlzXzEuYXVkaW9UcmFja0Vycm9yID0gZXJyb3I7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xyXG4gICAgICAgIH0pKTtcclxuICAgIH07XHJcbiAgICBTZXR0aW5nRGlhbG9nLnByb3RvdHlwZS5vbkNhbWVyYUNoYW5nZWQgPSBmdW5jdGlvbiAoY2FtZXJhRGV2aWNlSWQpIHtcclxuICAgICAgICB2YXIgX3RoaXNfMSA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVDYW1lcmFEZXZpY2VJZCA9IGNhbWVyYURldmljZUlkO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlTG9jYWxUcmFja3ModGhpcy5hY3RpdmVDYW1lcmFEZXZpY2VJZCwgbnVsbClcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHRyYWNrcykge1xyXG4gICAgICAgICAgICB2YXIgbmV3VHJhY2sgPSB0cmFja3MuZmluZChmdW5jdGlvbiAodCkgeyByZXR1cm4gdC5nZXRUeXBlKCkgPT09IE1lZGlhVHlwZV8xLk1lZGlhVHlwZS5WSURFTzsgfSk7XHJcbiAgICAgICAgICAgIC8vcmVtb3ZlIGV4aXN0aW5nIHRyYWNrXHJcbiAgICAgICAgICAgIHZhciBvbGRUcmFjayA9IF90aGlzXzEubG9jYWxUcmFja3MuZmluZChmdW5jdGlvbiAodCkgeyByZXR1cm4gdC5nZXRUeXBlKCkgPT09IE1lZGlhVHlwZV8xLk1lZGlhVHlwZS5WSURFTzsgfSk7XHJcbiAgICAgICAgICAgIGlmIChvbGRUcmFjaykge1xyXG4gICAgICAgICAgICAgICAgb2xkVHJhY2suZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgX3RoaXNfMS5sb2NhbFRyYWNrcy5zcGxpY2UoX3RoaXNfMS5sb2NhbFRyYWNrcy5pbmRleE9mKG9sZFRyYWNrKSwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG5ld1RyYWNrKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpc18xLmxvY2FsVHJhY2tzLnB1c2gobmV3VHJhY2spO1xyXG4gICAgICAgICAgICAgICAgbmV3VHJhY2suYXR0YWNoKF90aGlzXzEudmlkZW9QcmV2aWV3RWxlbSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBTZXR0aW5nRGlhbG9nLnByb3RvdHlwZS5vbk1pY0NoYW5nZWQgPSBmdW5jdGlvbiAobWljRGV2aWNlSWQpIHtcclxuICAgICAgICB2YXIgX3RoaXNfMSA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVNaWNEZXZpY2VJZCA9IG1pY0RldmljZUlkO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlTG9jYWxUcmFja3MobnVsbCwgdGhpcy5hY3RpdmVNaWNEZXZpY2VJZClcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHRyYWNrcykge1xyXG4gICAgICAgICAgICB2YXIgbmV3VHJhY2sgPSB0cmFja3MuZmluZChmdW5jdGlvbiAodCkgeyByZXR1cm4gdC5nZXRUeXBlKCkgPT09IE1lZGlhVHlwZV8xLk1lZGlhVHlwZS5BVURJTzsgfSk7XHJcbiAgICAgICAgICAgIC8vcmVtb3ZlIGV4aXN0aW5nIHRyYWNrXHJcbiAgICAgICAgICAgIHZhciBvbGRUcmFjayA9IF90aGlzXzEubG9jYWxUcmFja3MuZmluZChmdW5jdGlvbiAodCkgeyByZXR1cm4gdC5nZXRUeXBlKCkgPT09IE1lZGlhVHlwZV8xLk1lZGlhVHlwZS5BVURJTzsgfSk7XHJcbiAgICAgICAgICAgIGlmIChvbGRUcmFjaykge1xyXG4gICAgICAgICAgICAgICAgb2xkVHJhY2suZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgX3RoaXNfMS5sb2NhbFRyYWNrcy5zcGxpY2UoX3RoaXNfMS5sb2NhbFRyYWNrcy5pbmRleE9mKG9sZFRyYWNrKSwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG5ld1RyYWNrKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpc18xLmxvY2FsVHJhY2tzLnB1c2gobmV3VHJhY2spO1xyXG4gICAgICAgICAgICAgICAgbmV3VHJhY2suYXR0YWNoKF90aGlzXzEuYXVkaW9QcmV2aWV3RWxlbSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBTZXR0aW5nRGlhbG9nLnByb3RvdHlwZS5vblNwZWFrZXJDaGFuZ2VkID0gZnVuY3Rpb24gKHNwZWFrZXJEZXZpY2VJZCkge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlU3BlYWtlckRldmljZUlkID0gc3BlYWtlckRldmljZUlkO1xyXG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZVNwZWFrZXJEZXZpY2VJZCAmJiB0aGlzLkppdHNpTWVldEpTLm1lZGlhRGV2aWNlcy5pc0RldmljZUNoYW5nZUF2YWlsYWJsZSgnb3V0cHV0JykpIHtcclxuICAgICAgICAgICAgdGhpcy5KaXRzaU1lZXRKUy5tZWRpYURldmljZXMuc2V0QXVkaW9PdXRwdXREZXZpY2UodGhpcy5hY3RpdmVTcGVha2VyRGV2aWNlSWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICA7XHJcbiAgICB9O1xyXG4gICAgU2V0dGluZ0RpYWxvZy5wcm90b3R5cGUub25PSyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmNsb3NlRGlhbG9nKCk7XHJcbiAgICAgICAgdmFyIG5ld0RldmljZXMgPSBuZXcgQWN0aXZlRGV2aWNlc18xLkFjdGl2ZURldmljZXMoKTtcclxuICAgICAgICBuZXdEZXZpY2VzLmNhbWVyYUlkID0gdGhpcy5hY3RpdmVDYW1lcmFEZXZpY2VJZDtcclxuICAgICAgICBuZXdEZXZpY2VzLm1pY0lkID0gdGhpcy5hY3RpdmVNaWNEZXZpY2VJZDtcclxuICAgICAgICBuZXdEZXZpY2VzLnNwZWFrZXJJZCA9IHRoaXMuYWN0aXZlU3BlYWtlckRldmljZUlkO1xyXG4gICAgICAgIHRoaXMucHJvcHMub25EZXZpY2VDaGFuZ2UobmV3RGV2aWNlcyk7XHJcbiAgICB9O1xyXG4gICAgU2V0dGluZ0RpYWxvZy5wcm90b3R5cGUuY2xvc2VEaWFsb2cgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJCh0aGlzLmNsb3NlQnV0dG9uKS50cmlnZ2VyKFwiY2xpY2tcIik7XHJcbiAgICAgICAgdGhpcy5sb2NhbFRyYWNrcy5mb3JFYWNoKGZ1bmN0aW9uICh0cmFjaykge1xyXG4gICAgICAgICAgICB0cmFjay5kaXNwb3NlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFNldHRpbmdEaWFsb2c7XHJcbn0oKSk7XHJcbmV4cG9ydHMuU2V0dGluZ0RpYWxvZyA9IFNldHRpbmdEaWFsb2c7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVNldHRpbmdEaWFsb2cuanMubWFwXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2NvbXBvbmVudHNcXFxcU2V0dGluZ0RpYWxvZy5qc1wiLFwiL2NvbXBvbmVudHNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLlZlY3Rvckljb24gPSB2b2lkIDA7XHJcbnZhciBWZWN0b3JJY29uID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gVmVjdG9ySWNvbigpIHtcclxuICAgIH1cclxuICAgIFZlY3Rvckljb24uQVVESU9fTVVURV9JQ09OID0gXCJNNy4zMzMgOC42NVYxMWEzLjY2OCAzLjY2OCAwIDAwMi43NTcgMy41NTMuOTI4LjkyOCAwIDAwLS4wMDcuMTE0djEuNzU3QTUuNTAxIDUuNTAxIDAgMDE1LjUgMTFhLjkxNy45MTcgMCAxMC0xLjgzMyAwYzAgMy43NCAyLjc5OSA2LjgyNiA2LjQxNiA3LjI3N3YuOTczYS45MTcuOTE3IDAgMDAxLjgzNCAwdi0uOTczYTcuMjk3IDcuMjk3IDAgMDAzLjU2OC0xLjQ3NWwzLjA5MSAzLjA5MmEuOTMyLjkzMiAwIDEwMS4zMTgtMS4zMThsLTMuMDkxLTMuMDkxLjAxLS4wMTMtMS4zMTEtMS4zMTEtLjAxLjAxMy0xLjMyNS0xLjMyNS4wMDgtLjAxNC0xLjM5NS0xLjM5NWExLjI0IDEuMjQgMCAwMS0uMDA0LjAxOGwtMy42MS0zLjYwOXYtLjAyM0w3LjMzNCA1Ljk5M3YuMDIzbC0zLjkwOS0zLjkxYS45MzIuOTMyIDAgMTAtMS4zMTggMS4zMThMNy4zMzMgOC42NXptMS44MzQgMS44MzRWMTFhMS44MzMgMS44MzMgMCAwMDIuMjkxIDEuNzc2bC0yLjI5MS0yLjI5MnptMy42ODIgMy42ODNjLS4yOS4xNy0uNjA2LjMtLjk0LjM4NmEuOTI4LjkyOCAwIDAxLjAwOC4xMTR2MS43NTdhNS40NyA1LjQ3IDAgMDAyLjI1Ny0uOTMybC0xLjMyNS0xLjMyNXptMS44MTgtMy40NzZsLTEuODM0LTEuODM0VjUuNWExLjgzMyAxLjgzMyAwIDAwLTMuNjQ0LS4yODdsLTEuNDMtMS40M0EzLjY2NiAzLjY2NiAwIDAxMTQuNjY3IDUuNXY1LjE5em0xLjY2NSAxLjY2NWwxLjQ0NyAxLjQ0N2MuMzU3LS44NjQuNTU0LTEuODEuNTU0LTIuODAzYS45MTcuOTE3IDAgMTAtMS44MzMgMGMwIC40NjgtLjA1OC45MjItLjE2OCAxLjM1NnpcIjtcclxuICAgIFZlY3Rvckljb24uQVVESU9fVU5NVVRFX0lDT04gPSBcIk0xNiA2YTQgNCAwIDAwLTggMHY2YTQuMDAyIDQuMDAyIDAgMDAzLjAwOCAzLjg3NmMtLjAwNS4wNC0uMDA4LjA4Mi0uMDA4LjEyNHYxLjkxN0E2LjAwMiA2LjAwMiAwIDAxNiAxMmExIDEgMCAxMC0yIDAgOC4wMDEgOC4wMDEgMCAwMDcgNy45MzhWMjFhMSAxIDAgMTAyIDB2LTEuMDYyQTguMDAxIDguMDAxIDAgMDAyMCAxMmExIDEgMCAxMC0yIDAgNi4wMDIgNi4wMDIgMCAwMS01IDUuOTE3VjE2YzAtLjA0Mi0uMDAzLS4wODMtLjAwOC0uMTI0QTQuMDAyIDQuMDAyIDAgMDAxNiAxMlY2em0tNC0yYTIgMiAwIDAwLTIgMnY2YTIgMiAwIDEwNCAwVjZhMiAyIDAgMDAtMi0yelwiO1xyXG4gICAgVmVjdG9ySWNvbi5WSURFT19NVVRFX0lDT04gPSBcIk0gNi44NCA1LjUgaCAtMC4wMjIgTCAzLjQyNCAyLjEwNiBhIDAuOTMyIDAuOTMyIDAgMSAwIC0xLjMxOCAxLjMxOCBMIDQuMTgyIDUuNSBoIC0wLjUxNSBjIC0xLjAxMyAwIC0xLjgzNCAwLjgyIC0xLjgzNCAxLjgzMyB2IDcuMzM0IGMgMCAxLjAxMiAwLjgyMSAxLjgzMyAxLjgzNCAxLjgzMyBIIDEzLjc1IGMgMC40MDQgMCAwLjc3NyAtMC4xMyAxLjA4IC0wLjM1MiBsIDMuNzQ2IDMuNzQ2IGEgMC45MzIgMC45MzIgMCAxIDAgMS4zMTggLTEuMzE4IGwgLTQuMzEgLTQuMzEgdiAtMC4wMjQgTCAxMy43NSAxMi40MSB2IDAuMDIzIGwgLTUuMSAtNS4wOTkgaCAwLjAyNCBMIDYuODQxIDUuNSBaIG0gNi45MSA0LjI3NCBWIDcuMzMzIGggLTIuNDQgTCA5LjQ3NSA1LjUgaCA0LjI3NCBjIDEuMDEyIDAgMS44MzMgMC44MiAxLjgzMyAxLjgzMyB2IDAuNzg2IGwgMy4yMTIgLTEuODM1IGEgMC45MTcgMC45MTcgMCAwIDEgMS4zNzIgMC43OTYgdiA3Ljg0IGMgMCAwLjM0NCAtMC4xOSAwLjY0NCAtMC40NyAwLjggbCAtMy43MzYgLTMuNzM1IGwgMi4zNzIgMS4zNTYgViA4LjY1OSBsIC0yLjc1IDEuNTcxIHYgMS4zNzcgTCAxMy43NSA5Ljc3NCBaIE0gMy42NjcgNy4zMzQgaCAyLjM0OSBsIDcuMzMzIDcuMzMzIEggMy42NjcgViA3LjMzMyBaXCI7XHJcbiAgICBWZWN0b3JJY29uLlZJREVPX1VOTVVURV9JQ09OID0gXCJNMTMuNzUgNS41SDMuNjY3Yy0xLjAxMyAwLTEuODM0LjgyLTEuODM0IDEuODMzdjcuMzM0YzAgMS4wMTIuODIxIDEuODMzIDEuODM0IDEuODMzSDEzLjc1YzEuMDEyIDAgMS44MzMtLjgyIDEuODMzLTEuODMzdi0uNzg2bDMuMjEyIDEuODM1YS45MTYuOTE2IDAgMDAxLjM3Mi0uNzk2VjcuMDhhLjkxNy45MTcgMCAwMC0xLjM3Mi0uNzk2bC0zLjIxMiAxLjgzNXYtLjc4NmMwLTEuMDEyLS44Mi0xLjgzMy0xLjgzMy0xLjgzM3ptMCAzLjY2N3Y1LjVIMy42NjdWNy4zMzNIMTMuNzV2MS44MzR6bTQuNTgzIDQuMTc0bC0yLjc1LTEuNTcydi0xLjUzOGwyLjc1LTEuNTcydjQuNjgyelwiO1xyXG4gICAgVmVjdG9ySWNvbi5HUkFOVF9NT0RFUkFUT1JfSUNPTiA9IFwiTTE0IDRhMiAyIDAgMDEtMS4yOTggMS44NzNsMS41MjcgNC4wNy43MTYgMS45MTJjLjA2Mi4wNzQuMTI2LjA3NC4xNjUuMDM1bDEuNDQ0LTEuNDQ0IDIuMDMyLTIuMDMyYTIgMiAwIDExMS4yNDguNTc5TDE5IDE5YTIgMiAwIDAxLTIgMkg3YTIgMiAwIDAxLTItMkw0LjE2NiA4Ljk5M2EyIDIgMCAxMTEuMjQ4LS41NzlsMi4wMzMgMi4wMzNMOC44OSAxMS44OWMuMDg3LjA0Mi4xNDUuMDE2LjE2NS0uMDM1bC43MTYtMS45MTIgMS41MjctNC4wN0EyIDIgMCAxMTE0IDR6TTYuODQgMTdsLS4zOTMtNC43MjUgMS4wMjkgMS4wM2EyLjEgMi4xIDAgMDAzLjQ1MS0uNzQ4TDEyIDkuNjk2bDEuMDczIDIuODZhMi4xIDIuMSAwIDAwMy40NTEuNzQ4bDEuMDMtMS4wM0wxNy4xNiAxN0g2Ljg0elwiO1xyXG4gICAgVmVjdG9ySWNvbi5BVURJT19NVVRFX1NNQUxMX0lDT04gPSBcIk01LjY4OCA0bDIyLjMxMyAyMi4zMTMtMS42ODggMS42ODgtNS41NjMtNS41NjNjLTEgLjYyNS0yLjI1IDEtMy40MzggMS4xODh2NC4zNzVoLTIuNjI1di00LjM3NWMtNC4zNzUtLjYyNS04LTQuMzc1LTgtOC45MzhoMi4yNWMwIDQgMy4zNzUgNi43NSA3LjA2MyA2Ljc1IDEuMDYzIDAgMi4xMjUtLjI1IDMuMDYzLS42ODhsLTIuMTg4LTIuMTg4Yy0uMjUuMDYzLS41NjMuMTI1LS44NzUuMTI1LTIuMTg4IDAtNC0xLjgxMy00LTR2LTFsLTgtOHpNMjAgMTQuODc1bC04LTcuOTM4di0uMjVjMC0yLjE4OCAxLjgxMy00IDQtNHM0IDEuODEzIDQgNHY4LjE4OHptNS4zMTMtLjE4N2E4LjgyNCA4LjgyNCAwIDAxLTEuMTg4IDQuMzc1TDIyLjUgMTcuMzc1Yy4zNzUtLjgxMy41NjMtMS42ODguNTYzLTIuNjg4aDIuMjV6XCI7XHJcbiAgICBWZWN0b3JJY29uLlZJREVPX01VVEVfU01BTExfSUNPTiA9IFwiTTQuMzc1IDIuNjg4TDI4IDI2LjMxM2wtMS42ODggMS42ODgtNC4yNS00LjI1Yy0uMTg4LjEyNS0uNS4yNS0uNzUuMjVoLTE2Yy0uNzUgMC0xLjMxMy0uNTYzLTEuMzEzLTEuMzEzVjkuMzEzYzAtLjc1LjU2My0xLjMxMyAxLjMxMy0xLjMxM2gxTDIuNjg3IDQuMzc1em0yMy42MjUgNnYxNC4yNUwxMy4wNjIgOGg4LjI1Yy43NSAwIDEuMzc1LjU2MyAxLjM3NSAxLjMxM3Y0LjY4OHpcIjtcclxuICAgIFZlY3Rvckljb24uTU9ERVJBVE9SX1NNQUxMX0lDT04gPSBcIk0xNiAyMC41NjNsNSAzLTEuMzEzLTUuNjg4TDI0LjEyNSAxNGwtNS44NzUtLjVMMTYgOC4xMjUgMTMuNzUgMTMuNWwtNS44NzUuNSA0LjQzOCAzLjg3NUwxMSAyMy41NjN6bTEzLjMxMy04LjI1bC03LjI1IDYuMzEzIDIuMTg4IDkuMzc1LTguMjUtNS04LjI1IDUgMi4xODgtOS4zNzUtNy4yNS02LjMxMyA5LjU2My0uODEzIDMuNzUtOC44MTMgMy43NSA4LjgxM3pcIjtcclxuICAgIFZlY3Rvckljb24uU0VUVElOR19JQ09OID0gXCJNOS4wMDUgMi4xN2wtLjU3NiAxLjcyNy0uNjM0LjI2Mi0xLjYyOC0uODEzYTEuODMzIDEuODMzIDAgMDAtMi4xMTYuMzQzbC0uMzYyLjM2MmExLjgzMyAxLjgzMyAwIDAwLS4zNDMgMi4xMTZsLjgxNiAxLjYyNC0uMjY1LjYzOC0xLjcyNy41NzZjLS43NDguMjUtMS4yNTMuOTUtMS4yNTMgMS43Mzl2LjUxMmMwIC43OS41MDUgMS40OSAxLjI1MyAxLjc0bDEuNzI3LjU3NS4yNjIuNjM0LS44MTMgMS42MjhhMS44MzMgMS44MzMgMCAwMC4zNDMgMi4xMTZsLjM2Mi4zNjJjLjU1OC41NTggMS40MS42OTYgMi4xMTYuMzQzbDEuNjI0LS44MTYuNjM4LjI2NS41NzYgMS43MjdjLjI1Ljc0OC45NSAxLjI1MyAxLjczOSAxLjI1M2guNTEyYy43OSAwIDEuNDktLjUwNSAxLjc0LTEuMjUzbC41NzUtMS43MjYuNjM0LS4yNjMgMS42MjguODEzYTEuODMzIDEuODMzIDAgMDAyLjExNi0uMzQzbC4zNjItLjM2MmMuNTU4LS41NTguNjk2LTEuNDEuMzQzLTIuMTE2bC0uODE2LTEuNjI0LjI2NS0uNjM4IDEuNzI3LS41NzZhMS44MzMgMS44MzMgMCAwMDEuMjUzLTEuNzM5di0uNTEyYzAtLjc5LS41MDUtMS40OS0xLjI1My0xLjc0bC0xLjcyNi0uNTcyLS4yNjQtLjYzNy44MTQtMS42MjhhMS44MzMgMS44MzMgMCAwMC0uMzQzLTIuMTE2bC0uMzYyLS4zNjJhMS44MzMgMS44MzMgMCAwMC0yLjExNi0uMzQzbC0xLjYyNC44MTYtLjYzOC0uMjY1LS41NzYtMS43MjdhMS44MzMgMS44MzMgMCAwMC0xLjc0LTEuMjUzaC0uNTExYy0uNzkgMC0xLjQ5LjUwNS0xLjc0IDEuMjUzek03LjcyMyA2LjE3M2wyLjE4MS0uOTAzLjg0LTIuNTJoLjUxMmwuODQgMi41MiAyLjE4NS45MDggMi4zNzItMS4xOTMuMzYyLjM2Mi0xLjE4OCAyLjM3Ni45MDMgMi4xODUgMi41Mi44MzZ2LjUxMmwtMi41Mi44NC0uOTA4IDIuMTg1IDEuMTkzIDIuMzcyLS4zNjIuMzYyLTIuMzc2LTEuMTg4LTIuMTgxLjkwMy0uODQgMi41MmgtLjUxMmwtLjg0LTIuNTItMi4xODUtLjkwOC0yLjM3MiAxLjE5My0uMzYyLS4zNjIgMS4xODgtMi4zNzYtLjkwMy0yLjE4MS0yLjUyLS44NHYtLjUxMmwyLjUyLS44NC45MDgtMi4xODUtMS4xOTMtMi4zNzIuMzYyLS4zNjIgMi4zNzYgMS4xODh6TTExIDE1LjU4M2E0LjU4MyA0LjU4MyAwIDExMC05LjE2NiA0LjU4MyA0LjU4MyAwIDAxMCA5LjE2NnpNMTMuNzUgMTFhMi43NSAyLjc1IDAgMTEtNS41IDAgMi43NSAyLjc1IDAgMDE1LjUgMHpcIjtcclxuICAgIFZlY3Rvckljb24uVVNFUl9HUk9VUF9JQ09OID0gXCJNNS4zMzMzMSAyQzYuMjgxMDEgMiA3LjA5Njc1IDIuNTY0OTkgNy40NjIwNyAzLjM3NjUxQzcuMDA3NjYgMy40NTAyMyA2LjU4NDA2IDMuNjE1ODMgNi4yMTA5NSAzLjg1MzYxQzYuMDQxMTEgMy41NDM1NiA1LjcxMTc2IDMuMzMzMzMgNS4zMzMzMSAzLjMzMzMzQzQuNzgxMDMgMy4zMzMzMyA0LjMzMzMxIDMuNzgxMDUgNC4zMzMzMSA0LjMzMzMzQzQuMzMzMzEgNC43NTg5NSA0LjU5OTIxIDUuMTIyNDYgNC45NzM5NSA1LjI2NjgyQzQuNzc2NzIgNS42OTI0NSA0LjY2NjY1IDYuMTY2NzEgNC42NjY2NSA2LjY2NjY3TDQuNjY2NzggNi42OTY3QzMuMTIyNDkgNi44NTMzMiAyLjY2NjY1IDcuNjU0MTUgMi42NjY2NSA5LjgzMzMzQzIuNjY2NjUgOS44OTY2NiAyLjY2ODM1IDkuOTUyMjIgMi42NzA4OCAxMEgzLjEzNDQxQzIuOTc3IDEwLjM5ODIgMi44NjExNCAxMC44NDIzIDIuNzg0MSAxMS4zMzMzSDIuMzMzMzFDMS42NjY2NSAxMS4zMzMzIDEuMzMzMzEgMTAuODMzMyAxLjMzMzMxIDkuODMzMzNDMS4zMzMzMSA3LjYwNTU5IDEuODgwOTcgNi4yMDQ5OCAzLjM5NDE3IDUuNjMxNTJDMy4xNDUyMSA1LjI2MDM4IDIuOTk5OTggNC44MTM4MiAyLjk5OTk4IDQuMzMzMzNDMi45OTk5OCAzLjA0NDY3IDQuMDQ0NjUgMiA1LjMzMzMxIDJaTTkuNzg5MDEgMy44NTM2MUM5LjQxNTkgMy42MTU4MyA4Ljk5MjMgMy40NTAyMyA4LjUzNzg4IDMuMzc2NTFDOC45MDMyMSAyLjU2NDk5IDkuNzE4OTUgMiAxMC42NjY2IDJDMTEuOTU1MyAyIDEzIDMuMDQ0NjcgMTMgNC4zMzMzM0MxMyA0LjgxMzgyIDEyLjg1NDcgNS4yNjAzOCAxMi42MDU4IDUuNjMxNTJDMTQuMTE5IDYuMjA0OTggMTQuNjY2NiA3LjYwNTU5IDE0LjY2NjYgOS44MzMzM0MxNC42NjY2IDEwLjgzMzMgMTQuMzMzMyAxMS4zMzMzIDEzLjY2NjYgMTEuMzMzM0gxMy4yMTU5QzEzLjEzODggMTAuODQyMyAxMy4wMjMgMTAuMzk4MiAxMi44NjU2IDEwSDEzLjMyOTFDMTMuMzMxNiA5Ljk1MjIyIDEzLjMzMzMgOS44OTY2NiAxMy4zMzMzIDkuODMzMzNDMTMuMzMzMyA3LjY1NDE1IDEyLjg3NzUgNi44NTMzMiAxMS4zMzMyIDYuNjk2N0wxMS4zMzMzIDYuNjY2NjdDMTEuMzMzMyA2LjE2NjcgMTEuMjIzMiA1LjY5MjQ1IDExLjAyNiA1LjI2NjgyQzExLjQwMDggNS4xMjI0NiAxMS42NjY2IDQuNzU4OTUgMTEuNjY2NiA0LjMzMzMzQzExLjY2NjYgMy43ODEwNSAxMS4yMTg5IDMuMzMzMzMgMTAuNjY2NiAzLjMzMzMzQzEwLjI4ODIgMy4zMzMzMyA5Ljk1ODg1IDMuNTQzNTYgOS43ODkwMSAzLjg1MzYxWk00LjQ5OTk4IDE0LjY2NjdDMy43MjIyIDE0LjY2NjcgMy4zMzMzMSAxNC4xMTExIDMuMzMzMzEgMTNDMy4zMzMzMSAxMC40NTk4IDQuMDA2MiA4Ljg4NzUgNS44Nzg4OCA4LjI4MzA4QzUuNTM2NiA3LjgzNDYyIDUuMzMzMzEgNy4yNzQzOCA1LjMzMzMxIDYuNjY2NjdDNS4zMzMzMSA1LjE5MzkxIDYuNTI3MjIgNCA3Ljk5OTk4IDRDOS40NzI3NCA0IDEwLjY2NjYgNS4xOTM5MSAxMC42NjY2IDYuNjY2NjdDMTAuNjY2NiA3LjI3NDM4IDEwLjQ2MzQgNy44MzQ2MiAxMC4xMjExIDguMjgzMDhDMTEuOTkzOCA4Ljg4NzUgMTIuNjY2NiAxMC40NTk4IDEyLjY2NjYgMTNDMTIuNjY2NiAxNC4xMTExIDEyLjI3NzggMTQuNjY2NyAxMS41IDE0LjY2NjdINC40OTk5OFpNOS4zMzMzMSA2LjY2NjY3QzkuMzMzMzEgNy40MDMwNSA4LjczNjM2IDggNy45OTk5OCA4QzcuMjYzNiA4IDYuNjY2NjUgNy40MDMwNSA2LjY2NjY1IDYuNjY2NjdDNi42NjY2NSA1LjkzMDI5IDcuMjYzNiA1LjMzMzMzIDcuOTk5OTggNS4zMzMzM0M4LjczNjM2IDUuMzMzMzMgOS4zMzMzMSA1LjkzMDI5IDkuMzMzMzEgNi42NjY2N1pNMTEuMzMzMyAxM0MxMS4zMzMzIDEzLjE0MjYgMTEuMzI1MiAxMy4yNTM2IDExLjMxNTIgMTMuMzMzM0g0LjY4NDc3QzQuNjc0NzYgMTMuMjUzNiA0LjY2NjY1IDEzLjE0MjYgNC42NjY2NSAxM0M0LjY2NjY1IDEwLjE5NTcgNS40MjAyMSA5LjMzMzMzIDcuOTk5OTggOS4zMzMzM0MxMC41Nzk3IDkuMzMzMzMgMTEuMzMzMyAxMC4xOTU3IDExLjMzMzMgMTNaXCI7XHJcbiAgICByZXR1cm4gVmVjdG9ySWNvbjtcclxufSgpKTtcclxuZXhwb3J0cy5WZWN0b3JJY29uID0gVmVjdG9ySWNvbjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dmVjdG9yX2ljb24uanMubWFwXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2NvbXBvbmVudHNcXFxcdmVjdG9yX2ljb24uanNcIixcIi9jb21wb25lbnRzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5NZWRpYVR5cGUgPSB2b2lkIDA7XHJcbnZhciBNZWRpYVR5cGU7XHJcbihmdW5jdGlvbiAoTWVkaWFUeXBlKSB7XHJcbiAgICBNZWRpYVR5cGVbXCJWSURFT1wiXSA9IFwidmlkZW9cIjtcclxuICAgIE1lZGlhVHlwZVtcIkFVRElPXCJdID0gXCJhdWRpb1wiO1xyXG4gICAgTWVkaWFUeXBlW1wiUFJFU0VOVEVSXCJdID0gXCJwcmVzZW50ZXJcIjtcclxufSkoTWVkaWFUeXBlID0gZXhwb3J0cy5NZWRpYVR5cGUgfHwgKGV4cG9ydHMuTWVkaWFUeXBlID0ge30pKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9TWVkaWFUeXBlLmpzLm1hcFxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9lbnVtXFxcXE1lZGlhVHlwZS5qc1wiLFwiL2VudW1cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLk5vdGlmaWNhdGlvblR5cGUgPSB2b2lkIDA7XHJcbnZhciBOb3RpZmljYXRpb25UeXBlO1xyXG4oZnVuY3Rpb24gKE5vdGlmaWNhdGlvblR5cGUpIHtcclxuICAgIE5vdGlmaWNhdGlvblR5cGVbXCJVc2VyXCJdID0gXCJ1c2VyXCI7XHJcbiAgICBOb3RpZmljYXRpb25UeXBlW1wiR3JhbnRIb3N0XCJdID0gXCJob3N0XCI7XHJcbiAgICBOb3RpZmljYXRpb25UeXBlW1wiVmlkZW9cIl0gPSBcInZpZGVvXCI7XHJcbiAgICBOb3RpZmljYXRpb25UeXBlW1wiVmlkZW9NdXRlXCJdID0gXCJ2aWRlby1tdXRlXCI7XHJcbiAgICBOb3RpZmljYXRpb25UeXBlW1wiQXVkaW9cIl0gPSBcImF1ZGlvXCI7XHJcbiAgICBOb3RpZmljYXRpb25UeXBlW1wiQXVkaW9NdXRlXCJdID0gXCJhdWRpby1tdXRlXCI7XHJcbiAgICBOb3RpZmljYXRpb25UeXBlW1wiUmVjb3JkaW5nXCJdID0gXCJyZWNvcmRpbmdcIjtcclxuICAgIE5vdGlmaWNhdGlvblR5cGVbXCJDaGF0XCJdID0gXCJjaGF0XCI7XHJcbiAgICBOb3RpZmljYXRpb25UeXBlW1wiSW5mb1wiXSA9IFwiaW5mb1wiO1xyXG4gICAgTm90aWZpY2F0aW9uVHlwZVtcIldhcm5pbmdcIl0gPSBcIndhcm5pbmdcIjtcclxufSkoTm90aWZpY2F0aW9uVHlwZSA9IGV4cG9ydHMuTm90aWZpY2F0aW9uVHlwZSB8fCAoZXhwb3J0cy5Ob3RpZmljYXRpb25UeXBlID0ge30pKTtcclxuO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1Ob3RpZmljYXRpb25UeXBlLmpzLm1hcFxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9lbnVtXFxcXE5vdGlmaWNhdGlvblR5cGUuanNcIixcIi9lbnVtXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5Vc2VyUHJvcGVydHkgPSB2b2lkIDA7XHJcbnZhciBVc2VyUHJvcGVydHk7XHJcbihmdW5jdGlvbiAoVXNlclByb3BlcnR5KSB7XHJcbiAgICBVc2VyUHJvcGVydHlbXCJ2aWRlb0VsZW1cIl0gPSBcInZpZGVvRWxlbVwiO1xyXG4gICAgVXNlclByb3BlcnR5W1wiYXVkaW9FbGVtXCJdID0gXCJhdWRpb0VsZW1cIjtcclxuICAgIFVzZXJQcm9wZXJ0eVtcIklzSG9zdFwiXSA9IFwiSXNIb3N0XCI7XHJcbiAgICBVc2VyUHJvcGVydHlbXCJ1c2VDYW1lcmFcIl0gPSBcInVzZUNhbWVyYVwiO1xyXG4gICAgVXNlclByb3BlcnR5W1widXNlTWljXCJdID0gXCJ1c2VNaWNcIjtcclxufSkoVXNlclByb3BlcnR5ID0gZXhwb3J0cy5Vc2VyUHJvcGVydHkgfHwgKGV4cG9ydHMuVXNlclByb3BlcnR5ID0ge30pKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9VXNlclByb3BlcnR5LmpzLm1hcFxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9lbnVtXFxcXFVzZXJQcm9wZXJ0eS5qc1wiLFwiL2VudW1cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cInVzZSBzdHJpY3RcIjtcclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICBcclxuICAgICAgICAgIG5QYW5lbENvdW50ID0gNFxyXG5cclxuLS0tLS0tLS0tLXBhbmVsQ29udGFpbmVyLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAtLS1wYW5lbC0tLSAgICAgICAtLS1wYW5lbC0tLVxyXG4gICAgfCAgICAxICAgICB8ICAgICAgfCAgICAyICAgIHxcclxuICAgIHxfX19fX19fX19ffCAgICAgIHxfX19fX19fX198XHJcblxyXG4gICAgLS0tcGFuZWwtLS0gICAgICAgLS0tcGFuZWwtLS1cclxuICAgIHwgICAgMyAgICAgfCAgICAgIHwgICAgNCAgICB8XHJcbiAgICB8X19fX19fX19fX3wgICAgICB8X19fX19fX19ffFxyXG5cclxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICAgQnV0dG9ucyAtICBhdWRpby92aWRlb011dGUsIHNjcmVlblNoYXJlLCBSZWNvcmQsIENoYXRcclxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5NZWV0aW5nVUkgPSB2b2lkIDA7XHJcbnZhciB2ZWN0b3JfaWNvbl8xID0gcmVxdWlyZShcIi4vY29tcG9uZW50cy92ZWN0b3JfaWNvblwiKTtcclxudmFyIE1lZGlhVHlwZV8xID0gcmVxdWlyZShcIi4vZW51bS9NZWRpYVR5cGVcIik7XHJcbnZhciBVc2VyUHJvcGVydHlfMSA9IHJlcXVpcmUoXCIuL2VudW0vVXNlclByb3BlcnR5XCIpO1xyXG52YXIgU2V0dGluZ0RpYWxvZ18xID0gcmVxdWlyZShcIi4vY29tcG9uZW50cy9TZXR0aW5nRGlhbG9nXCIpO1xyXG52YXIgQ2hhdHRpbmdQYW5lbF8xID0gcmVxdWlyZShcIi4vY29tcG9uZW50cy9DaGF0dGluZ1BhbmVsXCIpO1xyXG52YXIgUGFydGljaXBhbnRMaXN0UGFuZWxfMSA9IHJlcXVpcmUoXCIuL2NvbXBvbmVudHMvUGFydGljaXBhbnRMaXN0UGFuZWxcIik7XHJcbnZhciBOb3RpZmljYXRpb25UeXBlXzEgPSByZXF1aXJlKFwiLi9lbnVtL05vdGlmaWNhdGlvblR5cGVcIik7XHJcbnZhciBzbmlwcGV0XzEgPSByZXF1aXJlKFwiLi91dGlsL3NuaXBwZXRcIik7XHJcbnZhciBBc2tEaWFsb2dfMSA9IHJlcXVpcmUoXCIuL2NvbXBvbmVudHMvQXNrRGlhbG9nXCIpO1xyXG52YXIgUGFuZWxWaWRlb1N0YXRlO1xyXG4oZnVuY3Rpb24gKFBhbmVsVmlkZW9TdGF0ZSkge1xyXG4gICAgUGFuZWxWaWRlb1N0YXRlW1wiTm9DYW1lcmFcIl0gPSBcIm5vLWNhbWVyYVwiO1xyXG4gICAgUGFuZWxWaWRlb1N0YXRlW1wiU2NyZWVuU2hhcmVcIl0gPSBcInNjcmVlblwiO1xyXG4gICAgUGFuZWxWaWRlb1N0YXRlW1wiQ2FtZXJhXCJdID0gXCJjYW1lcmFcIjtcclxuICAgIFBhbmVsVmlkZW9TdGF0ZVtcIlZpZGVvU3RyZWFtaW5nXCJdID0gXCJzdHJlYW1cIjtcclxufSkoUGFuZWxWaWRlb1N0YXRlIHx8IChQYW5lbFZpZGVvU3RhdGUgPSB7fSkpO1xyXG52YXIgTWVldGluZ1VJID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTWVldGluZ1VJKG1lZXRpbmcpIHtcclxuICAgICAgICB0aGlzLk1BWF9QQU5FTFMgPSA5O1xyXG4gICAgICAgIHRoaXMublBhbmVsQ291bnQgPSAwO1xyXG4gICAgICAgIHRoaXMucGFuZWxDb250YWluZXJJZCA9IFwidmlkZW8tcGFuZWxcIjtcclxuICAgICAgICB0aGlzLnBhbmVsQ29udGFpbmVyRWxlbWVudCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy50b29sYmFySWQgPSBcIm5ldy10b29sYm94XCI7XHJcbiAgICAgICAgdGhpcy50b29sYmFyRWxlbWVudCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5wYW5lbENsYXNzID0gXCJ2aWRlb2NvbnRhaW5lclwiOyAvL2V2ZXJ5IHBhbmVsIGVsZW1lbnRzIGhhdmUgdGhpcyBjbGFzc1xyXG4gICAgICAgIHRoaXMudmlkZW9FbGVtZW50Q2xhc3MgPSBcInZpZGVvLWVsZW1lbnRcIjtcclxuICAgICAgICB0aGlzLnNob3J0TmFtZUNsYXNzID0gXCJhdmF0YXItY29udGFpbmVyXCI7XHJcbiAgICAgICAgdGhpcy5tb2RlcmF0b3JDbGFzcyA9IFwibW9kZXJhdG9yLWljb25cIjtcclxuICAgICAgICB0aGlzLmF1ZGlvTXV0ZUNsYXNzID0gXCJhdWRpb011dGVkXCI7XHJcbiAgICAgICAgdGhpcy52aWRlb011dGVDbGFzcyA9IFwidmlkZW9NdXRlZFwiO1xyXG4gICAgICAgIHRoaXMucG9wdXBNZW51Q2xhc3MgPSBcInBvcHVwLW1lbnVcIjtcclxuICAgICAgICB0aGlzLnBvcHVwTWVudUJ1dHRvbkNsYXNzID0gXCJyZW1vdGV2aWRlb21lbnVcIjtcclxuICAgICAgICB0aGlzLnVzZXJOYW1lQ2xhc3MgPSBcImRpc3BsYXluYW1lXCI7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVTcGVha2VyQ2xhc3MgPSBcImFjdGl2ZS1zcGVha2VyXCI7XHJcbiAgICAgICAgdGhpcy5mdWxsc2NyZWVuQ2xhc3MgPSBcInZpZGVvLWZ1bGxzY3JlZW5cIjtcclxuICAgICAgICB0aGlzLnByaXZhdGVDaGF0Q2xhc3MgPSBcInByaXZhdGUtY2hhdFwiO1xyXG4gICAgICAgIHRoaXMuaW5pdFRvcEluZm8gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm5QYW5lbEluc3RhbmNlSWQgPSAxOyAvL2luY3JlYXNlZCB3aGVuIGFkZCBuZXcsIGJ1dCBub3QgZGVjcmVhc2VkIHdoZW4gcmVtb3ZlIHBhbmVsXHJcbiAgICAgICAgdGhpcy5tZWV0aW5nID0gbnVsbDtcclxuICAgICAgICB0aGlzLm1lZXRpbmcgPSBtZWV0aW5nO1xyXG4gICAgICAgIHRoaXMucGFuZWxDb250YWluZXJFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5wYW5lbENvbnRhaW5lcklkKTtcclxuICAgICAgICB0aGlzLnRvb2xiYXJFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy50b29sYmFySWQpO1xyXG4gICAgICAgIHRoaXMudG9vbGJhckF1ZGlvQnV0dG9uRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWljLWVuYWJsZVwiKTtcclxuICAgICAgICB0aGlzLnRvb2xiYXJWaWRlb0J1dHRvbkVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NhbWVyYS1lbmFibGVcIik7XHJcbiAgICAgICAgdGhpcy50b29sYmFyRGVza3RvcFNoYXJlQnV0dG9uRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2hhcmVcIik7XHJcbiAgICAgICAgdGhpcy50b29sYmFyUmVjb3JkQnV0dG9uRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmVjb3JkXCIpO1xyXG4gICAgICAgIHRoaXMudG9vbGJhckNoYXRCdXR0b25FbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGF0XCIpO1xyXG4gICAgICAgIHRoaXMudG9vbGJhckxlYXZlQnV0dG9uRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbGVhdmVcIik7XHJcbiAgICAgICAgdGhpcy50b29sYmFyU2V0dGluZ0J1dHRvbkVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3NldHRpbmdcIik7XHJcbiAgICAgICAgdGhpcy5zdWJqZWN0RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc3ViamVjdC10ZXh0XCIpO1xyXG4gICAgICAgIHRoaXMudGltZXN0YW1wRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc3ViamVjdC10aW1lclwiKTtcclxuICAgICAgICB0aGlzLnRvcEluZm9iYXJFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zdWJqZWN0XCIpO1xyXG4gICAgICAgIHRoaXMudXNlckxpc3RUb2dnbGVCdXR0b25FbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNvcGVuLXBhcnRpY2lwYW50cy10b2dnbGVcIik7XHJcbiAgICAgICAgdGhpcy5yZWdpc3RlckV2ZW50SGFuZGxlcnMoKTtcclxuICAgICAgICB0aGlzLmNoYXR0aW5nUGFuZWwgPSBuZXcgQ2hhdHRpbmdQYW5lbF8xLkNoYXR0aW5nUGFuZWwoKTtcclxuICAgICAgICB2YXIgcHJvcHMgPSBuZXcgQ2hhdHRpbmdQYW5lbF8xLkNoYXR0aW5nUGFuZWxQcm9wcygpO1xyXG4gICAgICAgIHByb3BzLmNoYXRPcGVuQnV0dG9uID0gdGhpcy50b29sYmFyQ2hhdEJ1dHRvbkVsZW1lbnQ7XHJcbiAgICAgICAgcHJvcHMudW5yZWFkQmFkZ2VFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LWJhZGdlXCIpO1xyXG4gICAgICAgIHByb3BzLm9wZW5DYWxsYmFjayA9IHRoaXMucmVmcmVzaENhcmRWaWV3cy5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHByb3BzLnNlbmRDaGF0ID0gdGhpcy5tZWV0aW5nLnNlbmRDaGF0TWVzc2FnZS5iaW5kKHRoaXMubWVldGluZyk7XHJcbiAgICAgICAgcHJvcHMuc2VuZFByaXZhdGVDaGF0ID0gdGhpcy5tZWV0aW5nLnNlbmRQcml2YXRlQ2hhdE1lc3NhZ2UuYmluZCh0aGlzLm1lZXRpbmcpO1xyXG4gICAgICAgIHRoaXMuY2hhdHRpbmdQYW5lbC5pbml0KHByb3BzKTtcclxuICAgICAgICB0aGlzLnBhcnRpY2lwYW50c0xpc3RQYW5lbCA9IG5ldyBQYXJ0aWNpcGFudExpc3RQYW5lbF8xLlBhcnRpY2lwYW50TGlzdFBhbmVsKCk7XHJcbiAgICAgICAgdmFyIGxQcm9wcyA9IG5ldyBQYXJ0aWNpcGFudExpc3RQYW5lbF8xLlBhcnRpY2lwYW50TGlzdFBhbmVsUHJvcHMoKTtcclxuICAgICAgICBsUHJvcHMub25Vc2VDYW1lcmEgPSB0aGlzLm1lZXRpbmcuYWxsb3dDYW1lcmEuYmluZCh0aGlzLm1lZXRpbmcpO1xyXG4gICAgICAgIGxQcm9wcy5vblVzZU1pYyA9IHRoaXMubWVldGluZy5hbGxvd01pYy5iaW5kKHRoaXMubWVldGluZyk7XHJcbiAgICAgICAgdGhpcy5wYXJ0aWNpcGFudHNMaXN0UGFuZWwuaW5pdChsUHJvcHMpO1xyXG4gICAgfVxyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5yZWdpc3RlckV2ZW50SGFuZGxlcnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzXzEgPSB0aGlzO1xyXG4gICAgICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBfdGhpc18xLnJlZnJlc2hDYXJkVmlld3MoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndW5sb2FkJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBfdGhpc18xLm1lZXRpbmcuZm9yY2VTdG9wKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBfdGhpc18xLnJlZnJlc2hDYXJkVmlld3MoKTtcclxuICAgICAgICAgICAgdmFyIF90aGlzID0gX3RoaXNfMTtcclxuICAgICAgICAgICAgJChfdGhpc18xLnRvb2xiYXJMZWF2ZUJ1dHRvbkVsZW1lbnQpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzXzEubWVldGluZy5zdG9wKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoX3RoaXNfMS5tZWV0aW5nLmNvbmZpZy5oaWRlVG9vbGJhck9uTW91c2VPdXQpIHtcclxuICAgICAgICAgICAgICAgICQoXCIjY29udGVudFwiKS5ob3ZlcihmdW5jdGlvbiAoXykge1xyXG4gICAgICAgICAgICAgICAgICAgICQoX3RoaXNfMS50b29sYmFyRWxlbWVudCkuYWRkQ2xhc3MoXCJ2aXNpYmxlXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChfdGhpc18xLmluaXRUb3BJbmZvKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKF90aGlzXzEudG9wSW5mb2JhckVsZW1lbnQpLmFkZENsYXNzKFwidmlzaWJsZVwiKTtcclxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChfKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChfdGhpc18xLnRvb2xiYXJFbGVtZW50KS5yZW1vdmVDbGFzcyhcInZpc2libGVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzXzEuaW5pdFRvcEluZm8pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoX3RoaXNfMS50b3BJbmZvYmFyRWxlbWVudCkucmVtb3ZlQ2xhc3MoXCJ2aXNpYmxlXCIpO1xyXG4gICAgICAgICAgICAgICAgfSkuY2xpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoXCIuXCIgKyBfdGhpc18xLnBvcHVwTWVudUNsYXNzKS5yZW1vdmVDbGFzcyhcInZpc2libGVcIik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoX3RoaXNfMS50b29sYmFyRWxlbWVudCkuYWRkQ2xhc3MoXCJ2aXNpYmxlXCIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKF90aGlzXzEuaW5pdFRvcEluZm8pXHJcbiAgICAgICAgICAgICAgICAgICAgJChfdGhpc18xLnRvcEluZm9iYXJFbGVtZW50KS5hZGRDbGFzcyhcInZpc2libGVcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJChcIiNtaWMtZW5hYmxlXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzXzEubWVldGluZy5PblRvZ2dsZU11dGVNeUF1ZGlvKCk7XHJcbiAgICAgICAgICAgICAgICAvKnZhciBlbCA9ICQodGhpcykuZmluZChcIi50b29sYm94LWljb25cIik7XHJcbiAgICAgICAgICAgICAgICBlbC50b2dnbGVDbGFzcyhcInRvZ2dsZWRcIik7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWwuaGFzQ2xhc3MoXCJ0b2dnbGVkXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGVsLmZpbmQoXCJzdmdcIikuYXR0cihcInZpZXdCb3hcIiwgXCIwIDAgMjIgMjJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgZWwuZmluZChcInBhdGhcIikuYXR0cihcImRcIiwgXCJNNy4zMzMgOC42NVYxMWEzLjY2OCAzLjY2OCAwIDAwMi43NTcgMy41NTMuOTI4LjkyOCAwIDAwLS4wMDcuMTE0djEuNzU3QTUuNTAxIDUuNTAxIDAgMDE1LjUgMTFhLjkxNy45MTcgMCAxMC0xLjgzMyAwYzAgMy43NCAyLjc5OSA2LjgyNiA2LjQxNiA3LjI3N3YuOTczYS45MTcuOTE3IDAgMDAxLjgzNCAwdi0uOTczYTcuMjk3IDcuMjk3IDAgMDAzLjU2OC0xLjQ3NWwzLjA5MSAzLjA5MmEuOTMyLjkzMiAwIDEwMS4zMTgtMS4zMThsLTMuMDkxLTMuMDkxLjAxLS4wMTMtMS4zMTEtMS4zMTEtLjAxLjAxMy0xLjMyNS0xLjMyNS4wMDgtLjAxNC0xLjM5NS0xLjM5NWExLjI0IDEuMjQgMCAwMS0uMDA0LjAxOGwtMy42MS0zLjYwOXYtLjAyM0w3LjMzNCA1Ljk5M3YuMDIzbC0zLjkwOS0zLjkxYS45MzIuOTMyIDAgMTAtMS4zMTggMS4zMThMNy4zMzMgOC42NXptMS44MzQgMS44MzRWMTFhMS44MzMgMS44MzMgMCAwMDIuMjkxIDEuNzc2bC0yLjI5MS0yLjI5MnptMy42ODIgMy42ODNjLS4yOS4xNy0uNjA2LjMtLjk0LjM4NmEuOTI4LjkyOCAwIDAxLjAwOC4xMTR2MS43NTdhNS40NyA1LjQ3IDAgMDAyLjI1Ny0uOTMybC0xLjMyNS0xLjMyNXptMS44MTgtMy40NzZsLTEuODM0LTEuODM0VjUuNWExLjgzMyAxLjgzMyAwIDAwLTMuNjQ0LS4yODdsLTEuNDMtMS40M0EzLjY2NiAzLjY2NiAwIDAxMTQuNjY3IDUuNXY1LjE5em0xLjY2NSAxLjY2NWwxLjQ0NyAxLjQ0N2MuMzU3LS44NjQuNTU0LTEuODEuNTU0LTIuODAzYS45MTcuOTE3IDAgMTAtMS44MzMgMGMwIC40NjgtLjA1OC45MjItLjE2OCAxLjM1NnpcIik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsLmZpbmQoXCJzdmdcIikuYXR0cihcInZpZXdCb3hcIiwgXCIwIDAgMjQgMjRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgZWwuZmluZChcInBhdGhcIikuYXR0cihcImRcIiwgXCJNMTYgNmE0IDQgMCAwMC04IDB2NmE0LjAwMiA0LjAwMiAwIDAwMy4wMDggMy44NzZjLS4wMDUuMDQtLjAwOC4wODItLjAwOC4xMjR2MS45MTdBNi4wMDIgNi4wMDIgMCAwMTYgMTJhMSAxIDAgMTAtMiAwIDguMDAxIDguMDAxIDAgMDA3IDcuOTM4VjIxYTEgMSAwIDEwMiAwdi0xLjA2MkE4LjAwMSA4LjAwMSAwIDAwMjAgMTJhMSAxIDAgMTAtMiAwIDYuMDAyIDYuMDAyIDAgMDEtNSA1LjkxN1YxNmMwLS4wNDItLjAwMy0uMDgzLS4wMDgtLjEyNEE0LjAwMiA0LjAwMiAwIDAwMTYgMTJWNnptLTQtMmEyIDIgMCAwMC0yIDJ2NmEyIDIgMCAxMDQgMFY2YTIgMiAwIDAwLTItMnpcIik7XHJcbiAgICAgICAgICAgICAgICB9Ki9cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQoXCIjY2FtZXJhLWVuYWJsZVwiKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpc18xLm1lZXRpbmcuT25Ub2dnbGVNdXRlTXlWaWRlbygpO1xyXG4gICAgICAgICAgICAgICAgLyp2YXIgZWwgPSAkKHRoaXMpLmZpbmQoXCIudG9vbGJveC1pY29uXCIpO1xyXG4gICAgICAgICAgICAgICAgZWwudG9nZ2xlQ2xhc3MoXCJ0b2dnbGVkXCIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsLmhhc0NsYXNzKFwidG9nZ2xlZFwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsLmZpbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTSA2Ljg0IDUuNSBoIC0wLjAyMiBMIDMuNDI0IDIuMTA2IGEgMC45MzIgMC45MzIgMCAxIDAgLTEuMzE4IDEuMzE4IEwgNC4xODIgNS41IGggLTAuNTE1IGMgLTEuMDEzIDAgLTEuODM0IDAuODIgLTEuODM0IDEuODMzIHYgNy4zMzQgYyAwIDEuMDEyIDAuODIxIDEuODMzIDEuODM0IDEuODMzIEggMTMuNzUgYyAwLjQwNCAwIDAuNzc3IC0wLjEzIDEuMDggLTAuMzUyIGwgMy43NDYgMy43NDYgYSAwLjkzMiAwLjkzMiAwIDEgMCAxLjMxOCAtMS4zMTggbCAtNC4zMSAtNC4zMSB2IC0wLjAyNCBMIDEzLjc1IDEyLjQxIHYgMC4wMjMgbCAtNS4xIC01LjA5OSBoIDAuMDI0IEwgNi44NDEgNS41IFogbSA2LjkxIDQuMjc0IFYgNy4zMzMgaCAtMi40NCBMIDkuNDc1IDUuNSBoIDQuMjc0IGMgMS4wMTIgMCAxLjgzMyAwLjgyIDEuODMzIDEuODMzIHYgMC43ODYgbCAzLjIxMiAtMS44MzUgYSAwLjkxNyAwLjkxNyAwIDAgMSAxLjM3MiAwLjc5NiB2IDcuODQgYyAwIDAuMzQ0IC0wLjE5IDAuNjQ0IC0wLjQ3IDAuOCBsIC0zLjczNiAtMy43MzUgbCAyLjM3MiAxLjM1NiBWIDguNjU5IGwgLTIuNzUgMS41NzEgdiAxLjM3NyBMIDEzLjc1IDkuNzc0IFogTSAzLjY2NyA3LjMzNCBoIDIuMzQ5IGwgNy4zMzMgNy4zMzMgSCAzLjY2NyBWIDcuMzMzIFpcIik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsLmZpbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTTEzLjc1IDUuNUgzLjY2N2MtMS4wMTMgMC0xLjgzNC44Mi0xLjgzNCAxLjgzM3Y3LjMzNGMwIDEuMDEyLjgyMSAxLjgzMyAxLjgzNCAxLjgzM0gxMy43NWMxLjAxMiAwIDEuODMzLS44MiAxLjgzMy0xLjgzM3YtLjc4NmwzLjIxMiAxLjgzNWEuOTE2LjkxNiAwIDAwMS4zNzItLjc5NlY3LjA4YS45MTcuOTE3IDAgMDAtMS4zNzItLjc5NmwtMy4yMTIgMS44MzV2LS43ODZjMC0xLjAxMi0uODItMS44MzMtMS44MzMtMS44MzN6bTAgMy42Njd2NS41SDMuNjY3VjcuMzMzSDEzLjc1djEuODM0em00LjU4MyA0LjE3NGwtMi43NS0xLjU3MnYtMS41MzhsMi43NS0xLjU3MnY0LjY4MnpcIik7XHJcbiAgICAgICAgICAgICAgICB9Ki9cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQoX3RoaXNfMS50b29sYmFyQ2hhdEJ1dHRvbkVsZW1lbnQpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChfKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpc18xLmNoYXR0aW5nUGFuZWwudG9nZ2xlT3BlbigpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJChfdGhpc18xLnRvb2xiYXJEZXNrdG9wU2hhcmVCdXR0b25FbGVtZW50KS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzXzEubWVldGluZy50b2dnbGVTY3JlZW5TaGFyZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJChfdGhpc18xLnRvb2xiYXJSZWNvcmRCdXR0b25FbGVtZW50KS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpc18xLm1lZXRpbmcudG9nZ2xlUmVjb3JkaW5nKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKF90aGlzXzEudG9vbGJhclNldHRpbmdCdXR0b25FbGVtZW50KS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpc18xLnNob3dTZXR0aW5nRGlhbG9nKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW5zaWRlID0gJChlLnRhcmdldCkuY2xvc2VzdChcIi5cIiArIF90aGlzXzEucG9wdXBNZW51Q2xhc3MpLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWluc2lkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoXCIuXCIgKyBfdGhpc18xLnBvcHVwTWVudUNsYXNzKS5yZW1vdmVDbGFzcyhcInZpc2libGVcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUudXBkYXRlQnlSb2xlID0gZnVuY3Rpb24gKGlzSG9zdCkge1xyXG4gICAgICAgIHZhciBpc1dlYmluYXIgPSB0aGlzLm1lZXRpbmcucm9vbUluZm8uSXNXZWJpbmFyO1xyXG4gICAgICAgIGlmIChpc1dlYmluYXIgJiYgIWlzSG9zdClcclxuICAgICAgICAgICAgdGhpcy5zaG93UGFydGljaXBhbnRMaXN0QnV0dG9uKGZhbHNlKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHRoaXMuc2hvd1BhcnRpY2lwYW50TGlzdEJ1dHRvbih0cnVlKTtcclxuICAgICAgICB0aGlzLnBhcnRpY2lwYW50c0xpc3RQYW5lbC51cGRhdGVCeVJvbGUoaXNIb3N0KTtcclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLnJlZ2lzdGVyUGFuZWxFdmVudEhhbmRsZXIgPSBmdW5jdGlvbiAocGFuZWwpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgICQocGFuZWwpXHJcbiAgICAgICAgICAgIC5vbignY2xpY2snLCBcIi5cIiArIF90aGlzLnBvcHVwTWVudUJ1dHRvbkNsYXNzLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAkKFwiLlwiICsgX3RoaXMucG9wdXBNZW51Q2xhc3MpLnJlbW92ZUNsYXNzKFwidmlzaWJsZVwiKTtcclxuICAgICAgICAgICAgJCh0aGlzKS5maW5kKFwiLlwiICsgX3RoaXMucG9wdXBNZW51Q2xhc3MpLmFkZENsYXNzKFwidmlzaWJsZVwiKS5mb2N1cygpO1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5vbignY2xpY2snLCAnbGkub3ZlcmZsb3ctbWVudS1pdGVtJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KFwiLlwiICsgX3RoaXMucG9wdXBNZW51Q2xhc3MpLnJlbW92ZUNsYXNzKFwidmlzaWJsZVwiKTtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgJy5mdWxsc2NyZWVuJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgJChwYW5lbCkudG9nZ2xlQ2xhc3MoX3RoaXMuZnVsbHNjcmVlbkNsYXNzKTtcclxuICAgICAgICAgICAgX3RoaXMucmVmcmVzaENhcmRWaWV3cygpO1xyXG4gICAgICAgICAgICB2YXIgbGFiZWwgPSAkKHRoaXMpLmZpbmQoXCIubGFiZWxcIik7XHJcbiAgICAgICAgICAgIGlmICgkKHBhbmVsKS5oYXNDbGFzcyhfdGhpcy5mdWxsc2NyZWVuQ2xhc3MpKSB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbC5odG1sKFwiRXhpdCBmdWxsIHNjcmVlblwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmh0bWwoXCJWaWV3IGZ1bGwgc2NyZWVuXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJkaXNwbGF5LXZpZGVvXCIpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKFwiZGlzcGxheS1uYW1lLW9uLXZpZGVvXCIpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5vbignbW91c2VvdXQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJkaXNwbGF5LW5hbWUtb24tdmlkZW9cIik7XHJcbiAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJkaXNwbGF5LXZpZGVvXCIpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5vbignZGJsY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAkKHRoaXMpLmZpbmQoXCIuZnVsbHNjcmVlblwiKS50cmlnZ2VyKFwiY2xpY2tcIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5fZ2V0UGFuZWxGcm9tVmlkZW9FbGVtZW50ID0gZnVuY3Rpb24gKHZpZGVvRWxlbSkge1xyXG4gICAgICAgIHJldHVybiB2aWRlb0VsZW0ucGFyZW50Tm9kZTtcclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLl9nZXRWaWRlb0VsZW1lbnRGcm9tUGFuZWwgPSBmdW5jdGlvbiAocGFuZWwpIHtcclxuICAgICAgICByZXR1cm4gJChcIi5cIiArIHRoaXMudmlkZW9FbGVtZW50Q2xhc3MsIHBhbmVsKVswXTtcclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLl9nZXRBdWRpb0VsZW1lbnRGcm9tUGFuZWwgPSBmdW5jdGlvbiAocGFuZWwpIHtcclxuICAgICAgICByZXR1cm4gJChcImF1ZGlvXCIsIHBhbmVsKVswXTtcclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLl9nZXRTaG9ydE5hbWVFbGVtZW50RnJvbVBhbmVsID0gZnVuY3Rpb24gKHBhbmVsKSB7XHJcbiAgICAgICAgcmV0dXJuICQoXCIuXCIgKyB0aGlzLnNob3J0TmFtZUNsYXNzLCBwYW5lbClbMF07XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5fZ2V0QXVkaW9NdXRlRWxlbWVudEZyb21QYW5lbCA9IGZ1bmN0aW9uIChwYW5lbCkge1xyXG4gICAgICAgIHJldHVybiAkKFwiLlwiICsgdGhpcy5hdWRpb011dGVDbGFzcywgcGFuZWwpWzBdO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuX2dldFZpZGVvTXV0ZUVsZW1lbnRGcm9tUGFuZWwgPSBmdW5jdGlvbiAocGFuZWwpIHtcclxuICAgICAgICByZXR1cm4gJChcIi5cIiArIHRoaXMudmlkZW9NdXRlQ2xhc3MsIHBhbmVsKVswXTtcclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLl9nZXRNb2RlcmF0b3JTdGFyRWxlbWVudEZyb21QYW5lbCA9IGZ1bmN0aW9uIChwYW5lbCkge1xyXG4gICAgICAgIHJldHVybiAkKFwiLlwiICsgdGhpcy5tb2RlcmF0b3JDbGFzcywgcGFuZWwpWzBdO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuX2dldE5hbWVFbGVtZW50RnJvbVBhbmVsID0gZnVuY3Rpb24gKHBhbmVsKSB7XHJcbiAgICAgICAgcmV0dXJuICQoXCIuXCIgKyB0aGlzLnVzZXJOYW1lQ2xhc3MsIHBhbmVsKVswXTtcclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLl9nZXRQb3B1cE1lbnVHcmFudE1vZGVyYXRvckZyb21QYW5lbCA9IGZ1bmN0aW9uIChwYW5lbCkge1xyXG4gICAgICAgIHJldHVybiAkKFwibGkuZ3JhbnQtbW9kZXJhdG9yXCIsIHBhbmVsKVswXTtcclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLl9nZXRQb3B1cE1lbnVBdWRpb011dGVGcm9tUGFuZWwgPSBmdW5jdGlvbiAocGFuZWwpIHtcclxuICAgICAgICByZXR1cm4gJChcImxpLmF1ZGlvLW11dGVcIiwgcGFuZWwpWzBdO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuX2dldFBvcHVwTWVudVZpZGVvTXV0ZUZyb21QYW5lbCA9IGZ1bmN0aW9uIChwYW5lbCkge1xyXG4gICAgICAgIHJldHVybiAkKFwibGkudmlkZW8tbXV0ZVwiLCBwYW5lbClbMF07XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5fZ2V0UG9wdXBNZW51RnVsbHNjcmVlbkZyb21QYW5lbCA9IGZ1bmN0aW9uIChwYW5lbCkge1xyXG4gICAgICAgIHJldHVybiAkKFwibGkuZnVsbHNjcmVlblwiLCBwYW5lbClbMF07XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5nZXRFbXB0eVZpZGVvUGFuZWwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHBhbmVsID0gdGhpcy5hZGROZXdQYW5lbCgpO1xyXG4gICAgICAgIHRoaXMucmVnaXN0ZXJQYW5lbEV2ZW50SGFuZGxlcihwYW5lbCk7XHJcbiAgICAgICAgLy9ib3R0b20gc21hbGwgaWNvbnNcclxuICAgICAgICB0aGlzLl9nZXRWaWRlb011dGVFbGVtZW50RnJvbVBhbmVsKHBhbmVsKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgdGhpcy5fZ2V0QXVkaW9NdXRlRWxlbWVudEZyb21QYW5lbChwYW5lbCkuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgIHRoaXMuX2dldE1vZGVyYXRvclN0YXJFbGVtZW50RnJvbVBhbmVsKHBhbmVsKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgdmFyIHZpZGVvRWxlbSA9IHRoaXMuX2dldFZpZGVvRWxlbWVudEZyb21QYW5lbChwYW5lbCk7XHJcbiAgICAgICAgdmFyIGF1ZGlvRWxlbSA9IHRoaXMuX2dldEF1ZGlvRWxlbWVudEZyb21QYW5lbChwYW5lbCk7XHJcbiAgICAgICAgcmV0dXJuIHsgdmlkZW9FbGVtOiB2aWRlb0VsZW0sIGF1ZGlvRWxlbTogYXVkaW9FbGVtIH07XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5mcmVlVmlkZW9QYW5lbCA9IGZ1bmN0aW9uICh2aWRlb0VsZW1lbnQpIHtcclxuICAgICAgICB2YXIgdmlkZW9DYXJkVmlld3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwidmlkZW8uXCIgKyB0aGlzLnZpZGVvRWxlbWVudENsYXNzKTtcclxuICAgICAgICB2YXIgTiA9IHZpZGVvQ2FyZFZpZXdzLmxlbmd0aDtcclxuICAgICAgICB2YXIgaSA9IDA7XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IE47IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodmlkZW9DYXJkVmlld3NbaV0gPT0gdmlkZW9FbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY3VyRWxlbSA9IHZpZGVvQ2FyZFZpZXdzW2ldO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKCEkKGN1ckVsZW0pLmhhc0NsYXNzKHRoaXMucGFuZWxDbGFzcykpXHJcbiAgICAgICAgICAgICAgICAgICAgY3VyRWxlbSA9IGN1ckVsZW0ucGFyZW50RWxlbWVudDtcclxuICAgICAgICAgICAgICAgIGN1ckVsZW0ucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5yZWZyZXNoQ2FyZFZpZXdzKCk7XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS51cGRhdGVQYW5lbE9uSml0c2lVc2VyID0gZnVuY3Rpb24gKHZpZGVvRWxlbSwgbXlJbmZvLCB1c2VyKSB7XHJcbiAgICAgICAgdmFyIF90aGlzXzEgPSB0aGlzO1xyXG4gICAgICAgIHZhciBwYW5lbCA9IHRoaXMuX2dldFBhbmVsRnJvbVZpZGVvRWxlbWVudCh2aWRlb0VsZW0pO1xyXG4gICAgICAgIGlmICghcGFuZWwpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAvL3NldCBuYW1lXHJcbiAgICAgICAgdGhpcy5zZXRVc2VyTmFtZSh1c2VyLmdldERpc3BsYXlOYW1lKCksIHZpZGVvRWxlbSk7XHJcbiAgICAgICAgLy9oaWRlIHNob3RuYW1lIGlmIGV4aXN0IHZpc2libGUgdmlkZW8gdHJhY2tcclxuICAgICAgICB2YXIgaXNWaXNpYmxlVmlkZW8gPSBmYWxzZTtcclxuICAgICAgICB1c2VyLmdldFRyYWNrcygpLmZvckVhY2goZnVuY3Rpb24gKHRyYWNrKSB7XHJcbiAgICAgICAgICAgIGlmICh0cmFjay5nZXRUeXBlKCkgPT09IE1lZGlhVHlwZV8xLk1lZGlhVHlwZS5WSURFTyAmJiAhdHJhY2suaXNNdXRlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICBpc1Zpc2libGVWaWRlbyA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnNldFNob3RuYW1lVmlzaWJsZSghaXNWaXNpYmxlVmlkZW8sIHZpZGVvRWxlbSk7XHJcbiAgICAgICAgLy9ib3R0b20gc21hbGwgaWNvbnNcclxuICAgICAgICB0aGlzLl9nZXRWaWRlb011dGVFbGVtZW50RnJvbVBhbmVsKHBhbmVsKS5zdHlsZS5kaXNwbGF5ID0gdXNlci5pc1ZpZGVvTXV0ZWQoKSA/IFwiYmxvY2tcIiA6IFwibm9uZVwiO1xyXG4gICAgICAgIHRoaXMuX2dldEF1ZGlvTXV0ZUVsZW1lbnRGcm9tUGFuZWwocGFuZWwpLnN0eWxlLmRpc3BsYXkgPSB1c2VyLmlzQXVkaW9NdXRlZCgpID8gXCJibG9ja1wiIDogXCJub25lXCI7XHJcbiAgICAgICAgdGhpcy5fZ2V0TW9kZXJhdG9yU3RhckVsZW1lbnRGcm9tUGFuZWwocGFuZWwpLnN0eWxlLmRpc3BsYXkgPSB1c2VyLmdldFByb3BlcnR5KFVzZXJQcm9wZXJ0eV8xLlVzZXJQcm9wZXJ0eS5Jc0hvc3QpID8gXCJibG9ja1wiIDogXCJub25lXCI7XHJcbiAgICAgICAgLy9wb3B1cCBtZW51XHJcbiAgICAgICAgdmFyIGF1ZGlvTXV0ZVBvcHVwTWVudSA9IHRoaXMuX2dldFBvcHVwTWVudUF1ZGlvTXV0ZUZyb21QYW5lbChwYW5lbCk7XHJcbiAgICAgICAgdmFyIHZpZGVvTXV0ZVBvcHVwTWVudSA9IHRoaXMuX2dldFBvcHVwTWVudVZpZGVvTXV0ZUZyb21QYW5lbChwYW5lbCk7XHJcbiAgICAgICAgdmFyIGdyYW50TW9kZXJhdG9yUG9wdXBNZW51ID0gdGhpcy5fZ2V0UG9wdXBNZW51R3JhbnRNb2RlcmF0b3JGcm9tUGFuZWwocGFuZWwpO1xyXG4gICAgICAgIGlmIChteUluZm8uSXNIb3N0KSB7XHJcbiAgICAgICAgICAgIHZhciB1c2VySGF2ZUNhbWVyYV8xID0gZmFsc2UsIHVzZXJIYXZlTWljcm9waG9uZV8xID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHVzZXIuZ2V0VHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbiAodHJhY2spIHtcclxuICAgICAgICAgICAgICAgIGlmICh0cmFjay5nZXRUeXBlKCkgPT09IE1lZGlhVHlwZV8xLk1lZGlhVHlwZS5WSURFTylcclxuICAgICAgICAgICAgICAgICAgICB1c2VySGF2ZUNhbWVyYV8xID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRyYWNrLmdldFR5cGUoKSA9PT0gTWVkaWFUeXBlXzEuTWVkaWFUeXBlLkFVRElPKVxyXG4gICAgICAgICAgICAgICAgICAgIHVzZXJIYXZlTWljcm9waG9uZV8xID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHZpZGVvTXV0ZVBvcHVwTWVudS5zdHlsZS5kaXNwbGF5ID0gdXNlckhhdmVDYW1lcmFfMSA/IFwiZmxleFwiIDogXCJub25lXCI7XHJcbiAgICAgICAgICAgIGF1ZGlvTXV0ZVBvcHVwTWVudS5zdHlsZS5kaXNwbGF5ID0gdXNlckhhdmVNaWNyb3Bob25lXzEgPyBcImZsZXhcIiA6IFwibm9uZVwiO1xyXG4gICAgICAgICAgICBncmFudE1vZGVyYXRvclBvcHVwTWVudS5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2aWRlb011dGVQb3B1cE1lbnUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICBhdWRpb011dGVQb3B1cE1lbnUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICBncmFudE1vZGVyYXRvclBvcHVwTWVudS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh1c2VyLmdldFByb3BlcnR5KFVzZXJQcm9wZXJ0eV8xLlVzZXJQcm9wZXJ0eS5Jc0hvc3QpKVxyXG4gICAgICAgICAgICBncmFudE1vZGVyYXRvclBvcHVwTWVudS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgLy9wb3B1cCBtZW51IGF1ZGlvIGljb24vbGFiZWwgY2hhbmdlXHJcbiAgICAgICAgaWYgKGF1ZGlvTXV0ZVBvcHVwTWVudS5zdHlsZS5kaXNwbGF5ID09PSAnZmxleCcpIHtcclxuICAgICAgICAgICAgaWYgKHVzZXIuaXNBdWRpb011dGVkKCkpIHtcclxuICAgICAgICAgICAgICAgICQoYXVkaW9NdXRlUG9wdXBNZW51KS5maW5kKFwiLmxhYmVsXCIpLmh0bWwoXCJVbm11dGUgQXVkaW9cIik7XHJcbiAgICAgICAgICAgICAgICAkKGF1ZGlvTXV0ZVBvcHVwTWVudSkuZmluZChcInBhdGhcIikuYXR0cihcImRcIiwgdmVjdG9yX2ljb25fMS5WZWN0b3JJY29uLkFVRElPX01VVEVfSUNPTik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKGF1ZGlvTXV0ZVBvcHVwTWVudSkuZmluZChcIi5sYWJlbFwiKS5odG1sKFwiTXV0ZSBBdWRpb1wiKTtcclxuICAgICAgICAgICAgICAgICQoYXVkaW9NdXRlUG9wdXBNZW51KS5maW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCB2ZWN0b3JfaWNvbl8xLlZlY3Rvckljb24uQVVESU9fVU5NVVRFX0lDT04pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2aWRlb011dGVQb3B1cE1lbnUuc3R5bGUuZGlzcGxheSA9PT0gJ2ZsZXgnKSB7XHJcbiAgICAgICAgICAgIGlmICh1c2VyLmlzVmlkZW9NdXRlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICAkKHZpZGVvTXV0ZVBvcHVwTWVudSkuZmluZChcIi5sYWJlbFwiKS5odG1sKFwiVW5tdXRlIFZpZGVvXCIpO1xyXG4gICAgICAgICAgICAgICAgJCh2aWRlb011dGVQb3B1cE1lbnUpLmZpbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIHZlY3Rvcl9pY29uXzEuVmVjdG9ySWNvbi5WSURFT19NVVRFX0lDT04pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJCh2aWRlb011dGVQb3B1cE1lbnUpLmZpbmQoXCIubGFiZWxcIikuaHRtbChcIk11dGUgVmlkZW9cIik7XHJcbiAgICAgICAgICAgICAgICAkKHZpZGVvTXV0ZVBvcHVwTWVudSkuZmluZChcInBhdGhcIikuYXR0cihcImRcIiwgdmVjdG9yX2ljb25fMS5WZWN0b3JJY29uLlZJREVPX1VOTVVURV9JQ09OKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvL3BvcHVwIG1lbnUgaGFuZGxlcnNcclxuICAgICAgICBpZiAobXlJbmZvLklzSG9zdCkge1xyXG4gICAgICAgICAgICAkKGdyYW50TW9kZXJhdG9yUG9wdXBNZW51KS51bmJpbmQoJ2NsaWNrJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgX3RoaXNfMS5tZWV0aW5nLmdyYW50TW9kZXJhdG9yUm9sZSh1c2VyLmdldElkKCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJChhdWRpb011dGVQb3B1cE1lbnUpLnVuYmluZCgnY2xpY2snKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpc18xLm1lZXRpbmcubXV0ZVVzZXJBdWRpbyh1c2VyLmdldElkKCksICF1c2VyLmlzQXVkaW9NdXRlZCgpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQodmlkZW9NdXRlUG9wdXBNZW51KS51bmJpbmQoJ2NsaWNrJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgX3RoaXNfMS5tZWV0aW5nLm11dGVVc2VyVmlkZW8odXNlci5nZXRJZCgpLCAhdXNlci5pc1ZpZGVvTXV0ZWQoKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL3ByaXZhdGUgY2hhdCBoYW5kbGVyXHJcbiAgICAgICAgJChwYW5lbCkuZmluZChcIi5cIiArIHRoaXMucHJpdmF0ZUNoYXRDbGFzcykuY2xpY2soZnVuY3Rpb24gKF8pIHtcclxuICAgICAgICAgICAgX3RoaXNfMS5jaGF0dGluZ1BhbmVsLm9wZW4odHJ1ZSk7XHJcbiAgICAgICAgICAgIF90aGlzXzEuY2hhdHRpbmdQYW5lbC5zZXRQcml2YXRlU3RhdGUodXNlci5nZXRJZCgpLCB1c2VyLmdldERpc3BsYXlOYW1lKCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vYWN0aXZlIHNwZWFrZXIoYmx1ZSBib3JkZXIpXHJcbiAgICAgICAgJChwYW5lbCkucmVtb3ZlQ2xhc3ModGhpcy5hY3RpdmVTcGVha2VyQ2xhc3MpO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUudXBkYXRlUGFuZWxPbk15QkdVc2VyID0gZnVuY3Rpb24gKHZpZGVvRWxlbSwgbXlJbmZvLCBsb2NhbFRyYWNrcykge1xyXG4gICAgICAgIHZhciBfdGhpc18xID0gdGhpcztcclxuICAgICAgICB2YXIgcGFuZWwgPSB0aGlzLl9nZXRQYW5lbEZyb21WaWRlb0VsZW1lbnQodmlkZW9FbGVtKTtcclxuICAgICAgICBpZiAoIXBhbmVsKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgdmFyIGF1ZGlvTXV0ZWQgPSB0cnVlLCB2aWRlb011dGVkID0gdHJ1ZTtcclxuICAgICAgICBsb2NhbFRyYWNrcy5mb3JFYWNoKGZ1bmN0aW9uICh0cmFjaykge1xyXG4gICAgICAgICAgICBpZiAodHJhY2suZ2V0VHlwZSgpID09PSBNZWRpYVR5cGVfMS5NZWRpYVR5cGUuVklERU8gJiYgIXRyYWNrLmlzTXV0ZWQoKSlcclxuICAgICAgICAgICAgICAgIHZpZGVvTXV0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgZWxzZSBpZiAodHJhY2suZ2V0VHlwZSgpID09PSBNZWRpYVR5cGVfMS5NZWRpYVR5cGUuQVVESU8gJiYgIXRyYWNrLmlzTXV0ZWQoKSlcclxuICAgICAgICAgICAgICAgIGF1ZGlvTXV0ZWQgPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvL25hbWVcclxuICAgICAgICB0aGlzLnNldFVzZXJOYW1lKG15SW5mby5OYW1lLCB2aWRlb0VsZW0pO1xyXG4gICAgICAgIHZhciBpc1Zpc2libGVWaWRlbyA9IGZhbHNlO1xyXG4gICAgICAgIGxvY2FsVHJhY2tzLmZvckVhY2goZnVuY3Rpb24gKHRyYWNrKSB7XHJcbiAgICAgICAgICAgIGlmICh0cmFjay5nZXRUeXBlKCkgPT09IE1lZGlhVHlwZV8xLk1lZGlhVHlwZS5WSURFTyAmJiAhdHJhY2suaXNNdXRlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICBpc1Zpc2libGVWaWRlbyA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnNldFNob3RuYW1lVmlzaWJsZSghaXNWaXNpYmxlVmlkZW8sIHZpZGVvRWxlbSk7XHJcbiAgICAgICAgLy9ib3R0b20gc21hbGwgaWNvbnNcclxuICAgICAgICB0aGlzLl9nZXRWaWRlb011dGVFbGVtZW50RnJvbVBhbmVsKHBhbmVsKS5zdHlsZS5kaXNwbGF5ID0gdmlkZW9NdXRlZCA/IFwiYmxvY2tcIiA6IFwibm9uZVwiO1xyXG4gICAgICAgIHRoaXMuX2dldEF1ZGlvTXV0ZUVsZW1lbnRGcm9tUGFuZWwocGFuZWwpLnN0eWxlLmRpc3BsYXkgPSBhdWRpb011dGVkID8gXCJibG9ja1wiIDogXCJub25lXCI7XHJcbiAgICAgICAgdGhpcy5fZ2V0TW9kZXJhdG9yU3RhckVsZW1lbnRGcm9tUGFuZWwocGFuZWwpLnN0eWxlLmRpc3BsYXkgPSBteUluZm8uSXNIb3N0ID8gXCJibG9ja1wiIDogXCJub25lXCI7XHJcbiAgICAgICAgLy9wb3B1cCBtZW51XHJcbiAgICAgICAgdmFyIGF1ZGlvTXV0ZVBvcHVwTWVudSA9IHRoaXMuX2dldFBvcHVwTWVudUF1ZGlvTXV0ZUZyb21QYW5lbChwYW5lbCk7XHJcbiAgICAgICAgdmFyIHZpZGVvTXV0ZVBvcHVwTWVudSA9IHRoaXMuX2dldFBvcHVwTWVudVZpZGVvTXV0ZUZyb21QYW5lbChwYW5lbCk7XHJcbiAgICAgICAgdmFyIGdyYW50TW9kZXJhdG9yUG9wdXBNZW51ID0gdGhpcy5fZ2V0UG9wdXBNZW51R3JhbnRNb2RlcmF0b3JGcm9tUGFuZWwocGFuZWwpO1xyXG4gICAgICAgIGlmIChteUluZm8uSXNIb3N0KSB7XHJcbiAgICAgICAgICAgIHZpZGVvTXV0ZVBvcHVwTWVudS5zdHlsZS5kaXNwbGF5ID0gbXlJbmZvLm1lZGlhUG9saWN5LnVzZUNhbWVyYSA/IFwiZmxleFwiIDogXCJub25lXCI7XHJcbiAgICAgICAgICAgIGF1ZGlvTXV0ZVBvcHVwTWVudS5zdHlsZS5kaXNwbGF5ID0gbXlJbmZvLm1lZGlhUG9saWN5LnVzZU1pYyA/IFwiZmxleFwiIDogXCJub25lXCI7XHJcbiAgICAgICAgICAgIGdyYW50TW9kZXJhdG9yUG9wdXBNZW51LnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZpZGVvTXV0ZVBvcHVwTWVudS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgICAgIGF1ZGlvTXV0ZVBvcHVwTWVudS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgICAgIGdyYW50TW9kZXJhdG9yUG9wdXBNZW51LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZ3JhbnRNb2RlcmF0b3JQb3B1cE1lbnUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgIC8vcG9wdXAgbWVudSBhdWRpbyBpY29uL2xhYmVsIGNoYW5nZVxyXG4gICAgICAgIGlmIChhdWRpb011dGVQb3B1cE1lbnUuc3R5bGUuZGlzcGxheSA9PT0gJ2ZsZXgnKSB7XHJcbiAgICAgICAgICAgIGlmIChhdWRpb011dGVkKSB7XHJcbiAgICAgICAgICAgICAgICAkKGF1ZGlvTXV0ZVBvcHVwTWVudSkuZmluZChcIi5sYWJlbFwiKS5odG1sKFwiVW5tdXRlIEF1ZGlvXCIpO1xyXG4gICAgICAgICAgICAgICAgJChhdWRpb011dGVQb3B1cE1lbnUpLmZpbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIHZlY3Rvcl9pY29uXzEuVmVjdG9ySWNvbi5BVURJT19NVVRFX0lDT04pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJChhdWRpb011dGVQb3B1cE1lbnUpLmZpbmQoXCIubGFiZWxcIikuaHRtbChcIk11dGUgQXVkaW9cIik7XHJcbiAgICAgICAgICAgICAgICAkKGF1ZGlvTXV0ZVBvcHVwTWVudSkuZmluZChcInBhdGhcIikuYXR0cihcImRcIiwgdmVjdG9yX2ljb25fMS5WZWN0b3JJY29uLkFVRElPX1VOTVVURV9JQ09OKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmlkZW9NdXRlUG9wdXBNZW51LnN0eWxlLmRpc3BsYXkgPT09ICdmbGV4Jykge1xyXG4gICAgICAgICAgICBpZiAodmlkZW9NdXRlZCkge1xyXG4gICAgICAgICAgICAgICAgJCh2aWRlb011dGVQb3B1cE1lbnUpLmZpbmQoXCIubGFiZWxcIikuaHRtbChcIlVubXV0ZSBWaWRlb1wiKTtcclxuICAgICAgICAgICAgICAgICQodmlkZW9NdXRlUG9wdXBNZW51KS5maW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCB2ZWN0b3JfaWNvbl8xLlZlY3Rvckljb24uVklERU9fTVVURV9JQ09OKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQodmlkZW9NdXRlUG9wdXBNZW51KS5maW5kKFwiLmxhYmVsXCIpLmh0bWwoXCJNdXRlIFZpZGVvXCIpO1xyXG4gICAgICAgICAgICAgICAgJCh2aWRlb011dGVQb3B1cE1lbnUpLmZpbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIHZlY3Rvcl9pY29uXzEuVmVjdG9ySWNvbi5WSURFT19VTk1VVEVfSUNPTik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy9wb3B1cCBtZW51IGhhbmRsZXJzXHJcbiAgICAgICAgaWYgKG15SW5mby5Jc0hvc3QpIHtcclxuICAgICAgICAgICAgJChhdWRpb011dGVQb3B1cE1lbnUpLnVuYmluZCgnY2xpY2snKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpc18xLm1lZXRpbmcubXV0ZU15QXVkaW8oIWF1ZGlvTXV0ZWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJCh2aWRlb011dGVQb3B1cE1lbnUpLnVuYmluZCgnY2xpY2snKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpc18xLm1lZXRpbmcubXV0ZU15VmlkZW8oIXZpZGVvTXV0ZWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy9oaWRlIHByaXZhdGUtY2hhdCBpdGVtXHJcbiAgICAgICAgJChwYW5lbCkuZmluZChcIi5cIiArIHRoaXMucHJpdmF0ZUNoYXRDbGFzcykuaGlkZSgpO1xyXG4gICAgICAgIC8vYWN0aXZlIHNwZWFrZXIoYmx1ZSBib3JkZXIpXHJcbiAgICAgICAgJChwYW5lbCkuYWRkQ2xhc3ModGhpcy5hY3RpdmVTcGVha2VyQ2xhc3MpO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuc2V0U2hvdG5hbWVWaXNpYmxlID0gZnVuY3Rpb24gKHNob3csIHZpZGVvRWxlbSkge1xyXG4gICAgICAgIHZhciBwYW5lbCA9IHRoaXMuX2dldFBhbmVsRnJvbVZpZGVvRWxlbWVudCh2aWRlb0VsZW0pO1xyXG4gICAgICAgIHZhciBzaG9ydE5hbWVQYW5lbCA9IHRoaXMuX2dldFNob3J0TmFtZUVsZW1lbnRGcm9tUGFuZWwocGFuZWwpO1xyXG4gICAgICAgIHNob3J0TmFtZVBhbmVsLnN0eWxlLmRpc3BsYXkgPSBzaG93ID8gXCJibG9ja1wiIDogXCJub25lXCI7XHJcbiAgICAgICAgdmlkZW9FbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBzaG93ID8gXCJoaWRkZW5cIiA6IFwidmlzaWJsZVwiO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuc2V0VXNlck5hbWUgPSBmdW5jdGlvbiAobmFtZSwgdmlkZW9FbGVtKSB7XHJcbiAgICAgICAgLy9uYW1lXHJcbiAgICAgICAgdmFyIHBhbmVsID0gdGhpcy5fZ2V0UGFuZWxGcm9tVmlkZW9FbGVtZW50KHZpZGVvRWxlbSk7XHJcbiAgICAgICAgdGhpcy5fZ2V0TmFtZUVsZW1lbnRGcm9tUGFuZWwocGFuZWwpLmlubmVySFRNTCA9IG5hbWU7XHJcbiAgICAgICAgLy9zaG9ydG5hbWVcclxuICAgICAgICB2YXIgc2hvcnROYW1lUGFuZWwgPSB0aGlzLl9nZXRTaG9ydE5hbWVFbGVtZW50RnJvbVBhbmVsKHBhbmVsKTtcclxuICAgICAgICAkKFwidGV4dFwiLCBzaG9ydE5hbWVQYW5lbCkuaHRtbChzbmlwcGV0XzEuYXZhdGFyTmFtZShuYW1lKSk7XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS51cGRhdGVUb29sYmFyID0gZnVuY3Rpb24gKG15SW5mbywgbG9jYWxUcmFja3MpIHtcclxuICAgICAgICB2YXIgYXVkaW9NdXRlZCA9IGZhbHNlLCB2aWRlb011dGVkID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIGhhc0F1ZGlvVHJhY2sgPSBmYWxzZSwgaGFzVmlkZW9UcmFjayA9IGZhbHNlO1xyXG4gICAgICAgIGxvY2FsVHJhY2tzLmZvckVhY2goZnVuY3Rpb24gKHRyYWNrKSB7XHJcbiAgICAgICAgICAgIGlmICh0cmFjay5nZXRUeXBlKCkgPT09IE1lZGlhVHlwZV8xLk1lZGlhVHlwZS5WSURFTykge1xyXG4gICAgICAgICAgICAgICAgaGFzVmlkZW9UcmFjayA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBpZiAodHJhY2suaXNNdXRlZCgpKVxyXG4gICAgICAgICAgICAgICAgICAgIHZpZGVvTXV0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRyYWNrLmdldFR5cGUoKSA9PT0gTWVkaWFUeXBlXzEuTWVkaWFUeXBlLkFVRElPKSB7XHJcbiAgICAgICAgICAgICAgICBoYXNBdWRpb1RyYWNrID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGlmICh0cmFjay5pc011dGVkKCkpXHJcbiAgICAgICAgICAgICAgICAgICAgYXVkaW9NdXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnRvb2xiYXJWaWRlb0J1dHRvbkVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IGhhc1ZpZGVvVHJhY2sgPyBcImlubGluZS1ibG9ja1wiIDogXCJub25lXCI7XHJcbiAgICAgICAgdGhpcy50b29sYmFyRGVza3RvcFNoYXJlQnV0dG9uRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gaGFzVmlkZW9UcmFjayA/IFwiaW5saW5lLWJsb2NrXCIgOiBcIm5vbmVcIjtcclxuICAgICAgICB0aGlzLnRvb2xiYXJBdWRpb0J1dHRvbkVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IGhhc0F1ZGlvVHJhY2sgPyBcImlubGluZS1ibG9ja1wiIDogXCJub25lXCI7XHJcbiAgICAgICAgaWYgKGF1ZGlvTXV0ZWQpIHtcclxuICAgICAgICAgICAgJCh0aGlzLnRvb2xiYXJBdWRpb0J1dHRvbkVsZW1lbnQpLmZpbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIHZlY3Rvcl9pY29uXzEuVmVjdG9ySWNvbi5BVURJT19NVVRFX0lDT04pO1xyXG4gICAgICAgICAgICAkKHRoaXMudG9vbGJhckF1ZGlvQnV0dG9uRWxlbWVudCkuYWRkQ2xhc3MoXCJtdXRlZFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICQodGhpcy50b29sYmFyQXVkaW9CdXR0b25FbGVtZW50KS5maW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCB2ZWN0b3JfaWNvbl8xLlZlY3Rvckljb24uQVVESU9fVU5NVVRFX0lDT04pO1xyXG4gICAgICAgICAgICAkKHRoaXMudG9vbGJhckF1ZGlvQnV0dG9uRWxlbWVudCkucmVtb3ZlQ2xhc3MoXCJtdXRlZFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZpZGVvTXV0ZWQpIHtcclxuICAgICAgICAgICAgJCh0aGlzLnRvb2xiYXJWaWRlb0J1dHRvbkVsZW1lbnQpLmZpbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIHZlY3Rvcl9pY29uXzEuVmVjdG9ySWNvbi5WSURFT19NVVRFX0lDT04pO1xyXG4gICAgICAgICAgICAkKHRoaXMudG9vbGJhclZpZGVvQnV0dG9uRWxlbWVudCkuYWRkQ2xhc3MoXCJtdXRlZFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICQodGhpcy50b29sYmFyVmlkZW9CdXR0b25FbGVtZW50KS5maW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCB2ZWN0b3JfaWNvbl8xLlZlY3Rvckljb24uVklERU9fVU5NVVRFX0lDT04pO1xyXG4gICAgICAgICAgICAkKHRoaXMudG9vbGJhclZpZGVvQnV0dG9uRWxlbWVudCkucmVtb3ZlQ2xhc3MoXCJtdXRlZFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5zZXRTY3JlZW5TaGFyZSA9IGZ1bmN0aW9uIChvbikge1xyXG4gICAgICAgIGlmIChvbikge1xyXG4gICAgICAgICAgICAkKFwiLnRvb2xib3gtaWNvblwiLCB0aGlzLnRvb2xiYXJEZXNrdG9wU2hhcmVCdXR0b25FbGVtZW50KS5hZGRDbGFzcyhcInRvZ2dsZWRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAkKFwiLnRvb2xib3gtaWNvblwiLCB0aGlzLnRvb2xiYXJEZXNrdG9wU2hhcmVCdXR0b25FbGVtZW50KS5yZW1vdmVDbGFzcyhcInRvZ2dsZWRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuc2V0UmVjb3JkaW5nID0gZnVuY3Rpb24gKG9uKSB7XHJcbiAgICAgICAgaWYgKG9uKSB7XHJcbiAgICAgICAgICAgICQoXCIudG9vbGJveC1pY29uXCIsIHRoaXMudG9vbGJhclJlY29yZEJ1dHRvbkVsZW1lbnQpLmFkZENsYXNzKFwidG9nZ2xlZFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICQoXCIudG9vbGJveC1pY29uXCIsIHRoaXMudG9vbGJhclJlY29yZEJ1dHRvbkVsZW1lbnQpLnJlbW92ZUNsYXNzKFwidG9nZ2xlZFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5zaG93TW9kZXJhdG9ySWNvbiA9IGZ1bmN0aW9uIChwYW5lbCwgc2hvdykge1xyXG4gICAgICAgIHRoaXMuX2dldE1vZGVyYXRvclN0YXJFbGVtZW50RnJvbVBhbmVsKHBhbmVsKS5zdHlsZS5kaXNwbGF5ID0gc2hvdyA/IFwiYmxvY2tcIiA6IFwibm9uZVwiO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuc2V0UGFuZWxTdGF0ZSA9IGZ1bmN0aW9uIChwYW5lbCwgc3RhdGUpIHtcclxuICAgICAgICBwYW5lbC5zZXRBdHRyaWJ1dGUoXCJ2aWRlby1zdGF0ZVwiLCBcIlwiICsgc3RhdGUpO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuZ2V0UGFuZWxTdGF0ZSA9IGZ1bmN0aW9uIChwYW5lbCkge1xyXG4gICAgICAgIHZhciB2aWRlb1N0YXRlID0gcGFuZWwuZ2V0QXR0cmlidXRlKFwidmlkZW8tc3RhdGVcIik7XHJcbiAgICAgICAgcmV0dXJuIHZpZGVvU3RhdGU7XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5yZWZyZXNoQ2FyZFZpZXdzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vbWFyZ2luXHJcbiAgICAgICAgdmFyIGd1dHRlciA9IDQwO1xyXG4gICAgICAgIHZhciB3aWR0aCA9ICQoXCIjY29udGVudFwiKS53aWR0aCgpIC0gZ3V0dGVyO1xyXG4gICAgICAgIHZhciBoZWlnaHQgPSAkKFwiI2NvbnRlbnRcIikuaGVpZ2h0KCkgLSBndXR0ZXI7XHJcbiAgICAgICAgLy9udW1iZXIgb2YgdmlkZW8gcGFuZWxzXHJcbiAgICAgICAgdmFyIHBhbmVsQ291bnQgPSAkKFwiLlwiICsgdGhpcy5wYW5lbENsYXNzKS5sZW5ndGg7XHJcbiAgICAgICAgLy9jaGF0dGluZyBkaWFsb2dcclxuICAgICAgICB2YXIgY2hhdHRpbmdXaWR0aCA9IDMxNTtcclxuICAgICAgICBpZiAoJChcIiN2aWRlby1wYW5lbFwiKS5oYXNDbGFzcyhcInNoaWZ0LXJpZ2h0XCIpKSB7XHJcbiAgICAgICAgICAgIHdpZHRoIC09IGNoYXR0aW5nV2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vd2lkdGgsIGhlaWdodCBvZiBlYWNoIHZpZGVvIHBhbmVsXHJcbiAgICAgICAgdmFyIHcsIGg7XHJcbiAgICAgICAgLy9pZiBmdWxsc2NyZWVuIG1vZGUsIGhpZGUgb3RoZXIgdmlkZW8gcGFuZWxzXHJcbiAgICAgICAgaWYgKCQoXCIuXCIgKyB0aGlzLnBhbmVsQ2xhc3MpLmhhc0NsYXNzKHRoaXMuZnVsbHNjcmVlbkNsYXNzKSkge1xyXG4gICAgICAgICAgICAkKFwiLlwiICsgdGhpcy5wYW5lbENsYXNzKS5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcclxuICAgICAgICAgICAgJChcIi5cIiArIHRoaXMuZnVsbHNjcmVlbkNsYXNzKS5jc3MoXCJkaXNwbGF5XCIsIFwiaW5saW5lLWJsb2NrXCIpLmNzcyhcImhlaWdodFwiLCBoZWlnaHQgKyBndXR0ZXIgLSA2KS5jc3MoXCJ3aWR0aFwiLCB3aWR0aCArIGd1dHRlcik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy9zaG93IGFsbCB2aWRlbyBwYW5lbHNcclxuICAgICAgICAkKFwiLlwiICsgdGhpcy5wYW5lbENsYXNzKS5jc3MoXCJkaXNwbGF5XCIsIFwiaW5saW5lLWJsb2NrXCIpO1xyXG4gICAgICAgIHZhciBjb2x1bW5Db3VudCA9IDE7XHJcbiAgICAgICAgdmFyIHJvd0NvdW50ID0gMTtcclxuICAgICAgICB2YXIgU00gPSA1NzY7XHJcbiAgICAgICAgdmFyIE1EID0gNzY4O1xyXG4gICAgICAgIHZhciBMRyA9IDk5MjtcclxuICAgICAgICB2YXIgWEwgPSAxMjAwO1xyXG4gICAgICAgIHZhciBYWEwgPSAxNDAwO1xyXG4gICAgICAgIGlmICh3aWR0aCA8IFNNKSB7XHJcbiAgICAgICAgICAgIGNvbHVtbkNvdW50ID0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAod2lkdGggPCBMRykge1xyXG4gICAgICAgICAgICBpZiAocGFuZWxDb3VudCA8PSAxKVxyXG4gICAgICAgICAgICAgICAgY29sdW1uQ291bnQgPSAxO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBjb2x1bW5Db3VudCA9IDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAocGFuZWxDb3VudCA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAod2lkdGggPCBYWEwpXHJcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uQ291bnQgPSAxO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbkNvdW50ID0gMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChwYW5lbENvdW50IDw9IDQpXHJcbiAgICAgICAgICAgICAgICBjb2x1bW5Db3VudCA9IDI7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHBhbmVsQ291bnQgPD0gOSlcclxuICAgICAgICAgICAgICAgIGNvbHVtbkNvdW50ID0gMztcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgY29sdW1uQ291bnQgPSA0O1xyXG4gICAgICAgIH1cclxuICAgICAgICByb3dDb3VudCA9IE1hdGguZmxvb3IoKHBhbmVsQ291bnQgLSAxKSAvIGNvbHVtbkNvdW50KSArIDE7XHJcbiAgICAgICAgaWYgKHdpZHRoIDwgNTc2KSB7XHJcbiAgICAgICAgICAgIHcgPSB3aWR0aDtcclxuICAgICAgICAgICAgaCA9IHcgKiA5IC8gMTY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBcclxuICAgICAgICAgICAgaWYgKHdpZHRoICogcm93Q291bnQgKiA5ID4gaGVpZ2h0ICogY29sdW1uQ291bnQgKiAxNikge1xyXG4gICAgICAgICAgICAgICAgaCA9IGhlaWdodCAvIHJvd0NvdW50O1xyXG4gICAgICAgICAgICAgICAgdyA9IGggKiAxNiAvIDk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB3ID0gd2lkdGggLyBjb2x1bW5Db3VudDtcclxuICAgICAgICAgICAgICAgIGggPSB3ICogOSAvIDE2O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoXCIuXCIgKyB0aGlzLnBhbmVsQ2xhc3MpXHJcbiAgICAgICAgICAgIC5jc3MoXCJ3aWR0aFwiLCB3KVxyXG4gICAgICAgICAgICAuY3NzKFwiaGVpZ2h0XCIsIGgpXHJcbiAgICAgICAgICAgIC5maW5kKFwiLmF2YXRhci1jb250YWluZXJcIilcclxuICAgICAgICAgICAgLmNzcyhcIndpZHRoXCIsIGggLyAyKVxyXG4gICAgICAgICAgICAuY3NzKFwiaGVpZ2h0XCIsIGggLyAyKTtcclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLmFkZE5ld1BhbmVsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBjb3VudCA9ICQoXCIuXCIgKyB0aGlzLnBhbmVsQ2xhc3MpLmxlbmd0aDtcclxuICAgICAgICBpZiAoY291bnQgPj0gdGhpcy5NQVhfUEFORUxTKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgdmFyIGlzU3BlYWsgPSBmYWxzZTtcclxuICAgICAgICB2YXIgaXNEaXNhYmxlQ2FtZXJhID0gdHJ1ZTtcclxuICAgICAgICB2YXIgYWN0aXZlU3BlYWtlciA9ICcnO1xyXG4gICAgICAgIGlmIChpc1NwZWFrKSB7XHJcbiAgICAgICAgICAgIGFjdGl2ZVNwZWFrZXIgPSBcImFjdGl2ZS1zcGVha2VyXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBhdmF0YXJWaXNpYmxlID0gJyc7XHJcbiAgICAgICAgdmFyIGNhbWVyYVN0YXR1cyA9ICcnO1xyXG4gICAgICAgICsrdGhpcy5uUGFuZWxJbnN0YW5jZUlkO1xyXG4gICAgICAgIHZhciB2aWRlb1RhZyA9IFwiPHZpZGVvIGF1dG9wbGF5IHBsYXlzaW5saW5lICBjbGFzcz0nXCIgKyB0aGlzLnZpZGVvRWxlbWVudENsYXNzICsgXCInIGlkPSdyZW1vdGVWaWRlb19cIiArIHRoaXMublBhbmVsSW5zdGFuY2VJZCArIFwiJz48L3ZpZGVvPlwiO1xyXG4gICAgICAgIHZhciBhdWRpb1RhZyA9IFwiPGF1ZGlvIGF1dG9wbGF5PVxcXCJcXFwiIGlkPVxcXCJyZW1vdGVBdWRpb19cIiArIHRoaXMublBhbmVsSW5zdGFuY2VJZCArIFwiXFxcIj48L2F1ZGlvPlwiO1xyXG4gICAgICAgIGlmIChpc0Rpc2FibGVDYW1lcmEpIHtcclxuICAgICAgICAgICAgYXZhdGFyVmlzaWJsZSA9ICd2aXNpYmxlJztcclxuICAgICAgICAgICAgY2FtZXJhU3RhdHVzID0gJzxkaXYgY2xhc3M9XCJpbmRpY2F0b3ItY29udGFpbmVyIHZpZGVvTXV0ZWRcIj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpbmRpY2F0b3ItaWNvbi1jb250YWluZXIgIHRvb2xiYXItaWNvblwiIGlkPVwiXCI+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJqaXRzaS1pY29uIFwiPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyBoZWlnaHQ9XCIxM1wiIGlkPVwiY2FtZXJhLWRpc2FibGVkXCIgd2lkdGg9XCIxM1wiIHZpZXdCb3g9XCIwIDAgMzIgMzJcIj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTQuMzc1IDIuNjg4TDI4IDI2LjMxM2wtMS42ODggMS42ODgtNC4yNS00LjI1Yy0uMTg4LjEyNS0uNS4yNS0uNzUuMjVoLTE2Yy0uNzUgMC0xLjMxMy0uNTYzLTEuMzEzLTEuMzEzVjkuMzEzYzAtLjc1LjU2My0xLjMxMyAxLjMxMy0xLjMxM2gxTDIuNjg3IDQuMzc1em0yMy42MjUgNnYxNC4yNUwxMy4wNjIgOGg4LjI1Yy43NSAwIDEuMzc1LjU2MyAxLjM3NSAxLjMxM3Y0LjY4OHpcIj48L3BhdGg+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBtaWNTdGF0dXMgPSAnPGRpdiBjbGFzcz1cImluZGljYXRvci1jb250YWluZXIgYXVkaW9NdXRlZFwiPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImluZGljYXRvci1pY29uLWNvbnRhaW5lciAgdG9vbGJhci1pY29uXCIgaWQ9XCJcIj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImppdHNpLWljb24gXCI+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGhlaWdodD1cIjEzXCIgaWQ9XCJtaWMtZGlzYWJsZWRcIiB3aWR0aD1cIjEzXCIgdmlld0JveD1cIjAgMCAzMiAzMlwiPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNNS42ODggNGwyMi4zMTMgMjIuMzEzLTEuNjg4IDEuNjg4LTUuNTYzLTUuNTYzYy0xIC42MjUtMi4yNSAxLTMuNDM4IDEuMTg4djQuMzc1aC0yLjYyNXYtNC4zNzVjLTQuMzc1LS42MjUtOC00LjM3NS04LTguOTM4aDIuMjVjMCA0IDMuMzc1IDYuNzUgNy4wNjMgNi43NSAxLjA2MyAwIDIuMTI1LS4yNSAzLjA2My0uNjg4bC0yLjE4OC0yLjE4OGMtLjI1LjA2My0uNTYzLjEyNS0uODc1LjEyNS0yLjE4OCAwLTQtMS44MTMtNC00di0xbC04LTh6TTIwIDE0Ljg3NWwtOC03LjkzOHYtLjI1YzAtMi4xODggMS44MTMtNCA0LTRzNCAxLjgxMyA0IDR2OC4xODh6bTUuMzEzLS4xODdhOC44MjQgOC44MjQgMCAwMS0xLjE4OCA0LjM3NUwyMi41IDE3LjM3NWMuMzc1LS44MTMuNTYzLTEuNjg4LjU2My0yLjY4OGgyLjI1elwiPjwvcGF0aD4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+JztcclxuICAgICAgICB2YXIgbW9kZXJhdG9yU3RhdHVzID0gJzxkaXYgY2xhc3M9XCJtb2RlcmF0b3ItaWNvbiByaWdodFwiPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpbmRpY2F0b3ItY29udGFpbmVyXCI+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImluZGljYXRvci1pY29uLWNvbnRhaW5lciBmb2N1c2luZGljYXRvciB0b29sYmFyLWljb25cIiBpZD1cIlwiPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJqaXRzaS1pY29uIFwiPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGhlaWdodD1cIjEzXCIgd2lkdGg9XCIxM1wiIHZpZXdCb3g9XCIwIDAgMzIgMzJcIj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMTYgMjAuNTYzbDUgMy0xLjMxMy01LjY4OEwyNC4xMjUgMTRsLTUuODc1LS41TDE2IDguMTI1IDEzLjc1IDEzLjVsLTUuODc1LjUgNC40MzggMy44NzVMMTEgMjMuNTYzem0xMy4zMTMtOC4yNWwtNy4yNSA2LjMxMyAyLjE4OCA5LjM3NS04LjI1LTUtOC4yNSA1IDIuMTg4LTkuMzc1LTcuMjUtNi4zMTMgOS41NjMtLjgxMyAzLjc1LTguODEzIDMuNzUgOC44MTN6XCI+PC9wYXRoPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4nO1xyXG4gICAgICAgIHZhciBwYW5lbEh0bWwgPSBcIlxcbiAgICAgICAgPHNwYW4gY2xhc3M9XFxcIlwiICsgdGhpcy5wYW5lbENsYXNzICsgXCIgZGlzcGxheS12aWRlbyBcIiArIGFjdGl2ZVNwZWFrZXIgKyBcIlxcXCI+XFxuICAgICAgICAgICAgXCIgKyB2aWRlb1RhZyArIFwiIFxcbiAgICAgICAgICAgIFwiICsgYXVkaW9UYWcgKyBcIlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInZpZGVvY29udGFpbmVyX190b29sYmFyXFxcIj5cXG4gICAgICAgICAgICAgICAgPGRpdj4gXCIgKyBjYW1lcmFTdGF0dXMgKyBcIiBcIiArIG1pY1N0YXR1cyArIFwiIFwiICsgbW9kZXJhdG9yU3RhdHVzICsgXCI8L2Rpdj5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ2aWRlb2NvbnRhaW5lcl9faG92ZXJPdmVybGF5XFxcIj48L2Rpdj5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJkaXNwbGF5TmFtZUNvbnRhaW5lclxcXCI+PHNwYW4gY2xhc3M9XFxcImRpc3BsYXluYW1lXFxcIiBpZD1cXFwibG9jYWxEaXNwbGF5TmFtZVxcXCI+TmFtZTwvc3Bhbj48L2Rpdj5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJhdmF0YXItY29udGFpbmVyIFwiICsgYXZhdGFyVmlzaWJsZSArIFwiXFxcIiBzdHlsZT1cXFwiaGVpZ2h0OiAxMDUuNXB4OyB3aWR0aDogMTA1LjVweDtcXFwiPlxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJhdmF0YXIgIHVzZXJBdmF0YXJcXFwiIHN0eWxlPVxcXCJiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIzNCwgMjU1LCAxMjgsIDAuNCk7IGZvbnQtc2l6ZTogMTgwJTsgaGVpZ2h0OiAxMDAlOyB3aWR0aDogMTAwJTtcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgPHN2ZyBjbGFzcz1cXFwiYXZhdGFyLXN2Z1xcXCIgdmlld0JveD1cXFwiMCAwIDEwMCAxMDBcXFwiIHhtbG5zPVxcXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1xcXCIgeG1sbnM6eGxpbms9XFxcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZXh0IGRvbWluYW50LWJhc2VsaW5lPVxcXCJjZW50cmFsXFxcIiBmaWxsPVxcXCJyZ2JhKDI1NSwyNTUsMjU1LC42KVxcXCIgZm9udC1zaXplPVxcXCI0MHB0XFxcIiB0ZXh0LWFuY2hvcj1cXFwibWlkZGxlXFxcIiB4PVxcXCI1MFxcXCIgeT1cXFwiNTBcXFwiPk5hbWU8L3RleHQ+XFxuICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgPC9kaXYgPlxcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJcIiArIHRoaXMucG9wdXBNZW51QnV0dG9uQ2xhc3MgKyBcIlxcXCI+XFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcIlxcXCIgaWQ9XFxcIlxcXCI+XFxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwicG9wb3Zlci10cmlnZ2VyIHJlbW90ZS12aWRlby1tZW51LXRyaWdnZXJcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImppdHNpLWljb25cXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGhlaWdodD1cXFwiMWVtXFxcIiB3aWR0aD1cXFwiMWVtXFxcIiB2aWV3Qm94PVxcXCIwIDAgMjQgMjRcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cXFwiTTEyIDE1Ljk4NGMxLjA3OCAwIDIuMDE2LjkzOCAyLjAxNiAyLjAxNnMtLjkzOCAyLjAxNi0yLjAxNiAyLjAxNlM5Ljk4NCAxOS4wNzggOS45ODQgMThzLjkzOC0yLjAxNiAyLjAxNi0yLjAxNnptMC02YzEuMDc4IDAgMi4wMTYuOTM4IDIuMDE2IDIuMDE2cy0uOTM4IDIuMDE2LTIuMDE2IDIuMDE2UzkuOTg0IDEzLjA3OCA5Ljk4NCAxMiAxMC45MjIgOS45ODQgMTIgOS45ODR6bTAtMS45NjhjLTEuMDc4IDAtMi4wMTYtLjkzOC0yLjAxNi0yLjAxNlMxMC45MjIgMy45ODQgMTIgMy45ODRzMi4wMTYuOTM4IDIuMDE2IDIuMDE2UzEzLjA3OCA4LjAxNiAxMiA4LjAxNnpcXFwiPjwvcGF0aD4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiXCIgKyB0aGlzLnBvcHVwTWVudUNsYXNzICsgXCJcXFwiIHRhYkluZGV4PS0xIHN0eWxlPVxcXCJwb3NpdGlvbjogcmVsYXRpdmU7IHJpZ2h0OiAxNjhweDsgIHRvcDogMjVweDsgd2lkdGg6IDE3NXB4O1xcXCI+XFxuICAgICAgICAgICAgICAgICAgICA8dWwgYXJpYS1sYWJlbD1cXFwiTW9yZSBhY3Rpb25zIG1lbnVcXFwiIGNsYXNzPVxcXCJvdmVyZmxvdy1tZW51XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGkgYXJpYS1sYWJlbD1cXFwiR3JhbnQgTW9kZXJhdG9yXFxcIiBjbGFzcz1cXFwib3ZlcmZsb3ctbWVudS1pdGVtIGdyYW50LW1vZGVyYXRvclxcXCIgdGFiaW5kZXg9XFxcIjBcXFwiIHJvbGU9XFxcImJ1dHRvblxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJvdmVyZmxvdy1tZW51LWl0ZW0taWNvblxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJqaXRzaS1pY29uIFxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyBoZWlnaHQ9XFxcIjIyXFxcIiB3aWR0aD1cXFwiMjJcXFwiIHZpZXdCb3g9XFxcIjAgMCAyNCAyNFxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGwtcnVsZT1cXFwiZXZlbm9kZFxcXCIgY2xpcC1ydWxlPVxcXCJldmVub2RkXFxcIiBkPVxcXCJNMTQgNGEyIDIgMCAwMS0xLjI5OCAxLjg3M2wxLjUyNyA0LjA3LjcxNiAxLjkxMmMuMDYyLjA3NC4xMjYuMDc0LjE2NS4wMzVsMS40NDQtMS40NDQgMi4wMzItMi4wMzJhMiAyIDAgMTExLjI0OC41NzlMMTkgMTlhMiAyIDAgMDEtMiAySDdhMiAyIDAgMDEtMi0yTDQuMTY2IDguOTkzYTIgMiAwIDExMS4yNDgtLjU3OWwyLjAzMyAyLjAzM0w4Ljg5IDExLjg5Yy4wODcuMDQyLjE0NS4wMTYuMTY1LS4wMzVsLjcxNi0xLjkxMiAxLjUyNy00LjA3QTIgMiAwIDExMTQgNHpNNi44NCAxN2wtLjM5My00LjcyNSAxLjAyOSAxLjAzYTIuMSAyLjEgMCAwMDMuNDUxLS43NDhMMTIgOS42OTZsMS4wNzMgMi44NmEyLjEgMi4xIDAgMDAzLjQ1MS43NDhsMS4wMy0xLjAzTDE3LjE2IDE3SDYuODR6XFxcIj48L3BhdGg+ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImxhYmVsXFxcIj5HcmFudCBNb2RlcmF0b3I8L3NwYW4+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGkgYXJpYS1sYWJlbD1cXFwiTXV0ZVxcXCIgY2xhc3M9XFxcIm92ZXJmbG93LW1lbnUtaXRlbSBhdWRpby1tdXRlXFxcIiB0YWJpbmRleD1cXFwiMFxcXCIgcm9sZT1cXFwiYnV0dG9uXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcIm92ZXJmbG93LW1lbnUtaXRlbS1pY29uXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImppdHNpLWljb24gXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGZpbGw9XFxcIm5vbmVcXFwiIGhlaWdodD1cXFwiMjJcXFwiIHdpZHRoPVxcXCIyMlxcXCIgdmlld0JveD1cXFwiMCAwIDIyIDIyXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbC1ydWxlPVxcXCJldmVub2RkXFxcIiBjbGlwLXJ1bGU9XFxcImV2ZW5vZGRcXFwiIGQ9XFxcIk03LjMzMyA4LjY1VjExYTMuNjY4IDMuNjY4IDAgMDAyLjc1NyAzLjU1My45MjguOTI4IDAgMDAtLjAwNy4xMTR2MS43NTdBNS41MDEgNS41MDEgMCAwMTUuNSAxMWEuOTE3LjkxNyAwIDEwLTEuODMzIDBjMCAzLjc0IDIuNzk5IDYuODI2IDYuNDE2IDcuMjc3di45NzNhLjkxNy45MTcgMCAwMDEuODM0IDB2LS45NzNhNy4yOTcgNy4yOTcgMCAwMDMuNTY4LTEuNDc1bDMuMDkxIDMuMDkyYS45MzIuOTMyIDAgMTAxLjMxOC0xLjMxOGwtMy4wOTEtMy4wOTEuMDEtLjAxMy0xLjMxMS0xLjMxMS0uMDEuMDEzLTEuMzI1LTEuMzI1LjAwOC0uMDE0LTEuMzk1LTEuMzk1YTEuMjQgMS4yNCAwIDAxLS4wMDQuMDE4bC0zLjYxLTMuNjA5di0uMDIzTDcuMzM0IDUuOTkzdi4wMjNsLTMuOTA5LTMuOTFhLjkzMi45MzIgMCAxMC0xLjMxOCAxLjMxOEw3LjMzMyA4LjY1em0xLjgzNCAxLjgzNFYxMWExLjgzMyAxLjgzMyAwIDAwMi4yOTEgMS43NzZsLTIuMjkxLTIuMjkyem0zLjY4MiAzLjY4M2MtLjI5LjE3LS42MDYuMy0uOTQuMzg2YS45MjguOTI4IDAgMDEuMDA4LjExNHYxLjc1N2E1LjQ3IDUuNDcgMCAwMDIuMjU3LS45MzJsLTEuMzI1LTEuMzI1em0xLjgxOC0zLjQ3NmwtMS44MzQtMS44MzRWNS41YTEuODMzIDEuODMzIDAgMDAtMy42NDQtLjI4N2wtMS40My0xLjQzQTMuNjY2IDMuNjY2IDAgMDExNC42NjcgNS41djUuMTl6bTEuNjY1IDEuNjY1bDEuNDQ3IDEuNDQ3Yy4zNTctLjg2NC41NTQtMS44MS41NTQtMi44MDNhLjkxNy45MTcgMCAxMC0xLjgzMyAwYzAgLjQ2OC0uMDU4LjkyMi0uMTY4IDEuMzU2elxcXCI+PC9wYXRoPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJsYWJlbFxcXCI+TXV0ZTwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBhcmlhLWxhYmVsPVxcXCJEaXNhYmxlIGNhbWVyYVxcXCIgY2xhc3M9XFxcIm92ZXJmbG93LW1lbnUtaXRlbSB2aWRlby1tdXRlXFxcIiB0YWJpbmRleD1cXFwiMFxcXCIgcm9sZT1cXFwiYnV0dG9uXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcIm92ZXJmbG93LW1lbnUtaXRlbS1pY29uXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImppdHNpLWljb25cXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgZmlsbD1cXFwibm9uZVxcXCIgaGVpZ2h0PVxcXCIyMlxcXCIgd2lkdGg9XFxcIjIyXFxcIiB2aWV3Qm94PVxcXCIwIDAgMjIgMjJcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBjbGlwLXJ1bGU9XFxcImV2ZW5vZGRcXFwiIGQ9XFxcIk02Ljg0IDUuNWgtLjAyMkwzLjQyNCAyLjEwNmEuOTMyLjkzMiAwIDEwLTEuMzE4IDEuMzE4TDQuMTgyIDUuNWgtLjUxNWMtMS4wMTMgMC0xLjgzNC44Mi0xLjgzNCAxLjgzM3Y3LjMzNGMwIDEuMDEyLjgyMSAxLjgzMyAxLjgzNCAxLjgzM0gxMy43NWMuNDA0IDAgLjc3Ny0uMTMgMS4wOC0uMzUybDMuNzQ2IDMuNzQ2YS45MzIuOTMyIDAgMTAxLjMxOC0xLjMxOGwtNC4zMS00LjMxdi0uMDI0TDEzLjc1IDEyLjQxdi4wMjNsLTUuMS01LjA5OWguMDI0TDYuODQxIDUuNXptNi45MSA0LjI3NFY3LjMzM2gtMi40NEw5LjQ3NSA1LjVoNC4yNzRjMS4wMTIgMCAxLjgzMy44MiAxLjgzMyAxLjgzM3YuNzg2bDMuMjEyLTEuODM1YS45MTcuOTE3IDAgMDExLjM3Mi43OTZ2Ny44NGMwIC4zNDQtLjE5LjY0NC0uNDcuOGwtMy43MzYtMy43MzUgMi4zNzIgMS4zNTZWOC42NTlsLTIuNzUgMS41NzF2MS4zNzdMMTMuNzUgOS43NzR6TTMuNjY3IDcuMzM0aDIuMzQ5bDcuMzMzIDcuMzMzSDMuNjY3VjcuMzMzelxcXCI+PC9wYXRoPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJsYWJlbFxcXCI+RGlzYWJsZSBjYW1lcmE8L3NwYW4+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGkgYXJpYS1sYWJlbD1cXFwiVG9nZ2xlIGZ1bGwgc2NyZWVuXFxcIiBjbGFzcz1cXFwib3ZlcmZsb3ctbWVudS1pdGVtIGZ1bGxzY3JlZW5cXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwib3ZlcmZsb3ctbWVudS1pdGVtLWljb25cXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiaml0c2ktaWNvbiBcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgZmlsbD1cXFwibm9uZVxcXCIgaGVpZ2h0PVxcXCIyMlxcXCIgd2lkdGg9XFxcIjIyXFxcIiB2aWV3Qm94PVxcXCIwIDAgMjIgMjJcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBjbGlwLXJ1bGU9XFxcImV2ZW5vZGRcXFwiIGQ9XFxcIk04LjI1IDIuNzVIMy42NjdhLjkxNy45MTcgMCAwMC0uOTE3LjkxN1Y4LjI1aDEuODMzVjQuNTgzSDguMjVWMi43NXptNS41IDEuODMzVjIuNzVoNC41ODNjLjUwNyAwIC45MTcuNDEuOTE3LjkxN1Y4LjI1aC0xLjgzM1Y0LjU4M0gxMy43NXptMCAxMi44MzRoMy42NjdWMTMuNzVoMS44MzN2NC41ODNjMCAuNTA3LS40MS45MTctLjkxNy45MTdIMTMuNzV2LTEuODMzek00LjU4MyAxMy43NXYzLjY2N0g4LjI1djEuODMzSDMuNjY3YS45MTcuOTE3IDAgMDEtLjkxNy0uOTE3VjEzLjc1aDEuODMzelxcXCI+PC9wYXRoPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJsYWJlbCBvdmVyZmxvdy1tZW51LWl0ZW0tdGV4dFxcXCI+VmlldyBmdWxsIHNjcmVlbjwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBhcmlhLWxhYmVsPVxcXCJQcml2YXRlIENoYXRcXFwiIGNsYXNzPVxcXCJvdmVyZmxvdy1tZW51LWl0ZW0gcHJpdmF0ZS1jaGF0XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcIm92ZXJmbG93LW1lbnUtaXRlbS1pY29uXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImppdHNpLWljb24gXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGZpbGw9XFxcIm5vbmVcXFwiIGhlaWdodD1cXFwiMjJcXFwiIHdpZHRoPVxcXCIyMlxcXCIgdmlld0JveD1cXFwiMCAwIDIyIDIyXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggY2xpcC1ydWxlPVxcXCJldmVub2RkXFxcIiBkPVxcXCJNMTksOEgxOFY1YTMsMywwLDAsMC0zLTNINUEzLDMsMCwwLDAsMiw1VjE3YTEsMSwwLDAsMCwuNjIuOTJBLjg0Ljg0LDAsMCwwLDMsMThhMSwxLDAsMCwwLC43MS0uMjlsMi44MS0yLjgySDh2MS40NGEzLDMsMCwwLDAsMywzaDYuOTJsMi4zNywyLjM4QTEsMSwwLDAsMCwyMSwyMmEuODQuODQsMCwwLDAsLjM4LS4wOEExLDEsMCwwLDAsMjIsMjFWMTFBMywzLDAsMCwwLDE5LDhaTTgsMTF2MS44OUg2LjExYTEsMSwwLDAsMC0uNzEuMjlMNCwxNC41OVY1QTEsMSwwLDAsMSw1LDRIMTVhMSwxLDAsMCwxLDEsMVY4SDExQTMsMywwLDAsMCw4LDExWm0xMiw3LjU5LTEtMWExLDEsMCwwLDAtLjcxLS4zSDExYTEsMSwwLDAsMS0xLTFWMTFhMSwxLDAsMCwxLDEtMWg4YTEsMSwwLDAsMSwxLDFaXFxcIj48L3BhdGg+ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImxhYmVsIG92ZXJmbG93LW1lbnUtaXRlbS10ZXh0XFxcIj5Qcml2YXRlIGNoYXQ8L3NwYW4+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cXG4gICAgICAgICAgICAgICAgICAgIDwvdWw+XFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgIDwvc3Bhbj5cXG4gICAgICAgIDwvc3BhbiA+XCI7XHJcbiAgICAgICAgdmFyIHBhbmVsID0gJChwYW5lbEh0bWwpO1xyXG4gICAgICAgICQoXCIjXCIgKyB0aGlzLnBhbmVsQ29udGFpbmVySWQpLmFwcGVuZChwYW5lbFswXSk7XHJcbiAgICAgICAgdGhpcy5yZWZyZXNoQ2FyZFZpZXdzKCk7XHJcbiAgICAgICAgcmV0dXJuIHBhbmVsWzBdO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUudXBkYXRlVGltZSA9IGZ1bmN0aW9uICh0aW1lTGFiZWwpIHtcclxuICAgICAgICB0aGlzLnRpbWVzdGFtcEVsZW1lbnQuaW5uZXJIVE1MID0gdGltZUxhYmVsO1xyXG4gICAgICAgIGlmICghdGhpcy5pbml0VG9wSW5mbykge1xyXG4gICAgICAgICAgICB0aGlzLmluaXRUb3BJbmZvID0gdHJ1ZTtcclxuICAgICAgICAgICAgJCh0aGlzLnRvcEluZm9iYXJFbGVtZW50KS5hZGRDbGFzcyhcInZpc2libGVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuc2hvd01lZXRpbmdTdWJqZWN0ID0gZnVuY3Rpb24gKHN1YmplY3QsIGhvc3ROYW1lKSB7XHJcbiAgICAgICAgaWYgKHN1YmplY3QgJiYgc3ViamVjdC50cmltKCkubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB2YXIgc3ViamVjdExhYmVsID0gc3ViamVjdC50cmltKCk7XHJcbiAgICAgICAgICAgIGlmIChob3N0TmFtZSAmJiBob3N0TmFtZS50cmltKCkubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgICAgIHN1YmplY3RMYWJlbCArPSBcIihcIiArIGhvc3ROYW1lLnRyaW0oKSArIFwiKVwiO1xyXG4gICAgICAgICAgICB0aGlzLnN1YmplY3RFbGVtZW50LmlubmVySFRNTCA9IHN1YmplY3RMYWJlbDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5zaG93U2V0dGluZ0RpYWxvZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc2V0dGluZ0RpYWxvZyA9IG5ldyBTZXR0aW5nRGlhbG9nXzEuU2V0dGluZ0RpYWxvZygpO1xyXG4gICAgICAgIHZhciBwcm9wcyA9IG5ldyBTZXR0aW5nRGlhbG9nXzEuU2V0dGluZ0RpYWxvZ1Byb3BzKCk7XHJcbiAgICAgICAgcHJvcHMuY3VyRGV2aWNlcyA9IHRoaXMubWVldGluZy5nZXRBY3RpdmVEZXZpY2VzKCk7XHJcbiAgICAgICAgcHJvcHMub25EZXZpY2VDaGFuZ2UgPSB0aGlzLm1lZXRpbmcub25EZXZpY2VDaGFuZ2UuYmluZCh0aGlzLm1lZXRpbmcpO1xyXG4gICAgICAgIHNldHRpbmdEaWFsb2cuaW5pdChwcm9wcyk7XHJcbiAgICAgICAgc2V0dGluZ0RpYWxvZy5zaG93KCk7XHJcbiAgICB9O1xyXG4gICAgLy9hZGQsIHJlbW92ZSBwYXJ0aWNpcGFudCB0byBhbmQgZnJvbSBsaXN0XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLmFkZFBhcnRpY2lwYW50ID0gZnVuY3Rpb24gKGppdHNpSWQsIG5hbWUsIG1lLCB1c2VDYW1lcmEsIHVzZU1pYykge1xyXG4gICAgICAgIHRoaXMucGFydGljaXBhbnRzTGlzdFBhbmVsLmFkZFBhcnRpY2lwYW50KGppdHNpSWQsIG5hbWUsIG1lLCB1c2VDYW1lcmEsIHVzZU1pYyk7XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5yZW1vdmVQYXJ0aWNpcGFudCA9IGZ1bmN0aW9uIChqaXRzaUlkKSB7XHJcbiAgICAgICAgdGhpcy5wYXJ0aWNpcGFudHNMaXN0UGFuZWwucmVtb3ZlUGFydGljaXBhbnQoaml0c2lJZCk7XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5zaG93UGFydGljaXBhbnRMaXN0QnV0dG9uID0gZnVuY3Rpb24gKHNob3cpIHtcclxuICAgICAgICAkKFwiI29wZW4tcGFydGljaXBhbnRzLXRvZ2dsZVwiKS5jc3MoXCJ2aXNpYmlsaXR5XCIsIHNob3cgPyBcInZpc2libGVcIiA6IFwiaGlkZGVuXCIpO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuTG9nID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcclxuICAgICAgICBpZiAoJChcIiNsb2dQYW5lbFwiKS5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICB2YXIgbG9nUGFuZWwgPSBcIjxkaXYgaWQ9XFxcImxvZ1BhbmVsXFxcIiBzdHlsZT1cXFwicG9zaXRpb246IGZpeGVkO3dpZHRoOiAzMDBweDtoZWlnaHQ6IDIwMHB4O2JhY2tncm91bmQ6IGJsYWNrO3RvcDowcHg7bGVmdDogMHB4O1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgei1pbmRleDogMTAwMDAwO2JvcmRlci1yaWdodDogMXB4IGRhc2hlZCByZWJlY2NhcHVycGxlO2JvcmRlci1ib3R0b206IDFweCBkYXNoZWQgcmViZWNjYXB1cnBsZTtvdmVyZmxvdy15OmF1dG87XFxcIj48L2Rpdj5cIjtcclxuICAgICAgICAgICAgJChcImJvZHlcIikuYXBwZW5kKGxvZ1BhbmVsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGNvbG9ycyA9IFsnYmxhbmNoZWRhbG1vbmQnLCAnaG90cGluaycsICdjaGFydHJldXNlJywgJ2NvcmFsJywgJ2dvbGQnLCAnZ3JlZW55ZWxsb3cnLCAndmlvbGV0JywgJ3doZWF0J107XHJcbiAgICAgICAgdmFyIGNvbG9yID0gY29sb3JzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCkgJSBjb2xvcnMubGVuZ3RoXTtcclxuICAgICAgICB2YXIgbWVzc2FnZUl0bSA9IFwiPGRpdiBzdHlsZT1cXFwiY29sb3I6XCIgKyBjb2xvciArIFwiO1xcXCI+PHNwYW4+XCIgKyBtZXNzYWdlICsgXCI8L3NwYW4+PC9kaXY+XCI7XHJcbiAgICAgICAgJChcIiNsb2dQYW5lbFwiKS5hcHBlbmQobWVzc2FnZUl0bSk7XHJcbiAgICAgICAgJCgnI2xvZ1BhbmVsJykuc2Nyb2xsKCk7XHJcbiAgICAgICAgJChcIiNsb2dQYW5lbFwiKS5hbmltYXRlKHtcclxuICAgICAgICAgICAgc2Nyb2xsVG9wOiAyMDAwMFxyXG4gICAgICAgIH0sIDIwMCk7XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5hc2tEaWFsb2cgPSBmdW5jdGlvbiAodGl0bGUsIG1lc3NhZ2UsIGljb24sIGFsbG93Q2FsbGJhY2ssIGRlbnlDYWxsYmFjaywgcGFyYW0pIHtcclxuICAgICAgICB2YXIgcHJvcHMgPSBuZXcgQXNrRGlhbG9nXzEuQXNrRGlhbG9nUHJvcHMoKTtcclxuICAgICAgICBwcm9wcy50aXRsZSA9IHRpdGxlO1xyXG4gICAgICAgIHByb3BzLm1lc3NhZ2UgPSBtZXNzYWdlO1xyXG4gICAgICAgIHByb3BzLmljb24gPSBpY29uO1xyXG4gICAgICAgIHByb3BzLmlzV2FybmluZyA9IHRydWU7XHJcbiAgICAgICAgcHJvcHMuYWxsb3dDYWxsYmFjayA9IGFsbG93Q2FsbGJhY2s7XHJcbiAgICAgICAgcHJvcHMuZGVueUNhbGxiYWNrID0gZGVueUNhbGxiYWNrO1xyXG4gICAgICAgIHByb3BzLnBhcmFtID0gcGFyYW07XHJcbiAgICAgICAgdmFyIGRsZyA9IG5ldyBBc2tEaWFsb2dfMS5Bc2tEaWFsb2cocHJvcHMpO1xyXG4gICAgICAgIGRsZy5zaG93KCk7XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5ub3RpZmljYXRpb24gPSBmdW5jdGlvbiAodGl0bGUsIG1lc3NhZ2UsIGljb24pIHtcclxuICAgICAgICBpZiAoIWljb24pXHJcbiAgICAgICAgICAgIGljb24gPSBOb3RpZmljYXRpb25UeXBlXzEuTm90aWZpY2F0aW9uVHlwZS5JbmZvO1xyXG4gICAgICAgICQudG9hc3Qoe1xyXG4gICAgICAgICAgICBoZWFkaW5nOiB0aXRsZSxcclxuICAgICAgICAgICAgdGV4dDogbWVzc2FnZSxcclxuICAgICAgICAgICAgc2hvd0hpZGVUcmFuc2l0aW9uOiAnc2xpZGUnLFxyXG4gICAgICAgICAgICBoaWRlQWZ0ZXI6IGZhbHNlLFxyXG4gICAgICAgICAgICBiZ0NvbG9yOiBcIiMxNjQxNTdcIixcclxuICAgICAgICAgICAgaWNvbjogaWNvbixcclxuICAgICAgICAgICAgc3RhY2s6IDUsXHJcbiAgICAgICAgICAgIGxvYWRlcjogZmFsc2UsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5ub3RpZmljYXRpb25fd2FybmluZyA9IGZ1bmN0aW9uICh0aXRsZSwgbWVzc2FnZSwgaWNvbikge1xyXG4gICAgICAgIGlmICghaWNvbilcclxuICAgICAgICAgICAgaWNvbiA9IE5vdGlmaWNhdGlvblR5cGVfMS5Ob3RpZmljYXRpb25UeXBlLldhcm5pbmc7XHJcbiAgICAgICAgJC50b2FzdCh7XHJcbiAgICAgICAgICAgIGhlYWRpbmc6IHRpdGxlLFxyXG4gICAgICAgICAgICB0ZXh0OiBtZXNzYWdlLFxyXG4gICAgICAgICAgICBzaG93SGlkZVRyYW5zaXRpb246ICdzbGlkZScsXHJcbiAgICAgICAgICAgIGhpZGVBZnRlcjogNzAwMCxcclxuICAgICAgICAgICAgYmdDb2xvcjogXCIjODAwMDAwXCIsXHJcbiAgICAgICAgICAgIGljb246IGljb24sXHJcbiAgICAgICAgICAgIHN0YWNrOiA1LFxyXG4gICAgICAgICAgICBsb2FkZXI6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIE1lZXRpbmdVSTtcclxufSgpKTtcclxuZXhwb3J0cy5NZWV0aW5nVUkgPSBNZWV0aW5nVUk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1lZXRpbmdfdWkuanMubWFwXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2Zha2VfNjZhZjg0ZjcuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLkFjdGl2ZURldmljZXMgPSB2b2lkIDA7XHJcbnZhciBBY3RpdmVEZXZpY2VzID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gQWN0aXZlRGV2aWNlcygpIHtcclxuICAgIH1cclxuICAgIHJldHVybiBBY3RpdmVEZXZpY2VzO1xyXG59KCkpO1xyXG5leHBvcnRzLkFjdGl2ZURldmljZXMgPSBBY3RpdmVEZXZpY2VzO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1BY3RpdmVEZXZpY2VzLmpzLm1hcFxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9tb2RlbFxcXFxBY3RpdmVEZXZpY2VzLmpzXCIsXCIvbW9kZWxcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLnJhbmRvbU51bWJlciA9IHZvaWQgMDtcclxuZnVuY3Rpb24gcmFuZG9tTnVtYmVyKCkge1xyXG4gICAgcmV0dXJuIHJhbmRvbUZyb21JbnRlcnZhbCgxLCAxMDAwMDAwMDApO1xyXG59XHJcbmV4cG9ydHMucmFuZG9tTnVtYmVyID0gcmFuZG9tTnVtYmVyO1xyXG5mdW5jdGlvbiByYW5kb21Gcm9tSW50ZXJ2YWwoZnJvbSwgdG8pIHtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAodG8gLSBmcm9tICsgMSkgKyBmcm9tKTtcclxufVxyXG4vKmludGVyZmFjZSBQcm92aWRlRmVlZGJhY2tGb3JtUHJvcHMge1xyXG4gICAgZmVlZGJhY2tOYXR1cmU6IEZvcm1pa0Ryb3Bkb3duUHJvcHNcclxuICAgIHdheWJpbGxOdW1iZXI6IEZvcm1pa0Ryb3Bkb3duUHJvcHNcclxuICAgIHByb3ZpZGVGZWVkYmFjazogRm9ybWlrRHJvcGRvd25Qcm9wc1xyXG4gICAgZWRpdG9yU3RhdGU/OiBzdHJpbmdcclxuICAgIGF0dGFjaG1lbnRzPzogc3RyaW5nW11cclxufVxyXG5cclxuXHJcbmludGVyZmFjZSBGb3JtaWtEcm9wZG93blByb3BzIHtcclxuICAgIGlkOiBudW1iZXJcclxuICAgIHZhbHVlOiBzdHJpbmdcclxufVxyXG5cclxuY29uc3QgdmFsdWVzOiBQcm92aWRlRmVlZGJhY2tGb3JtUHJvcHMgPSB7fTtcclxuY29uc3QgY3VzdG9tRmllbGRzOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuZm9yIChjb25zdCBwcm9wZXJ0eSBpbiB2YWx1ZXMpIHtcclxuICAgIGNvbnN0IGN1c3RvbUZpZWxkID0gdmFsdWVzW3Byb3BlcnR5IGFzIGtleW9mIFByb3ZpZGVGZWVkYmFja0Zvcm1Qcm9wc11cclxuICAgIGN1c3RvbUZpZWxkcy5wdXNoKGN1c3RvbUZpZWxkKVxyXG59Ki8gXHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJhbmRvbS5qcy5tYXBcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvdXRpbFxcXFxyYW5kb20uanNcIixcIi91dGlsXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5yYW5kb20gPSBleHBvcnRzLmF2YXRhck5hbWUgPSBleHBvcnRzLnN0cmlwSFRNTFRhZ3MgPSB2b2lkIDA7XHJcbmZ1bmN0aW9uIHN0cmlwSFRNTFRhZ3ModGV4dCkge1xyXG4gICAgcmV0dXJuIHRleHQucmVwbGFjZSgvKDwoW14+XSspPikvZ2ksIFwiXCIpO1xyXG59XHJcbmV4cG9ydHMuc3RyaXBIVE1MVGFncyA9IHN0cmlwSFRNTFRhZ3M7XHJcbi8qXHJcbiBhamF4IGV4YW1wbGVcclxuICQuYWpheCh7XHJcbiAgICAgICAgdXJsOiBcImh0dHA6Ly9sb2NhbGhvc3QvbXlwcm9qZWN0L2FqYXhfdXJsXCIsXHJcbiAgICAgICAgdHlwZTogXCJQT1NUXCIsXHJcbiAgICAgICAgZGF0YTogJChcIiNteS1mb3JtXCIpLnNlcmlhbGl6ZSgpLFxyXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbicsIC8vIGxvd2VyY2FzZSBpcyBhbHdheXMgcHJlZmVyZXJlZCB0aG91Z2ggalF1ZXJ5IGRvZXMgaXQsIHRvby5cclxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbigpe31cclxufSk7XHJcbiBcclxuIFxyXG4gKi9cclxuZnVuY3Rpb24gYXZhdGFyTmFtZShuYW1lKSB7XHJcbiAgICB2YXIgdW5rbm93biA9IFwiP1wiO1xyXG4gICAgaWYgKCFuYW1lIHx8IG5hbWUubGVuZ3RoIDw9IDApXHJcbiAgICAgICAgcmV0dXJuIHVua25vd247XHJcbiAgICB2YXIgbmFtZVBhcnRzID0gbmFtZS5zcGxpdChcIiBcIik7XHJcbiAgICB2YXIgcmVzID0gXCJcIjtcclxuICAgIG5hbWVQYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwKSB7XHJcbiAgICAgICAgaWYgKHAubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgcmVzICs9IHBbMF07XHJcbiAgICB9KTtcclxuICAgIGlmIChyZXMubGVuZ3RoIDw9IDApXHJcbiAgICAgICAgdW5rbm93bjtcclxuICAgIHJldHVybiByZXMudG9VcHBlckNhc2UoKS5zdWJzdHIoMCwgMik7XHJcbn1cclxuZXhwb3J0cy5hdmF0YXJOYW1lID0gYXZhdGFyTmFtZTtcclxudmFyIHJhbmRvbSA9IGZ1bmN0aW9uIChtaW4sIG1heCkgeyByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluOyB9O1xyXG5leHBvcnRzLnJhbmRvbSA9IHJhbmRvbTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c25pcHBldC5qcy5tYXBcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvdXRpbFxcXFxzbmlwcGV0LmpzXCIsXCIvdXRpbFwiKSJdfQ==
