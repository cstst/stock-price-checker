
const fetch = require('node-fetch');

module.exports = function() {
  
  // checks for presence of two stocks
  this.twoStocks = (input) => {
    return Array.isArray(input)
  }
  
  // gets stock price from Alpha Advantage API
  this.getQuote = (stock) => {
    return fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock}&apikey=${process.env.APIKEY}`)
      .then(response => response.json())
      .then(data => {
        const { 'Global Quote': { '01. symbol': stock = null, '05. price': price = null } } = data;  
        return {stock, price};
      })
      .catch(err => console.log(err));
  }
  // Checks if data returned from Alpha Advantage API included a stock price
  this.validStock = (data) => {
    if (Array.isArray(data) && data.some(ele => !ele.stock || !ele.price)) {
      return false;
    } else if (!Array.isArray(data) && (!data.stock || !data.price)) {
      return false;
    } else {
      return true;
    }
  }

  
  // checks database for presence of stock, likes, and previous likes by ip, updates if necessary, returns stock data object
  this.dbQueryAndUpdate = async (quote, db, ip, like = false) => {
    const { stock, price } = quote;
     // if user attempts to like stock
    if (like) {
      // checks if that ip has liked this stock before
      const match = await db.collection('likes').findOne({stock, likes: {ip}})
      // if not previously liked by that ip
      if (!match) {
        // adds like (and stock if not yet present) to database
        const doc = await db.collection('likes').findAndModify(
          {stock},
          [["stock", 1]],
          { "$push": {"likes": {ip}} },
          { new: true, upsert: true }
        );    
        // returns stock data object with updated likes data from database
        return {stock, price, likes: doc.value.likes.length};
      // if previously liked by that ip
      } else {
        // returns stock data object with likes data from database
        return {stock, price, likes: match.likes.length};
      }
    // if no like attempted
    } else {
      // checks database for stock, gets like data if present
      const doc = await db.collection('likes').findOne({stock});  
      // returns stock data object with likes data from database, or 0 if none
      return {stock, price, likes: doc ? doc.likes.length : 0};
    }
  }
  
  // converts array of stock data objects from one stock format to two stock format
  this.oneToTwoFormat = (stockData) => {
    return stockData.map((ele, i) => {
      const rel_likes = ele.likes - stockData[i === 0 ? 1 : 0].likes;
      return {stock: ele.stock, price: ele.price, rel_likes: rel_likes};
    });
  }
}