/**
 * Log definition
 * part_log.js
 */
mvc.ext(mvc['cls'], '_log', function() {
	var props = {

	}
	var _private = {
		log : function(str) {
			console.log(str);
		}
	}
	var _public = {
		/**
		 * Debug message
		 */
		d : function(debugInfo) {
			debugInfo=debugInfo ||"";
			var template="DEBUG: {0}";
			_private.log(mvc.util.text.format(template,debugInfo));
		},
		/**
		 * Info Message
		 */
		i : function(info) {
			info=info || "";
			var template="INFO: {0}";
			_private.log(mvc.util.text.format(template,info));
		},
		/**
		 * Log an error message
		 * @param e: error message as string
		 * @param place: location of the message
		 * @param data: related data
		 */
		e : function(e, place, data) {
			e=e || "";
			if (typeof e==="string"){
			var tmplate="ERROR: {0}. {1}:{2}.";
			_private.log(mvc.util.text.format(tmplate,e,place,data));
			}else{
				throw(e);
			}
		},
		/**
		 * Warning message
		 */
		w:function(str){
			var template="WARNNING: {0}";
			_private.log(mvc.util.text.format(template,str));
		}
	}
	return _public;
});

mvc.log=new mvc.cls._log();
