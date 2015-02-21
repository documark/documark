module.exports = {
	cli: function (argv) {
		var join     = require('path').join;
 		var spawn    = require('child_process').spawn;
		var execPath = join(__dirname, 'bin', 'documark.js');
		var args     = (argv || process.argv.slice(2));
		
		return spawn(execPath, args, { stdio: 'inherit' });
	},
	Document: require('./lib/document.js')
};
