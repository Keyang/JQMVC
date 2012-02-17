/**
 * part_basic.js
 */

(function(parent, opt) {
	var nameSpace = "mvc";
	parent[nameSpace] = {};
	var obj = parent[nameSpace];
	obj.ext = function(parent, key, tarObj) {
		if( typeof parent != "object") {
				throw("mvc.ext first param should be entry object.");
		}
		if( typeof key != "string") {
			throw ("mvc.ext second param should be key as string.");
		}
		if(parent[key] != undefined) {
			mvc.log.i("Overwritten extention detected.");
		}
		parent[key] = tarObj;
	}
	obj.opt = opt;
})(window, _app_);
mvc.ext(mvc, "cls", {});
mvc.ext(mvc, "util", {
	text : {
		format : function() {
			var args = arguments;
			var str = args[0];
			var rtn = str;
			for(var i = 1; i < args.length; i++) {
				var index = i - 1;
				rtn = rtn.replace("{" + index + "}", args[i]);
			}
			return rtn;
		}
	},
	/**
	 * deeply Copy jsonObj to toJson object
	 * final json object will be returned
	 */
	copyJSON : function(jsonObj, toJson, override) {
		var tmpObj = {};
		if(toJson != undefined) {
			tmpObj = mvc.util.copyJSON(toJson,undefined,true);
		}
		//deep clone for setting json obj
		var tmpOri = jsonObj;
		for(var key in tmpOri) {
			if(override === false) {
				if(tmpObj[key] != undefined) {
					continue;
				}
			}
			if(!mvc.util.isEmpty(tmpOri[key])) {
				if(tmpOri[key].constructor == Object) {
					tmpObj[key] = mvc.util.copyJSON(tmpOri[key]);
				} else {
					tmpObj[key] = tmpOri[key];
				}
			} else {
				tmpObj[key] = tmpOri[key];
			}
		}
		return tmpObj;
	},
	/**
	 * return true if given value is empty.
	 */
	isEmpty : function(val) {
		return val == undefined || val === "" || val === null || val === {};
	}
});

