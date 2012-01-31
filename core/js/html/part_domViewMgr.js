/**
 * View Manager Definition
 * ./html/part_view.js
 */
mvc.ext(mvc.html, "domViewMgr",mvc.Class.create(mvc.cls.absViewMgr,new (function() {
	var _public = {
		/**
		 * Get or created a view with specific name & Push created view to view manager.
		 * If no name is given, current view (displayed) will be returned. If current view is not set, null will return.
		 * If a new name is given, a new view will be created.
		 */
		get : function(name) {
			return _private.get(name);
		},
		/**
		 * Return whether a specified view existed.
		 */
		isViewExisted : function(name) {
			return _private.isViewExisted(name);
		},
		/**
		 * Init a new view. it will replace existing one.
		 */
		init : function(name) {
			return _private.reset(name);
		},
		/**
		 * display last view in history stack.
		 */
		back : function() {
			return _private.back();
		},
		clearHistory : function() {
			return _private.clearHistory();
		},
		/**
		 * preload views
		 * @param view array.
		 * @param async. default true
		 */
		preLoad : function(viewArr, async) {
			return _private.preLoad(viewArr,async);
		},
		/**
		 * preload all views
		 * @param async. default true
		 */
		preLoadAll : function(async) {
			return _private.preLoadAll(async);
		},
		/**
		 * setup the cls of page
		 * @param str class name
		 */
		setPageCls : function(str) {
			return _private.setPageCls(str);
		},
		/**
		 * get the cls of page
		 */
		getPageCls : function() {
			return _private.getPageCls();
		},
		/**
		 * clear all views, history, dom
		 */
		clearAll : function() {
			return _private.clearAll();
		}
		//Event interfaces
	}

	var _props = {
		curView : null,
		_views : {},
		history : new mvc.cls.history(),
		events : new mvc.cls.event(),
		pageCls : "page"
	};
	var _private = {
		preLoad : function(viewArr, async) {
			for (var i=0;i<viewArr.length;i++){
				var view=viewArr[i];
				if (async===false){
					view.loadDom();
				}else{
					(function(){
						var v=view;
						setTimeout(function(){
							v.loadDom();
						},1)
					})();
				}
			}
		},
		preLoadAll : function(async) {
			_private.each(function(v) {
				if(async === false) {
					v.loadDom();
				} else {
					setTimeout(function() {
						v.loadDom();
					}, 1);
				}
			})
		},
		each : function(func) {
			for(var key in _props._views) {
				func(_props._views[key]);
			}
		},
		clearAll : function() {
			_private.each(function(v) {
				v.remove();
			})
			_private.clearHistory();
			_props._views = {};
			_props.curView = null;
		},
		getPageCls : function() {
			return _props.pageCls;
		},
		clearHistory : function() {
			_props.history.clear();
		},
		init : function() {
			_public['events'] = _props.events;
			_public.events.bind("displayed", "_history_event", function() {
				var curView = _private.get();
				if(curView != null) {
					_props.history.push(curView.getName());
				}
				_props.curView = this;
			})
		},
		back : function() {
			var viewName = _props.history.back();
			if(viewName != undefined) {
				_private.get(viewName).display(false);
			}
			return viewName;
		},
		reset : function(name) {
			return _props._views[name] = new mvc.cls.view_dom(name);
		},
		get : function(name) {
			if( typeof name == "undefined") {
				return _props.curView;
			}
			if(_props._views[name] != undefined) {
				return _props._views[name];
			} else {
				var obj = new mvc.cls.view_dom(name);
				_props._views[name] = obj;
				return obj;
			}
		},
		isViewExisted : function(name) {
			if( typeof name == "undefined") {
				mvc.log.e(mvc.string.error.view["vnun"], "mvc.view.isViewExisted with parameter:", name);
				return false;
			}
			if(_props._views[name] != undefined) {
				return true;
			} else {
				return false;
			}
		}
	};
	_private.init();
	return _public;
}))());
