// Inspired and Instructed by Savjee
const SHA256 = require('crypto-js').SHA256;

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }
}

class Block {
  constructor(timestamp, transactions, previousHash = '') {
    this.timestamp = timestamp;
    this.previousHash = previousHash;
    this.transactions = transactions;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return SHA256(this.timestamp + this.previousHash + JSON.stringify(this.transactions) + this.nonce).toString();
  }

  mindBlock(difficulty) {
    while(this.calculateHash().substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
      this.nonce++;
    }
    this.hash = this.calculateHash();
    console.log('minded block ', this.hash);
    console.log('with nonce', this.nonce);
  }
}

class BlockChain {
  constructor() {
    // Init the chain with genesis block
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 120;
  }

  createGenesisBlock() {
    return new Block('01/01/2018', "Genesis block");
  }

  isValidChain() {
    for (let i = 1, len = this.chain.length; i < len; i++) {
      const previousBlock = this.chain[i - 1];
      const currentBlock = this.chain[i];
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      // The current block is connect with incorrect previous block
      // Or basically the previous block is modified
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  createTransaction(transaction) {
    this.pendingTransactions.push(transaction);
  }

  mindingPendingTransactions(minerAddress) {
    const block = new Block('25/03/2018', this.pendingTransactions);
    block.mindBlock(this.difficulty);

    this.chain.push(block);
    this.pendingTransactions = [new Transaction(null, minerAddress, this.miningReward)];
  }

  getBalance(address) {
    let balance = 0;
    
    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    return balance;
  }

  // This is for simply add a new block to the chain, replaced byh mindingPendingTransactions
  // addBlock(newBlock) {
  //   const latestBlock = this.getLatestBlock();
  //   newBlock.previousHash = latestBlock.hash;
  //   newBlock.mindBlock(this.difficulty);
  //   this.chain.push(newBlock);
  // }
}

const pandaCoin = new BlockChain();

pandaCoin.createTransaction(new Transaction('poe', 'tan', 100));
pandaCoin.createTransaction(new Transaction('tan', 'poe', 20));

console.log('Starting mining transactions ...');
pandaCoin.mindingPendingTransactions('theminer');
console.log('Miner balance is ', pandaCoin.getBalance('theminer'));

console.log('Start the mining again... ');
pandaCoin.mindingPendingTransactions();
console.log('Miner balance is ', pandaCoin.getBalance('theminer'));

console.log(JSON.stringify(pandaCoin, null, 4));