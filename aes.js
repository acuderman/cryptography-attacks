const crypto = require('crypto')
const Buffer = require('buffer').Buffer;

// NATIVE functions
function decipherAesNative (keyText, cipherText, alghoritm) {
  const iv = Buffer.from(cipherText, 'hex').slice(0, 16)
  const key = Buffer.from(keyText, 'hex')
  const cipher = Buffer.from(cipherText, 'hex').slice(16,)

  const decipher = crypto.createDecipheriv(alghoritm, key, iv)
  const decoded = decipher.update(cipher, 'binary')

  return decoded + decipher.final('binary')
}

const cbcKey = '140b41b22a29beb4061bda66b6747e14'
const cbcCipher = '4ca00ff4c898d61e1edbf1800618fb2828a226d160dad07883d04e008a7897ee2e4b7465d5290d0c0e6c6822236e1daafb94ffe0c5da05d9476be028ad7c1d81'

console.log('aesDecipherCBC1', decipherAesNative(cbcKey, cbcCipher, 'aes-128-cbc'))

const cbcKey2 = '140b41b22a29beb4061bda66b6747e14'
const cbcCipher2 = '5b68629feb8606f9a6667670b75b38a5b4832d0f26e1ab7da33249de7d4afc48e713ac646ace36e872ad5fb8a512428a6e21364b0c374df45503473c5242a253'

console.log('aesDecipherCBC2', decipherAesNative(cbcKey2, cbcCipher2, 'aes-128-cbc'))

const ctrKey = '36f18357be4dbd77f050515c73fcf9f2'
const ctrCipher = '69dda8455c7dd4254bf353b773304eec0ec7702330098ce7f7520d1cbbb20fc388d1b0adb5054dbd7370849dbf0b88d393f252e764f1f5f7ad97ef79d59ce29f5f51eeca32eabedd9afa9329'

console.log('aesDecipherCTR1', decipherAesNative(ctrKey, ctrCipher, 'aes-128-ctr'))

const ctrKey1 = '36f18357be4dbd77f050515c73fcf9f2'
const ctrCipher1 = '770b80259ec33beb2561358a9f2dc617e46218c0a53cbeca695ae45faa8952aa0e311bde9d4e01726d3184c34451'

console.log('aesDecipherCTR2', decipherAesNative(ctrKey1, ctrCipher1, 'aes-128-ctr'))

// CUSTOM

function xor(text1, text2) {
  if (!Buffer.isBuffer(text1)) text1 = Buffer.from(text1, 'hex')
  if (!Buffer.isBuffer(text2)) text2 = Buffer.from(text2, 'hex')
  let xoredMessages = []

  let lengthMax = Math.min(text1.length, text2.length)
  for (let i = 0; i < lengthMax; i++) {
    xoredMessages = [...xoredMessages, text1[i] ^ text2[i]]
  }

  return Buffer.from(xoredMessages);
}

function decipherBlock (dkey, data) {
  const decipher = crypto.createDecipheriv('aes-128-ecb', dkey, null)
  decipher.setAutoPadding(false)
  const decoded = decipher.update(data, 'binary')

  decipher.final('utf-8')
  return decoded
}

function aesCbcDecipher (keyText, cipherText) {
  const iv = Buffer.from(cipherText, 'hex').slice(0, 16)
  const key = Buffer.from(keyText, 'hex')
  const cipher = Buffer.from(cipherText, 'hex').slice(16,)

  const array = new Array(cipher.byteLength / 16).fill(null)

  let previousBlockCipher = iv
  const messages = array.map((_el, i) => {
    const blockCipher = cipher.slice(i * 16, (i+1) * 16)

    const deciphered = decipherBlock(key, blockCipher)

    const message = xor(Buffer.from(deciphered), previousBlockCipher)

    previousBlockCipher = blockCipher

    if (i === array.length - 1) {
      // remove padding bits
      return message.slice(0, 16 - (blockCipher[blockCipher.length - 1]/16)).toString('utf-8')
    }

    return message.toString('utf-8')
  })

  return messages.join('')
}

function incrementBe (buffer) {
  for (var i = buffer.length -1; i > 0; i++) {
    if (buffer[i]++ !== 255) break;
  }
}

function cipherBlock (dkey, data) {
  const cipher = crypto.createCipheriv('aes-128-ecb', dkey, null)
  cipher.setAutoPadding(false)
  const decoded = cipher.update(data, 'binary')

  cipher.final('utf-8')
  return decoded
}

function aesCtrDecipher (keyText, cipherText) {
  const ivNonce = Buffer.from(cipherText, 'hex').slice(0, 8)
  let ivCounter = Buffer.from(cipherText, 'hex').slice(8, 16)

  const key = Buffer.from(keyText, 'hex')
  const cipher = Buffer.from(cipherText, 'hex').slice(16,)

  const array = new Array(Math.ceil(cipher.byteLength / 16)).fill(null)

  const messages = array.map((_el, i) => {
    let blockCipher = cipher.slice(i * 16, (i+1) * 16)

    const deciphered = cipherBlock(key, Buffer.from([...ivNonce, ...ivCounter]))

    incrementBe(ivCounter)

    const decrypted = xor(blockCipher, deciphered)

    return decrypted.toString('utf-8')
  })

  return messages.join('')
}

const cbcKey12 = '140b41b22a29beb4061bda66b6747e14'
const cbcCipher12 = '4ca00ff4c898d61e1edbf1800618fb2828a226d160dad07883d04e008a7897ee2e4b7465d5290d0c0e6c6822236e1daafb94ffe0c5da05d9476be028ad7c1d81'

console.log('CUSTOM CBC: ', aesCbcDecipher(cbcKey12, cbcCipher12))

const ctrKey12 = '36f18357be4dbd77f050515c73fcf9f2'
const ctrCipher12 = '69dda8455c7dd4254bf353b773304eec0ec7702330098ce7f7520d1cbbb20fc388d1b0adb5054dbd7370849dbf0b88d393f252e764f1f5f7ad97ef79d59ce29f5f51eeca32eabedd9afa9329'

console.log('CUSTOM CTR', aesCtrDecipher(ctrKey12, ctrCipher12))
