
const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body.stockData, 'stock', 'response should contain a stock key');
          assert.property(res.body.stockData, 'price', 'response should contain a price key');
          assert.property(res.body.stockData, 'likes', 'response should contain a likes key');
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: true})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body.stockData, 'stock', 'response should contain a stock key');
          assert.property(res.body.stockData, 'price', 'response should contain a price key');
          assert.property(res.body.stockData, 'likes', 'response should contain a likes key');
          done();
        });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        
      });
      
      test('2 stocks', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog', 'msft']})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body.stockData, 'response should be an array')
          assert.property(res.body.stockData[0], 'stock', 'response should contain a stock key');
          assert.property(res.body.stockData[0], 'price', 'response should contain a price key');
          assert.property(res.body.stockData[0], 'rel_likes', 'response should contain a rel_likes key');
          done();
        });
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog', 'msft'], like: true})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body.stockData, 'response should be an array')
          assert.property(res.body.stockData[0], 'stock', 'response should contain a stock key');
          assert.property(res.body.stockData[0], 'price', 'response should contain a price key');
          assert.property(res.body.stockData[0], 'rel_likes', 'response should contain a rel_likes key');
          done();
        });
      });
      
    });

});
