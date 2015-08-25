var vows   = require('vows')
var assert = require('assert')

vows.describe('Example').addBatch({
	'can do a simple assert': function () {
		assert.equal(true, true)
	},
}).export(module)
