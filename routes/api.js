/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect  = require('chai').expect;

const Controller = require('../controllers/controller.js');

const controller = new Controller();
const { twoStocks, getQuote, validStock, dbQueryAndUpdate, oneToTwoFormat } =  controller;

module.exports = (app, db) => {
  app.route('/api/stock-prices')
    .get(async (req, res) => {
      const stockInput = req.query.stock
      // if two stocks were submitted
      if (twoStocks(stockInput)){
        // gets an array of stock quotes from API
        const quotes = await Promise.all([getQuote(stockInput[0]), getQuote(stockInput[1])]);
        if (!validStock(quotes)) {
          res.send('please enter valid stock symbols');
        } else {
          // creates an array of stock data objects in {stock, price, likes} format after querying and potentially updating database
          const stockDataArr = await Promise.all(quotes.map((quote) => {
            return dbQueryAndUpdate(quote, db, req.ip, req.query.like);
          }));
          // converts array of stock data objects to {stock, price, rel_likes} format
          const stockDataTwoStocks = oneToTwoFormat(stockDataArr)
          res.json({stockData: stockDataTwoStocks});
        }
      // if one stock was submitted
      } else {
        // gets stock quote from API
        const quote = await getQuote(stockInput);
        /// check if stock is valid
        if (!validStock(quote)) {
          res.send("please enter a valid stock symbol");
        } else {
          // creates a stock data object in {stock, price, likes} format after querying and potentially updating database 
          const stockData = await dbQueryAndUpdate(quote, db, req.ip, req.query.like); 
          res.json({stockData});
        }
      }     
    });    
};
