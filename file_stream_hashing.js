const fs = require('fs')
const crypto = require('crypto');

const fileBuffer = fs.readFileSync('./example-file.txt')

console.log(fileBuffer)

function breakToBlocks (buffer) {
  const numberOfBlocks = Math.ceil(buffer.byteLength / 1024)

  return new Array(numberOfBlocks).fill(null).map((_el, i) => {
    return fileBuffer.slice(i * 1024, (i+1) * 1024)
  })
}

function hashBlock (block, previousBlockHash) {
  const hash = crypto.createHash('sha256').update(block)

  if (previousBlockHash !== undefined) {
    hash.update(previousBlockHash)
  }

  return hash.digest()
}

const orderedBlocks = breakToBlocks(fileBuffer).reverse()

let hashes = []
for (let i = 0; i < orderedBlocks.length; i++) {
  hashes[orderedBlocks.length - 1 - i] = hashBlock(orderedBlocks[i], hashes[orderedBlocks.length + 1 - i - 1])
}

console.log(hashes[0].toString('hex'))

function verify (block, nextBlockHash, i) {
  const hash = crypto.createHash('sha256').update(block)

  if (nextBlockHash !== undefined) {
    hash.update(nextBlockHash)
  }

  const digested =  hash.digest()

  return digested.equals(hashes[i])
}

const verifyBlockOrder = orderedBlocks.reverse()
function verifyBlocks () {
  let isValid = []

  for (let i = 0; i < verifyBlockOrder.length; i++) {
    isValid[i] = verify(verifyBlockOrder[i], hashes[i + 1], i)
  }

  return isValid.find((el) => el === false) === undefined
}

console.log('verified', verifyBlocks())

