/**
 * Log definition
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
		d : function() {

		},
		i : function() {

		},
		/**
		 * Log an error message
		 * @param e: error message as string
		 * @param place: location of the message
		 * @param data: related data
		 */
		e : function(e, place, data) {
			var tmplate="ERROR: {0}. {1}:{2}. At {3}->{4}";
			_private.log(mvc.util.text.format(tmplate,place,data,mvc.getCurrentController().name,mvc.getCurrentController()._action));
		}
	}
	return _public;
})
