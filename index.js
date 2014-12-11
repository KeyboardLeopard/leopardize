// Copyright 2014 Stuart P. Bentley.
// This work may be used freely as long as this notice is included.
// The work is provided "as is" without warranty, express or implied.

var cheerio = require("cheerio");

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function caseMatchSpan(source,base,output) {
  // When the span has an entire case that doesn't match the entire case of
  // the expected text, transform it to match
  return source == source.toLowerCase() && source != source.toUpperCase() ?
      base == base.toLowerCase() && base != base.toUpperCase() ? output :
      output.toLowerCase()
    : source == source.toUpperCase() && source != source.toLowerCase() ?
      base == base.toUpperCase() && base != base.toLowerCase() ? output :
      output.toUpperCase()
    : output;
}

// Slice against, for arrays or strings.
function sliceOf(ars, i, parts) {
  return ars.slice(
    Math.floor(i/parts*ars.length),
    Math.floor((i+1)/parts*ars.length));
}

function caseMatchWords(source, base, output) {
  //special case the first letter
  var result = caseMatchSpan(source[0],base[0],output[0]);

  var sRest = source.slice(1);
  var bRest = base.slice(1);
  var oRest = output.slice(1);

  var parts = Math.min(bRest.length, oRest.length);

  for(var i = 0; i < parts; i++){
    result += caseMatchSpan(
      sliceOf(sRest, i, parts),
      sliceOf(bRest, i, parts),
      sliceOf(oRest, i, parts));
  }

  return result;
}

exports.leopardizer = function leopardizer(newFilters) {
  var filters = newFilters || {};
  var allFilterRegexp = new RegExp('('
    + Object.keys(filters)
      .sort(function(m,n){
        return m.length == n.length ? m < n : m.length < n.length})
      .map(function(k){
        return (filters[k].lwb ? '\\b' : '')
          + escapeRegExp(k)
          + (filters[k].rwb ? '\\b' : '');
        })
      .join('|')
    + ')','gi');

  function replacement(match) {
    var filter = filters[match.toLowerCase()];

    // When filters require strict matches
    if (filter.strict && match != filter.inword) {
      // Ignore matches that don't strictly match
      return match;
    } else {
      var inWords = filter.inword.split(' ');
      var outWords = filter.outword.split(' ');
      var matchWords = match.split(' ');

      var replacementWords = [];

      var parts = Math.min(inWords.length,outWords.length);

      for(var i = 0; i < parts; i++){
        replacementWords[i] = caseMatchWords(
          sliceOf(matchWords, i, parts).join(' '),
          sliceOf(inWords, i, parts).join(' '),
          sliceOf(outWords, i, parts).join(' '));
      }

      return replacementWords.join(' ');
    }
  }

  function performSubstitutions(str) {
    return str.replace(allFilterRegexp, replacement);
  }

  function changeTextNodes(node) {
    var length, childNodes;
    // If this is a text node, attempt substitutions on it
    //console.log(node)
    if (node.type == 'text') {
      node.data = performSubstitutions(node.data);
    // If this is an ordinary content node, recurse any children
    // ("ordinary" here means a node where text content doesn't have meaning
    //  beyond human text - <style> and <script> are the only nodes of this
    //  type that I know of)
    } else if (node.type == 'root' || node.type == 'tag'
      && node.name.toLowerCase() != 'style'
      && node.name.toLowerCase() != 'script') {
      //TODO: Can I read the "children" array directly?
      childNodes = node.children;
      length = childNodes.length;
      for (var i = 0; i < length; ++i){
        changeTextNodes(childNodes[i]);
      }
    }
  }

  return function leopardize(html) {
    var doc = cheerio.load(html);
    changeTextNodes(doc.root()[0]);
    return doc.html();
  };
};

