const Buffer = require('buffer').Buffer;

const plain = 'attack at dawn'
const encrypted = '09e1c5f70a65ac519458e7e53f36'

const plainBin = Buffer.from(plain, 'ascii')
const encryptedBin = Buffer.from(encrypted, 'hex')

function xor(text1, text2) {
  let xoredMessages = []

  let lengthMax = Math.min(text1.length, text2.length)
  for (let i = 0; i < lengthMax; i++) {
    xoredMessages =[...xoredMessages, text1[i] ^ text2[i]]
  }

  return Buffer.from(xoredMessages);
}

function getKey (plain, encrypted) {
  return xor(plain, encrypted)
}

function encrypt (key, plain) {
  return xor(key, plain)
}

const key = getKey(plainBin, encryptedBin)

const target = Buffer.from('attack at dusk', 'ascii')
console.log('Encrypted hex text: "attack at dusk": ', encrypt(key, target).toString('hex'))
