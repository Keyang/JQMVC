/**
 * part_basic.js
 */

(function(parent, opt) {
	var nameSpace = "mvc";
	parent[nameSpace] = {};
	var obj = parent[nameSpace];
	obj.ext = function(parent, key, tarObj) {
		if( typeof parent != "object") {
			throw ("mvc.ext first param should be entry object.");
		}
		if( typeof key != "string") {
			throw ("mvc.ext second param should be key as string.");
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
	 * deeply Copy jsonObj
	 * @toJson omit it.
	 * final json object will be returned
	 */
	copyJSON : function(jsonObj, toJson, override) {
		if (typeof jsonObj!="object" || jsonObj===null){
			return jsonObj;
		}
		var tmpObj = {};
		//fix for old version 
		if(toJson != undefined) {
			tmpObj = mvc.util.copyJSON(toJson, undefined, true);
		}
		//deep clone for setting json obj
		var tmpOri = jsonObj;
		if( tmpOri instanceof Array) {
			tmpObj=[];
			for (var i=0;i<tmpOri.length;i++){
				tmpObj.push(mvc.util.copyJSON(tmpOri[i]));
			}
		} else {
			for(var key in tmpOri) {
				if(override === false) {
					if(tmpObj[key] != undefined) {
						continue;
					}
				}
				tmpObj[key]=mvc.util.copyJSON(tmpOri[key]);
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
