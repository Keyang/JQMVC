mvc.ext(mvc.cls, "parser", function() {
	var _public = {
		/**
		 * Parse html code within specific scope(params).
		 * @html Html code be parsed
		 * @param scope JSON object
		 */
		parseHtml : function(html, param) {
			return _private.parseHtml(html, param);
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
		parseHtml : function(__html, param) {
			var __index = -1;
			if(param == undefined || mvc.util.isEmpty(param)) {
				param = {};
			}
			mvc.util.copyJSON(_props._basic, param);
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
				__val = mvc.parserExe(__statement, param);
				if(__val == undefined) {
					__val = "";
				}
				__val = param.__resStack + __val;
				__html = __html.replace(__html.substring(__index, __endPos + 2), __val);
			}
			return __html
		}
	};
	return _public;
})

mvc.ext(mvc, "parserExe", function(__code__, __scope__) {
	with(__scope__) {
		try {
			return eval(__code__);
		} catch(e) {
			mvc.log.e(e, "Parse MVC code:", __code__);
		}
	}
})