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
var vector_icon_1 = require("./vector_icon");
var MediaType_1 = require("./jitsi/MediaType");
var UserProperty_1 = require("./jitsi/UserProperty");
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
        this.subjectElement = document.querySelector(".subject-text");
        this.timestampElement = document.querySelector(".subject-timer");
        this.topInfobarElement = document.querySelector(".subject");
        this.registerEventHandlers();
        this.registerExternalCallbacks();
    }
    MeetingUI.prototype.registerExternalCallbacks = function () {
        var _this_1 = this;
        $(document).ready(function () {
            $(_this_1.toolbarLeaveButtonElement).click(function () {
                _this_1.meeting.stop();
            });
        });
    };
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
            $("#content").hover(function () {
                $(_this_1.toolbarElement).addClass("visible");
                if (_this_1.initTopInfo)
                    $(_this_1.topInfobarElement).addClass("visible");
            }, function () {
                $(_this_1.toolbarElement).removeClass("visible");
                if (_this_1.initTopInfo)
                    $(_this_1.topInfobarElement).removeClass("visible");
            }).click(function () {
                $("." + _this_1.popupMenuClass).removeClass("visible");
            });
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
            $("#share").click(function () {
                var el = $(this).find(".toolbox-icon");
                el.toggleClass("toggled");
                if (el.hasClass("toggled")) {
                }
                else {
                }
            });
            $(_this_1.toolbarChatButtonElement).on('click', function () {
                var el = $(this).find(".toolbox-icon");
                el.toggleClass("toggled");
                if (el.hasClass("toggled")) {
                    $("#video-panel").addClass("shift-right");
                    $("#new-toolbox").addClass("shift-right");
                    $("#sideToolbarContainer").removeClass("invisible");
                    $("#usermsg").focus();
                }
                else {
                    $("#video-panel").removeClass("shift-right");
                    $("#new-toolbox").removeClass("shift-right");
                    $("#sideToolbarContainer").addClass("invisible");
                }
                _this.refreshCardViews();
            });
            $(".chat-header .jitsi-icon").click(function () {
                $("#chat").find(".toolbox-icon").removeClass("toggled");
                $("#video-panel").removeClass("shift-right");
                $("#new-toolbox").removeClass("shift-right");
                $("#sideToolbarContainer").addClass("invisible");
                _this.refreshCardViews();
            });
            $("#usermsg").keypress(function (e) {
                if ((e.keyCode || e.which) == 13) { //Enter keycode
                    if (e.shiftKey) {
                        return;
                    }
                    e.preventDefault();
                    var sms = $(this).val().toString().trim();
                    $(this).val('');
                    if (sms == '') {
                        return;
                    }
                    sms = _this.emonameToEmoicon(sms);
                    var time = _this.getCurTime();
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
                    _this.scrollToBottom();
                    // send sms to remote
                    _this.meeting.sendChatMessage(sms);
                }
            });
            $(_this_1.toolbarDesktopShareButtonElement).on("click", function () {
                _this_1.meeting.toggleScreenShare();
            });
            $(_this_1.toolbarRecordButtonElement).on('click', function () {
                _this_1.meeting.toggleRecording();
            });
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
    MeetingUI.prototype.toggleMicrophone = function () {
        var isDisable = $("#navMicrophoneButton").hasClass('mic-disable');
        if (isDisable) {
            $("#navMicrophoneButton").removeClass("mic-disable");
            $("#navMicrophoneButton img").attr("src", "../img/mic.png");
        }
        else {
            $("#navMicrophoneButton").addClass('mic-disable');
            $("#navMicrophoneButton img").attr('src', '../img/mute.png');
        }
    };
    MeetingUI.prototype.toggleCamera = function () {
        var isDisable = $("#navCameraButton").hasClass('camera-disable');
        if (isDisable) {
            this.setVideo(0, 1);
            $("#navCameraButton").removeClass("camera-disable");
            $("#navCameraButton img").attr("src", "../img/camera.png");
        }
        else {
            this.setVideo(0, 0);
            $("#navCameraButton").addClass('camera-disable');
            $("#navCameraButton img").attr('src', '../img/camera-off.png');
        }
    };
    MeetingUI.prototype.toggleChat = function () {
        var count = $("#layout .p-5-m-auto").length;
        if (count == 0) {
        }
    };
    MeetingUI.prototype.setAudio = function (index, status) {
        if (status == 0) { //disable
            $("#piece-" + index + " img.aud-back").attr("src", "../img/mute.png");
        }
        else if (status == 1) { //enable
            $("#piece-" + index + " img.aud-back").attr("src", "../img/mic.png");
        }
        else { // 2 speaking
            $("#piece-" + index + " img.aud-back").attr("src", "../img/speaking.png");
        }
    };
    MeetingUI.prototype.setAudioStatus = function (index) {
        if ($("#piece-" + index + " button.mic-button").hasClass('mic-disable')) {
            $("#piece-" + index + " button.mic-button").removeClass('mic-disable');
            $("#piece-" + index + " button.mic-button").addClass('mic-enable');
            this.setAudio(index, 1);
        }
        else if ($("#piece-" + index + " button.mic-button").hasClass('mic-enable')) {
            $("#piece-" + index + " button.mic-button").removeClass('mic-enable');
            $("#piece-" + index + " button.mic-button").addClass('mic-disable');
            this.setAudio(index, 0);
        }
    };
    MeetingUI.prototype.setVideo = function (index, status) {
        if (status == 1) {
            $("#piece-" + index + " img.vid-back").remove();
            $("#piece-" + index).append("<video />");
        }
        else {
            $("#piece-" + index + " video").remove();
            $("#piece-" + index).append("<img src='../img/poster.png' class='vid-back'/>");
        }
    };
    MeetingUI.prototype.activateVideoPanel = function (index, status) {
        if (status) {
            $("#piece-" + index + " img.vid-back").remove();
            $("#piece-" + index).append("<video autoplay playsinline index=\"" + index + "\"/>");
        }
        else {
            $("#piece-" + index + " video").remove();
            $("#piece-" + index).append("<img src='../img/poster.png' class='vid-back'/>");
        }
    };
    MeetingUI.prototype.activateAudioButton = function (index, status) {
        if (!status) { //disable
            $("#piece-" + index + " img.aud-back").attr("src", "../img/mute.png");
        }
        else if (status) { //enable
            $("#piece-" + index + " img.aud-back").attr("src", "../img/mic.png");
        }
        else { // 2 speaking
            $("#piece-" + index + " img.aud-back").attr("src", "../img/speaking.png");
        }
    };
    MeetingUI.prototype.getEmptyVideoPanel = function () {
        var panel = this.addNewPanel();
        this.registerPanelEventHandler(panel);
        //bottom small icons
        this._getVideoMuteElementFromPanel(panel).style.display = "none";
        this._getAudioMuteElementFromPanel(panel).style.display = "none";
        this._getModeratorStarElementFromPanel(panel).style.display = "none";
        var videoElem = this._getVideoElementFromPanel(panel);
        return videoElem;
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
        this._getModeratorStarElementFromPanel(panel).style.display = user.getProperty(UserProperty_1.UserProperty.isModerator) ? "block" : "none";
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
        if (user.getProperty(UserProperty_1.UserProperty.isModerator))
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
        var userHaveCamera = false, userHaveMicrophone = false;
        localTracks.forEach(function (track) {
            if (track.getType() === MediaType_1.MediaType.VIDEO)
                userHaveCamera = true;
            else if (track.getType() === MediaType_1.MediaType.AUDIO)
                userHaveMicrophone = true;
        });
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
            videoMutePopupMenu.style.display = userHaveCamera ? "flex" : "none";
            audioMutePopupMenu.style.display = userHaveMicrophone ? "flex" : "none";
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
        var userHaveCamera = false, userHaveMicrophone = false;
        localTracks.forEach(function (track) {
            if (track.getType() === MediaType_1.MediaType.VIDEO)
                userHaveCamera = true;
            else if (track.getType() === MediaType_1.MediaType.AUDIO)
                userHaveMicrophone = true;
        });
        var audioMuted = false, videoMuted = false;
        localTracks.forEach(function (track) {
            if (track.getType() === MediaType_1.MediaType.VIDEO && track.isMuted())
                videoMuted = true;
            else if (track.getType() === MediaType_1.MediaType.AUDIO && track.isMuted())
                audioMuted = true;
        });
        this.toolbarVideoButtonElement.style.display = userHaveCamera ? "block" : "none";
        this.toolbarAudioButtonElement.style.display = userHaveMicrophone ? "block" : "none";
        if (audioMuted) {
            $(this.toolbarAudioButtonElement).find("path").attr("d", vector_icon_1.VectorIcon.AUDIO_MUTE_ICON);
        }
        else {
            $(this.toolbarAudioButtonElement).find("path").attr("d", vector_icon_1.VectorIcon.AUDIO_UNMUTE_ICON);
        }
        if (videoMuted) {
            $(this.toolbarVideoButtonElement).find("path").attr("d", vector_icon_1.VectorIcon.VIDEO_MUTE_ICON);
        }
        else {
            $(this.toolbarVideoButtonElement).find("path").attr("d", vector_icon_1.VectorIcon.VIDEO_UNMUTE_ICON);
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
    MeetingUI.prototype.getShortName = function (fullName) {
        if (!fullName || fullName.length <= 1)
            return "";
        else
            return fullName.toUpperCase().substr(0, 2);
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
        var gutter = 40;
        var width = $("#content").width() - gutter;
        var height = $("#content").height() - gutter;
        var count = $("." + this.panelClass).length;
        if ($("#video-panel").hasClass("shift-right")) {
            width -= 315;
        }
        var w, h;
        if ($("." + this.panelClass).hasClass(this.fullscreenClass)) {
            $("." + this.panelClass).css("display", "none");
            $("." + this.fullscreenClass).css("display", "inline-block").css("height", height + gutter - 6).css("width", width + gutter);
            return;
        }
        $("." + this.panelClass).css("display", "inline-block");
        if (count == 1) {
            if (width * 9 > height * 16) {
                h = height;
                w = h * 16 / 9;
            }
            else {
                w = width;
                h = w * 9 / 16;
            }
        }
        else if (count == 2) {
            if (width < 320) {
                w = width;
                h = w * 9 / 16;
                //            console.log("w", w, h);
            }
            else {
                if (width * 9 > height * 16 * 2) {
                    h = height;
                    w = h * 16 / 9;
                }
                else {
                    w = width / 2;
                    h = w * 9 / 16;
                }
            }
        }
        else if (count > 2 && count < 5) {
            if (width < 320) {
                w = width;
                h = w * 9 / 16;
            }
            else {
                if (width * 9 > height * 16) {
                    h = height / 2;
                    w = h * 16 / 9;
                }
                else {
                    w = width / 2;
                    h = w * 9 / 16;
                }
            }
        }
        else if (count >= 5 && count < 7) {
            if (width < 320) {
                w = width;
                h = w * 9 / 16;
            }
            else if (width >= 320 && width < 1000) {
                if (width * 9 / 2 > height * 16 / 3) { // w*h= 2*3 
                    h = height / 3;
                    w = h * 16 / 9;
                    //console.log("h", w, h);
                }
                else {
                    w = width / 2;
                    h = w * 9 / 16;
                    //console.log("w", w, h);
                }
            }
            else {
                if (width * 9 / 3 > height * 16 / 2) { // w*h= 2*3
                    h = height / 2;
                    w = h * 16 / 9;
                }
                else {
                    w = width / 3;
                    h = w * 9 / 16;
                }
            }
        }
        else if (count >= 7 && count < 10) {
            if (width < 320) {
                w = width;
                h = w * 9 / 16;
            }
            else if (width >= 320 && width < 1000) {
                if (width * 9 / 2 > height * 16 / 4) { // w*h= 2*4
                    h = height / 4;
                    w = h * 16 / 9;
                    //console.log("h", w, h);
                }
                else {
                    w = width / 2;
                    h = w * 9 / 16;
                    //console.log("w", w, h);
                }
            }
            else {
                if (width * 9 / 3 > height * 16 / 3) { // w*h= 2*3
                    h = height / 3;
                    w = h * 16 / 9;
                }
                else {
                    w = width / 3;
                    h = w * 9 / 16;
                }
            }
        }
        $("." + this.panelClass).css("width", w).css("height", h).find(".avatar-container").css("width", h / 2).css("height", h / 2);
    };
    MeetingUI.prototype.addNewPanel = function () {
        var count = $("." + this.panelClass).length;
        if (count >= this.MAX_PANELS)
            return;
        var isSpeak = false;
        var isDisableCamera = true;
        var isMute = true;
        var activeSpeaker = '';
        if (isSpeak) {
            activeSpeaker = "active-speaker";
        }
        var avatarVisible = '';
        var cameraStatus = '';
        var videoTag = '';
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
            videoTag = "<video autoplay playsinline  class='" + this.videoElementClass + "' id='remoteVideo_" + ++this.nPanelInstanceId + "'></video>";
        }
        else {
            videoTag = "<video autoplay playsinline  class='" + this.videoElementClass + "'  id=\"remoteVideo_" + ++this.nPanelInstanceId + "\"></video>"; //set camera parameter;
        }
        var micStatus = '';
        var audioTag = '';
        if (isMute) {
            micStatus = '<div class="indicator-container audioMuted"> \
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
            audioTag = '<audio></audio>';
        }
        else {
            audioTag = '<audio autoplay="" id="remoteAudio_"></audio>';
        }
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
    MeetingUI.prototype.idToEmoname = function (id) {
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
    MeetingUI.prototype.emonameToEmoicon = function (sms) {
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
    MeetingUI.prototype.getCurTime = function () {
        var date = new Date();
        var h = date.getHours();
        var m = date.getMinutes();
        var m_2 = ("0" + m).slice(-2);
        var h_2 = ("0" + h).slice(-2);
        var time = h_2 + ":" + m_2;
        return time;
    };
    MeetingUI.prototype.scrollToBottom = function () {
        var overheight = 0;
        $(".chat-message-group").each(function () {
            overheight += $(this).height();
        });
        var limit = $('#chatconversation').height();
        var pos = overheight - limit;
        $("#chatconversation").animate({ scrollTop: pos }, 200);
    };
    //chat
    MeetingUI.prototype.receiveMessage = function (username, message, timestamp) {
        message = this.emonameToEmoicon(message);
        $("#chatconversation").append('<div class="chat-message-group remote"> \
        <div class= "chatmessage-wrapper" >\
                <div class="chatmessage ">\
                    <div class="replywrapper">\
                        <div class="messagecontent">\
                            <div class="display-name">' + username + '</div>\
                            <div class="usermessage">' + message + '</div>\
                        </div>\
                    </div>\
                </div>\
                <div class="timestamp">' + this.getCurTime() + '</div>\
            </div >\
        </div>');
        this.scrollToBottom();
        var el = $("#chat").find(".toolbox-icon");
        el.addClass("toggled");
        $("#video-panel").addClass("shift-right");
        $("#new-toolbox").addClass("shift-right");
        $("#sideToolbarContainer").removeClass("invisible");
        this.refreshCardViews();
    };
    MeetingUI.prototype.updateTime = function (timeLabel) {
        this.timestampElement.innerHTML = timeLabel;
        if (!this.initTopInfo) {
            this.initTopInfo = true;
            $(this.topInfobarElement).addClass("visible");
        }
    };
    MeetingUI.prototype.showMeetingSubject = function (subject) {
        if (subject && subject.length > 0) {
            this.subjectElement.innerHTML = subject;
        }
    };
    return MeetingUI;
}());
exports.MeetingUI = MeetingUI;
//# sourceMappingURL=meeting_ui.js.map
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_5acb808b.js","/")
},{"./jitsi/MediaType":6,"./jitsi/UserProperty":7,"./vector_icon":8,"buffer":2,"e/U+97":4}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaType = void 0;
var MediaType;
(function (MediaType) {
    MediaType["AUDIO"] = "audio";
    MediaType["PRESENTER"] = "presenter";
    MediaType["VIDEO"] = "video";
})(MediaType = exports.MediaType || (exports.MediaType = {}));
//# sourceMappingURL=MediaType.js.map
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/jitsi\\MediaType.js","/jitsi")
},{"buffer":2,"e/U+97":4}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProperty = void 0;
var UserProperty;
(function (UserProperty) {
    UserProperty["videoElem"] = "videoElem";
    UserProperty["isModerator"] = "isModerator";
})(UserProperty = exports.UserProperty || (exports.UserProperty = {}));
//# sourceMappingURL=UserProperty.js.map
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/jitsi\\UserProperty.js","/jitsi")
},{"buffer":2,"e/U+97":4}],8:[function(require,module,exports){
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
    return VectorIcon;
}());
exports.VectorIcon = VectorIcon;
//# sourceMappingURL=vector_icon.js.map
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/vector_icon.js","/")
},{"buffer":2,"e/U+97":4}]},{},[5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkY6XFwxX2luZGlhX3dlYnJ0Y1xcX1Byb2plY3RcXGJpemdhemVfbWVldGluZ1xcdmlkZW9jb25mXFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJGOi8xX2luZGlhX3dlYnJ0Yy9fUHJvamVjdC9iaXpnYXplX21lZXRpbmcvdmlkZW9jb25mL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliL2I2NC5qcyIsIkY6LzFfaW5kaWFfd2VicnRjL19Qcm9qZWN0L2JpemdhemVfbWVldGluZy92aWRlb2NvbmYvbm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qcyIsIkY6LzFfaW5kaWFfd2VicnRjL19Qcm9qZWN0L2JpemdhemVfbWVldGluZy92aWRlb2NvbmYvbm9kZV9tb2R1bGVzL2llZWU3NTQvaW5kZXguanMiLCJGOi8xX2luZGlhX3dlYnJ0Yy9fUHJvamVjdC9iaXpnYXplX21lZXRpbmcvdmlkZW9jb25mL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJGOi8xX2luZGlhX3dlYnJ0Yy9fUHJvamVjdC9iaXpnYXplX21lZXRpbmcvdmlkZW9jb25mL3NjcmlwdHMvYnVpbGQvZmFrZV81YWNiODA4Yi5qcyIsIkY6LzFfaW5kaWFfd2VicnRjL19Qcm9qZWN0L2JpemdhemVfbWVldGluZy92aWRlb2NvbmYvc2NyaXB0cy9idWlsZC9qaXRzaS9NZWRpYVR5cGUuanMiLCJGOi8xX2luZGlhX3dlYnJ0Yy9fUHJvamVjdC9iaXpnYXplX21lZXRpbmcvdmlkZW9jb25mL3NjcmlwdHMvYnVpbGQvaml0c2kvVXNlclByb3BlcnR5LmpzIiwiRjovMV9pbmRpYV93ZWJydGMvX1Byb2plY3QvYml6Z2F6ZV9tZWV0aW5nL3ZpZGVvY29uZi9zY3JpcHRzL2J1aWxkL3ZlY3Rvcl9pY29uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmxDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzk4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgbG9va3VwID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuXG47KGZ1bmN0aW9uIChleHBvcnRzKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuICB2YXIgQXJyID0gKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJylcbiAgICA/IFVpbnQ4QXJyYXlcbiAgICA6IEFycmF5XG5cblx0dmFyIFBMVVMgICA9ICcrJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSCAgPSAnLycuY2hhckNvZGVBdCgwKVxuXHR2YXIgTlVNQkVSID0gJzAnLmNoYXJDb2RlQXQoMClcblx0dmFyIExPV0VSICA9ICdhJy5jaGFyQ29kZUF0KDApXG5cdHZhciBVUFBFUiAgPSAnQScuY2hhckNvZGVBdCgwKVxuXHR2YXIgUExVU19VUkxfU0FGRSA9ICctJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSF9VUkxfU0FGRSA9ICdfJy5jaGFyQ29kZUF0KDApXG5cblx0ZnVuY3Rpb24gZGVjb2RlIChlbHQpIHtcblx0XHR2YXIgY29kZSA9IGVsdC5jaGFyQ29kZUF0KDApXG5cdFx0aWYgKGNvZGUgPT09IFBMVVMgfHxcblx0XHQgICAgY29kZSA9PT0gUExVU19VUkxfU0FGRSlcblx0XHRcdHJldHVybiA2MiAvLyAnKydcblx0XHRpZiAoY29kZSA9PT0gU0xBU0ggfHxcblx0XHQgICAgY29kZSA9PT0gU0xBU0hfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjMgLy8gJy8nXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIpXG5cdFx0XHRyZXR1cm4gLTEgLy9ubyBtYXRjaFxuXHRcdGlmIChjb2RlIDwgTlVNQkVSICsgMTApXG5cdFx0XHRyZXR1cm4gY29kZSAtIE5VTUJFUiArIDI2ICsgMjZcblx0XHRpZiAoY29kZSA8IFVQUEVSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIFVQUEVSXG5cdFx0aWYgKGNvZGUgPCBMT1dFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBMT1dFUiArIDI2XG5cdH1cblxuXHRmdW5jdGlvbiBiNjRUb0J5dGVBcnJheSAoYjY0KSB7XG5cdFx0dmFyIGksIGosIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnJcblxuXHRcdGlmIChiNjQubGVuZ3RoICUgNCA+IDApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG5cdFx0fVxuXG5cdFx0Ly8gdGhlIG51bWJlciBvZiBlcXVhbCBzaWducyAocGxhY2UgaG9sZGVycylcblx0XHQvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XG5cdFx0Ly8gcmVwcmVzZW50IG9uZSBieXRlXG5cdFx0Ly8gaWYgdGhlcmUgaXMgb25seSBvbmUsIHRoZW4gdGhlIHRocmVlIGNoYXJhY3RlcnMgYmVmb3JlIGl0IHJlcHJlc2VudCAyIGJ5dGVzXG5cdFx0Ly8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxuXHRcdHZhciBsZW4gPSBiNjQubGVuZ3RoXG5cdFx0cGxhY2VIb2xkZXJzID0gJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDIpID8gMiA6ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAxKSA/IDEgOiAwXG5cblx0XHQvLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcblx0XHRhcnIgPSBuZXcgQXJyKGI2NC5sZW5ndGggKiAzIC8gNCAtIHBsYWNlSG9sZGVycylcblxuXHRcdC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcblx0XHRsID0gcGxhY2VIb2xkZXJzID4gMCA/IGI2NC5sZW5ndGggLSA0IDogYjY0Lmxlbmd0aFxuXG5cdFx0dmFyIEwgPSAwXG5cblx0XHRmdW5jdGlvbiBwdXNoICh2KSB7XG5cdFx0XHRhcnJbTCsrXSA9IHZcblx0XHR9XG5cblx0XHRmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDE4KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDEyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpIDw8IDYpIHwgZGVjb2RlKGI2NC5jaGFyQXQoaSArIDMpKVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwMDApID4+IDE2KVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwKSA+PiA4KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdGlmIChwbGFjZUhvbGRlcnMgPT09IDIpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA+PiA0KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH0gZWxzZSBpZiAocGxhY2VIb2xkZXJzID09PSAxKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDEwKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDQpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPj4gMilcblx0XHRcdHB1c2goKHRtcCA+PiA4KSAmIDB4RkYpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFyclxuXHR9XG5cblx0ZnVuY3Rpb24gdWludDhUb0Jhc2U2NCAodWludDgpIHtcblx0XHR2YXIgaSxcblx0XHRcdGV4dHJhQnl0ZXMgPSB1aW50OC5sZW5ndGggJSAzLCAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xuXHRcdFx0b3V0cHV0ID0gXCJcIixcblx0XHRcdHRlbXAsIGxlbmd0aFxuXG5cdFx0ZnVuY3Rpb24gZW5jb2RlIChudW0pIHtcblx0XHRcdHJldHVybiBsb29rdXAuY2hhckF0KG51bSlcblx0XHR9XG5cblx0XHRmdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuXHRcdFx0cmV0dXJuIGVuY29kZShudW0gPj4gMTggJiAweDNGKSArIGVuY29kZShudW0gPj4gMTIgJiAweDNGKSArIGVuY29kZShudW0gPj4gNiAmIDB4M0YpICsgZW5jb2RlKG51bSAmIDB4M0YpXG5cdFx0fVxuXG5cdFx0Ly8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuXHRcdGZvciAoaSA9IDAsIGxlbmd0aCA9IHVpbnQ4Lmxlbmd0aCAtIGV4dHJhQnl0ZXM7IGkgPCBsZW5ndGg7IGkgKz0gMykge1xuXHRcdFx0dGVtcCA9ICh1aW50OFtpXSA8PCAxNikgKyAodWludDhbaSArIDFdIDw8IDgpICsgKHVpbnQ4W2kgKyAyXSlcblx0XHRcdG91dHB1dCArPSB0cmlwbGV0VG9CYXNlNjQodGVtcClcblx0XHR9XG5cblx0XHQvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXG5cdFx0c3dpdGNoIChleHRyYUJ5dGVzKSB7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHRlbXAgPSB1aW50OFt1aW50OC5sZW5ndGggLSAxXVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPT0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHRlbXAgPSAodWludDhbdWludDgubGVuZ3RoIC0gMl0gPDwgOCkgKyAodWludDhbdWludDgubGVuZ3RoIC0gMV0pXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAxMClcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA+PiA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgMikgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dFxuXHR9XG5cblx0ZXhwb3J0cy50b0J5dGVBcnJheSA9IGI2NFRvQnl0ZUFycmF5XG5cdGV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IHVpbnQ4VG9CYXNlNjRcbn0odHlwZW9mIGV4cG9ydHMgPT09ICd1bmRlZmluZWQnID8gKHRoaXMuYmFzZTY0anMgPSB7fSkgOiBleHBvcnRzKSlcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcYmFzZTY0LWpzXFxcXGxpYlxcXFxiNjQuanNcIixcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcYmFzZTY0LWpzXFxcXGxpYlwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qIVxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTID0gNTBcbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTJcblxuLyoqXG4gKiBJZiBgQnVmZmVyLl91c2VUeXBlZEFycmF5c2A6XG4gKiAgID09PSB0cnVlICAgIFVzZSBVaW50OEFycmF5IGltcGxlbWVudGF0aW9uIChmYXN0ZXN0KVxuICogICA9PT0gZmFsc2UgICBVc2UgT2JqZWN0IGltcGxlbWVudGF0aW9uIChjb21wYXRpYmxlIGRvd24gdG8gSUU2KVxuICovXG5CdWZmZXIuX3VzZVR5cGVkQXJyYXlzID0gKGZ1bmN0aW9uICgpIHtcbiAgLy8gRGV0ZWN0IGlmIGJyb3dzZXIgc3VwcG9ydHMgVHlwZWQgQXJyYXlzLiBTdXBwb3J0ZWQgYnJvd3NlcnMgYXJlIElFIDEwKywgRmlyZWZveCA0KyxcbiAgLy8gQ2hyb21lIDcrLCBTYWZhcmkgNS4xKywgT3BlcmEgMTEuNissIGlPUyA0LjIrLiBJZiB0aGUgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGFkZGluZ1xuICAvLyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YCBpbnN0YW5jZXMsIHRoZW4gdGhhdCdzIHRoZSBzYW1lIGFzIG5vIGBVaW50OEFycmF5YCBzdXBwb3J0XG4gIC8vIGJlY2F1c2Ugd2UgbmVlZCB0byBiZSBhYmxlIHRvIGFkZCBhbGwgdGhlIG5vZGUgQnVmZmVyIEFQSSBtZXRob2RzLiBUaGlzIGlzIGFuIGlzc3VlXG4gIC8vIGluIEZpcmVmb3ggNC0yOS4gTm93IGZpeGVkOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzhcbiAgdHJ5IHtcbiAgICB2YXIgYnVmID0gbmV3IEFycmF5QnVmZmVyKDApXG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KGJ1ZilcbiAgICBhcnIuZm9vID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfVxuICAgIHJldHVybiA0MiA9PT0gYXJyLmZvbygpICYmXG4gICAgICAgIHR5cGVvZiBhcnIuc3ViYXJyYXkgPT09ICdmdW5jdGlvbicgLy8gQ2hyb21lIDktMTAgbGFjayBgc3ViYXJyYXlgXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufSkoKVxuXG4vKipcbiAqIENsYXNzOiBCdWZmZXJcbiAqID09PT09PT09PT09PT1cbiAqXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGFyZSBhdWdtZW50ZWRcbiAqIHdpdGggZnVuY3Rpb24gcHJvcGVydGllcyBmb3IgYWxsIHRoZSBub2RlIGBCdWZmZXJgIEFQSSBmdW5jdGlvbnMuIFdlIHVzZVxuICogYFVpbnQ4QXJyYXlgIHNvIHRoYXQgc3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXQgcmV0dXJuc1xuICogYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogQnkgYXVnbWVudGluZyB0aGUgaW5zdGFuY2VzLCB3ZSBjYW4gYXZvaWQgbW9kaWZ5aW5nIHRoZSBgVWludDhBcnJheWBcbiAqIHByb3RvdHlwZS5cbiAqL1xuZnVuY3Rpb24gQnVmZmVyIChzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBCdWZmZXIpKVxuICAgIHJldHVybiBuZXcgQnVmZmVyKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pXG5cbiAgdmFyIHR5cGUgPSB0eXBlb2Ygc3ViamVjdFxuXG4gIC8vIFdvcmthcm91bmQ6IG5vZGUncyBiYXNlNjQgaW1wbGVtZW50YXRpb24gYWxsb3dzIGZvciBub24tcGFkZGVkIHN0cmluZ3NcbiAgLy8gd2hpbGUgYmFzZTY0LWpzIGRvZXMgbm90LlxuICBpZiAoZW5jb2RpbmcgPT09ICdiYXNlNjQnICYmIHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgc3ViamVjdCA9IHN0cmluZ3RyaW0oc3ViamVjdClcbiAgICB3aGlsZSAoc3ViamVjdC5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgICBzdWJqZWN0ID0gc3ViamVjdCArICc9J1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpbmQgdGhlIGxlbmd0aFxuICB2YXIgbGVuZ3RoXG4gIGlmICh0eXBlID09PSAnbnVtYmVyJylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdClcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpXG4gICAgbGVuZ3RoID0gQnVmZmVyLmJ5dGVMZW5ndGgoc3ViamVjdCwgZW5jb2RpbmcpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnKVxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0Lmxlbmd0aCkgLy8gYXNzdW1lIHRoYXQgb2JqZWN0IGlzIGFycmF5LWxpa2VcbiAgZWxzZVxuICAgIHRocm93IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgbmVlZHMgdG8gYmUgYSBudW1iZXIsIGFycmF5IG9yIHN0cmluZy4nKVxuXG4gIHZhciBidWZcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICAvLyBQcmVmZXJyZWQ6IFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgYnVmID0gQnVmZmVyLl9hdWdtZW50KG5ldyBVaW50OEFycmF5KGxlbmd0aCkpXG4gIH0gZWxzZSB7XG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBUSElTIGluc3RhbmNlIG9mIEJ1ZmZlciAoY3JlYXRlZCBieSBgbmV3YClcbiAgICBidWYgPSB0aGlzXG4gICAgYnVmLmxlbmd0aCA9IGxlbmd0aFxuICAgIGJ1Zi5faXNCdWZmZXIgPSB0cnVlXG4gIH1cblxuICB2YXIgaVxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiB0eXBlb2Ygc3ViamVjdC5ieXRlTGVuZ3RoID09PSAnbnVtYmVyJykge1xuICAgIC8vIFNwZWVkIG9wdGltaXphdGlvbiAtLSB1c2Ugc2V0IGlmIHdlJ3JlIGNvcHlpbmcgZnJvbSBhIHR5cGVkIGFycmF5XG4gICAgYnVmLl9zZXQoc3ViamVjdClcbiAgfSBlbHNlIGlmIChpc0FycmF5aXNoKHN1YmplY3QpKSB7XG4gICAgLy8gVHJlYXQgYXJyYXktaXNoIG9iamVjdHMgYXMgYSBieXRlIGFycmF5XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpKVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0LnJlYWRVSW50OChpKVxuICAgICAgZWxzZVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0W2ldXG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgYnVmLndyaXRlKHN1YmplY3QsIDAsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdudW1iZXInICYmICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmICFub1plcm8pIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGJ1ZltpXSA9IDBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbi8vIFNUQVRJQyBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PVxuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAncmF3JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gKGIpIHtcbiAgcmV0dXJuICEhKGIgIT09IG51bGwgJiYgYiAhPT0gdW5kZWZpbmVkICYmIGIuX2lzQnVmZmVyKVxufVxuXG5CdWZmZXIuYnl0ZUxlbmd0aCA9IGZ1bmN0aW9uIChzdHIsIGVuY29kaW5nKSB7XG4gIHZhciByZXRcbiAgc3RyID0gc3RyICsgJydcbiAgc3dpdGNoIChlbmNvZGluZyB8fCAndXRmOCcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAvIDJcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gdXRmOFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAncmF3JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IGJhc2U2NFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggKiAyXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIChsaXN0LCB0b3RhbExlbmd0aCkge1xuICBhc3NlcnQoaXNBcnJheShsaXN0KSwgJ1VzYWdlOiBCdWZmZXIuY29uY2F0KGxpc3QsIFt0b3RhbExlbmd0aF0pXFxuJyArXG4gICAgICAnbGlzdCBzaG91bGQgYmUgYW4gQXJyYXkuJylcblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcigwKVxuICB9IGVsc2UgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIGxpc3RbMF1cbiAgfVxuXG4gIHZhciBpXG4gIGlmICh0eXBlb2YgdG90YWxMZW5ndGggIT09ICdudW1iZXInKSB7XG4gICAgdG90YWxMZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRvdGFsTGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZiA9IG5ldyBCdWZmZXIodG90YWxMZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldXG4gICAgaXRlbS5jb3B5KGJ1ZiwgcG9zKVxuICAgIHBvcyArPSBpdGVtLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZcbn1cblxuLy8gQlVGRkVSIElOU1RBTkNFIE1FVEhPRFNcbi8vID09PT09PT09PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIF9oZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGFzc2VydChzdHJMZW4gJSAyID09PSAwLCAnSW52YWxpZCBoZXggc3RyaW5nJylcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGJ5dGUgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXG4gICAgYXNzZXJ0KCFpc05hTihieXRlKSwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG4gICAgYnVmW29mZnNldCArIGldID0gYnl0ZVxuICB9XG4gIEJ1ZmZlci5fY2hhcnNXcml0dGVuID0gaSAqIDJcbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gX3V0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9hc2NpaVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBfYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX3V0ZjE2bGVXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcbiAgLy8gU3VwcG9ydCBib3RoIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZylcbiAgLy8gYW5kIHRoZSBsZWdhY3kgKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIGlmICghaXNGaW5pdGUobGVuZ3RoKSkge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgfSBlbHNlIHsgIC8vIGxlZ2FjeVxuICAgIHZhciBzd2FwID0gZW5jb2RpbmdcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIG9mZnNldCA9IGxlbmd0aFxuICAgIGxlbmd0aCA9IHN3YXBcbiAgfVxuXG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG5cbiAgdmFyIHJldFxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IF9oZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSBfdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldCA9IF9hc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXQgPSBfYmluYXJ5V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IF9iYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gX3V0ZjE2bGVXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG4gIHN0YXJ0ID0gTnVtYmVyKHN0YXJ0KSB8fCAwXG4gIGVuZCA9IChlbmQgIT09IHVuZGVmaW5lZClcbiAgICA/IE51bWJlcihlbmQpXG4gICAgOiBlbmQgPSBzZWxmLmxlbmd0aFxuXG4gIC8vIEZhc3RwYXRoIGVtcHR5IHN0cmluZ3NcbiAgaWYgKGVuZCA9PT0gc3RhcnQpXG4gICAgcmV0dXJuICcnXG5cbiAgdmFyIHJldFxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IF9oZXhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSBfdXRmOFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldCA9IF9hc2NpaVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXQgPSBfYmluYXJ5U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IF9iYXNlNjRTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gX3V0ZjE2bGVTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uICh0YXJnZXQsIHRhcmdldF9zdGFydCwgc3RhcnQsIGVuZCkge1xuICB2YXIgc291cmNlID0gdGhpc1xuXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICghdGFyZ2V0X3N0YXJ0KSB0YXJnZXRfc3RhcnQgPSAwXG5cbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgc291cmNlLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnc291cmNlRW5kIDwgc291cmNlU3RhcnQnKVxuICBhc3NlcnQodGFyZ2V0X3N0YXJ0ID49IDAgJiYgdGFyZ2V0X3N0YXJ0IDwgdGFyZ2V0Lmxlbmd0aCxcbiAgICAgICd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCBzb3VyY2UubGVuZ3RoLCAnc291cmNlU3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gc291cmNlLmxlbmd0aCwgJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpXG4gICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgPCBlbmQgLSBzdGFydClcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0ICsgc3RhcnRcblxuICB2YXIgbGVuID0gZW5kIC0gc3RhcnRcblxuICBpZiAobGVuIDwgMTAwIHx8ICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0X3N0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICB9IGVsc2Uge1xuICAgIHRhcmdldC5fc2V0KHRoaXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuKSwgdGFyZ2V0X3N0YXJ0KVxuICB9XG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGlmIChzdGFydCA9PT0gMCAmJiBlbmQgPT09IGJ1Zi5sZW5ndGgpIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYuc2xpY2Uoc3RhcnQsIGVuZCkpXG4gIH1cbn1cblxuZnVuY3Rpb24gX3V0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXMgPSAnJ1xuICB2YXIgdG1wID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgaWYgKGJ1ZltpXSA8PSAweDdGKSB7XG4gICAgICByZXMgKz0gZGVjb2RlVXRmOENoYXIodG1wKSArIFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICAgICAgdG1wID0gJydcbiAgICB9IGVsc2Uge1xuICAgICAgdG1wICs9ICclJyArIGJ1ZltpXS50b1N0cmluZygxNilcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzICsgZGVjb2RlVXRmOENoYXIodG1wKVxufVxuXG5mdW5jdGlvbiBfYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspXG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHJldHVybiBfYXNjaWlTbGljZShidWYsIHN0YXJ0LCBlbmQpXG59XG5cbmZ1bmN0aW9uIF9oZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG5cbiAgaWYgKCFzdGFydCB8fCBzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuXG5cbiAgdmFyIG91dCA9ICcnXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgb3V0ICs9IHRvSGV4KGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIF91dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIGJ5dGVzW2krMV0gKiAyNTYpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIHN0YXJ0ID0gY2xhbXAoc3RhcnQsIGxlbiwgMClcbiAgZW5kID0gY2xhbXAoZW5kLCBsZW4sIGxlbilcblxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIHJldHVybiBCdWZmZXIuX2F1Z21lbnQodGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSlcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2xpY2VMZW4gPSBlbmQgLSBzdGFydFxuICAgIHZhciBuZXdCdWYgPSBuZXcgQnVmZmVyKHNsaWNlTGVuLCB1bmRlZmluZWQsIHRydWUpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGljZUxlbjsgaSsrKSB7XG4gICAgICBuZXdCdWZbaV0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gICAgcmV0dXJuIG5ld0J1ZlxuICB9XG59XG5cbi8vIGBnZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5nZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLnJlYWRVSW50OChvZmZzZXQpXG59XG5cbi8vIGBzZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh2LCBvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5zZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLndyaXRlVUludDgodiwgb2Zmc2V0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZFVJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWxcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xuICAgIHZhbCA9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcbiAgfSBlbHNlIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAyXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gICAgdmFsIHw9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldCArIDNdIDw8IDI0ID4+PiAwKVxuICB9IGVsc2Uge1xuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDFdIDw8IDE2XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDJdIDw8IDhcbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgM11cbiAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldF0gPDwgMjQgPj4+IDApXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgdmFyIG5lZyA9IHRoaXNbb2Zmc2V0XSAmIDB4ODBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbmZ1bmN0aW9uIF9yZWFkSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsID0gX3JlYWRVSW50MTYoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDMyKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDAwMDAwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmZmZmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEZsb2F0IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkRG91YmxlIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZilcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpIHJldHVyblxuXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmYpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgMik7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgJiAoMHhmZiA8PCAoOCAqIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpKSkpID4+PlxuICAgICAgICAgICAgKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkgKiA4XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmZmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDQpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlID4+PiAobGl0dGxlRW5kaWFuID8gaSA6IDMgLSBpKSAqIDgpICYgMHhmZlxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmLCAtMHg4MClcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgdGhpcy53cml0ZVVJbnQ4KHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgdGhpcy53cml0ZVVJbnQ4KDB4ZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZiwgLTB4ODAwMClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIF93cml0ZVVJbnQxNihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICBfd3JpdGVVSW50MTYoYnVmLCAweGZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MzIoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgMHhmZmZmZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuLy8gZmlsbCh2YWx1ZSwgc3RhcnQ9MCwgZW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiAodmFsdWUsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKCF2YWx1ZSkgdmFsdWUgPSAwXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCkgZW5kID0gdGhpcy5sZW5ndGhcblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHZhbHVlID0gdmFsdWUuY2hhckNvZGVBdCgwKVxuICB9XG5cbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgIWlzTmFOKHZhbHVlKSwgJ3ZhbHVlIGlzIG5vdCBhIG51bWJlcicpXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdlbmQgPCBzdGFydCcpXG5cbiAgLy8gRmlsbCAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHRoaXMubGVuZ3RoLCAnc3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gdGhpcy5sZW5ndGgsICdlbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICB0aGlzW2ldID0gdmFsdWVcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBvdXQgPSBbXVxuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIG91dFtpXSA9IHRvSGV4KHRoaXNbaV0pXG4gICAgaWYgKGkgPT09IGV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMpIHtcbiAgICAgIG91dFtpICsgMV0gPSAnLi4uJ1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbiAgcmV0dXJuICc8QnVmZmVyICcgKyBvdXQuam9pbignICcpICsgJz4nXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBgQXJyYXlCdWZmZXJgIHdpdGggdGhlICpjb3BpZWQqIG1lbW9yeSBvZiB0aGUgYnVmZmVyIGluc3RhbmNlLlxuICogQWRkZWQgaW4gTm9kZSAwLjEyLiBPbmx5IGF2YWlsYWJsZSBpbiBicm93c2VycyB0aGF0IHN1cHBvcnQgQXJyYXlCdWZmZXIuXG4gKi9cbkJ1ZmZlci5wcm90b3R5cGUudG9BcnJheUJ1ZmZlciA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgICByZXR1cm4gKG5ldyBCdWZmZXIodGhpcykpLmJ1ZmZlclxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYnVmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5sZW5ndGgpXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYnVmLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKVxuICAgICAgICBidWZbaV0gPSB0aGlzW2ldXG4gICAgICByZXR1cm4gYnVmLmJ1ZmZlclxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1ZmZlci50b0FycmF5QnVmZmVyIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyJylcbiAgfVxufVxuXG4vLyBIRUxQRVIgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIHN0cmluZ3RyaW0gKHN0cikge1xuICBpZiAoc3RyLnRyaW0pIHJldHVybiBzdHIudHJpbSgpXG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG59XG5cbnZhciBCUCA9IEJ1ZmZlci5wcm90b3R5cGVcblxuLyoqXG4gKiBBdWdtZW50IGEgVWludDhBcnJheSAqaW5zdGFuY2UqIChub3QgdGhlIFVpbnQ4QXJyYXkgY2xhc3MhKSB3aXRoIEJ1ZmZlciBtZXRob2RzXG4gKi9cbkJ1ZmZlci5fYXVnbWVudCA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgYXJyLl9pc0J1ZmZlciA9IHRydWVcblxuICAvLyBzYXZlIHJlZmVyZW5jZSB0byBvcmlnaW5hbCBVaW50OEFycmF5IGdldC9zZXQgbWV0aG9kcyBiZWZvcmUgb3ZlcndyaXRpbmdcbiAgYXJyLl9nZXQgPSBhcnIuZ2V0XG4gIGFyci5fc2V0ID0gYXJyLnNldFxuXG4gIC8vIGRlcHJlY2F0ZWQsIHdpbGwgYmUgcmVtb3ZlZCBpbiBub2RlIDAuMTMrXG4gIGFyci5nZXQgPSBCUC5nZXRcbiAgYXJyLnNldCA9IEJQLnNldFxuXG4gIGFyci53cml0ZSA9IEJQLndyaXRlXG4gIGFyci50b1N0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0xvY2FsZVN0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0pTT04gPSBCUC50b0pTT05cbiAgYXJyLmNvcHkgPSBCUC5jb3B5XG4gIGFyci5zbGljZSA9IEJQLnNsaWNlXG4gIGFyci5yZWFkVUludDggPSBCUC5yZWFkVUludDhcbiAgYXJyLnJlYWRVSW50MTZMRSA9IEJQLnJlYWRVSW50MTZMRVxuICBhcnIucmVhZFVJbnQxNkJFID0gQlAucmVhZFVJbnQxNkJFXG4gIGFyci5yZWFkVUludDMyTEUgPSBCUC5yZWFkVUludDMyTEVcbiAgYXJyLnJlYWRVSW50MzJCRSA9IEJQLnJlYWRVSW50MzJCRVxuICBhcnIucmVhZEludDggPSBCUC5yZWFkSW50OFxuICBhcnIucmVhZEludDE2TEUgPSBCUC5yZWFkSW50MTZMRVxuICBhcnIucmVhZEludDE2QkUgPSBCUC5yZWFkSW50MTZCRVxuICBhcnIucmVhZEludDMyTEUgPSBCUC5yZWFkSW50MzJMRVxuICBhcnIucmVhZEludDMyQkUgPSBCUC5yZWFkSW50MzJCRVxuICBhcnIucmVhZEZsb2F0TEUgPSBCUC5yZWFkRmxvYXRMRVxuICBhcnIucmVhZEZsb2F0QkUgPSBCUC5yZWFkRmxvYXRCRVxuICBhcnIucmVhZERvdWJsZUxFID0gQlAucmVhZERvdWJsZUxFXG4gIGFyci5yZWFkRG91YmxlQkUgPSBCUC5yZWFkRG91YmxlQkVcbiAgYXJyLndyaXRlVUludDggPSBCUC53cml0ZVVJbnQ4XG4gIGFyci53cml0ZVVJbnQxNkxFID0gQlAud3JpdGVVSW50MTZMRVxuICBhcnIud3JpdGVVSW50MTZCRSA9IEJQLndyaXRlVUludDE2QkVcbiAgYXJyLndyaXRlVUludDMyTEUgPSBCUC53cml0ZVVJbnQzMkxFXG4gIGFyci53cml0ZVVJbnQzMkJFID0gQlAud3JpdGVVSW50MzJCRVxuICBhcnIud3JpdGVJbnQ4ID0gQlAud3JpdGVJbnQ4XG4gIGFyci53cml0ZUludDE2TEUgPSBCUC53cml0ZUludDE2TEVcbiAgYXJyLndyaXRlSW50MTZCRSA9IEJQLndyaXRlSW50MTZCRVxuICBhcnIud3JpdGVJbnQzMkxFID0gQlAud3JpdGVJbnQzMkxFXG4gIGFyci53cml0ZUludDMyQkUgPSBCUC53cml0ZUludDMyQkVcbiAgYXJyLndyaXRlRmxvYXRMRSA9IEJQLndyaXRlRmxvYXRMRVxuICBhcnIud3JpdGVGbG9hdEJFID0gQlAud3JpdGVGbG9hdEJFXG4gIGFyci53cml0ZURvdWJsZUxFID0gQlAud3JpdGVEb3VibGVMRVxuICBhcnIud3JpdGVEb3VibGVCRSA9IEJQLndyaXRlRG91YmxlQkVcbiAgYXJyLmZpbGwgPSBCUC5maWxsXG4gIGFyci5pbnNwZWN0ID0gQlAuaW5zcGVjdFxuICBhcnIudG9BcnJheUJ1ZmZlciA9IEJQLnRvQXJyYXlCdWZmZXJcblxuICByZXR1cm4gYXJyXG59XG5cbi8vIHNsaWNlKHN0YXJ0LCBlbmQpXG5mdW5jdGlvbiBjbGFtcCAoaW5kZXgsIGxlbiwgZGVmYXVsdFZhbHVlKSB7XG4gIGlmICh0eXBlb2YgaW5kZXggIT09ICdudW1iZXInKSByZXR1cm4gZGVmYXVsdFZhbHVlXG4gIGluZGV4ID0gfn5pbmRleDsgIC8vIENvZXJjZSB0byBpbnRlZ2VyLlxuICBpZiAoaW5kZXggPj0gbGVuKSByZXR1cm4gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgaW5kZXggKz0gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gY29lcmNlIChsZW5ndGgpIHtcbiAgLy8gQ29lcmNlIGxlbmd0aCB0byBhIG51bWJlciAocG9zc2libHkgTmFOKSwgcm91bmQgdXBcbiAgLy8gaW4gY2FzZSBpdCdzIGZyYWN0aW9uYWwgKGUuZy4gMTIzLjQ1NikgdGhlbiBkbyBhXG4gIC8vIGRvdWJsZSBuZWdhdGUgdG8gY29lcmNlIGEgTmFOIHRvIDAuIEVhc3ksIHJpZ2h0P1xuICBsZW5ndGggPSB+fk1hdGguY2VpbCgrbGVuZ3RoKVxuICByZXR1cm4gbGVuZ3RoIDwgMCA/IDAgOiBsZW5ndGhcbn1cblxuZnVuY3Rpb24gaXNBcnJheSAoc3ViamVjdCkge1xuICByZXR1cm4gKEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHN1YmplY3QpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHN1YmplY3QpID09PSAnW29iamVjdCBBcnJheV0nXG4gIH0pKHN1YmplY3QpXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXlpc2ggKHN1YmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXkoc3ViamVjdCkgfHwgQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpIHx8XG4gICAgICBzdWJqZWN0ICYmIHR5cGVvZiBzdWJqZWN0ID09PSAnb2JqZWN0JyAmJlxuICAgICAgdHlwZW9mIHN1YmplY3QubGVuZ3RoID09PSAnbnVtYmVyJ1xufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGIgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGlmIChiIDw9IDB4N0YpXG4gICAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSlcbiAgICBlbHNlIHtcbiAgICAgIHZhciBzdGFydCA9IGlcbiAgICAgIGlmIChiID49IDB4RDgwMCAmJiBiIDw9IDB4REZGRikgaSsrXG4gICAgICB2YXIgaCA9IGVuY29kZVVSSUNvbXBvbmVudChzdHIuc2xpY2Uoc3RhcnQsIGkrMSkpLnN1YnN0cigxKS5zcGxpdCgnJScpXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGgubGVuZ3RoOyBqKyspXG4gICAgICAgIGJ5dGVBcnJheS5wdXNoKHBhcnNlSW50KGhbal0sIDE2KSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoc3RyKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIHBvc1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKVxuICAgICAgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBkZWNvZGVVdGY4Q2hhciAoc3RyKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzdHIpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4RkZGRCkgLy8gVVRGIDggaW52YWxpZCBjaGFyXG4gIH1cbn1cblxuLypcbiAqIFdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHZhbHVlIGlzIGEgdmFsaWQgaW50ZWdlci4gVGhpcyBtZWFucyB0aGF0IGl0XG4gKiBpcyBub24tbmVnYXRpdmUuIEl0IGhhcyBubyBmcmFjdGlvbmFsIGNvbXBvbmVudCBhbmQgdGhhdCBpdCBkb2VzIG5vdFxuICogZXhjZWVkIHRoZSBtYXhpbXVtIGFsbG93ZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHZlcmlmdWludCAodmFsdWUsIG1heCkge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPj0gMCwgJ3NwZWNpZmllZCBhIG5lZ2F0aXZlIHZhbHVlIGZvciB3cml0aW5nIGFuIHVuc2lnbmVkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGlzIGxhcmdlciB0aGFuIG1heGltdW0gdmFsdWUgZm9yIHR5cGUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnNpbnQgKHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZklFRUU3NTQgKHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxufVxuXG5mdW5jdGlvbiBhc3NlcnQgKHRlc3QsIG1lc3NhZ2UpIHtcbiAgaWYgKCF0ZXN0KSB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSB8fCAnRmFpbGVkIGFzc2VydGlvbicpXG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJ1ZmZlclxcXFxpbmRleC5qc1wiLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxidWZmZXJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5leHBvcnRzLnJlYWQgPSBmdW5jdGlvbiAoYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbVxuICB2YXIgZUxlbiA9IChuQnl0ZXMgKiA4KSAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgbkJpdHMgPSAtN1xuICB2YXIgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwXG4gIHZhciBkID0gaXNMRSA/IC0xIDogMVxuICB2YXIgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxuXG4gIGkgKz0gZFxuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIHMgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IGVMZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IChlICogMjU2KSArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIGUgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IG1MZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IChtICogMjU2KSArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhc1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pXG4gICAgZSA9IGUgLSBlQmlhc1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pXG59XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbiAoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGNcbiAgdmFyIGVMZW4gPSAobkJ5dGVzICogOCkgLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKVxuICB2YXIgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpXG4gIHZhciBkID0gaXNMRSA/IDEgOiAtMVxuICB2YXIgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpXG5cbiAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHkpIHtcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDBcbiAgICBlID0gZU1heFxuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKVxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcbiAgICAgIGUtLVxuICAgICAgYyAqPSAyXG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlICs9IHJ0ICogTWF0aC5wb3coMiwgMSAtIGVCaWFzKVxuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrK1xuICAgICAgYyAvPSAyXG4gICAgfVxuXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XG4gICAgICBtID0gMFxuICAgICAgZSA9IGVNYXhcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKCh2YWx1ZSAqIGMpIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IGUgKyBlQmlhc1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSAwXG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCkge31cblxuICBlID0gKGUgPDwgbUxlbikgfCBtXG4gIGVMZW4gKz0gbUxlblxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4XG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGllZWU3NTRcXFxcaW5kZXguanNcIixcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcaWVlZTc1NFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxwcm9jZXNzXFxcXGJyb3dzZXIuanNcIixcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxccHJvY2Vzc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcblwidXNlIHN0cmljdFwiO1xyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gIFxyXG4gICAgICAgICAgblBhbmVsQ291bnQgPSA0XHJcblxyXG4tLS0tLS0tLS0tcGFuZWxDb250YWluZXItLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC0tLXBhbmVsLS0tICAgICAgIC0tLXBhbmVsLS0tXHJcbiAgICB8ICAgIDEgICAgIHwgICAgICB8ICAgIDIgICAgfFxyXG4gICAgfF9fX19fX19fX198ICAgICAgfF9fX19fX19fX3xcclxuXHJcbiAgICAtLS1wYW5lbC0tLSAgICAgICAtLS1wYW5lbC0tLVxyXG4gICAgfCAgICAzICAgICB8ICAgICAgfCAgICA0ICAgIHxcclxuICAgIHxfX19fX19fX19ffCAgICAgIHxfX19fX19fX198XHJcblxyXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgICBCdXR0b25zIC0gIGF1ZGlvL3ZpZGVvTXV0ZSwgc2NyZWVuU2hhcmUsIFJlY29yZCwgQ2hhdFxyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLk1lZXRpbmdVSSA9IHZvaWQgMDtcclxudmFyIHZlY3Rvcl9pY29uXzEgPSByZXF1aXJlKFwiLi92ZWN0b3JfaWNvblwiKTtcclxudmFyIE1lZGlhVHlwZV8xID0gcmVxdWlyZShcIi4vaml0c2kvTWVkaWFUeXBlXCIpO1xyXG52YXIgVXNlclByb3BlcnR5XzEgPSByZXF1aXJlKFwiLi9qaXRzaS9Vc2VyUHJvcGVydHlcIik7XHJcbnZhciBQYW5lbFZpZGVvU3RhdGU7XHJcbihmdW5jdGlvbiAoUGFuZWxWaWRlb1N0YXRlKSB7XHJcbiAgICBQYW5lbFZpZGVvU3RhdGVbXCJOb0NhbWVyYVwiXSA9IFwibm8tY2FtZXJhXCI7XHJcbiAgICBQYW5lbFZpZGVvU3RhdGVbXCJTY3JlZW5TaGFyZVwiXSA9IFwic2NyZWVuXCI7XHJcbiAgICBQYW5lbFZpZGVvU3RhdGVbXCJDYW1lcmFcIl0gPSBcImNhbWVyYVwiO1xyXG4gICAgUGFuZWxWaWRlb1N0YXRlW1wiVmlkZW9TdHJlYW1pbmdcIl0gPSBcInN0cmVhbVwiO1xyXG59KShQYW5lbFZpZGVvU3RhdGUgfHwgKFBhbmVsVmlkZW9TdGF0ZSA9IHt9KSk7XHJcbnZhciBNZWV0aW5nVUkgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBNZWV0aW5nVUkobWVldGluZykge1xyXG4gICAgICAgIHRoaXMuTUFYX1BBTkVMUyA9IDk7XHJcbiAgICAgICAgdGhpcy5uUGFuZWxDb3VudCA9IDA7XHJcbiAgICAgICAgdGhpcy5wYW5lbENvbnRhaW5lcklkID0gXCJ2aWRlby1wYW5lbFwiO1xyXG4gICAgICAgIHRoaXMucGFuZWxDb250YWluZXJFbGVtZW50ID0gbnVsbDtcclxuICAgICAgICB0aGlzLnRvb2xiYXJJZCA9IFwibmV3LXRvb2xib3hcIjtcclxuICAgICAgICB0aGlzLnRvb2xiYXJFbGVtZW50ID0gbnVsbDtcclxuICAgICAgICB0aGlzLnBhbmVsQ2xhc3MgPSBcInZpZGVvY29udGFpbmVyXCI7IC8vZXZlcnkgcGFuZWwgZWxlbWVudHMgaGF2ZSB0aGlzIGNsYXNzXHJcbiAgICAgICAgdGhpcy52aWRlb0VsZW1lbnRDbGFzcyA9IFwidmlkZW8tZWxlbWVudFwiO1xyXG4gICAgICAgIHRoaXMuc2hvcnROYW1lQ2xhc3MgPSBcImF2YXRhci1jb250YWluZXJcIjtcclxuICAgICAgICB0aGlzLm1vZGVyYXRvckNsYXNzID0gXCJtb2RlcmF0b3ItaWNvblwiO1xyXG4gICAgICAgIHRoaXMuYXVkaW9NdXRlQ2xhc3MgPSBcImF1ZGlvTXV0ZWRcIjtcclxuICAgICAgICB0aGlzLnZpZGVvTXV0ZUNsYXNzID0gXCJ2aWRlb011dGVkXCI7XHJcbiAgICAgICAgdGhpcy5wb3B1cE1lbnVDbGFzcyA9IFwicG9wdXAtbWVudVwiO1xyXG4gICAgICAgIHRoaXMucG9wdXBNZW51QnV0dG9uQ2xhc3MgPSBcInJlbW90ZXZpZGVvbWVudVwiO1xyXG4gICAgICAgIHRoaXMudXNlck5hbWVDbGFzcyA9IFwiZGlzcGxheW5hbWVcIjtcclxuICAgICAgICB0aGlzLmFjdGl2ZVNwZWFrZXJDbGFzcyA9IFwiYWN0aXZlLXNwZWFrZXJcIjtcclxuICAgICAgICB0aGlzLmZ1bGxzY3JlZW5DbGFzcyA9IFwidmlkZW8tZnVsbHNjcmVlblwiO1xyXG4gICAgICAgIHRoaXMuaW5pdFRvcEluZm8gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm5QYW5lbEluc3RhbmNlSWQgPSAxOyAvL2luY3JlYXNlZCB3aGVuIGFkZCBuZXcsIGJ1dCBub3QgZGVjcmVhc2VkIHdoZW4gcmVtb3ZlIHBhbmVsXHJcbiAgICAgICAgdGhpcy5tZWV0aW5nID0gbnVsbDtcclxuICAgICAgICB0aGlzLm1lZXRpbmcgPSBtZWV0aW5nO1xyXG4gICAgICAgIHRoaXMucGFuZWxDb250YWluZXJFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5wYW5lbENvbnRhaW5lcklkKTtcclxuICAgICAgICB0aGlzLnRvb2xiYXJFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy50b29sYmFySWQpO1xyXG4gICAgICAgIHRoaXMudG9vbGJhckF1ZGlvQnV0dG9uRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWljLWVuYWJsZVwiKTtcclxuICAgICAgICB0aGlzLnRvb2xiYXJWaWRlb0J1dHRvbkVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NhbWVyYS1lbmFibGVcIik7XHJcbiAgICAgICAgdGhpcy50b29sYmFyRGVza3RvcFNoYXJlQnV0dG9uRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2hhcmVcIik7XHJcbiAgICAgICAgdGhpcy50b29sYmFyUmVjb3JkQnV0dG9uRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmVjb3JkXCIpO1xyXG4gICAgICAgIHRoaXMudG9vbGJhckNoYXRCdXR0b25FbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGF0XCIpO1xyXG4gICAgICAgIHRoaXMudG9vbGJhckxlYXZlQnV0dG9uRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbGVhdmVcIik7XHJcbiAgICAgICAgdGhpcy5zdWJqZWN0RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc3ViamVjdC10ZXh0XCIpO1xyXG4gICAgICAgIHRoaXMudGltZXN0YW1wRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc3ViamVjdC10aW1lclwiKTtcclxuICAgICAgICB0aGlzLnRvcEluZm9iYXJFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zdWJqZWN0XCIpO1xyXG4gICAgICAgIHRoaXMucmVnaXN0ZXJFdmVudEhhbmRsZXJzKCk7XHJcbiAgICAgICAgdGhpcy5yZWdpc3RlckV4dGVybmFsQ2FsbGJhY2tzKCk7XHJcbiAgICB9XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLnJlZ2lzdGVyRXh0ZXJuYWxDYWxsYmFja3MgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzXzEgPSB0aGlzO1xyXG4gICAgICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJChfdGhpc18xLnRvb2xiYXJMZWF2ZUJ1dHRvbkVsZW1lbnQpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzXzEubWVldGluZy5zdG9wKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUucmVnaXN0ZXJFdmVudEhhbmRsZXJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBfdGhpc18xID0gdGhpcztcclxuICAgICAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgX3RoaXNfMS5yZWZyZXNoQ2FyZFZpZXdzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3VubG9hZCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgX3RoaXNfMS5tZWV0aW5nLmZvcmNlU3RvcCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgX3RoaXNfMS5yZWZyZXNoQ2FyZFZpZXdzKCk7XHJcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IF90aGlzXzE7XHJcbiAgICAgICAgICAgICQoXCIjY29udGVudFwiKS5ob3ZlcihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkKF90aGlzXzEudG9vbGJhckVsZW1lbnQpLmFkZENsYXNzKFwidmlzaWJsZVwiKTtcclxuICAgICAgICAgICAgICAgIGlmIChfdGhpc18xLmluaXRUb3BJbmZvKVxyXG4gICAgICAgICAgICAgICAgICAgICQoX3RoaXNfMS50b3BJbmZvYmFyRWxlbWVudCkuYWRkQ2xhc3MoXCJ2aXNpYmxlXCIpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkKF90aGlzXzEudG9vbGJhckVsZW1lbnQpLnJlbW92ZUNsYXNzKFwidmlzaWJsZVwiKTtcclxuICAgICAgICAgICAgICAgIGlmIChfdGhpc18xLmluaXRUb3BJbmZvKVxyXG4gICAgICAgICAgICAgICAgICAgICQoX3RoaXNfMS50b3BJbmZvYmFyRWxlbWVudCkucmVtb3ZlQ2xhc3MoXCJ2aXNpYmxlXCIpO1xyXG4gICAgICAgICAgICB9KS5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkKFwiLlwiICsgX3RoaXNfMS5wb3B1cE1lbnVDbGFzcykucmVtb3ZlQ2xhc3MoXCJ2aXNpYmxlXCIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJChcIiNtaWMtZW5hYmxlXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzXzEubWVldGluZy5PblRvZ2dsZU11dGVNeUF1ZGlvKCk7XHJcbiAgICAgICAgICAgICAgICAvKnZhciBlbCA9ICQodGhpcykuZmluZChcIi50b29sYm94LWljb25cIik7XHJcbiAgICAgICAgICAgICAgICBlbC50b2dnbGVDbGFzcyhcInRvZ2dsZWRcIik7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWwuaGFzQ2xhc3MoXCJ0b2dnbGVkXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGVsLmZpbmQoXCJzdmdcIikuYXR0cihcInZpZXdCb3hcIiwgXCIwIDAgMjIgMjJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgZWwuZmluZChcInBhdGhcIikuYXR0cihcImRcIiwgXCJNNy4zMzMgOC42NVYxMWEzLjY2OCAzLjY2OCAwIDAwMi43NTcgMy41NTMuOTI4LjkyOCAwIDAwLS4wMDcuMTE0djEuNzU3QTUuNTAxIDUuNTAxIDAgMDE1LjUgMTFhLjkxNy45MTcgMCAxMC0xLjgzMyAwYzAgMy43NCAyLjc5OSA2LjgyNiA2LjQxNiA3LjI3N3YuOTczYS45MTcuOTE3IDAgMDAxLjgzNCAwdi0uOTczYTcuMjk3IDcuMjk3IDAgMDAzLjU2OC0xLjQ3NWwzLjA5MSAzLjA5MmEuOTMyLjkzMiAwIDEwMS4zMTgtMS4zMThsLTMuMDkxLTMuMDkxLjAxLS4wMTMtMS4zMTEtMS4zMTEtLjAxLjAxMy0xLjMyNS0xLjMyNS4wMDgtLjAxNC0xLjM5NS0xLjM5NWExLjI0IDEuMjQgMCAwMS0uMDA0LjAxOGwtMy42MS0zLjYwOXYtLjAyM0w3LjMzNCA1Ljk5M3YuMDIzbC0zLjkwOS0zLjkxYS45MzIuOTMyIDAgMTAtMS4zMTggMS4zMThMNy4zMzMgOC42NXptMS44MzQgMS44MzRWMTFhMS44MzMgMS44MzMgMCAwMDIuMjkxIDEuNzc2bC0yLjI5MS0yLjI5MnptMy42ODIgMy42ODNjLS4yOS4xNy0uNjA2LjMtLjk0LjM4NmEuOTI4LjkyOCAwIDAxLjAwOC4xMTR2MS43NTdhNS40NyA1LjQ3IDAgMDAyLjI1Ny0uOTMybC0xLjMyNS0xLjMyNXptMS44MTgtMy40NzZsLTEuODM0LTEuODM0VjUuNWExLjgzMyAxLjgzMyAwIDAwLTMuNjQ0LS4yODdsLTEuNDMtMS40M0EzLjY2NiAzLjY2NiAwIDAxMTQuNjY3IDUuNXY1LjE5em0xLjY2NSAxLjY2NWwxLjQ0NyAxLjQ0N2MuMzU3LS44NjQuNTU0LTEuODEuNTU0LTIuODAzYS45MTcuOTE3IDAgMTAtMS44MzMgMGMwIC40NjgtLjA1OC45MjItLjE2OCAxLjM1NnpcIik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsLmZpbmQoXCJzdmdcIikuYXR0cihcInZpZXdCb3hcIiwgXCIwIDAgMjQgMjRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgZWwuZmluZChcInBhdGhcIikuYXR0cihcImRcIiwgXCJNMTYgNmE0IDQgMCAwMC04IDB2NmE0LjAwMiA0LjAwMiAwIDAwMy4wMDggMy44NzZjLS4wMDUuMDQtLjAwOC4wODItLjAwOC4xMjR2MS45MTdBNi4wMDIgNi4wMDIgMCAwMTYgMTJhMSAxIDAgMTAtMiAwIDguMDAxIDguMDAxIDAgMDA3IDcuOTM4VjIxYTEgMSAwIDEwMiAwdi0xLjA2MkE4LjAwMSA4LjAwMSAwIDAwMjAgMTJhMSAxIDAgMTAtMiAwIDYuMDAyIDYuMDAyIDAgMDEtNSA1LjkxN1YxNmMwLS4wNDItLjAwMy0uMDgzLS4wMDgtLjEyNEE0LjAwMiA0LjAwMiAwIDAwMTYgMTJWNnptLTQtMmEyIDIgMCAwMC0yIDJ2NmEyIDIgMCAxMDQgMFY2YTIgMiAwIDAwLTItMnpcIik7XHJcbiAgICAgICAgICAgICAgICB9Ki9cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQoXCIjY2FtZXJhLWVuYWJsZVwiKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpc18xLm1lZXRpbmcuT25Ub2dnbGVNdXRlTXlWaWRlbygpO1xyXG4gICAgICAgICAgICAgICAgLyp2YXIgZWwgPSAkKHRoaXMpLmZpbmQoXCIudG9vbGJveC1pY29uXCIpO1xyXG4gICAgICAgICAgICAgICAgZWwudG9nZ2xlQ2xhc3MoXCJ0b2dnbGVkXCIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsLmhhc0NsYXNzKFwidG9nZ2xlZFwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsLmZpbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTSA2Ljg0IDUuNSBoIC0wLjAyMiBMIDMuNDI0IDIuMTA2IGEgMC45MzIgMC45MzIgMCAxIDAgLTEuMzE4IDEuMzE4IEwgNC4xODIgNS41IGggLTAuNTE1IGMgLTEuMDEzIDAgLTEuODM0IDAuODIgLTEuODM0IDEuODMzIHYgNy4zMzQgYyAwIDEuMDEyIDAuODIxIDEuODMzIDEuODM0IDEuODMzIEggMTMuNzUgYyAwLjQwNCAwIDAuNzc3IC0wLjEzIDEuMDggLTAuMzUyIGwgMy43NDYgMy43NDYgYSAwLjkzMiAwLjkzMiAwIDEgMCAxLjMxOCAtMS4zMTggbCAtNC4zMSAtNC4zMSB2IC0wLjAyNCBMIDEzLjc1IDEyLjQxIHYgMC4wMjMgbCAtNS4xIC01LjA5OSBoIDAuMDI0IEwgNi44NDEgNS41IFogbSA2LjkxIDQuMjc0IFYgNy4zMzMgaCAtMi40NCBMIDkuNDc1IDUuNSBoIDQuMjc0IGMgMS4wMTIgMCAxLjgzMyAwLjgyIDEuODMzIDEuODMzIHYgMC43ODYgbCAzLjIxMiAtMS44MzUgYSAwLjkxNyAwLjkxNyAwIDAgMSAxLjM3MiAwLjc5NiB2IDcuODQgYyAwIDAuMzQ0IC0wLjE5IDAuNjQ0IC0wLjQ3IDAuOCBsIC0zLjczNiAtMy43MzUgbCAyLjM3MiAxLjM1NiBWIDguNjU5IGwgLTIuNzUgMS41NzEgdiAxLjM3NyBMIDEzLjc1IDkuNzc0IFogTSAzLjY2NyA3LjMzNCBoIDIuMzQ5IGwgNy4zMzMgNy4zMzMgSCAzLjY2NyBWIDcuMzMzIFpcIik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsLmZpbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTTEzLjc1IDUuNUgzLjY2N2MtMS4wMTMgMC0xLjgzNC44Mi0xLjgzNCAxLjgzM3Y3LjMzNGMwIDEuMDEyLjgyMSAxLjgzMyAxLjgzNCAxLjgzM0gxMy43NWMxLjAxMiAwIDEuODMzLS44MiAxLjgzMy0xLjgzM3YtLjc4NmwzLjIxMiAxLjgzNWEuOTE2LjkxNiAwIDAwMS4zNzItLjc5NlY3LjA4YS45MTcuOTE3IDAgMDAtMS4zNzItLjc5NmwtMy4yMTIgMS44MzV2LS43ODZjMC0xLjAxMi0uODItMS44MzMtMS44MzMtMS44MzN6bTAgMy42Njd2NS41SDMuNjY3VjcuMzMzSDEzLjc1djEuODM0em00LjU4MyA0LjE3NGwtMi43NS0xLjU3MnYtMS41MzhsMi43NS0xLjU3MnY0LjY4MnpcIik7XHJcbiAgICAgICAgICAgICAgICB9Ki9cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQoXCIjc2hhcmVcIikuY2xpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGVsID0gJCh0aGlzKS5maW5kKFwiLnRvb2xib3gtaWNvblwiKTtcclxuICAgICAgICAgICAgICAgIGVsLnRvZ2dsZUNsYXNzKFwidG9nZ2xlZFwiKTtcclxuICAgICAgICAgICAgICAgIGlmIChlbC5oYXNDbGFzcyhcInRvZ2dsZWRcIikpIHtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJChfdGhpc18xLnRvb2xiYXJDaGF0QnV0dG9uRWxlbWVudCkub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGVsID0gJCh0aGlzKS5maW5kKFwiLnRvb2xib3gtaWNvblwiKTtcclxuICAgICAgICAgICAgICAgIGVsLnRvZ2dsZUNsYXNzKFwidG9nZ2xlZFwiKTtcclxuICAgICAgICAgICAgICAgIGlmIChlbC5oYXNDbGFzcyhcInRvZ2dsZWRcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKFwiI3ZpZGVvLXBhbmVsXCIpLmFkZENsYXNzKFwic2hpZnQtcmlnaHRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiNuZXctdG9vbGJveFwiKS5hZGRDbGFzcyhcInNoaWZ0LXJpZ2h0XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoXCIjc2lkZVRvb2xiYXJDb250YWluZXJcIikucmVtb3ZlQ2xhc3MoXCJpbnZpc2libGVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiN1c2VybXNnXCIpLmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkKFwiI3ZpZGVvLXBhbmVsXCIpLnJlbW92ZUNsYXNzKFwic2hpZnQtcmlnaHRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiNuZXctdG9vbGJveFwiKS5yZW1vdmVDbGFzcyhcInNoaWZ0LXJpZ2h0XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoXCIjc2lkZVRvb2xiYXJDb250YWluZXJcIikuYWRkQ2xhc3MoXCJpbnZpc2libGVcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5yZWZyZXNoQ2FyZFZpZXdzKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKFwiLmNoYXQtaGVhZGVyIC5qaXRzaS1pY29uXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICQoXCIjY2hhdFwiKS5maW5kKFwiLnRvb2xib3gtaWNvblwiKS5yZW1vdmVDbGFzcyhcInRvZ2dsZWRcIik7XHJcbiAgICAgICAgICAgICAgICAkKFwiI3ZpZGVvLXBhbmVsXCIpLnJlbW92ZUNsYXNzKFwic2hpZnQtcmlnaHRcIik7XHJcbiAgICAgICAgICAgICAgICAkKFwiI25ldy10b29sYm94XCIpLnJlbW92ZUNsYXNzKFwic2hpZnQtcmlnaHRcIik7XHJcbiAgICAgICAgICAgICAgICAkKFwiI3NpZGVUb29sYmFyQ29udGFpbmVyXCIpLmFkZENsYXNzKFwiaW52aXNpYmxlXCIpO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMucmVmcmVzaENhcmRWaWV3cygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJChcIiN1c2VybXNnXCIpLmtleXByZXNzKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKGUua2V5Q29kZSB8fCBlLndoaWNoKSA9PSAxMykgeyAvL0VudGVyIGtleWNvZGVcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZS5zaGlmdEtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc21zID0gJCh0aGlzKS52YWwoKS50b1N0cmluZygpLnRyaW0oKTtcclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnZhbCgnJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNtcyA9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHNtcyA9IF90aGlzLmVtb25hbWVUb0Vtb2ljb24oc21zKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGltZSA9IF90aGlzLmdldEN1clRpbWUoKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsID0gJChcIiNjaGF0Y29udmVyc2F0aW9uIGRpdi5jaGF0LW1lc3NhZ2UtZ3JvdXA6bGFzdC1jaGlsZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsLmhhc0NsYXNzKFwibG9jYWxcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsLmZpbmQoXCIudGltZXN0YW1wXCIpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWwuYXBwZW5kKCc8ZGl2IGNsYXNzPSBcImNoYXRtZXNzYWdlLXdyYXBwZXJcIiA+XFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNoYXRtZXNzYWdlIFwiPlxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVwbHl3cmFwcGVyXCI+XFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVzc2FnZWNvbnRlbnRcIj5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlcm1lc3NhZ2VcIj4nICsgc21zICsgJzwvZGl2PlxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aW1lc3RhbXBcIj4nICsgdGltZSArICc8L2Rpdj5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2ID4nKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCIjY2hhdGNvbnZlcnNhdGlvblwiKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJjaGF0LW1lc3NhZ2UtZ3JvdXAgbG9jYWxcIj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSBcImNoYXRtZXNzYWdlLXdyYXBwZXJcIiA+XFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjaGF0bWVzc2FnZSBcIj5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZXBseXdyYXBwZXJcIj5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVzc2FnZWNvbnRlbnRcIj5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVzZXJtZXNzYWdlXCI+JyArIHNtcyArICc8L2Rpdj5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRpbWVzdGFtcFwiPicgKyB0aW1lICsgJzwvZGl2PlxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2ID5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zY3JvbGxUb0JvdHRvbSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHNlbmQgc21zIHRvIHJlbW90ZVxyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLm1lZXRpbmcuc2VuZENoYXRNZXNzYWdlKHNtcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKF90aGlzXzEudG9vbGJhckRlc2t0b3BTaGFyZUJ1dHRvbkVsZW1lbnQpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgX3RoaXNfMS5tZWV0aW5nLnRvZ2dsZVNjcmVlblNoYXJlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKF90aGlzXzEudG9vbGJhclJlY29yZEJ1dHRvbkVsZW1lbnQpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzXzEubWVldGluZy50b2dnbGVSZWNvcmRpbmcoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQoXCIuc21pbGV5Q29udGFpbmVyXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpZCA9ICQodGhpcykuYXR0cihcImlkXCIpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGltb25hbWUgPSBfdGhpcy5pZFRvRW1vbmFtZShpZCk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhpbW9uYW1lKTtcclxuICAgICAgICAgICAgICAgIHZhciBzZW5kZWwgPSAkKFwiI3VzZXJtc2dcIik7XHJcbiAgICAgICAgICAgICAgICB2YXIgc21zID0gc2VuZGVsLnZhbCgpO1xyXG4gICAgICAgICAgICAgICAgc21zICs9IGltb25hbWU7XHJcbiAgICAgICAgICAgICAgICBzZW5kZWwudmFsKHNtcyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgZWwgPSAkKFwiLnNtaWxleXMtcGFuZWxcIik7XHJcbiAgICAgICAgICAgICAgICBlbC5yZW1vdmVDbGFzcyhcInNob3ctc21pbGV5c1wiKTtcclxuICAgICAgICAgICAgICAgIGVsLmFkZENsYXNzKFwiaGlkZS1zbWlsZXlzXCIpO1xyXG4gICAgICAgICAgICAgICAgc2VuZGVsLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKFwiI3NtaWxleXNcIikuY2xpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGVsID0gJChcIi5zbWlsZXlzLXBhbmVsXCIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsLmhhc0NsYXNzKFwiaGlkZS1zbWlsZXlzXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWwucmVtb3ZlQ2xhc3MoXCJoaWRlLXNtaWxleXNcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgZWwuYWRkQ2xhc3MoXCJzaG93LXNtaWxleXNcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBlbC5yZW1vdmVDbGFzcyhcInNob3ctc21pbGV5c1wiKTtcclxuICAgICAgICAgICAgICAgICAgICBlbC5hZGRDbGFzcyhcImhpZGUtc21pbGV5c1wiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5yZWdpc3RlclBhbmVsRXZlbnRIYW5kbGVyID0gZnVuY3Rpb24gKHBhbmVsKSB7XHJcbiAgICAgICAgdmFyIHBvcHVwTWVudUNsYXNzID0gdGhpcy5wb3B1cE1lbnVDbGFzcztcclxuICAgICAgICB2YXIgcG9wdXBNZW51QnV0dG9uQ2xhc3MgPSB0aGlzLnBvcHVwTWVudUJ1dHRvbkNsYXNzO1xyXG4gICAgICAgIHZhciBwYW5lbENvbnRhaW5lckVsZW1lbnQgPSB0aGlzLnBhbmVsQ29udGFpbmVyRWxlbWVudDtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgICQocGFuZWwpXHJcbiAgICAgICAgICAgIC5vbignY2xpY2snLCBcIi5cIiArIHBvcHVwTWVudUJ1dHRvbkNsYXNzLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAkKHBhbmVsQ29udGFpbmVyRWxlbWVudCkuZmluZChcIi5cIiArIHBvcHVwTWVudUNsYXNzKS5yZW1vdmVDbGFzcyhcInZpc2libGVcIik7XHJcbiAgICAgICAgICAgICQodGhpcykuZmluZChcIi5cIiArIHBvcHVwTWVudUNsYXNzKS50b2dnbGVDbGFzcyhcInZpc2libGVcIik7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgLm9uKCdjbGljaycsICcuZ3JhbnQtbW9kZXJhdG9yJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KFwiLlwiICsgcG9wdXBNZW51Q2xhc3MpLnJlbW92ZUNsYXNzKFwidmlzaWJsZVwiKTtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgJy5hdWRpby1tdXRlJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KFwiLlwiICsgcG9wdXBNZW51Q2xhc3MpLnJlbW92ZUNsYXNzKFwidmlzaWJsZVwiKTtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgJy52aWRlby1tdXRlJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KFwiLlwiICsgcG9wdXBNZW51Q2xhc3MpLnJlbW92ZUNsYXNzKFwidmlzaWJsZVwiKTtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgJy5mdWxsc2NyZWVuJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KFwiLlwiICsgcG9wdXBNZW51Q2xhc3MpLnJlbW92ZUNsYXNzKFwidmlzaWJsZVwiKTtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgJChwYW5lbCkudG9nZ2xlQ2xhc3MoXCJ2aWRlby1mdWxsc2NyZWVuXCIpO1xyXG4gICAgICAgICAgICBfdGhpcy5yZWZyZXNoQ2FyZFZpZXdzKCk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJkaXNwbGF5LXZpZGVvXCIpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKFwiZGlzcGxheS1uYW1lLW9uLXZpZGVvXCIpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5vbignbW91c2VvdXQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJkaXNwbGF5LW5hbWUtb24tdmlkZW9cIik7XHJcbiAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJkaXNwbGF5LXZpZGVvXCIpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5vbignZGJsY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAkKHRoaXMpLmNsb3Nlc3QoXCIuXCIgKyBwb3B1cE1lbnVDbGFzcykucmVtb3ZlQ2xhc3MoXCJ2aXNpYmxlXCIpO1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAkKHBhbmVsKS50b2dnbGVDbGFzcyhcInZpZGVvLWZ1bGxzY3JlZW5cIik7XHJcbiAgICAgICAgICAgIF90aGlzLnJlZnJlc2hDYXJkVmlld3MoKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLl9nZXRQYW5lbEZyb21WaWRlb0VsZW1lbnQgPSBmdW5jdGlvbiAodmlkZW9FbGVtKSB7XHJcbiAgICAgICAgcmV0dXJuIHZpZGVvRWxlbS5wYXJlbnROb2RlO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuX2dldFZpZGVvRWxlbWVudEZyb21QYW5lbCA9IGZ1bmN0aW9uIChwYW5lbCkge1xyXG4gICAgICAgIHJldHVybiAkKFwiLlwiICsgdGhpcy52aWRlb0VsZW1lbnRDbGFzcywgcGFuZWwpWzBdO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuX2dldFNob3J0TmFtZUVsZW1lbnRGcm9tUGFuZWwgPSBmdW5jdGlvbiAocGFuZWwpIHtcclxuICAgICAgICByZXR1cm4gJChcIi5cIiArIHRoaXMuc2hvcnROYW1lQ2xhc3MsIHBhbmVsKVswXTtcclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLl9nZXRBdWRpb011dGVFbGVtZW50RnJvbVBhbmVsID0gZnVuY3Rpb24gKHBhbmVsKSB7XHJcbiAgICAgICAgcmV0dXJuICQoXCIuXCIgKyB0aGlzLmF1ZGlvTXV0ZUNsYXNzLCBwYW5lbClbMF07XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5fZ2V0VmlkZW9NdXRlRWxlbWVudEZyb21QYW5lbCA9IGZ1bmN0aW9uIChwYW5lbCkge1xyXG4gICAgICAgIHJldHVybiAkKFwiLlwiICsgdGhpcy52aWRlb011dGVDbGFzcywgcGFuZWwpWzBdO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuX2dldE1vZGVyYXRvclN0YXJFbGVtZW50RnJvbVBhbmVsID0gZnVuY3Rpb24gKHBhbmVsKSB7XHJcbiAgICAgICAgcmV0dXJuICQoXCIuXCIgKyB0aGlzLm1vZGVyYXRvckNsYXNzLCBwYW5lbClbMF07XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5fZ2V0TmFtZUVsZW1lbnRGcm9tUGFuZWwgPSBmdW5jdGlvbiAocGFuZWwpIHtcclxuICAgICAgICByZXR1cm4gJChcIi5cIiArIHRoaXMudXNlck5hbWVDbGFzcywgcGFuZWwpWzBdO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuX2dldFBvcHVwTWVudUdyYW50TW9kZXJhdG9yRnJvbVBhbmVsID0gZnVuY3Rpb24gKHBhbmVsKSB7XHJcbiAgICAgICAgcmV0dXJuICQoXCJsaS5ncmFudC1tb2RlcmF0b3JcIiwgcGFuZWwpWzBdO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuX2dldFBvcHVwTWVudUF1ZGlvTXV0ZUZyb21QYW5lbCA9IGZ1bmN0aW9uIChwYW5lbCkge1xyXG4gICAgICAgIHJldHVybiAkKFwibGkuYXVkaW8tbXV0ZVwiLCBwYW5lbClbMF07XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5fZ2V0UG9wdXBNZW51VmlkZW9NdXRlRnJvbVBhbmVsID0gZnVuY3Rpb24gKHBhbmVsKSB7XHJcbiAgICAgICAgcmV0dXJuICQoXCJsaS52aWRlby1tdXRlXCIsIHBhbmVsKVswXTtcclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLl9nZXRQb3B1cE1lbnVGdWxsc2NyZWVuRnJvbVBhbmVsID0gZnVuY3Rpb24gKHBhbmVsKSB7XHJcbiAgICAgICAgcmV0dXJuICQoXCJsaS5mdWxsc2NyZWVuXCIsIHBhbmVsKVswXTtcclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLnRvZ2dsZU1pY3JvcGhvbmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGlzRGlzYWJsZSA9ICQoXCIjbmF2TWljcm9waG9uZUJ1dHRvblwiKS5oYXNDbGFzcygnbWljLWRpc2FibGUnKTtcclxuICAgICAgICBpZiAoaXNEaXNhYmxlKSB7XHJcbiAgICAgICAgICAgICQoXCIjbmF2TWljcm9waG9uZUJ1dHRvblwiKS5yZW1vdmVDbGFzcyhcIm1pYy1kaXNhYmxlXCIpO1xyXG4gICAgICAgICAgICAkKFwiI25hdk1pY3JvcGhvbmVCdXR0b24gaW1nXCIpLmF0dHIoXCJzcmNcIiwgXCIuLi9pbWcvbWljLnBuZ1wiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICQoXCIjbmF2TWljcm9waG9uZUJ1dHRvblwiKS5hZGRDbGFzcygnbWljLWRpc2FibGUnKTtcclxuICAgICAgICAgICAgJChcIiNuYXZNaWNyb3Bob25lQnV0dG9uIGltZ1wiKS5hdHRyKCdzcmMnLCAnLi4vaW1nL211dGUucG5nJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUudG9nZ2xlQ2FtZXJhID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBpc0Rpc2FibGUgPSAkKFwiI25hdkNhbWVyYUJ1dHRvblwiKS5oYXNDbGFzcygnY2FtZXJhLWRpc2FibGUnKTtcclxuICAgICAgICBpZiAoaXNEaXNhYmxlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0VmlkZW8oMCwgMSk7XHJcbiAgICAgICAgICAgICQoXCIjbmF2Q2FtZXJhQnV0dG9uXCIpLnJlbW92ZUNsYXNzKFwiY2FtZXJhLWRpc2FibGVcIik7XHJcbiAgICAgICAgICAgICQoXCIjbmF2Q2FtZXJhQnV0dG9uIGltZ1wiKS5hdHRyKFwic3JjXCIsIFwiLi4vaW1nL2NhbWVyYS5wbmdcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNldFZpZGVvKDAsIDApO1xyXG4gICAgICAgICAgICAkKFwiI25hdkNhbWVyYUJ1dHRvblwiKS5hZGRDbGFzcygnY2FtZXJhLWRpc2FibGUnKTtcclxuICAgICAgICAgICAgJChcIiNuYXZDYW1lcmFCdXR0b24gaW1nXCIpLmF0dHIoJ3NyYycsICcuLi9pbWcvY2FtZXJhLW9mZi5wbmcnKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS50b2dnbGVDaGF0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBjb3VudCA9ICQoXCIjbGF5b3V0IC5wLTUtbS1hdXRvXCIpLmxlbmd0aDtcclxuICAgICAgICBpZiAoY291bnQgPT0gMCkge1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLnNldEF1ZGlvID0gZnVuY3Rpb24gKGluZGV4LCBzdGF0dXMpIHtcclxuICAgICAgICBpZiAoc3RhdHVzID09IDApIHsgLy9kaXNhYmxlXHJcbiAgICAgICAgICAgICQoXCIjcGllY2UtXCIgKyBpbmRleCArIFwiIGltZy5hdWQtYmFja1wiKS5hdHRyKFwic3JjXCIsIFwiLi4vaW1nL211dGUucG5nXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChzdGF0dXMgPT0gMSkgeyAvL2VuYWJsZVxyXG4gICAgICAgICAgICAkKFwiI3BpZWNlLVwiICsgaW5kZXggKyBcIiBpbWcuYXVkLWJhY2tcIikuYXR0cihcInNyY1wiLCBcIi4uL2ltZy9taWMucG5nXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHsgLy8gMiBzcGVha2luZ1xyXG4gICAgICAgICAgICAkKFwiI3BpZWNlLVwiICsgaW5kZXggKyBcIiBpbWcuYXVkLWJhY2tcIikuYXR0cihcInNyY1wiLCBcIi4uL2ltZy9zcGVha2luZy5wbmdcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuc2V0QXVkaW9TdGF0dXMgPSBmdW5jdGlvbiAoaW5kZXgpIHtcclxuICAgICAgICBpZiAoJChcIiNwaWVjZS1cIiArIGluZGV4ICsgXCIgYnV0dG9uLm1pYy1idXR0b25cIikuaGFzQ2xhc3MoJ21pYy1kaXNhYmxlJykpIHtcclxuICAgICAgICAgICAgJChcIiNwaWVjZS1cIiArIGluZGV4ICsgXCIgYnV0dG9uLm1pYy1idXR0b25cIikucmVtb3ZlQ2xhc3MoJ21pYy1kaXNhYmxlJyk7XHJcbiAgICAgICAgICAgICQoXCIjcGllY2UtXCIgKyBpbmRleCArIFwiIGJ1dHRvbi5taWMtYnV0dG9uXCIpLmFkZENsYXNzKCdtaWMtZW5hYmxlJyk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0QXVkaW8oaW5kZXgsIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICgkKFwiI3BpZWNlLVwiICsgaW5kZXggKyBcIiBidXR0b24ubWljLWJ1dHRvblwiKS5oYXNDbGFzcygnbWljLWVuYWJsZScpKSB7XHJcbiAgICAgICAgICAgICQoXCIjcGllY2UtXCIgKyBpbmRleCArIFwiIGJ1dHRvbi5taWMtYnV0dG9uXCIpLnJlbW92ZUNsYXNzKCdtaWMtZW5hYmxlJyk7XHJcbiAgICAgICAgICAgICQoXCIjcGllY2UtXCIgKyBpbmRleCArIFwiIGJ1dHRvbi5taWMtYnV0dG9uXCIpLmFkZENsYXNzKCdtaWMtZGlzYWJsZScpO1xyXG4gICAgICAgICAgICB0aGlzLnNldEF1ZGlvKGluZGV4LCAwKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5zZXRWaWRlbyA9IGZ1bmN0aW9uIChpbmRleCwgc3RhdHVzKSB7XHJcbiAgICAgICAgaWYgKHN0YXR1cyA9PSAxKSB7XHJcbiAgICAgICAgICAgICQoXCIjcGllY2UtXCIgKyBpbmRleCArIFwiIGltZy52aWQtYmFja1wiKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgJChcIiNwaWVjZS1cIiArIGluZGV4KS5hcHBlbmQoXCI8dmlkZW8gLz5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAkKFwiI3BpZWNlLVwiICsgaW5kZXggKyBcIiB2aWRlb1wiKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgJChcIiNwaWVjZS1cIiArIGluZGV4KS5hcHBlbmQoXCI8aW1nIHNyYz0nLi4vaW1nL3Bvc3Rlci5wbmcnIGNsYXNzPSd2aWQtYmFjaycvPlwiKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5hY3RpdmF0ZVZpZGVvUGFuZWwgPSBmdW5jdGlvbiAoaW5kZXgsIHN0YXR1cykge1xyXG4gICAgICAgIGlmIChzdGF0dXMpIHtcclxuICAgICAgICAgICAgJChcIiNwaWVjZS1cIiArIGluZGV4ICsgXCIgaW1nLnZpZC1iYWNrXCIpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAkKFwiI3BpZWNlLVwiICsgaW5kZXgpLmFwcGVuZChcIjx2aWRlbyBhdXRvcGxheSBwbGF5c2lubGluZSBpbmRleD1cXFwiXCIgKyBpbmRleCArIFwiXFxcIi8+XCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgJChcIiNwaWVjZS1cIiArIGluZGV4ICsgXCIgdmlkZW9cIikucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICQoXCIjcGllY2UtXCIgKyBpbmRleCkuYXBwZW5kKFwiPGltZyBzcmM9Jy4uL2ltZy9wb3N0ZXIucG5nJyBjbGFzcz0ndmlkLWJhY2snLz5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuYWN0aXZhdGVBdWRpb0J1dHRvbiA9IGZ1bmN0aW9uIChpbmRleCwgc3RhdHVzKSB7XHJcbiAgICAgICAgaWYgKCFzdGF0dXMpIHsgLy9kaXNhYmxlXHJcbiAgICAgICAgICAgICQoXCIjcGllY2UtXCIgKyBpbmRleCArIFwiIGltZy5hdWQtYmFja1wiKS5hdHRyKFwic3JjXCIsIFwiLi4vaW1nL211dGUucG5nXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChzdGF0dXMpIHsgLy9lbmFibGVcclxuICAgICAgICAgICAgJChcIiNwaWVjZS1cIiArIGluZGV4ICsgXCIgaW1nLmF1ZC1iYWNrXCIpLmF0dHIoXCJzcmNcIiwgXCIuLi9pbWcvbWljLnBuZ1wiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7IC8vIDIgc3BlYWtpbmdcclxuICAgICAgICAgICAgJChcIiNwaWVjZS1cIiArIGluZGV4ICsgXCIgaW1nLmF1ZC1iYWNrXCIpLmF0dHIoXCJzcmNcIiwgXCIuLi9pbWcvc3BlYWtpbmcucG5nXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLmdldEVtcHR5VmlkZW9QYW5lbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcGFuZWwgPSB0aGlzLmFkZE5ld1BhbmVsKCk7XHJcbiAgICAgICAgdGhpcy5yZWdpc3RlclBhbmVsRXZlbnRIYW5kbGVyKHBhbmVsKTtcclxuICAgICAgICAvL2JvdHRvbSBzbWFsbCBpY29uc1xyXG4gICAgICAgIHRoaXMuX2dldFZpZGVvTXV0ZUVsZW1lbnRGcm9tUGFuZWwocGFuZWwpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICB0aGlzLl9nZXRBdWRpb011dGVFbGVtZW50RnJvbVBhbmVsKHBhbmVsKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgdGhpcy5fZ2V0TW9kZXJhdG9yU3RhckVsZW1lbnRGcm9tUGFuZWwocGFuZWwpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICB2YXIgdmlkZW9FbGVtID0gdGhpcy5fZ2V0VmlkZW9FbGVtZW50RnJvbVBhbmVsKHBhbmVsKTtcclxuICAgICAgICByZXR1cm4gdmlkZW9FbGVtO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUudXBkYXRlUGFuZWxPbkppdHNpVXNlciA9IGZ1bmN0aW9uICh2aWRlb0VsZW0sIG15SW5mbywgdXNlcikge1xyXG4gICAgICAgIHZhciBfdGhpc18xID0gdGhpcztcclxuICAgICAgICB2YXIgcGFuZWwgPSB0aGlzLl9nZXRQYW5lbEZyb21WaWRlb0VsZW1lbnQodmlkZW9FbGVtKTtcclxuICAgICAgICBpZiAoIXBhbmVsKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgLy9zZXQgbmFtZVxyXG4gICAgICAgIHRoaXMuc2V0VXNlck5hbWUodXNlci5nZXREaXNwbGF5TmFtZSgpLCB2aWRlb0VsZW0pO1xyXG4gICAgICAgIC8vaGlkZSBzaG90bmFtZSBpZiBleGlzdCB2aXNpYmxlIHZpZGVvIHRyYWNrXHJcbiAgICAgICAgdmFyIGlzVmlzaWJsZVZpZGVvID0gZmFsc2U7XHJcbiAgICAgICAgdXNlci5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uICh0cmFjaykge1xyXG4gICAgICAgICAgICBpZiAodHJhY2suZ2V0VHlwZSgpID09PSBNZWRpYVR5cGVfMS5NZWRpYVR5cGUuVklERU8gJiYgIXRyYWNrLmlzTXV0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgaXNWaXNpYmxlVmlkZW8gPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zZXRTaG90bmFtZVZpc2libGUoIWlzVmlzaWJsZVZpZGVvLCB2aWRlb0VsZW0pO1xyXG4gICAgICAgIC8vYm90dG9tIHNtYWxsIGljb25zXHJcbiAgICAgICAgdGhpcy5fZ2V0VmlkZW9NdXRlRWxlbWVudEZyb21QYW5lbChwYW5lbCkuc3R5bGUuZGlzcGxheSA9IHVzZXIuaXNWaWRlb011dGVkKCkgPyBcImJsb2NrXCIgOiBcIm5vbmVcIjtcclxuICAgICAgICB0aGlzLl9nZXRBdWRpb011dGVFbGVtZW50RnJvbVBhbmVsKHBhbmVsKS5zdHlsZS5kaXNwbGF5ID0gdXNlci5pc0F1ZGlvTXV0ZWQoKSA/IFwiYmxvY2tcIiA6IFwibm9uZVwiO1xyXG4gICAgICAgIHRoaXMuX2dldE1vZGVyYXRvclN0YXJFbGVtZW50RnJvbVBhbmVsKHBhbmVsKS5zdHlsZS5kaXNwbGF5ID0gdXNlci5nZXRQcm9wZXJ0eShVc2VyUHJvcGVydHlfMS5Vc2VyUHJvcGVydHkuaXNNb2RlcmF0b3IpID8gXCJibG9ja1wiIDogXCJub25lXCI7XHJcbiAgICAgICAgLy9wb3B1cCBtZW51XHJcbiAgICAgICAgdmFyIGF1ZGlvTXV0ZVBvcHVwTWVudSA9IHRoaXMuX2dldFBvcHVwTWVudUF1ZGlvTXV0ZUZyb21QYW5lbChwYW5lbCk7XHJcbiAgICAgICAgdmFyIHZpZGVvTXV0ZVBvcHVwTWVudSA9IHRoaXMuX2dldFBvcHVwTWVudVZpZGVvTXV0ZUZyb21QYW5lbChwYW5lbCk7XHJcbiAgICAgICAgdmFyIGdyYW50TW9kZXJhdG9yUG9wdXBNZW51ID0gdGhpcy5fZ2V0UG9wdXBNZW51R3JhbnRNb2RlcmF0b3JGcm9tUGFuZWwocGFuZWwpO1xyXG4gICAgICAgIGlmIChteUluZm8uSXNIb3N0KSB7XHJcbiAgICAgICAgICAgIHZhciB1c2VySGF2ZUNhbWVyYV8xID0gZmFsc2UsIHVzZXJIYXZlTWljcm9waG9uZV8xID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHVzZXIuZ2V0VHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbiAodHJhY2spIHtcclxuICAgICAgICAgICAgICAgIGlmICh0cmFjay5nZXRUeXBlKCkgPT09IE1lZGlhVHlwZV8xLk1lZGlhVHlwZS5WSURFTylcclxuICAgICAgICAgICAgICAgICAgICB1c2VySGF2ZUNhbWVyYV8xID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRyYWNrLmdldFR5cGUoKSA9PT0gTWVkaWFUeXBlXzEuTWVkaWFUeXBlLkFVRElPKVxyXG4gICAgICAgICAgICAgICAgICAgIHVzZXJIYXZlTWljcm9waG9uZV8xID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHZpZGVvTXV0ZVBvcHVwTWVudS5zdHlsZS5kaXNwbGF5ID0gdXNlckhhdmVDYW1lcmFfMSA/IFwiZmxleFwiIDogXCJub25lXCI7XHJcbiAgICAgICAgICAgIGF1ZGlvTXV0ZVBvcHVwTWVudS5zdHlsZS5kaXNwbGF5ID0gdXNlckhhdmVNaWNyb3Bob25lXzEgPyBcImZsZXhcIiA6IFwibm9uZVwiO1xyXG4gICAgICAgICAgICBncmFudE1vZGVyYXRvclBvcHVwTWVudS5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2aWRlb011dGVQb3B1cE1lbnUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICBhdWRpb011dGVQb3B1cE1lbnUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICBncmFudE1vZGVyYXRvclBvcHVwTWVudS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh1c2VyLmdldFByb3BlcnR5KFVzZXJQcm9wZXJ0eV8xLlVzZXJQcm9wZXJ0eS5pc01vZGVyYXRvcikpXHJcbiAgICAgICAgICAgIGdyYW50TW9kZXJhdG9yUG9wdXBNZW51LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAvL3BvcHVwIG1lbnUgYXVkaW8gaWNvbi9sYWJlbCBjaGFuZ2VcclxuICAgICAgICBpZiAoYXVkaW9NdXRlUG9wdXBNZW51LnN0eWxlLmRpc3BsYXkgPT09ICdmbGV4Jykge1xyXG4gICAgICAgICAgICBpZiAodXNlci5pc0F1ZGlvTXV0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgJChhdWRpb011dGVQb3B1cE1lbnUpLmZpbmQoXCIubGFiZWxcIikuaHRtbChcIlVubXV0ZSBBdWRpb1wiKTtcclxuICAgICAgICAgICAgICAgICQoYXVkaW9NdXRlUG9wdXBNZW51KS5maW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCB2ZWN0b3JfaWNvbl8xLlZlY3Rvckljb24uQVVESU9fTVVURV9JQ09OKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoYXVkaW9NdXRlUG9wdXBNZW51KS5maW5kKFwiLmxhYmVsXCIpLmh0bWwoXCJNdXRlIEF1ZGlvXCIpO1xyXG4gICAgICAgICAgICAgICAgJChhdWRpb011dGVQb3B1cE1lbnUpLmZpbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIHZlY3Rvcl9pY29uXzEuVmVjdG9ySWNvbi5BVURJT19VTk1VVEVfSUNPTik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZpZGVvTXV0ZVBvcHVwTWVudS5zdHlsZS5kaXNwbGF5ID09PSAnZmxleCcpIHtcclxuICAgICAgICAgICAgaWYgKHVzZXIuaXNWaWRlb011dGVkKCkpIHtcclxuICAgICAgICAgICAgICAgICQodmlkZW9NdXRlUG9wdXBNZW51KS5maW5kKFwiLmxhYmVsXCIpLmh0bWwoXCJVbm11dGUgVmlkZW9cIik7XHJcbiAgICAgICAgICAgICAgICAkKHZpZGVvTXV0ZVBvcHVwTWVudSkuZmluZChcInBhdGhcIikuYXR0cihcImRcIiwgdmVjdG9yX2ljb25fMS5WZWN0b3JJY29uLlZJREVPX01VVEVfSUNPTik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKHZpZGVvTXV0ZVBvcHVwTWVudSkuZmluZChcIi5sYWJlbFwiKS5odG1sKFwiTXV0ZSBWaWRlb1wiKTtcclxuICAgICAgICAgICAgICAgICQodmlkZW9NdXRlUG9wdXBNZW51KS5maW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCB2ZWN0b3JfaWNvbl8xLlZlY3Rvckljb24uVklERU9fVU5NVVRFX0lDT04pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vcG9wdXAgbWVudSBoYW5kbGVyc1xyXG4gICAgICAgIGlmIChteUluZm8uSXNIb3N0KSB7XHJcbiAgICAgICAgICAgICQoZ3JhbnRNb2RlcmF0b3JQb3B1cE1lbnUpLnVuYmluZCgnY2xpY2snKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpc18xLm1lZXRpbmcuZ3JhbnRNb2RlcmF0b3JSb2xlKHVzZXIuZ2V0SWQoKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKGF1ZGlvTXV0ZVBvcHVwTWVudSkudW5iaW5kKCdjbGljaycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzXzEubWVldGluZy5tdXRlVXNlckF1ZGlvKHVzZXIuZ2V0SWQoKSwgIXVzZXIuaXNBdWRpb011dGVkKCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJCh2aWRlb011dGVQb3B1cE1lbnUpLnVuYmluZCgnY2xpY2snKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpc18xLm1lZXRpbmcubXV0ZVVzZXJWaWRlbyh1c2VyLmdldElkKCksICF1c2VyLmlzVmlkZW9NdXRlZCgpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vYWN0aXZlIHNwZWFrZXIoYmx1ZSBib3JkZXIpXHJcbiAgICAgICAgJChwYW5lbCkucmVtb3ZlQ2xhc3ModGhpcy5hY3RpdmVTcGVha2VyQ2xhc3MpO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUudXBkYXRlUGFuZWxPbk15QkdVc2VyID0gZnVuY3Rpb24gKHZpZGVvRWxlbSwgbXlJbmZvLCBsb2NhbFRyYWNrcykge1xyXG4gICAgICAgIHZhciBfdGhpc18xID0gdGhpcztcclxuICAgICAgICB2YXIgcGFuZWwgPSB0aGlzLl9nZXRQYW5lbEZyb21WaWRlb0VsZW1lbnQodmlkZW9FbGVtKTtcclxuICAgICAgICBpZiAoIXBhbmVsKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgdmFyIHVzZXJIYXZlQ2FtZXJhID0gZmFsc2UsIHVzZXJIYXZlTWljcm9waG9uZSA9IGZhbHNlO1xyXG4gICAgICAgIGxvY2FsVHJhY2tzLmZvckVhY2goZnVuY3Rpb24gKHRyYWNrKSB7XHJcbiAgICAgICAgICAgIGlmICh0cmFjay5nZXRUeXBlKCkgPT09IE1lZGlhVHlwZV8xLk1lZGlhVHlwZS5WSURFTylcclxuICAgICAgICAgICAgICAgIHVzZXJIYXZlQ2FtZXJhID0gdHJ1ZTtcclxuICAgICAgICAgICAgZWxzZSBpZiAodHJhY2suZ2V0VHlwZSgpID09PSBNZWRpYVR5cGVfMS5NZWRpYVR5cGUuQVVESU8pXHJcbiAgICAgICAgICAgICAgICB1c2VySGF2ZU1pY3JvcGhvbmUgPSB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBhdWRpb011dGVkID0gZmFsc2UsIHZpZGVvTXV0ZWQgPSBmYWxzZTtcclxuICAgICAgICBsb2NhbFRyYWNrcy5mb3JFYWNoKGZ1bmN0aW9uICh0cmFjaykge1xyXG4gICAgICAgICAgICBpZiAodHJhY2suZ2V0VHlwZSgpID09PSBNZWRpYVR5cGVfMS5NZWRpYVR5cGUuVklERU8gJiYgdHJhY2suaXNNdXRlZCgpKVxyXG4gICAgICAgICAgICAgICAgdmlkZW9NdXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRyYWNrLmdldFR5cGUoKSA9PT0gTWVkaWFUeXBlXzEuTWVkaWFUeXBlLkFVRElPICYmIHRyYWNrLmlzTXV0ZWQoKSlcclxuICAgICAgICAgICAgICAgIGF1ZGlvTXV0ZWQgPSB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vbmFtZVxyXG4gICAgICAgIHRoaXMuc2V0VXNlck5hbWUobXlJbmZvLk5hbWUsIHZpZGVvRWxlbSk7XHJcbiAgICAgICAgdmFyIGlzVmlzaWJsZVZpZGVvID0gZmFsc2U7XHJcbiAgICAgICAgbG9jYWxUcmFja3MuZm9yRWFjaChmdW5jdGlvbiAodHJhY2spIHtcclxuICAgICAgICAgICAgaWYgKHRyYWNrLmdldFR5cGUoKSA9PT0gTWVkaWFUeXBlXzEuTWVkaWFUeXBlLlZJREVPICYmICF0cmFjay5pc011dGVkKCkpIHtcclxuICAgICAgICAgICAgICAgIGlzVmlzaWJsZVZpZGVvID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc2V0U2hvdG5hbWVWaXNpYmxlKCFpc1Zpc2libGVWaWRlbywgdmlkZW9FbGVtKTtcclxuICAgICAgICAvL3BvcHVwIG1lbnVcclxuICAgICAgICB2YXIgYXVkaW9NdXRlUG9wdXBNZW51ID0gdGhpcy5fZ2V0UG9wdXBNZW51QXVkaW9NdXRlRnJvbVBhbmVsKHBhbmVsKTtcclxuICAgICAgICB2YXIgdmlkZW9NdXRlUG9wdXBNZW51ID0gdGhpcy5fZ2V0UG9wdXBNZW51VmlkZW9NdXRlRnJvbVBhbmVsKHBhbmVsKTtcclxuICAgICAgICB2YXIgZ3JhbnRNb2RlcmF0b3JQb3B1cE1lbnUgPSB0aGlzLl9nZXRQb3B1cE1lbnVHcmFudE1vZGVyYXRvckZyb21QYW5lbChwYW5lbCk7XHJcbiAgICAgICAgaWYgKG15SW5mby5Jc0hvc3QpIHtcclxuICAgICAgICAgICAgdmlkZW9NdXRlUG9wdXBNZW51LnN0eWxlLmRpc3BsYXkgPSB1c2VySGF2ZUNhbWVyYSA/IFwiZmxleFwiIDogXCJub25lXCI7XHJcbiAgICAgICAgICAgIGF1ZGlvTXV0ZVBvcHVwTWVudS5zdHlsZS5kaXNwbGF5ID0gdXNlckhhdmVNaWNyb3Bob25lID8gXCJmbGV4XCIgOiBcIm5vbmVcIjtcclxuICAgICAgICAgICAgZ3JhbnRNb2RlcmF0b3JQb3B1cE1lbnUuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmlkZW9NdXRlUG9wdXBNZW51LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgYXVkaW9NdXRlUG9wdXBNZW51LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgZ3JhbnRNb2RlcmF0b3JQb3B1cE1lbnUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBncmFudE1vZGVyYXRvclBvcHVwTWVudS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgLy9wb3B1cCBtZW51IGF1ZGlvIGljb24vbGFiZWwgY2hhbmdlXHJcbiAgICAgICAgaWYgKGF1ZGlvTXV0ZVBvcHVwTWVudS5zdHlsZS5kaXNwbGF5ID09PSAnZmxleCcpIHtcclxuICAgICAgICAgICAgaWYgKG15SW5mby5tZWRpYU11dGUuYXVkaW9NdXRlKSB7XHJcbiAgICAgICAgICAgICAgICAkKGF1ZGlvTXV0ZVBvcHVwTWVudSkuZmluZChcIi5sYWJlbFwiKS5odG1sKFwiVW5tdXRlIEF1ZGlvXCIpO1xyXG4gICAgICAgICAgICAgICAgJChhdWRpb011dGVQb3B1cE1lbnUpLmZpbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIHZlY3Rvcl9pY29uXzEuVmVjdG9ySWNvbi5BVURJT19NVVRFX0lDT04pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJChhdWRpb011dGVQb3B1cE1lbnUpLmZpbmQoXCIubGFiZWxcIikuaHRtbChcIk11dGUgQXVkaW9cIik7XHJcbiAgICAgICAgICAgICAgICAkKGF1ZGlvTXV0ZVBvcHVwTWVudSkuZmluZChcInBhdGhcIikuYXR0cihcImRcIiwgdmVjdG9yX2ljb25fMS5WZWN0b3JJY29uLkFVRElPX1VOTVVURV9JQ09OKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmlkZW9NdXRlUG9wdXBNZW51LnN0eWxlLmRpc3BsYXkgPT09ICdmbGV4Jykge1xyXG4gICAgICAgICAgICBpZiAobXlJbmZvLm1lZGlhTXV0ZS52aWRlb011dGUpIHtcclxuICAgICAgICAgICAgICAgICQodmlkZW9NdXRlUG9wdXBNZW51KS5maW5kKFwiLmxhYmVsXCIpLmh0bWwoXCJVbm11dGUgVmlkZW9cIik7XHJcbiAgICAgICAgICAgICAgICAkKHZpZGVvTXV0ZVBvcHVwTWVudSkuZmluZChcInBhdGhcIikuYXR0cihcImRcIiwgdmVjdG9yX2ljb25fMS5WZWN0b3JJY29uLlZJREVPX01VVEVfSUNPTik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKHZpZGVvTXV0ZVBvcHVwTWVudSkuZmluZChcIi5sYWJlbFwiKS5odG1sKFwiTXV0ZSBWaWRlb1wiKTtcclxuICAgICAgICAgICAgICAgICQodmlkZW9NdXRlUG9wdXBNZW51KS5maW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCB2ZWN0b3JfaWNvbl8xLlZlY3Rvckljb24uVklERU9fVU5NVVRFX0lDT04pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vcG9wdXAgbWVudSBoYW5kbGVyc1xyXG4gICAgICAgIGlmIChteUluZm8uSXNIb3N0KSB7XHJcbiAgICAgICAgICAgICQoYXVkaW9NdXRlUG9wdXBNZW51KS51bmJpbmQoJ2NsaWNrJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgX3RoaXNfMS5tZWV0aW5nLm11dGVNeUF1ZGlvKCFhdWRpb011dGVkKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQodmlkZW9NdXRlUG9wdXBNZW51KS51bmJpbmQoJ2NsaWNrJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgX3RoaXNfMS5tZWV0aW5nLm11dGVNeVZpZGVvKCF2aWRlb011dGVkKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vYm90dG9tIHNtYWxsIGljb25zXHJcbiAgICAgICAgdGhpcy5fZ2V0VmlkZW9NdXRlRWxlbWVudEZyb21QYW5lbChwYW5lbCkuc3R5bGUuZGlzcGxheSA9IHZpZGVvTXV0ZWQgPyBcImJsb2NrXCIgOiBcIm5vbmVcIjtcclxuICAgICAgICB0aGlzLl9nZXRBdWRpb011dGVFbGVtZW50RnJvbVBhbmVsKHBhbmVsKS5zdHlsZS5kaXNwbGF5ID0gYXVkaW9NdXRlZCA/IFwiYmxvY2tcIiA6IFwibm9uZVwiO1xyXG4gICAgICAgIHRoaXMuX2dldE1vZGVyYXRvclN0YXJFbGVtZW50RnJvbVBhbmVsKHBhbmVsKS5zdHlsZS5kaXNwbGF5ID0gbXlJbmZvLklzSG9zdCA/IFwiYmxvY2tcIiA6IFwibm9uZVwiO1xyXG4gICAgICAgIC8vYWN0aXZlIHNwZWFrZXIoYmx1ZSBib3JkZXIpXHJcbiAgICAgICAgJChwYW5lbCkuYWRkQ2xhc3ModGhpcy5hY3RpdmVTcGVha2VyQ2xhc3MpO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuc2V0U2hvdG5hbWVWaXNpYmxlID0gZnVuY3Rpb24gKHNob3csIHZpZGVvRWxlbSkge1xyXG4gICAgICAgIHZhciBwYW5lbCA9IHRoaXMuX2dldFBhbmVsRnJvbVZpZGVvRWxlbWVudCh2aWRlb0VsZW0pO1xyXG4gICAgICAgIHZhciBzaG9ydE5hbWVQYW5lbCA9IHRoaXMuX2dldFNob3J0TmFtZUVsZW1lbnRGcm9tUGFuZWwocGFuZWwpO1xyXG4gICAgICAgIHNob3J0TmFtZVBhbmVsLnN0eWxlLmRpc3BsYXkgPSBzaG93ID8gXCJibG9ja1wiIDogXCJub25lXCI7XHJcbiAgICAgICAgdmlkZW9FbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBzaG93ID8gXCJoaWRkZW5cIiA6IFwidmlzaWJsZVwiO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuc2V0VXNlck5hbWUgPSBmdW5jdGlvbiAobmFtZSwgdmlkZW9FbGVtKSB7XHJcbiAgICAgICAgLy9uYW1lXHJcbiAgICAgICAgdmFyIHBhbmVsID0gdGhpcy5fZ2V0UGFuZWxGcm9tVmlkZW9FbGVtZW50KHZpZGVvRWxlbSk7XHJcbiAgICAgICAgdGhpcy5fZ2V0TmFtZUVsZW1lbnRGcm9tUGFuZWwocGFuZWwpLmlubmVySFRNTCA9IG5hbWU7XHJcbiAgICAgICAgLy9zaG9ydG5hbWVcclxuICAgICAgICB2YXIgc2hvcnROYW1lUGFuZWwgPSB0aGlzLl9nZXRTaG9ydE5hbWVFbGVtZW50RnJvbVBhbmVsKHBhbmVsKTtcclxuICAgICAgICAkKFwidGV4dFwiLCBzaG9ydE5hbWVQYW5lbCkuaHRtbCh0aGlzLmdldFNob3J0TmFtZShuYW1lKSk7XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS51cGRhdGVUb29sYmFyID0gZnVuY3Rpb24gKG15SW5mbywgbG9jYWxUcmFja3MpIHtcclxuICAgICAgICB2YXIgdXNlckhhdmVDYW1lcmEgPSBmYWxzZSwgdXNlckhhdmVNaWNyb3Bob25lID0gZmFsc2U7XHJcbiAgICAgICAgbG9jYWxUcmFja3MuZm9yRWFjaChmdW5jdGlvbiAodHJhY2spIHtcclxuICAgICAgICAgICAgaWYgKHRyYWNrLmdldFR5cGUoKSA9PT0gTWVkaWFUeXBlXzEuTWVkaWFUeXBlLlZJREVPKVxyXG4gICAgICAgICAgICAgICAgdXNlckhhdmVDYW1lcmEgPSB0cnVlO1xyXG4gICAgICAgICAgICBlbHNlIGlmICh0cmFjay5nZXRUeXBlKCkgPT09IE1lZGlhVHlwZV8xLk1lZGlhVHlwZS5BVURJTylcclxuICAgICAgICAgICAgICAgIHVzZXJIYXZlTWljcm9waG9uZSA9IHRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGF1ZGlvTXV0ZWQgPSBmYWxzZSwgdmlkZW9NdXRlZCA9IGZhbHNlO1xyXG4gICAgICAgIGxvY2FsVHJhY2tzLmZvckVhY2goZnVuY3Rpb24gKHRyYWNrKSB7XHJcbiAgICAgICAgICAgIGlmICh0cmFjay5nZXRUeXBlKCkgPT09IE1lZGlhVHlwZV8xLk1lZGlhVHlwZS5WSURFTyAmJiB0cmFjay5pc011dGVkKCkpXHJcbiAgICAgICAgICAgICAgICB2aWRlb011dGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgZWxzZSBpZiAodHJhY2suZ2V0VHlwZSgpID09PSBNZWRpYVR5cGVfMS5NZWRpYVR5cGUuQVVESU8gJiYgdHJhY2suaXNNdXRlZCgpKVxyXG4gICAgICAgICAgICAgICAgYXVkaW9NdXRlZCA9IHRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy50b29sYmFyVmlkZW9CdXR0b25FbGVtZW50LnN0eWxlLmRpc3BsYXkgPSB1c2VySGF2ZUNhbWVyYSA/IFwiYmxvY2tcIiA6IFwibm9uZVwiO1xyXG4gICAgICAgIHRoaXMudG9vbGJhckF1ZGlvQnV0dG9uRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gdXNlckhhdmVNaWNyb3Bob25lID8gXCJibG9ja1wiIDogXCJub25lXCI7XHJcbiAgICAgICAgaWYgKGF1ZGlvTXV0ZWQpIHtcclxuICAgICAgICAgICAgJCh0aGlzLnRvb2xiYXJBdWRpb0J1dHRvbkVsZW1lbnQpLmZpbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIHZlY3Rvcl9pY29uXzEuVmVjdG9ySWNvbi5BVURJT19NVVRFX0lDT04pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgJCh0aGlzLnRvb2xiYXJBdWRpb0J1dHRvbkVsZW1lbnQpLmZpbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIHZlY3Rvcl9pY29uXzEuVmVjdG9ySWNvbi5BVURJT19VTk1VVEVfSUNPTik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2aWRlb011dGVkKSB7XHJcbiAgICAgICAgICAgICQodGhpcy50b29sYmFyVmlkZW9CdXR0b25FbGVtZW50KS5maW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCB2ZWN0b3JfaWNvbl8xLlZlY3Rvckljb24uVklERU9fTVVURV9JQ09OKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICQodGhpcy50b29sYmFyVmlkZW9CdXR0b25FbGVtZW50KS5maW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCB2ZWN0b3JfaWNvbl8xLlZlY3Rvckljb24uVklERU9fVU5NVVRFX0lDT04pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLnNldFNjcmVlblNoYXJlID0gZnVuY3Rpb24gKG9uKSB7XHJcbiAgICAgICAgaWYgKG9uKSB7XHJcbiAgICAgICAgICAgICQoXCIudG9vbGJveC1pY29uXCIsIHRoaXMudG9vbGJhckRlc2t0b3BTaGFyZUJ1dHRvbkVsZW1lbnQpLmFkZENsYXNzKFwidG9nZ2xlZFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICQoXCIudG9vbGJveC1pY29uXCIsIHRoaXMudG9vbGJhckRlc2t0b3BTaGFyZUJ1dHRvbkVsZW1lbnQpLnJlbW92ZUNsYXNzKFwidG9nZ2xlZFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5zZXRSZWNvcmRpbmcgPSBmdW5jdGlvbiAob24pIHtcclxuICAgICAgICBpZiAob24pIHtcclxuICAgICAgICAgICAgJChcIi50b29sYm94LWljb25cIiwgdGhpcy50b29sYmFyUmVjb3JkQnV0dG9uRWxlbWVudCkuYWRkQ2xhc3MoXCJ0b2dnbGVkXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgJChcIi50b29sYm94LWljb25cIiwgdGhpcy50b29sYmFyUmVjb3JkQnV0dG9uRWxlbWVudCkucmVtb3ZlQ2xhc3MoXCJ0b2dnbGVkXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLmdldFNob3J0TmFtZSA9IGZ1bmN0aW9uIChmdWxsTmFtZSkge1xyXG4gICAgICAgIGlmICghZnVsbE5hbWUgfHwgZnVsbE5hbWUubGVuZ3RoIDw9IDEpXHJcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bGxOYW1lLnRvVXBwZXJDYXNlKCkuc3Vic3RyKDAsIDIpO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuZnJlZVZpZGVvUGFuZWwgPSBmdW5jdGlvbiAodmlkZW9FbGVtZW50KSB7XHJcbiAgICAgICAgdmFyIHZpZGVvQ2FyZFZpZXdzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcInZpZGVvLlwiICsgdGhpcy52aWRlb0VsZW1lbnRDbGFzcyk7XHJcbiAgICAgICAgdmFyIE4gPSB2aWRlb0NhcmRWaWV3cy5sZW5ndGg7XHJcbiAgICAgICAgdmFyIGkgPSAwO1xyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBOOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHZpZGVvQ2FyZFZpZXdzW2ldID09IHZpZGVvRWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGN1ckVsZW0gPSB2aWRlb0NhcmRWaWV3c1tpXTtcclxuICAgICAgICAgICAgICAgIHdoaWxlICghJChjdXJFbGVtKS5oYXNDbGFzcyh0aGlzLnBhbmVsQ2xhc3MpKVxyXG4gICAgICAgICAgICAgICAgICAgIGN1ckVsZW0gPSBjdXJFbGVtLnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICBjdXJFbGVtLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucmVmcmVzaENhcmRWaWV3cygpO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuc2hvd01vZGVyYXRvckljb24gPSBmdW5jdGlvbiAocGFuZWwsIHNob3cpIHtcclxuICAgICAgICB0aGlzLl9nZXRNb2RlcmF0b3JTdGFyRWxlbWVudEZyb21QYW5lbChwYW5lbCkuc3R5bGUuZGlzcGxheSA9IHNob3cgPyBcImJsb2NrXCIgOiBcIm5vbmVcIjtcclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLnNldFBhbmVsU3RhdGUgPSBmdW5jdGlvbiAocGFuZWwsIHN0YXRlKSB7XHJcbiAgICAgICAgcGFuZWwuc2V0QXR0cmlidXRlKFwidmlkZW8tc3RhdGVcIiwgXCJcIiArIHN0YXRlKTtcclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLmdldFBhbmVsU3RhdGUgPSBmdW5jdGlvbiAocGFuZWwpIHtcclxuICAgICAgICB2YXIgdmlkZW9TdGF0ZSA9IHBhbmVsLmdldEF0dHJpYnV0ZShcInZpZGVvLXN0YXRlXCIpO1xyXG4gICAgICAgIHJldHVybiB2aWRlb1N0YXRlO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUucmVmcmVzaENhcmRWaWV3cyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgZ3V0dGVyID0gNDA7XHJcbiAgICAgICAgdmFyIHdpZHRoID0gJChcIiNjb250ZW50XCIpLndpZHRoKCkgLSBndXR0ZXI7XHJcbiAgICAgICAgdmFyIGhlaWdodCA9ICQoXCIjY29udGVudFwiKS5oZWlnaHQoKSAtIGd1dHRlcjtcclxuICAgICAgICB2YXIgY291bnQgPSAkKFwiLlwiICsgdGhpcy5wYW5lbENsYXNzKS5sZW5ndGg7XHJcbiAgICAgICAgaWYgKCQoXCIjdmlkZW8tcGFuZWxcIikuaGFzQ2xhc3MoXCJzaGlmdC1yaWdodFwiKSkge1xyXG4gICAgICAgICAgICB3aWR0aCAtPSAzMTU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciB3LCBoO1xyXG4gICAgICAgIGlmICgkKFwiLlwiICsgdGhpcy5wYW5lbENsYXNzKS5oYXNDbGFzcyh0aGlzLmZ1bGxzY3JlZW5DbGFzcykpIHtcclxuICAgICAgICAgICAgJChcIi5cIiArIHRoaXMucGFuZWxDbGFzcykuY3NzKFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XHJcbiAgICAgICAgICAgICQoXCIuXCIgKyB0aGlzLmZ1bGxzY3JlZW5DbGFzcykuY3NzKFwiZGlzcGxheVwiLCBcImlubGluZS1ibG9ja1wiKS5jc3MoXCJoZWlnaHRcIiwgaGVpZ2h0ICsgZ3V0dGVyIC0gNikuY3NzKFwid2lkdGhcIiwgd2lkdGggKyBndXR0ZXIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoXCIuXCIgKyB0aGlzLnBhbmVsQ2xhc3MpLmNzcyhcImRpc3BsYXlcIiwgXCJpbmxpbmUtYmxvY2tcIik7XHJcbiAgICAgICAgaWYgKGNvdW50ID09IDEpIHtcclxuICAgICAgICAgICAgaWYgKHdpZHRoICogOSA+IGhlaWdodCAqIDE2KSB7XHJcbiAgICAgICAgICAgICAgICBoID0gaGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgdyA9IGggKiAxNiAvIDk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB3ID0gd2lkdGg7XHJcbiAgICAgICAgICAgICAgICBoID0gdyAqIDkgLyAxNjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChjb3VudCA9PSAyKSB7XHJcbiAgICAgICAgICAgIGlmICh3aWR0aCA8IDMyMCkge1xyXG4gICAgICAgICAgICAgICAgdyA9IHdpZHRoO1xyXG4gICAgICAgICAgICAgICAgaCA9IHcgKiA5IC8gMTY7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgIGNvbnNvbGUubG9nKFwid1wiLCB3LCBoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICh3aWR0aCAqIDkgPiBoZWlnaHQgKiAxNiAqIDIpIHtcclxuICAgICAgICAgICAgICAgICAgICBoID0gaGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgIHcgPSBoICogMTYgLyA5O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdyA9IHdpZHRoIC8gMjtcclxuICAgICAgICAgICAgICAgICAgICBoID0gdyAqIDkgLyAxNjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChjb3VudCA+IDIgJiYgY291bnQgPCA1KSB7XHJcbiAgICAgICAgICAgIGlmICh3aWR0aCA8IDMyMCkge1xyXG4gICAgICAgICAgICAgICAgdyA9IHdpZHRoO1xyXG4gICAgICAgICAgICAgICAgaCA9IHcgKiA5IC8gMTY7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAod2lkdGggKiA5ID4gaGVpZ2h0ICogMTYpIHtcclxuICAgICAgICAgICAgICAgICAgICBoID0gaGVpZ2h0IC8gMjtcclxuICAgICAgICAgICAgICAgICAgICB3ID0gaCAqIDE2IC8gOTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHcgPSB3aWR0aCAvIDI7XHJcbiAgICAgICAgICAgICAgICAgICAgaCA9IHcgKiA5IC8gMTY7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoY291bnQgPj0gNSAmJiBjb3VudCA8IDcpIHtcclxuICAgICAgICAgICAgaWYgKHdpZHRoIDwgMzIwKSB7XHJcbiAgICAgICAgICAgICAgICB3ID0gd2lkdGg7XHJcbiAgICAgICAgICAgICAgICBoID0gdyAqIDkgLyAxNjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh3aWR0aCA+PSAzMjAgJiYgd2lkdGggPCAxMDAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAod2lkdGggKiA5IC8gMiA+IGhlaWdodCAqIDE2IC8gMykgeyAvLyB3Kmg9IDIqMyBcclxuICAgICAgICAgICAgICAgICAgICBoID0gaGVpZ2h0IC8gMztcclxuICAgICAgICAgICAgICAgICAgICB3ID0gaCAqIDE2IC8gOTtcclxuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiaFwiLCB3LCBoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHcgPSB3aWR0aCAvIDI7XHJcbiAgICAgICAgICAgICAgICAgICAgaCA9IHcgKiA5IC8gMTY7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIndcIiwgdywgaCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAod2lkdGggKiA5IC8gMyA+IGhlaWdodCAqIDE2IC8gMikgeyAvLyB3Kmg9IDIqM1xyXG4gICAgICAgICAgICAgICAgICAgIGggPSBoZWlnaHQgLyAyO1xyXG4gICAgICAgICAgICAgICAgICAgIHcgPSBoICogMTYgLyA5O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdyA9IHdpZHRoIC8gMztcclxuICAgICAgICAgICAgICAgICAgICBoID0gdyAqIDkgLyAxNjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChjb3VudCA+PSA3ICYmIGNvdW50IDwgMTApIHtcclxuICAgICAgICAgICAgaWYgKHdpZHRoIDwgMzIwKSB7XHJcbiAgICAgICAgICAgICAgICB3ID0gd2lkdGg7XHJcbiAgICAgICAgICAgICAgICBoID0gdyAqIDkgLyAxNjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh3aWR0aCA+PSAzMjAgJiYgd2lkdGggPCAxMDAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAod2lkdGggKiA5IC8gMiA+IGhlaWdodCAqIDE2IC8gNCkgeyAvLyB3Kmg9IDIqNFxyXG4gICAgICAgICAgICAgICAgICAgIGggPSBoZWlnaHQgLyA0O1xyXG4gICAgICAgICAgICAgICAgICAgIHcgPSBoICogMTYgLyA5O1xyXG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJoXCIsIHcsIGgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdyA9IHdpZHRoIC8gMjtcclxuICAgICAgICAgICAgICAgICAgICBoID0gdyAqIDkgLyAxNjtcclxuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwid1wiLCB3LCBoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICh3aWR0aCAqIDkgLyAzID4gaGVpZ2h0ICogMTYgLyAzKSB7IC8vIHcqaD0gMiozXHJcbiAgICAgICAgICAgICAgICAgICAgaCA9IGhlaWdodCAvIDM7XHJcbiAgICAgICAgICAgICAgICAgICAgdyA9IGggKiAxNiAvIDk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB3ID0gd2lkdGggLyAzO1xyXG4gICAgICAgICAgICAgICAgICAgIGggPSB3ICogOSAvIDE2O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoXCIuXCIgKyB0aGlzLnBhbmVsQ2xhc3MpLmNzcyhcIndpZHRoXCIsIHcpLmNzcyhcImhlaWdodFwiLCBoKS5maW5kKFwiLmF2YXRhci1jb250YWluZXJcIikuY3NzKFwid2lkdGhcIiwgaCAvIDIpLmNzcyhcImhlaWdodFwiLCBoIC8gMik7XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5hZGROZXdQYW5lbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgY291bnQgPSAkKFwiLlwiICsgdGhpcy5wYW5lbENsYXNzKS5sZW5ndGg7XHJcbiAgICAgICAgaWYgKGNvdW50ID49IHRoaXMuTUFYX1BBTkVMUylcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHZhciBpc1NwZWFrID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIGlzRGlzYWJsZUNhbWVyYSA9IHRydWU7XHJcbiAgICAgICAgdmFyIGlzTXV0ZSA9IHRydWU7XHJcbiAgICAgICAgdmFyIGFjdGl2ZVNwZWFrZXIgPSAnJztcclxuICAgICAgICBpZiAoaXNTcGVhaykge1xyXG4gICAgICAgICAgICBhY3RpdmVTcGVha2VyID0gXCJhY3RpdmUtc3BlYWtlclwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgYXZhdGFyVmlzaWJsZSA9ICcnO1xyXG4gICAgICAgIHZhciBjYW1lcmFTdGF0dXMgPSAnJztcclxuICAgICAgICB2YXIgdmlkZW9UYWcgPSAnJztcclxuICAgICAgICBpZiAoaXNEaXNhYmxlQ2FtZXJhKSB7XHJcbiAgICAgICAgICAgIGF2YXRhclZpc2libGUgPSAndmlzaWJsZSc7XHJcbiAgICAgICAgICAgIGNhbWVyYVN0YXR1cyA9ICc8ZGl2IGNsYXNzPVwiaW5kaWNhdG9yLWNvbnRhaW5lciB2aWRlb011dGVkXCI+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaW5kaWNhdG9yLWljb24tY29udGFpbmVyICB0b29sYmFyLWljb25cIiBpZD1cIlwiPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaml0c2ktaWNvbiBcIj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgaGVpZ2h0PVwiMTNcIiBpZD1cImNhbWVyYS1kaXNhYmxlZFwiIHdpZHRoPVwiMTNcIiB2aWV3Qm94PVwiMCAwIDMyIDMyXCI+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIk00LjM3NSAyLjY4OEwyOCAyNi4zMTNsLTEuNjg4IDEuNjg4LTQuMjUtNC4yNWMtLjE4OC4xMjUtLjUuMjUtLjc1LjI1aC0xNmMtLjc1IDAtMS4zMTMtLjU2My0xLjMxMy0xLjMxM1Y5LjMxM2MwLS43NS41NjMtMS4zMTMgMS4zMTMtMS4zMTNoMUwyLjY4NyA0LjM3NXptMjMuNjI1IDZ2MTQuMjVMMTMuMDYyIDhoOC4yNWMuNzUgMCAxLjM3NS41NjMgMS4zNzUgMS4zMTN2NC42ODh6XCI+PC9wYXRoPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4nO1xyXG4gICAgICAgICAgICB2aWRlb1RhZyA9IFwiPHZpZGVvIGF1dG9wbGF5IHBsYXlzaW5saW5lICBjbGFzcz0nXCIgKyB0aGlzLnZpZGVvRWxlbWVudENsYXNzICsgXCInIGlkPSdyZW1vdGVWaWRlb19cIiArICsrdGhpcy5uUGFuZWxJbnN0YW5jZUlkICsgXCInPjwvdmlkZW8+XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2aWRlb1RhZyA9IFwiPHZpZGVvIGF1dG9wbGF5IHBsYXlzaW5saW5lICBjbGFzcz0nXCIgKyB0aGlzLnZpZGVvRWxlbWVudENsYXNzICsgXCInICBpZD1cXFwicmVtb3RlVmlkZW9fXCIgKyArK3RoaXMublBhbmVsSW5zdGFuY2VJZCArIFwiXFxcIj48L3ZpZGVvPlwiOyAvL3NldCBjYW1lcmEgcGFyYW1ldGVyO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbWljU3RhdHVzID0gJyc7XHJcbiAgICAgICAgdmFyIGF1ZGlvVGFnID0gJyc7XHJcbiAgICAgICAgaWYgKGlzTXV0ZSkge1xyXG4gICAgICAgICAgICBtaWNTdGF0dXMgPSAnPGRpdiBjbGFzcz1cImluZGljYXRvci1jb250YWluZXIgYXVkaW9NdXRlZFwiPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImluZGljYXRvci1pY29uLWNvbnRhaW5lciAgdG9vbGJhci1pY29uXCIgaWQ9XCJcIj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImppdHNpLWljb24gXCI+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGhlaWdodD1cIjEzXCIgaWQ9XCJtaWMtZGlzYWJsZWRcIiB3aWR0aD1cIjEzXCIgdmlld0JveD1cIjAgMCAzMiAzMlwiPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNNS42ODggNGwyMi4zMTMgMjIuMzEzLTEuNjg4IDEuNjg4LTUuNTYzLTUuNTYzYy0xIC42MjUtMi4yNSAxLTMuNDM4IDEuMTg4djQuMzc1aC0yLjYyNXYtNC4zNzVjLTQuMzc1LS42MjUtOC00LjM3NS04LTguOTM4aDIuMjVjMCA0IDMuMzc1IDYuNzUgNy4wNjMgNi43NSAxLjA2MyAwIDIuMTI1LS4yNSAzLjA2My0uNjg4bC0yLjE4OC0yLjE4OGMtLjI1LjA2My0uNTYzLjEyNS0uODc1LjEyNS0yLjE4OCAwLTQtMS44MTMtNC00di0xbC04LTh6TTIwIDE0Ljg3NWwtOC03LjkzOHYtLjI1YzAtMi4xODggMS44MTMtNCA0LTRzNCAxLjgxMyA0IDR2OC4xODh6bTUuMzEzLS4xODdhOC44MjQgOC44MjQgMCAwMS0xLjE4OCA0LjM3NUwyMi41IDE3LjM3NWMuMzc1LS44MTMuNTYzLTEuNjg4LjU2My0yLjY4OGgyLjI1elwiPjwvcGF0aD4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+JztcclxuICAgICAgICAgICAgYXVkaW9UYWcgPSAnPGF1ZGlvPjwvYXVkaW8+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGF1ZGlvVGFnID0gJzxhdWRpbyBhdXRvcGxheT1cIlwiIGlkPVwicmVtb3RlQXVkaW9fXCI+PC9hdWRpbz4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbW9kZXJhdG9yU3RhdHVzID0gJzxkaXYgY2xhc3M9XCJtb2RlcmF0b3ItaWNvbiByaWdodFwiPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpbmRpY2F0b3ItY29udGFpbmVyXCI+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImluZGljYXRvci1pY29uLWNvbnRhaW5lciBmb2N1c2luZGljYXRvciB0b29sYmFyLWljb25cIiBpZD1cIlwiPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJqaXRzaS1pY29uIFwiPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGhlaWdodD1cIjEzXCIgd2lkdGg9XCIxM1wiIHZpZXdCb3g9XCIwIDAgMzIgMzJcIj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMTYgMjAuNTYzbDUgMy0xLjMxMy01LjY4OEwyNC4xMjUgMTRsLTUuODc1LS41TDE2IDguMTI1IDEzLjc1IDEzLjVsLTUuODc1LjUgNC40MzggMy44NzVMMTEgMjMuNTYzem0xMy4zMTMtOC4yNWwtNy4yNSA2LjMxMyAyLjE4OCA5LjM3NS04LjI1LTUtOC4yNSA1IDIuMTg4LTkuMzc1LTcuMjUtNi4zMTMgOS41NjMtLjgxMyAzLjc1LTguODEzIDMuNzUgOC44MTN6XCI+PC9wYXRoPiBcXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj4gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4nO1xyXG4gICAgICAgIHZhciBwYW5lbEh0bWwgPSBcIlxcbiAgICAgICAgPHNwYW4gY2xhc3M9XFxcIlwiICsgdGhpcy5wYW5lbENsYXNzICsgXCIgZGlzcGxheS12aWRlbyBcIiArIGFjdGl2ZVNwZWFrZXIgKyBcIlxcXCI+XFxuICAgICAgICAgICAgXCIgKyB2aWRlb1RhZyArIFwiIFxcbiAgICAgICAgICAgIFwiICsgYXVkaW9UYWcgKyBcIlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInZpZGVvY29udGFpbmVyX190b29sYmFyXFxcIj5cXG4gICAgICAgICAgICAgICAgPGRpdj4gXCIgKyBjYW1lcmFTdGF0dXMgKyBcIiBcIiArIG1pY1N0YXR1cyArIFwiIFwiICsgbW9kZXJhdG9yU3RhdHVzICsgXCI8L2Rpdj5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ2aWRlb2NvbnRhaW5lcl9faG92ZXJPdmVybGF5XFxcIj48L2Rpdj5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJkaXNwbGF5TmFtZUNvbnRhaW5lclxcXCI+PHNwYW4gY2xhc3M9XFxcImRpc3BsYXluYW1lXFxcIiBpZD1cXFwibG9jYWxEaXNwbGF5TmFtZVxcXCI+TmFtZTwvc3Bhbj48L2Rpdj5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJhdmF0YXItY29udGFpbmVyIFwiICsgYXZhdGFyVmlzaWJsZSArIFwiXFxcIiBzdHlsZT1cXFwiaGVpZ2h0OiAxMDUuNXB4OyB3aWR0aDogMTA1LjVweDtcXFwiPlxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJhdmF0YXIgIHVzZXJBdmF0YXJcXFwiIHN0eWxlPVxcXCJiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIzNCwgMjU1LCAxMjgsIDAuNCk7IGZvbnQtc2l6ZTogMTgwJTsgaGVpZ2h0OiAxMDAlOyB3aWR0aDogMTAwJTtcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgPHN2ZyBjbGFzcz1cXFwiYXZhdGFyLXN2Z1xcXCIgdmlld0JveD1cXFwiMCAwIDEwMCAxMDBcXFwiIHhtbG5zPVxcXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1xcXCIgeG1sbnM6eGxpbms9XFxcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZXh0IGRvbWluYW50LWJhc2VsaW5lPVxcXCJjZW50cmFsXFxcIiBmaWxsPVxcXCJyZ2JhKDI1NSwyNTUsMjU1LC42KVxcXCIgZm9udC1zaXplPVxcXCI0MHB0XFxcIiB0ZXh0LWFuY2hvcj1cXFwibWlkZGxlXFxcIiB4PVxcXCI1MFxcXCIgeT1cXFwiNTBcXFwiPk5hbWU8L3RleHQ+XFxuICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgPC9kaXYgPlxcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJcIiArIHRoaXMucG9wdXBNZW51QnV0dG9uQ2xhc3MgKyBcIlxcXCI+XFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcIlxcXCIgaWQ9XFxcIlxcXCI+XFxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwicG9wb3Zlci10cmlnZ2VyIHJlbW90ZS12aWRlby1tZW51LXRyaWdnZXJcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImppdHNpLWljb25cXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGhlaWdodD1cXFwiMWVtXFxcIiB3aWR0aD1cXFwiMWVtXFxcIiB2aWV3Qm94PVxcXCIwIDAgMjQgMjRcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cXFwiTTEyIDE1Ljk4NGMxLjA3OCAwIDIuMDE2LjkzOCAyLjAxNiAyLjAxNnMtLjkzOCAyLjAxNi0yLjAxNiAyLjAxNlM5Ljk4NCAxOS4wNzggOS45ODQgMThzLjkzOC0yLjAxNiAyLjAxNi0yLjAxNnptMC02YzEuMDc4IDAgMi4wMTYuOTM4IDIuMDE2IDIuMDE2cy0uOTM4IDIuMDE2LTIuMDE2IDIuMDE2UzkuOTg0IDEzLjA3OCA5Ljk4NCAxMiAxMC45MjIgOS45ODQgMTIgOS45ODR6bTAtMS45NjhjLTEuMDc4IDAtMi4wMTYtLjkzOC0yLjAxNi0yLjAxNlMxMC45MjIgMy45ODQgMTIgMy45ODRzMi4wMTYuOTM4IDIuMDE2IDIuMDE2UzEzLjA3OCA4LjAxNiAxMiA4LjAxNnpcXFwiPjwvcGF0aD4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiXCIgKyB0aGlzLnBvcHVwTWVudUNsYXNzICsgXCJcXFwiIHN0eWxlPVxcXCJwb3NpdGlvbjogcmVsYXRpdmU7IHJpZ2h0OiAxNjhweDsgIHRvcDogMjVweDsgd2lkdGg6IDE3NXB4O1xcXCI+XFxuICAgICAgICAgICAgICAgICAgICA8dWwgYXJpYS1sYWJlbD1cXFwiTW9yZSBhY3Rpb25zIG1lbnVcXFwiIGNsYXNzPVxcXCJvdmVyZmxvdy1tZW51XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGkgYXJpYS1sYWJlbD1cXFwiR3JhbnQgTW9kZXJhdG9yXFxcIiBjbGFzcz1cXFwib3ZlcmZsb3ctbWVudS1pdGVtIGdyYW50LW1vZGVyYXRvclxcXCIgdGFiaW5kZXg9XFxcIjBcXFwiIHJvbGU9XFxcImJ1dHRvblxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJvdmVyZmxvdy1tZW51LWl0ZW0taWNvblxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJqaXRzaS1pY29uIFxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyBoZWlnaHQ9XFxcIjIyXFxcIiB3aWR0aD1cXFwiMjJcXFwiIHZpZXdCb3g9XFxcIjAgMCAyNCAyNFxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGwtcnVsZT1cXFwiZXZlbm9kZFxcXCIgY2xpcC1ydWxlPVxcXCJldmVub2RkXFxcIiBkPVxcXCJNMTQgNGEyIDIgMCAwMS0xLjI5OCAxLjg3M2wxLjUyNyA0LjA3LjcxNiAxLjkxMmMuMDYyLjA3NC4xMjYuMDc0LjE2NS4wMzVsMS40NDQtMS40NDQgMi4wMzItMi4wMzJhMiAyIDAgMTExLjI0OC41NzlMMTkgMTlhMiAyIDAgMDEtMiAySDdhMiAyIDAgMDEtMi0yTDQuMTY2IDguOTkzYTIgMiAwIDExMS4yNDgtLjU3OWwyLjAzMyAyLjAzM0w4Ljg5IDExLjg5Yy4wODcuMDQyLjE0NS4wMTYuMTY1LS4wMzVsLjcxNi0xLjkxMiAxLjUyNy00LjA3QTIgMiAwIDExMTQgNHpNNi44NCAxN2wtLjM5My00LjcyNSAxLjAyOSAxLjAzYTIuMSAyLjEgMCAwMDMuNDUxLS43NDhMMTIgOS42OTZsMS4wNzMgMi44NmEyLjEgMi4xIDAgMDAzLjQ1MS43NDhsMS4wMy0xLjAzTDE3LjE2IDE3SDYuODR6XFxcIj48L3BhdGg+ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImxhYmVsXFxcIj5HcmFudCBNb2RlcmF0b3I8L3NwYW4+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGkgYXJpYS1sYWJlbD1cXFwiTXV0ZVxcXCIgY2xhc3M9XFxcIm92ZXJmbG93LW1lbnUtaXRlbSBhdWRpby1tdXRlXFxcIiB0YWJpbmRleD1cXFwiMFxcXCIgcm9sZT1cXFwiYnV0dG9uXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcIm92ZXJmbG93LW1lbnUtaXRlbS1pY29uXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImppdHNpLWljb24gXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGZpbGw9XFxcIm5vbmVcXFwiIGhlaWdodD1cXFwiMjJcXFwiIHdpZHRoPVxcXCIyMlxcXCIgdmlld0JveD1cXFwiMCAwIDIyIDIyXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbC1ydWxlPVxcXCJldmVub2RkXFxcIiBjbGlwLXJ1bGU9XFxcImV2ZW5vZGRcXFwiIGQ9XFxcIk03LjMzMyA4LjY1VjExYTMuNjY4IDMuNjY4IDAgMDAyLjc1NyAzLjU1My45MjguOTI4IDAgMDAtLjAwNy4xMTR2MS43NTdBNS41MDEgNS41MDEgMCAwMTUuNSAxMWEuOTE3LjkxNyAwIDEwLTEuODMzIDBjMCAzLjc0IDIuNzk5IDYuODI2IDYuNDE2IDcuMjc3di45NzNhLjkxNy45MTcgMCAwMDEuODM0IDB2LS45NzNhNy4yOTcgNy4yOTcgMCAwMDMuNTY4LTEuNDc1bDMuMDkxIDMuMDkyYS45MzIuOTMyIDAgMTAxLjMxOC0xLjMxOGwtMy4wOTEtMy4wOTEuMDEtLjAxMy0xLjMxMS0xLjMxMS0uMDEuMDEzLTEuMzI1LTEuMzI1LjAwOC0uMDE0LTEuMzk1LTEuMzk1YTEuMjQgMS4yNCAwIDAxLS4wMDQuMDE4bC0zLjYxLTMuNjA5di0uMDIzTDcuMzM0IDUuOTkzdi4wMjNsLTMuOTA5LTMuOTFhLjkzMi45MzIgMCAxMC0xLjMxOCAxLjMxOEw3LjMzMyA4LjY1em0xLjgzNCAxLjgzNFYxMWExLjgzMyAxLjgzMyAwIDAwMi4yOTEgMS43NzZsLTIuMjkxLTIuMjkyem0zLjY4MiAzLjY4M2MtLjI5LjE3LS42MDYuMy0uOTQuMzg2YS45MjguOTI4IDAgMDEuMDA4LjExNHYxLjc1N2E1LjQ3IDUuNDcgMCAwMDIuMjU3LS45MzJsLTEuMzI1LTEuMzI1em0xLjgxOC0zLjQ3NmwtMS44MzQtMS44MzRWNS41YTEuODMzIDEuODMzIDAgMDAtMy42NDQtLjI4N2wtMS40My0xLjQzQTMuNjY2IDMuNjY2IDAgMDExNC42NjcgNS41djUuMTl6bTEuNjY1IDEuNjY1bDEuNDQ3IDEuNDQ3Yy4zNTctLjg2NC41NTQtMS44MS41NTQtMi44MDNhLjkxNy45MTcgMCAxMC0xLjgzMyAwYzAgLjQ2OC0uMDU4LjkyMi0uMTY4IDEuMzU2elxcXCI+PC9wYXRoPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJsYWJlbFxcXCI+TXV0ZTwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBhcmlhLWxhYmVsPVxcXCJEaXNhYmxlIGNhbWVyYVxcXCIgY2xhc3M9XFxcIm92ZXJmbG93LW1lbnUtaXRlbSB2aWRlby1tdXRlXFxcIiB0YWJpbmRleD1cXFwiMFxcXCIgcm9sZT1cXFwiYnV0dG9uXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcIm92ZXJmbG93LW1lbnUtaXRlbS1pY29uXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImppdHNpLWljb25cXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgZmlsbD1cXFwibm9uZVxcXCIgaGVpZ2h0PVxcXCIyMlxcXCIgd2lkdGg9XFxcIjIyXFxcIiB2aWV3Qm94PVxcXCIwIDAgMjIgMjJcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBjbGlwLXJ1bGU9XFxcImV2ZW5vZGRcXFwiIGQ9XFxcIk02Ljg0IDUuNWgtLjAyMkwzLjQyNCAyLjEwNmEuOTMyLjkzMiAwIDEwLTEuMzE4IDEuMzE4TDQuMTgyIDUuNWgtLjUxNWMtMS4wMTMgMC0xLjgzNC44Mi0xLjgzNCAxLjgzM3Y3LjMzNGMwIDEuMDEyLjgyMSAxLjgzMyAxLjgzNCAxLjgzM0gxMy43NWMuNDA0IDAgLjc3Ny0uMTMgMS4wOC0uMzUybDMuNzQ2IDMuNzQ2YS45MzIuOTMyIDAgMTAxLjMxOC0xLjMxOGwtNC4zMS00LjMxdi0uMDI0TDEzLjc1IDEyLjQxdi4wMjNsLTUuMS01LjA5OWguMDI0TDYuODQxIDUuNXptNi45MSA0LjI3NFY3LjMzM2gtMi40NEw5LjQ3NSA1LjVoNC4yNzRjMS4wMTIgMCAxLjgzMy44MiAxLjgzMyAxLjgzM3YuNzg2bDMuMjEyLTEuODM1YS45MTcuOTE3IDAgMDExLjM3Mi43OTZ2Ny44NGMwIC4zNDQtLjE5LjY0NC0uNDcuOGwtMy43MzYtMy43MzUgMi4zNzIgMS4zNTZWOC42NTlsLTIuNzUgMS41NzF2MS4zNzdMMTMuNzUgOS43NzR6TTMuNjY3IDcuMzM0aDIuMzQ5bDcuMzMzIDcuMzMzSDMuNjY3VjcuMzMzelxcXCI+PC9wYXRoPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJsYWJlbFxcXCI+RGlzYWJsZSBjYW1lcmE8L3NwYW4+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGkgYXJpYS1sYWJlbD1cXFwiVG9nZ2xlIGZ1bGwgc2NyZWVuXFxcIiBjbGFzcz1cXFwib3ZlcmZsb3ctbWVudS1pdGVtIGZ1bGxzY3JlZW5cXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwib3ZlcmZsb3ctbWVudS1pdGVtLWljb25cXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiaml0c2ktaWNvbiBcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgZmlsbD1cXFwibm9uZVxcXCIgaGVpZ2h0PVxcXCIyMlxcXCIgd2lkdGg9XFxcIjIyXFxcIiB2aWV3Qm94PVxcXCIwIDAgMjIgMjJcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBjbGlwLXJ1bGU9XFxcImV2ZW5vZGRcXFwiIGQ9XFxcIk04LjI1IDIuNzVIMy42NjdhLjkxNy45MTcgMCAwMC0uOTE3LjkxN1Y4LjI1aDEuODMzVjQuNTgzSDguMjVWMi43NXptNS41IDEuODMzVjIuNzVoNC41ODNjLjUwNyAwIC45MTcuNDEuOTE3LjkxN1Y4LjI1aC0xLjgzM1Y0LjU4M0gxMy43NXptMCAxMi44MzRoMy42NjdWMTMuNzVoMS44MzN2NC41ODNjMCAuNTA3LS40MS45MTctLjkxNy45MTdIMTMuNzV2LTEuODMzek00LjU4MyAxMy43NXYzLjY2N0g4LjI1djEuODMzSDMuNjY3YS45MTcuOTE3IDAgMDEtLjkxNy0uOTE3VjEzLjc1aDEuODMzelxcXCI+PC9wYXRoPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJsYWJlbCBvdmVyZmxvdy1tZW51LWl0ZW0tdGV4dFxcXCI+VmlldyBmdWxsIHNjcmVlbjwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxcbiAgICAgICAgICAgICAgICAgICAgPC91bD5cXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgPC9zcGFuPlxcbiAgICAgICAgPC9zcGFuID5cIjtcclxuICAgICAgICB2YXIgcGFuZWwgPSAkKHBhbmVsSHRtbCk7XHJcbiAgICAgICAgJChcIiNcIiArIHRoaXMucGFuZWxDb250YWluZXJJZCkuYXBwZW5kKHBhbmVsWzBdKTtcclxuICAgICAgICB0aGlzLnJlZnJlc2hDYXJkVmlld3MoKTtcclxuICAgICAgICByZXR1cm4gcGFuZWxbMF07XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5Mb2cgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgICAgIGlmICgkKFwiI2xvZ1BhbmVsXCIpLmxlbmd0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgIHZhciBsb2dQYW5lbCA9IFwiPGRpdiBpZD1cXFwibG9nUGFuZWxcXFwiIHN0eWxlPVxcXCJwb3NpdGlvbjogZml4ZWQ7d2lkdGg6IDMwMHB4O2hlaWdodDogMjAwcHg7YmFja2dyb3VuZDogYmxhY2s7Ym90dG9tOjBweDtyaWdodDogMHB4O1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgei1pbmRleDogMTAwMDAwO2JvcmRlci1sZWZ0OiAxcHggZGFzaGVkIHJlYmVjY2FwdXJwbGU7Ym9yZGVyLXRvcDogMXB4IGRhc2hlZCByZWJlY2NhcHVycGxlO292ZXJmbG93LXk6YXV0bztcXFwiPjwvZGl2PlwiO1xyXG4gICAgICAgICAgICAkKFwiYm9keVwiKS5hcHBlbmQobG9nUGFuZWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgY29sb3JzID0gWydibGFuY2hlZGFsbW9uZCcsICdob3RwaW5rJywgJ2NoYXJ0cmV1c2UnLCAnY29yYWwnLCAnZ29sZCcsICdncmVlbnllbGxvdycsICd2aW9sZXQnLCAnd2hlYXQnXTtcclxuICAgICAgICB2YXIgY29sb3IgPSBjb2xvcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKSAlIGNvbG9ycy5sZW5ndGhdO1xyXG4gICAgICAgIHZhciBtZXNzYWdlSXRtID0gXCI8ZGl2IHN0eWxlPVxcXCJjb2xvcjpcIiArIGNvbG9yICsgXCI7XFxcIj48c3Bhbj5cIiArIG1lc3NhZ2UgKyBcIjwvc3Bhbj48L2Rpdj5cIjtcclxuICAgICAgICAkKFwiI2xvZ1BhbmVsXCIpLmFwcGVuZChtZXNzYWdlSXRtKTtcclxuICAgICAgICAkKCcjbG9nUGFuZWwnKS5zY3JvbGwoKTtcclxuICAgICAgICAkKFwiI2xvZ1BhbmVsXCIpLmFuaW1hdGUoe1xyXG4gICAgICAgICAgICBzY3JvbGxUb3A6IDIwMDAwXHJcbiAgICAgICAgfSwgMjAwKTtcclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLmlkVG9FbW9uYW1lID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgaWYgKGlkID09ICdzbWlsZXkxJylcclxuICAgICAgICAgICAgcmV0dXJuICc6KSc7XHJcbiAgICAgICAgaWYgKGlkID09ICdzbWlsZXkyJylcclxuICAgICAgICAgICAgcmV0dXJuICc6KCc7XHJcbiAgICAgICAgaWYgKGlkID09ICdzbWlsZXkzJylcclxuICAgICAgICAgICAgcmV0dXJuICc6RCc7XHJcbiAgICAgICAgaWYgKGlkID09ICdzbWlsZXk0JylcclxuICAgICAgICAgICAgcmV0dXJuICc6KzE6JztcclxuICAgICAgICBpZiAoaWQgPT0gJ3NtaWxleTUnKVxyXG4gICAgICAgICAgICByZXR1cm4gJzpQJztcclxuICAgICAgICBpZiAoaWQgPT0gJ3NtaWxleTYnKVxyXG4gICAgICAgICAgICByZXR1cm4gJzp3YXZlOic7XHJcbiAgICAgICAgaWYgKGlkID09ICdzbWlsZXk3JylcclxuICAgICAgICAgICAgcmV0dXJuICc6Ymx1c2g6JztcclxuICAgICAgICBpZiAoaWQgPT0gJ3NtaWxleTgnKVxyXG4gICAgICAgICAgICByZXR1cm4gJzpzbGlnaHRseV9zbWlsaW5nX2ZhY2U6JztcclxuICAgICAgICBpZiAoaWQgPT0gJ3NtaWxleTknKVxyXG4gICAgICAgICAgICByZXR1cm4gJzpzY3JlYW06JztcclxuICAgICAgICBpZiAoaWQgPT0gJ3NtaWxleTEwJylcclxuICAgICAgICAgICAgcmV0dXJuICc6Kic7XHJcbiAgICAgICAgaWYgKGlkID09ICdzbWlsZXkxMScpXHJcbiAgICAgICAgICAgIHJldHVybiAnOi0xOic7XHJcbiAgICAgICAgaWYgKGlkID09ICdzbWlsZXkxMicpXHJcbiAgICAgICAgICAgIHJldHVybiAnOm1hZzonO1xyXG4gICAgICAgIGlmIChpZCA9PSAnc21pbGV5MTMnKVxyXG4gICAgICAgICAgICByZXR1cm4gJzpoZWFydDonO1xyXG4gICAgICAgIGlmIChpZCA9PSAnc21pbGV5MTQnKVxyXG4gICAgICAgICAgICByZXR1cm4gJzppbm5vY2VudDonO1xyXG4gICAgICAgIGlmIChpZCA9PSAnc21pbGV5MTUnKVxyXG4gICAgICAgICAgICByZXR1cm4gJzphbmdyeTonO1xyXG4gICAgICAgIGlmIChpZCA9PSAnc21pbGV5MTYnKVxyXG4gICAgICAgICAgICByZXR1cm4gJzphbmdlbDonO1xyXG4gICAgICAgIGlmIChpZCA9PSAnc21pbGV5MTcnKVxyXG4gICAgICAgICAgICByZXR1cm4gJzsoJztcclxuICAgICAgICBpZiAoaWQgPT0gJ3NtaWxleTE4JylcclxuICAgICAgICAgICAgcmV0dXJuICc6Y2xhcDonO1xyXG4gICAgICAgIGlmIChpZCA9PSAnc21pbGV5MTknKVxyXG4gICAgICAgICAgICByZXR1cm4gJzspJztcclxuICAgICAgICBpZiAoaWQgPT0gJ3NtaWxleTIwJylcclxuICAgICAgICAgICAgcmV0dXJuICc6YmVlcjonO1xyXG4gICAgfTtcclxuICAgIE1lZXRpbmdVSS5wcm90b3R5cGUuZW1vbmFtZVRvRW1vaWNvbiA9IGZ1bmN0aW9uIChzbXMpIHtcclxuICAgICAgICB2YXIgc21zb3V0ID0gc21zO1xyXG4gICAgICAgIHNtc291dCA9IHNtc291dC5yZXBsYWNlKCc6KScsICc8c3BhbiBjbGFzcz1cInNtaWxleVwiIHN0eWxlPVwid2lkdGg6IDIwcHg7IGhlaWdodDoyMHB4O1wiPvCfmIM8L3NwYW4+Jyk7XHJcbiAgICAgICAgc21zb3V0ID0gc21zb3V0LnJlcGxhY2UoJzooJywgJzxzcGFuIGNsYXNzPVwic21pbGV5XCI+8J+Ypjwvc3Bhbj4nKTtcclxuICAgICAgICBzbXNvdXQgPSBzbXNvdXQucmVwbGFjZSgnOkQnLCAnPHNwYW4gY2xhc3M9XCJzbWlsZXlcIj7wn5iEPC9zcGFuPicpO1xyXG4gICAgICAgIHNtc291dCA9IHNtc291dC5yZXBsYWNlKCc6KzE6JywgJzxzcGFuIGNsYXNzPVwic21pbGV5XCI+8J+RjTwvc3Bhbj4nKTtcclxuICAgICAgICBzbXNvdXQgPSBzbXNvdXQucmVwbGFjZSgnOlAnLCAnPHNwYW4gY2xhc3M9XCJzbWlsZXlcIj7wn5ibPC9zcGFuPicpO1xyXG4gICAgICAgIHNtc291dCA9IHNtc291dC5yZXBsYWNlKCc6d2F2ZTonLCAnPHNwYW4gY2xhc3M9XCJzbWlsZXlcIj7wn5GLPC9zcGFuPicpO1xyXG4gICAgICAgIHNtc291dCA9IHNtc291dC5yZXBsYWNlKCc6Ymx1c2g6JywgJzxzcGFuIGNsYXNzPVwic21pbGV5XCI+8J+Yijwvc3Bhbj4nKTtcclxuICAgICAgICBzbXNvdXQgPSBzbXNvdXQucmVwbGFjZSgnOnNsaWdodGx5X3NtaWxpbmdfZmFjZTonLCAnPHNwYW4gY2xhc3M9XCJzbWlsZXlcIj7wn5mCPC9zcGFuPicpO1xyXG4gICAgICAgIHNtc291dCA9IHNtc291dC5yZXBsYWNlKCc6c2NyZWFtOicsICc8c3BhbiBjbGFzcz1cInNtaWxleVwiPvCfmLE8L3NwYW4+Jyk7XHJcbiAgICAgICAgc21zb3V0ID0gc21zb3V0LnJlcGxhY2UoJzoqJywgJzxzcGFuIGNsYXNzPVwic21pbGV5XCI+8J+Ylzwvc3Bhbj4nKTtcclxuICAgICAgICBzbXNvdXQgPSBzbXNvdXQucmVwbGFjZSgnOi0xOicsICc8c3BhbiBjbGFzcz1cInNtaWxleVwiPvCfkY48L3NwYW4+Jyk7XHJcbiAgICAgICAgc21zb3V0ID0gc21zb3V0LnJlcGxhY2UoJzptYWc6JywgJzxzcGFuIGNsYXNzPVwic21pbGV5XCI+8J+UjTwvc3Bhbj4nKTtcclxuICAgICAgICBzbXNvdXQgPSBzbXNvdXQucmVwbGFjZSgnOmhlYXJ0OicsICc8c3BhbiBjbGFzcz1cInNtaWxleVwiPuKdpO+4jzwvc3Bhbj4nKTtcclxuICAgICAgICBzbXNvdXQgPSBzbXNvdXQucmVwbGFjZSgnOmlubm9jZW50OicsICc8c3BhbiBjbGFzcz1cInNtaWxleVwiPvCfmIc8L3NwYW4+Jyk7XHJcbiAgICAgICAgc21zb3V0ID0gc21zb3V0LnJlcGxhY2UoJzphbmdyeTonLCAnPHNwYW4gY2xhc3M9XCJzbWlsZXlcIj7wn5igPC9zcGFuPicpO1xyXG4gICAgICAgIHNtc291dCA9IHNtc291dC5yZXBsYWNlKCc6YW5nZWw6JywgJzxzcGFuIGNsYXNzPVwic21pbGV5XCI+8J+RvDwvc3Bhbj4nKTtcclxuICAgICAgICBzbXNvdXQgPSBzbXNvdXQucmVwbGFjZSgnOygnLCAnPHNwYW4gY2xhc3M9XCJzbWlsZXlcIj7wn5itPC9zcGFuPicpO1xyXG4gICAgICAgIHNtc291dCA9IHNtc291dC5yZXBsYWNlKCc6Y2xhcDonLCAnPHNwYW4gY2xhc3M9XCJzbWlsZXlcIj7wn5GPPC9zcGFuPicpO1xyXG4gICAgICAgIHNtc291dCA9IHNtc291dC5yZXBsYWNlKCc7KScsICc8c3BhbiBjbGFzcz1cInNtaWxleVwiPvCfmIk8L3NwYW4+Jyk7XHJcbiAgICAgICAgc21zb3V0ID0gc21zb3V0LnJlcGxhY2UoJzpiZWVyOicsICc8c3BhbiBjbGFzcz1cInNtaWxleVwiPvCfjbo8L3NwYW4+Jyk7XHJcbiAgICAgICAgcmV0dXJuIHNtc291dDtcclxuICAgIH07XHJcbiAgICBNZWV0aW5nVUkucHJvdG90eXBlLmdldEN1clRpbWUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIHZhciBoID0gZGF0ZS5nZXRIb3VycygpO1xyXG4gICAgICAgIHZhciBtID0gZGF0ZS5nZXRNaW51dGVzKCk7XHJcbiAgICAgICAgdmFyIG1fMiA9IChcIjBcIiArIG0pLnNsaWNlKC0yKTtcclxuICAgICAgICB2YXIgaF8yID0gKFwiMFwiICsgaCkuc2xpY2UoLTIpO1xyXG4gICAgICAgIHZhciB0aW1lID0gaF8yICsgXCI6XCIgKyBtXzI7XHJcbiAgICAgICAgcmV0dXJuIHRpbWU7XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5zY3JvbGxUb0JvdHRvbSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgb3ZlcmhlaWdodCA9IDA7XHJcbiAgICAgICAgJChcIi5jaGF0LW1lc3NhZ2UtZ3JvdXBcIikuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIG92ZXJoZWlnaHQgKz0gJCh0aGlzKS5oZWlnaHQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgbGltaXQgPSAkKCcjY2hhdGNvbnZlcnNhdGlvbicpLmhlaWdodCgpO1xyXG4gICAgICAgIHZhciBwb3MgPSBvdmVyaGVpZ2h0IC0gbGltaXQ7XHJcbiAgICAgICAgJChcIiNjaGF0Y29udmVyc2F0aW9uXCIpLmFuaW1hdGUoeyBzY3JvbGxUb3A6IHBvcyB9LCAyMDApO1xyXG4gICAgfTtcclxuICAgIC8vY2hhdFxyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5yZWNlaXZlTWVzc2FnZSA9IGZ1bmN0aW9uICh1c2VybmFtZSwgbWVzc2FnZSwgdGltZXN0YW1wKSB7XHJcbiAgICAgICAgbWVzc2FnZSA9IHRoaXMuZW1vbmFtZVRvRW1vaWNvbihtZXNzYWdlKTtcclxuICAgICAgICAkKFwiI2NoYXRjb252ZXJzYXRpb25cIikuYXBwZW5kKCc8ZGl2IGNsYXNzPVwiY2hhdC1tZXNzYWdlLWdyb3VwIHJlbW90ZVwiPiBcXFxyXG4gICAgICAgIDxkaXYgY2xhc3M9IFwiY2hhdG1lc3NhZ2Utd3JhcHBlclwiID5cXFxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNoYXRtZXNzYWdlIFwiPlxcXHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJlcGx5d3JhcHBlclwiPlxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZXNzYWdlY29udGVudFwiPlxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGlzcGxheS1uYW1lXCI+JyArIHVzZXJuYW1lICsgJzwvZGl2PlxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlcm1lc3NhZ2VcIj4nICsgbWVzc2FnZSArICc8L2Rpdj5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXFxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcXHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXFxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRpbWVzdGFtcFwiPicgKyB0aGlzLmdldEN1clRpbWUoKSArICc8L2Rpdj5cXFxyXG4gICAgICAgICAgICA8L2RpdiA+XFxcclxuICAgICAgICA8L2Rpdj4nKTtcclxuICAgICAgICB0aGlzLnNjcm9sbFRvQm90dG9tKCk7XHJcbiAgICAgICAgdmFyIGVsID0gJChcIiNjaGF0XCIpLmZpbmQoXCIudG9vbGJveC1pY29uXCIpO1xyXG4gICAgICAgIGVsLmFkZENsYXNzKFwidG9nZ2xlZFwiKTtcclxuICAgICAgICAkKFwiI3ZpZGVvLXBhbmVsXCIpLmFkZENsYXNzKFwic2hpZnQtcmlnaHRcIik7XHJcbiAgICAgICAgJChcIiNuZXctdG9vbGJveFwiKS5hZGRDbGFzcyhcInNoaWZ0LXJpZ2h0XCIpO1xyXG4gICAgICAgICQoXCIjc2lkZVRvb2xiYXJDb250YWluZXJcIikucmVtb3ZlQ2xhc3MoXCJpbnZpc2libGVcIik7XHJcbiAgICAgICAgdGhpcy5yZWZyZXNoQ2FyZFZpZXdzKCk7XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS51cGRhdGVUaW1lID0gZnVuY3Rpb24gKHRpbWVMYWJlbCkge1xyXG4gICAgICAgIHRoaXMudGltZXN0YW1wRWxlbWVudC5pbm5lckhUTUwgPSB0aW1lTGFiZWw7XHJcbiAgICAgICAgaWYgKCF0aGlzLmluaXRUb3BJbmZvKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdFRvcEluZm8gPSB0cnVlO1xyXG4gICAgICAgICAgICAkKHRoaXMudG9wSW5mb2JhckVsZW1lbnQpLmFkZENsYXNzKFwidmlzaWJsZVwiKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTWVldGluZ1VJLnByb3RvdHlwZS5zaG93TWVldGluZ1N1YmplY3QgPSBmdW5jdGlvbiAoc3ViamVjdCkge1xyXG4gICAgICAgIGlmIChzdWJqZWN0ICYmIHN1YmplY3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnN1YmplY3RFbGVtZW50LmlubmVySFRNTCA9IHN1YmplY3Q7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHJldHVybiBNZWV0aW5nVUk7XHJcbn0oKSk7XHJcbmV4cG9ydHMuTWVldGluZ1VJID0gTWVldGluZ1VJO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tZWV0aW5nX3VpLmpzLm1hcFxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9mYWtlXzVhY2I4MDhiLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5NZWRpYVR5cGUgPSB2b2lkIDA7XHJcbnZhciBNZWRpYVR5cGU7XHJcbihmdW5jdGlvbiAoTWVkaWFUeXBlKSB7XHJcbiAgICBNZWRpYVR5cGVbXCJBVURJT1wiXSA9IFwiYXVkaW9cIjtcclxuICAgIE1lZGlhVHlwZVtcIlBSRVNFTlRFUlwiXSA9IFwicHJlc2VudGVyXCI7XHJcbiAgICBNZWRpYVR5cGVbXCJWSURFT1wiXSA9IFwidmlkZW9cIjtcclxufSkoTWVkaWFUeXBlID0gZXhwb3J0cy5NZWRpYVR5cGUgfHwgKGV4cG9ydHMuTWVkaWFUeXBlID0ge30pKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9TWVkaWFUeXBlLmpzLm1hcFxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9qaXRzaVxcXFxNZWRpYVR5cGUuanNcIixcIi9qaXRzaVwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcblwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuVXNlclByb3BlcnR5ID0gdm9pZCAwO1xyXG52YXIgVXNlclByb3BlcnR5O1xyXG4oZnVuY3Rpb24gKFVzZXJQcm9wZXJ0eSkge1xyXG4gICAgVXNlclByb3BlcnR5W1widmlkZW9FbGVtXCJdID0gXCJ2aWRlb0VsZW1cIjtcclxuICAgIFVzZXJQcm9wZXJ0eVtcImlzTW9kZXJhdG9yXCJdID0gXCJpc01vZGVyYXRvclwiO1xyXG59KShVc2VyUHJvcGVydHkgPSBleHBvcnRzLlVzZXJQcm9wZXJ0eSB8fCAoZXhwb3J0cy5Vc2VyUHJvcGVydHkgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1Vc2VyUHJvcGVydHkuanMubWFwXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2ppdHNpXFxcXFVzZXJQcm9wZXJ0eS5qc1wiLFwiL2ppdHNpXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5WZWN0b3JJY29uID0gdm9pZCAwO1xyXG52YXIgVmVjdG9ySWNvbiA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFZlY3Rvckljb24oKSB7XHJcbiAgICB9XHJcbiAgICBWZWN0b3JJY29uLkFVRElPX01VVEVfSUNPTiA9IFwiTTcuMzMzIDguNjVWMTFhMy42NjggMy42NjggMCAwMDIuNzU3IDMuNTUzLjkyOC45MjggMCAwMC0uMDA3LjExNHYxLjc1N0E1LjUwMSA1LjUwMSAwIDAxNS41IDExYS45MTcuOTE3IDAgMTAtMS44MzMgMGMwIDMuNzQgMi43OTkgNi44MjYgNi40MTYgNy4yNzd2Ljk3M2EuOTE3LjkxNyAwIDAwMS44MzQgMHYtLjk3M2E3LjI5NyA3LjI5NyAwIDAwMy41NjgtMS40NzVsMy4wOTEgMy4wOTJhLjkzMi45MzIgMCAxMDEuMzE4LTEuMzE4bC0zLjA5MS0zLjA5MS4wMS0uMDEzLTEuMzExLTEuMzExLS4wMS4wMTMtMS4zMjUtMS4zMjUuMDA4LS4wMTQtMS4zOTUtMS4zOTVhMS4yNCAxLjI0IDAgMDEtLjAwNC4wMThsLTMuNjEtMy42MDl2LS4wMjNMNy4zMzQgNS45OTN2LjAyM2wtMy45MDktMy45MWEuOTMyLjkzMiAwIDEwLTEuMzE4IDEuMzE4TDcuMzMzIDguNjV6bTEuODM0IDEuODM0VjExYTEuODMzIDEuODMzIDAgMDAyLjI5MSAxLjc3NmwtMi4yOTEtMi4yOTJ6bTMuNjgyIDMuNjgzYy0uMjkuMTctLjYwNi4zLS45NC4zODZhLjkyOC45MjggMCAwMS4wMDguMTE0djEuNzU3YTUuNDcgNS40NyAwIDAwMi4yNTctLjkzMmwtMS4zMjUtMS4zMjV6bTEuODE4LTMuNDc2bC0xLjgzNC0xLjgzNFY1LjVhMS44MzMgMS44MzMgMCAwMC0zLjY0NC0uMjg3bC0xLjQzLTEuNDNBMy42NjYgMy42NjYgMCAwMTE0LjY2NyA1LjV2NS4xOXptMS42NjUgMS42NjVsMS40NDcgMS40NDdjLjM1Ny0uODY0LjU1NC0xLjgxLjU1NC0yLjgwM2EuOTE3LjkxNyAwIDEwLTEuODMzIDBjMCAuNDY4LS4wNTguOTIyLS4xNjggMS4zNTZ6XCI7XHJcbiAgICBWZWN0b3JJY29uLkFVRElPX1VOTVVURV9JQ09OID0gXCJNMTYgNmE0IDQgMCAwMC04IDB2NmE0LjAwMiA0LjAwMiAwIDAwMy4wMDggMy44NzZjLS4wMDUuMDQtLjAwOC4wODItLjAwOC4xMjR2MS45MTdBNi4wMDIgNi4wMDIgMCAwMTYgMTJhMSAxIDAgMTAtMiAwIDguMDAxIDguMDAxIDAgMDA3IDcuOTM4VjIxYTEgMSAwIDEwMiAwdi0xLjA2MkE4LjAwMSA4LjAwMSAwIDAwMjAgMTJhMSAxIDAgMTAtMiAwIDYuMDAyIDYuMDAyIDAgMDEtNSA1LjkxN1YxNmMwLS4wNDItLjAwMy0uMDgzLS4wMDgtLjEyNEE0LjAwMiA0LjAwMiAwIDAwMTYgMTJWNnptLTQtMmEyIDIgMCAwMC0yIDJ2NmEyIDIgMCAxMDQgMFY2YTIgMiAwIDAwLTItMnpcIjtcclxuICAgIFZlY3Rvckljb24uVklERU9fTVVURV9JQ09OID0gXCJNIDYuODQgNS41IGggLTAuMDIyIEwgMy40MjQgMi4xMDYgYSAwLjkzMiAwLjkzMiAwIDEgMCAtMS4zMTggMS4zMTggTCA0LjE4MiA1LjUgaCAtMC41MTUgYyAtMS4wMTMgMCAtMS44MzQgMC44MiAtMS44MzQgMS44MzMgdiA3LjMzNCBjIDAgMS4wMTIgMC44MjEgMS44MzMgMS44MzQgMS44MzMgSCAxMy43NSBjIDAuNDA0IDAgMC43NzcgLTAuMTMgMS4wOCAtMC4zNTIgbCAzLjc0NiAzLjc0NiBhIDAuOTMyIDAuOTMyIDAgMSAwIDEuMzE4IC0xLjMxOCBsIC00LjMxIC00LjMxIHYgLTAuMDI0IEwgMTMuNzUgMTIuNDEgdiAwLjAyMyBsIC01LjEgLTUuMDk5IGggMC4wMjQgTCA2Ljg0MSA1LjUgWiBtIDYuOTEgNC4yNzQgViA3LjMzMyBoIC0yLjQ0IEwgOS40NzUgNS41IGggNC4yNzQgYyAxLjAxMiAwIDEuODMzIDAuODIgMS44MzMgMS44MzMgdiAwLjc4NiBsIDMuMjEyIC0xLjgzNSBhIDAuOTE3IDAuOTE3IDAgMCAxIDEuMzcyIDAuNzk2IHYgNy44NCBjIDAgMC4zNDQgLTAuMTkgMC42NDQgLTAuNDcgMC44IGwgLTMuNzM2IC0zLjczNSBsIDIuMzcyIDEuMzU2IFYgOC42NTkgbCAtMi43NSAxLjU3MSB2IDEuMzc3IEwgMTMuNzUgOS43NzQgWiBNIDMuNjY3IDcuMzM0IGggMi4zNDkgbCA3LjMzMyA3LjMzMyBIIDMuNjY3IFYgNy4zMzMgWlwiO1xyXG4gICAgVmVjdG9ySWNvbi5WSURFT19VTk1VVEVfSUNPTiA9IFwiTTEzLjc1IDUuNUgzLjY2N2MtMS4wMTMgMC0xLjgzNC44Mi0xLjgzNCAxLjgzM3Y3LjMzNGMwIDEuMDEyLjgyMSAxLjgzMyAxLjgzNCAxLjgzM0gxMy43NWMxLjAxMiAwIDEuODMzLS44MiAxLjgzMy0xLjgzM3YtLjc4NmwzLjIxMiAxLjgzNWEuOTE2LjkxNiAwIDAwMS4zNzItLjc5NlY3LjA4YS45MTcuOTE3IDAgMDAtMS4zNzItLjc5NmwtMy4yMTIgMS44MzV2LS43ODZjMC0xLjAxMi0uODItMS44MzMtMS44MzMtMS44MzN6bTAgMy42Njd2NS41SDMuNjY3VjcuMzMzSDEzLjc1djEuODM0em00LjU4MyA0LjE3NGwtMi43NS0xLjU3MnYtMS41MzhsMi43NS0xLjU3MnY0LjY4MnpcIjtcclxuICAgIFZlY3Rvckljb24uR1JBTlRfTU9ERVJBVE9SX0lDT04gPSBcIk0xNCA0YTIgMiAwIDAxLTEuMjk4IDEuODczbDEuNTI3IDQuMDcuNzE2IDEuOTEyYy4wNjIuMDc0LjEyNi4wNzQuMTY1LjAzNWwxLjQ0NC0xLjQ0NCAyLjAzMi0yLjAzMmEyIDIgMCAxMTEuMjQ4LjU3OUwxOSAxOWEyIDIgMCAwMS0yIDJIN2EyIDIgMCAwMS0yLTJMNC4xNjYgOC45OTNhMiAyIDAgMTExLjI0OC0uNTc5bDIuMDMzIDIuMDMzTDguODkgMTEuODljLjA4Ny4wNDIuMTQ1LjAxNi4xNjUtLjAzNWwuNzE2LTEuOTEyIDEuNTI3LTQuMDdBMiAyIDAgMTExNCA0ek02Ljg0IDE3bC0uMzkzLTQuNzI1IDEuMDI5IDEuMDNhMi4xIDIuMSAwIDAwMy40NTEtLjc0OEwxMiA5LjY5NmwxLjA3MyAyLjg2YTIuMSAyLjEgMCAwMDMuNDUxLjc0OGwxLjAzLTEuMDNMMTcuMTYgMTdINi44NHpcIjtcclxuICAgIFZlY3Rvckljb24uQVVESU9fTVVURV9TTUFMTF9JQ09OID0gXCJNNS42ODggNGwyMi4zMTMgMjIuMzEzLTEuNjg4IDEuNjg4LTUuNTYzLTUuNTYzYy0xIC42MjUtMi4yNSAxLTMuNDM4IDEuMTg4djQuMzc1aC0yLjYyNXYtNC4zNzVjLTQuMzc1LS42MjUtOC00LjM3NS04LTguOTM4aDIuMjVjMCA0IDMuMzc1IDYuNzUgNy4wNjMgNi43NSAxLjA2MyAwIDIuMTI1LS4yNSAzLjA2My0uNjg4bC0yLjE4OC0yLjE4OGMtLjI1LjA2My0uNTYzLjEyNS0uODc1LjEyNS0yLjE4OCAwLTQtMS44MTMtNC00di0xbC04LTh6TTIwIDE0Ljg3NWwtOC03LjkzOHYtLjI1YzAtMi4xODggMS44MTMtNCA0LTRzNCAxLjgxMyA0IDR2OC4xODh6bTUuMzEzLS4xODdhOC44MjQgOC44MjQgMCAwMS0xLjE4OCA0LjM3NUwyMi41IDE3LjM3NWMuMzc1LS44MTMuNTYzLTEuNjg4LjU2My0yLjY4OGgyLjI1elwiO1xyXG4gICAgVmVjdG9ySWNvbi5WSURFT19NVVRFX1NNQUxMX0lDT04gPSBcIk00LjM3NSAyLjY4OEwyOCAyNi4zMTNsLTEuNjg4IDEuNjg4LTQuMjUtNC4yNWMtLjE4OC4xMjUtLjUuMjUtLjc1LjI1aC0xNmMtLjc1IDAtMS4zMTMtLjU2My0xLjMxMy0xLjMxM1Y5LjMxM2MwLS43NS41NjMtMS4zMTMgMS4zMTMtMS4zMTNoMUwyLjY4NyA0LjM3NXptMjMuNjI1IDZ2MTQuMjVMMTMuMDYyIDhoOC4yNWMuNzUgMCAxLjM3NS41NjMgMS4zNzUgMS4zMTN2NC42ODh6XCI7XHJcbiAgICBWZWN0b3JJY29uLk1PREVSQVRPUl9TTUFMTF9JQ09OID0gXCJNMTYgMjAuNTYzbDUgMy0xLjMxMy01LjY4OEwyNC4xMjUgMTRsLTUuODc1LS41TDE2IDguMTI1IDEzLjc1IDEzLjVsLTUuODc1LjUgNC40MzggMy44NzVMMTEgMjMuNTYzem0xMy4zMTMtOC4yNWwtNy4yNSA2LjMxMyAyLjE4OCA5LjM3NS04LjI1LTUtOC4yNSA1IDIuMTg4LTkuMzc1LTcuMjUtNi4zMTMgOS41NjMtLjgxMyAzLjc1LTguODEzIDMuNzUgOC44MTN6XCI7XHJcbiAgICByZXR1cm4gVmVjdG9ySWNvbjtcclxufSgpKTtcclxuZXhwb3J0cy5WZWN0b3JJY29uID0gVmVjdG9ySWNvbjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dmVjdG9yX2ljb24uanMubWFwXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3ZlY3Rvcl9pY29uLmpzXCIsXCIvXCIpIl19
