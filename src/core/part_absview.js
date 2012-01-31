/**
 *  abstract view class
 * part_viewcls.js
 */
mvc.ext(mvc.cls, "absview", mvc.Class.create({
	
		"name" : "undefined",
		"op_buf" : "",
		"events" : null,
		/**
		 * class constructor
		 */
		initialise : function(name) {
			this.name = name;
			this.events=new mvc.cls.event(this);
		},
		/**
		 * Echo data to output buffer
		 */
		echo : function(str) {
			this.op_buf+=str;
		},
		show : function() {
			throw("Show method should be overwritten.");
		},
		/**
		 * fire an event.
		 * @param eventType event that will be fired.
		 * @param param parameters will be passed in.
		 * @param key handler that will be triggered. if ommited, all handlers of that event type will be triggered.
		 * @param async whether fire the events asynchrously. default is false
		 */
		fire : function(eventType, param, key, async) {
			var res = mvc.viewMgr.events.fire(eventType, param, key, async, this);
			return this.events.fire(eventType, res, key, async);
		},
		getName : function() {
			return this.name;
		},
		/**
		 * remove this view
		 */
		remove : function() {
			for(var key in this) {
				if (typeof this[key] == "function" ){
					this[key] = function() {};
				}else{
					this[key]=null;
				}
			}
		}
}));
