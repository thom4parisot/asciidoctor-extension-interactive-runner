'use strict';

const assert = require('assert');
const asciidoctor = require('asciidoctor.js')();
const runnerExtension = require('./index.js');

asciidoctor.Extensions.register(runnerExtension);

const options = {
  header_footer: true,
  backend: 'html5',
  safe: 'server'
};

var source = `= Document

[source%interactive,javascript]
----
console.log('Hello')
----
`;

var output = asciidoctor.convert(source, options);
assert.ok(output.match(/<div class="listingblock interactive interactive--javascript interactive--runtime--node-v\d+">/))
assert.ok(output.match('<style type="text/css" class="extension-interactive-runner">'))
assert.ok(output.match('<script class="extension-interactive-runner">'))

var source = `= Document
:runner-node: v9

[source%interactive,javascript]
----
console.log('Hello')
----
`;

var output = asciidoctor.convert(source, options);
assert.ok(output.match(/<div class="listingblock interactive interactive--javascript interactive--runtime--node-v9">/))

var source = `= Document

[source%interactive%endpoint,javascript]
----
const micro = require('micro');
const {random} = require('pokemon');

const server = micro((req, res) => random());

server.listen(4000);
----
`;

var output = asciidoctor.convert(source, options);
assert.ok(output.match(/<div class="listingblock interactive interactive--javascript interactive--runtime--node-v\d+ interactive--endpoint">/))

// %endpoint without %interactive does not work (why? Good question)
// it's a design thiny that can be revisited
var source = `= Document

[source%endpoint,javascript]
----
const micro = require('micro');
const {random} = require('pokemon');

const server = micro((req, res) => random());

server.listen(4000);
----
`;

var output = asciidoctor.convert(source, options);
assert.ok(output.match(/<div class="listingblock">/))

var source = `= Document

[source,javascript]
----
console.log('Hello')
----
`;

var output = asciidoctor.convert(source, options);
assert.ok(output.match(/<div class="listingblock">/))
assert.ok(!output.match('<style type="text/css" class="extension-interactive-runner">'))
assert.ok(!output.match('<script class="extension-interactive-runner">'))


var source = `= Document

[source%interactive,yaml]
----
language: node_js
cache: npm
node_js:
- node
----
`;

var output = asciidoctor.convert(source, options);
assert.ok(output.match(/<div class="listingblock">/))
assert.ok(!output.match('<style type="text/css" class="extension-interactive-runner">'))
assert.ok(!output.match('<script class="extension-interactive-runner">'))
