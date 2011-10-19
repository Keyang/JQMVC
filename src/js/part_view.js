/**
 * View Definition
 */
mvc.ext(mvc.cls, "view", function() {
	var _public = {
		/**
		 * Get or created a view with specific name & Push created view to view manager.
		 * If no name is given, current view will be returned. If current view is not set, null will return.
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
		 * Set Specified view as current view. This will not change page.
		 */
		setCurView : function(name) {
			return _private.setCurView(name);
		},
		/**
		 * load and render a specified view. This will be managed by view ctl. Later loaded view will be displayed.
		 * @param name name of the view
		 */
		loadRender : function(name) {
			return _private.loadRender(name);
		}
	}

	var _props = {
		curView : null,
		_views : {},
		viewRendering : null,
	};
	var _private = {
		loadRender : function(name) {
			if(_private.isViewExisted(name) === false) {
				return;
			}
			var view = _props.viewRendering = _private.get(name);
			view.load(function(){
				if(_props.viewRendering.getName() == view.getName()) {
					view.render();
				}
			})
		},
		get : function(name) {
			if( typeof name == "undefined") {
				return _props.curView;
			}
			if(_props._views[name] != undefined) {
				return _props._views[name];
			} else {
				var obj = new mvc.cls._view(name);
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
		},
		setCurView : function(name) {
			if(!_public.isViewExisted(name)) {
				mvc.log.e(mvc.string.error.view["vnex"], "View Name", name);
				return;
			}
			_props.curView = _public.get(name);
		}
	};

	return _public;
});
