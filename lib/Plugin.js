/* jslint node: true */

function Plugin( name ) {

	// Methods
	this.name = function() {
		return name;
	};
}

module.exports = Plugin;