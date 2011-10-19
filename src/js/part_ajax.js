mvc.ext(mvc.cls, "ajax", function() {
	var _props = {
		cachedHtml : {}
	};
	var _private = {
		ajax : function(defparam, userParam) {
			var param = defparam;
			if(userParam !== undefined) {
				for(var key in userParam) {
					param[key] = userParam[key];
				}
			}
			if( typeof mvc.opt.xhr != "undefined") {//fix some issues of jQuery
				param.xhr = mvc.opt.xhr;
			}
			return $.ajax(param);
		},
		asyncLoad : function(path, callback, userParam) {
			function cb(data) {
				try {
					callback(data);
				} catch(e) {
					mvc.log.e(e, "asyncLoad", path);
				}
			}

			if(_props.cachedHtml[path] != undefined) {
				cb(_props.cachedHtml[path]);
				return;
			}
			var param = {
				async : true,
				url : path,
				type : "GET",
				dataType : "text",
				success : function(res) {
					_props.cachedHtml[path]=res;
					cb(res);
				},
				error:function(xhr,text,err){
					mvc.log.e(text,"asyncLoad",path);
					cb("");
				}
			};
			_private.ajax(param,userParam);
		},
		syncLoad : function(path, userParam) {
			var result = null;
			if(_props.cachedHtml[path] != undefined) {
				return _props.cachedHtml[path];
			}
			var param = {
				async : false,
				url : path,
				type : "GET",
				dataType : "text"
			};
			try {
				var _res = _private.ajax(param,userParam);
				if(_res.statusText === "error") {
					mvc.log.e(mvc.string.error.ajax.loadErr, "FilePath", path);
				}
				var res = "";
				//console.log(JSON.stringify(_res));
				if(_res.responseText) {
					res = _res.responseText;
					_props.cachedHtml[path] = res;
				}
				return res;
			} catch(e) {
				mvc.log.e(mvc.string.error.ajax.loadErr, "FilePath", path);
				return "";
			}
		}
	};
	var _public = {
		/**
		 * Synchorous ajax call
		 * @ path url
		 * @ userParam parameters of $.ajax
		 */
		syncLoad : _private.syncLoad,
		/**
		 * Asynchorous ajax call
		 * @ path url
		 * @ callback callback function
		 * @ userParam parameters of $.ajax
		 */
		asyncLoad : _private.asyncLoad
	};
	return _public;
});
