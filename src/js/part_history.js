/**
 * part_history.js
 */
mvc.ext(mvc.cls, "history", function() {
	var _public={
		/**
		 * push a entry to stack.
		 */
		push:function(name){
			return _private.push(name);
		},
		/**
		 * clear stack
		 */
		clear:function(){
			return _private.clear();
		},
		/**
		 * back to a specified entry.
		 * back to last entry if name is ommited.
		 */
		back:function(name){
			return _private.back(name);
		}
	}
	var _props = {
		stack : [],
	}
	var _private = {
		push : function(pageID) {
			if(pageID && pageID != null) {
				_props.stack.push(pageID);
			}
		},
		clear : function(clearDom) {
				_props.stack = [];
		},
		pop : function() {
			return _props.stack.pop();
		},
		back : function(pageID) {
			var lastPageID = "";
			if(pageID === undefined) {//back to last page
				lastPageID = _private.pop();
				while(_props.stack.length > 0 && ( typeof (lastPageID) == "undefined" || mvc.util.isEmpty(lastPageID) || $("#" + lastPageID).length == 0)) {
					lastPageID = _private.pop();
				}
			} else {//back to page with id: pageID
				while(_props.stack.length > 0 && pageID != lastPageID) {// check whether specified page has been loaded.
					lastPageID = _private.pop();
				}
				if(lastPageID != pageID) {// cannot find page in history stack. Load specified page from scratch.
					lastPageID=pageID;
				}
			}
			if(lastPageID != undefined && lastPageID != null) {
				return lastPageID;
			}
		}
	}
	
	return _public;
})