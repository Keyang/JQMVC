/**
 *  abstract view class
 * part_viewcls.js
 */
mvc.ext(mvc.cls, "absview", mvc.Class.create(mvc.cls.observer, {
	"viewMgr" : null,
	"name" : "undefined",
	"op_buf" : "",
	"events" : null,
	"model" : null,
	/**
	 * bind model to current view
	 */
	bindModel : function(model) {
		if(this.model) {
			this.model.unsubscribe(this.getName());
		}
		this.model = model;
		this.model.subscribe(this);
	},
	/**
	 * class constructor
	 */
	initialise : function(name, viewMgr) {
		this.name = name;
		this.viewMgr = viewMgr;
		this.events = new mvc.cls.event(this);
	},
	/**
	 * Echo data to output buffer
	 */
	echo : function(str) {
		this.op_buf += str;
	},
	show : function() {
		throw ("Show method should be overwritten.");
	},
	update : function() {
		throw ("update method should be overwritten.");
	},
	/**
	 * fire an event of both global and private.
	 * @param eventType event that will be fired.
	 * @param param parameters will be passed in.
	 * @param key handler that will be triggered. if ommited, all handlers of that event type will be triggered.
	 * @param async whether fire the events asynchrously. default is false
	 */
	fire : function(eventType, param, key, async) {
		var res;
		if(this.viewMgr && this.viewMgr != null) {
			res = this.viewMgr.events.fire(eventType, param, key, async, this);
		}
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
			if( typeof this[key] == "function") {
				this[key] = function() {
				};
			} else {
				this[key] = null;
			}
		}
	},
	/**
	 * display current view
	 * It will fire "displayed" event
	 * Return displayed content
	 */
	display : function(isStack) {
		
		var vmgr=this.viewMgr;
		if (isStack){
			var curView=vmgr.get();
			if (curView!=null){
				vmgr.historyStack.push(curView.getName());
			}
			
		}
		this.fire("displayed", [this,vmgr], undefined, false);
		return this.op_buf;
	},
	/**
	 * overwrite observer notify method. Notification should be from subscribing models.
	 */
	notify : function() {
		this.update();
	}
}));
