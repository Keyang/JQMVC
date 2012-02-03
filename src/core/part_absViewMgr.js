/**
 * Abstract view manager class
 * part_absViewMgr.js
 *
 */
mvc.ext(mvc.cls, "absViewMgr", mvc.Class.create({
	props : {
		viewCls : null,
		curView : null,
		_views : {}
	},
	historyStack : new mvc.cls.history(),
	initialise : function(newprops) {
		this.events = new mvc.cls['event']();
		if(newprops && typeof newprops === "object") {
			for(var key in newprops) {
				this.props[key] = newprops[key];
			}
		}
		this.events.bind("displayed", "_history_event", function() {
			var curView = _private.get();
			if(curView != null) {
				_props.history.push(curView.getName());
			}
			_props.curView = this;
		});
	},
	/**
	 * Get or created a view with specific name & Push created view to view manager.
	 * If no name is given, current view (displayed) will be returned. If current view is not set, null will return.
	 * If a new name is given, a new view will be created.
	 */
	get : function(name) {
		if( typeof name == "undefined") {
			return this.props.curView;
		}
		if(this.props._views[name] != undefined) {
			return this.props._views[name];
		} else {
			var obj = new this.viewCls(name);
			this.props._views[name] = obj;
			return obj;
		}
	},
	/**
	 * view callback iterator
	 */
	each : function(func) {
		for(var key in this.props._views) {
			func(this.props._views[key]);
		}
	},
	/**
	 * Return whether a specified view existed.
	 */
	isViewExisted : function(name) {
		if( typeof name == "undefined") {
			mvc.log.e(mvc.string.error.view["vnun"], "mvc.view.isViewExisted with parameter:", name);
			return false;
		}
		if(this.props._views[name] != undefined) {
			return true;
		} else {
			return false;
		}
	},
	/**
	 * Forcely init a new view. it will replace existing one.
	 */
	init : function(name) {
		return this.props._views[name] = new this.props.viewCls(name);
	},
	/**
	 * clear history stack
	 */
	clearHistory : function() {
		return this.history.clear();
	},
	clearAll : function() {
		this.each(function(v) {
			v.remove();
		})
		this.clearHistory();
		this.props._views = {};
		this.props.curView = null;
	}
}));
