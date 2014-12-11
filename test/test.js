/* global describe it */
var leopardize = require('..');
var assert = require('assert');

var testifier = leopardize.leopardizer({
  keyboard: {inword: 'keyboard', outword: 'leopard'},
  electric: {inword: 'electric', outword: 'atomic'},
  force: {inword: 'force', outword: 'horse'},
  strong: {inword: 'strong', outword: 'weak', lwb: true},
  'super': {inword: 'super', outword: 'Uber'},
  space: {inword: 'space', outword: 'spaaace'}
});

describe('Substitution', function(){
  it('should work', function(){
    assert.equal(testifier(
      '<html><body><p>The strong electric <span>super <em>hyper space ' +
      'memory alpha</em> force ruins the key</span>board of Neil Armstrong.' +
      '</p></body></html>'),
    '<html><body><p>The weak atomic <span>Uber <em>hyper spaaace memory '+
    'alpha</em> horse ruins the key</span>board of Neil Armstrong.'+
    '</p></body></html>');
  });
});
