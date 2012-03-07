/**
 * Model Proxy
 * part_proxy.js
 *
 */

mvc.ext(mvc.cls, "proxy", mvc.Class.create(mvc.cls.observer, {
	events : null,
	initialise : function() {
		this.events = new mvc.cls["event"](this);
	},
	exec : function(cmd, params, callback) {
		var that = this;
		if(this[cmd] === undefined) {
			throw ("command:" + cmd + " is not implemented in proxy.");
		}
		that.events.fire("before" + cmd);
		this[cmd](params,function(err,response) {
			if (!err){
				var res = that.events.fire("after" + cmd, response);
			}
			callback(err, res);
		});
	}
}));

mvc.ext(mvc, "proxy", {});
