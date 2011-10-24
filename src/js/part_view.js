/**
 * View Definition
 * part_view.js
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
		 * Try to display loaded view.
		 */
		display : function(name) {
			return _private.display(name);
		},
		/**
		 * load and render a specified view. This will be managed by view ctl. Last loaded view will be displayed.
		 * @param name name of the view
		 */
		loadRender : function(name) {
			return _private.loadRender(name);
		},
		/**
		 * Reset specified view with default view object.
		 */
		reset : function(name) {
			return _private.reset(name);
		},
		/**
		 * go back to last view.
		 */
		back:function(){
			return _private.back();
		}
	}

	var _props = {
		curView : null,
		_views : {},
		viewRendering : null,
		history:new mvc.cls.history()
	};
	var _private = {
		back:function(){
			var viewName=_props.history.back();
			_private.display(viewName,false);
		},
		reset : function(name) {
			_props._views[name] = new mvc.cls._view(name);
		},
		loadRender : function(name) {
			if(_private.isViewExisted(name) === false) {
				return;
			}
			mvc.log.i("Current Loading View:"+name);
			var view = _props.viewRendering = _private.get(name);
			view.load(function() {
				mvc.log.i("Intended Rendering View:"+view.getName());
				if(_props.viewRendering.getName() == view.getName()) {
					view.render();
				}else{
					var tmp="View Render Interrupted for:"+view.getName();
					mvc.log.i(tmp);
				}
			});
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
		display : function(name,forward) {
			if(!_public.isViewExisted(name)) {
				mvc.log.e(mvc.string.error.view["vnex"], "Display View", name);
				return;
			}
			try {
				var view = _public.get(name);
				_props.curView = view;
				var func=mvc.opt.interfaces.goForwPage;
				if (forward===false){
					func=mvc.opt.interfaces.goBackPage;					
				}
				view.display(func);
			} catch(e) {
				mvc.log.e(e,"Display View",name);
			}

		}
	};

	return _public;
});
