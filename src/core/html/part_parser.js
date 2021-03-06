/**
 * Parser of <?mvc code ?>.
 * ./html/part_parser.js
 */
mvc.ext(mvc.cls, "html_js_parser", function() {
	var _public = {
		/**
		 * Parse html code within specific scope(params).
		 * @html Html code be parsed
		 * @param scope JSON object
		 */
		parseHtml : function(html, param) {
			return _private.parseHtml(html, param);
		},
		addScopeItem:function(key,val){
			if (key && val){
				_props._basic[key]=val;
			}
		},
		removeScopeItem:function(key){
			if (key && _props._basic[key]){
				delete _props._basic[key];
			}
		}
	};
	var _props = {
		startTag : "<?mvc",
		endTag : "?>",
		_basic : {
			__resStack : "",
			echo : function(str) {
				this.__resStack += str;
			}
		}
	};
	var _private = {
		init:function(){
			if (mvc.opt.injectTag){
				if (mvc.opt.injectTag.startTag){
					_props.startTag=mvc.opt.injectTag.startTag;
				}
				if (mvc.opt.injectTag.endTag){
					_props.endTag=mvc.opt.injectTag.endTag;
				}
			}
		},
		parseHtml : function(__html, param) {
			var __index = -1;
			if(param == undefined || mvc.util.isEmpty(param)) {
				param = {};
			}
			param=mvc.util.copyJSON(_props._basic, param);
			if(__html == undefined) {
				return "";
			}
			var st = _props.startTag;
			var et = _props.endTag;
			while(( __index = __html.indexOf(st)) != -1) {
				param.__resStack = "";
				var __startPos = __index + st.length + 1;
				var __endPos = __html.indexOf(et, __startPos);
				var __statement = __html.substring(__startPos, __endPos);
				var __val = "";
				__val = mvc.html.parseExec(__statement, param);
				if(__val == undefined) {
					__val = "";
				}
				__val = param.__resStack + __val;
				__html = __html.replace(__html.substring(__index, __endPos + et.length), __val);
			}
			return __html
		}
	};
	
	_private.init();
	return _public;
});

mvc.ext(mvc.html, "parseExec", function(__code__, __scope__) {
	with(__scope__) {
		try {
			return eval(__code__);
		} catch(e) {
			mvc.log.e(e, "Parse MVC code:", __code__);
		}
	}
});
mvc.ext(mvc.html, "parseJSON", function(__code__) {
		try {
			return eval("("+__code__+")");
		} catch(e) {
			mvc.log.e(e, "Parse JSON Object:", __code__);
		}
});


mvc.app.ready(function(){
	mvc.ext(mvc.html,"parser",new mvc.cls.html_js_parser());
});

