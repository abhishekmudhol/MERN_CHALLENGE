const mongoose = require('mongoose');
const { DB_URL } = require('../config');

mongoose.connect( DB_URL)

mongoose.connection.on('connected', () => {
    console.log('Connected to a DB');
}).on('error', (error) => {
    console.log('Error connecting to a DB:', error.message);
});

const transactionSchema = new mongoose.Schema({
    id  : { type: Number, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    sold: { type: Boolean, required: true },
    dateOfSale: { type: Date, required: true },
  });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = {
    Transaction
}