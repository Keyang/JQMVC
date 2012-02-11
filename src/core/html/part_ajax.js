/**
 * ./html/part_ajax.js
 */

mvc.ext(mvc.html, "ajax", new (function() {
	var _props = {
		cachedHtml : {},
		cfg_ajax:null
	};
	var _private = {
		init:function(){
			mvc.cfg.addItem("html.ajax",function(opt){
				if (opt.ajax===undefined){
					mvc.cfg.err("ajax");
					return false;
				}
				_props.cfg_ajax=opt.ajax;
			})
		},
		ajax : function(defparam, userParam) {
			var param = defparam;
			if( _props.cfg_ajax!=null) {// global configuration
				for (var key in _props.cfg_ajax){
					param[key]=_props.cfg_ajax[key];
				}
			}
			if(userParam !== undefined) { // user configuration
				for(var key in userParam) {
					param[key] = userParam[key];
				}
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
	_private.init();
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
})());
