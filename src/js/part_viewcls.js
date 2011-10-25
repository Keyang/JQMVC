/**
 * user view class
 * part_viewcls.js
 */
mvc.ext(mvc.cls, "_view", function(name) {
	var _public = {
		/**
		 * Bind a event with specified key
		 * @param eventType pageEventType
		 * @param key string
		 * @param func handler
		 */
		bind : function(eventType, key, func) {
		},
		/**
		 * Bind an event with specified key only one time
		 * @param eventType pageEventType
		 * @param key string
		 * @param func handler
		 */
		bindOnce : function(eventType, key, func) {
		},
		/**
		 * fire an event.
		 * @param eventType event that will be fired.
		 * @param param parameters will be passed in.
		 * @param key handler that will be triggered. if ommited, all handlers of that event type will be triggered.
		 */
		fire : function(eventType, param, key) {
		},
		/**
		 * Set View Options.
		 * @param opt option object
		 */
		setOptions : function(opt) {
			return _private.setOptions(opt);
		},
		/**
		 * Display this view.
		 * @param func function that will be used for displaying. It could be Interface.goForwPage or Interface.goBackPage.
		 */
		display : function(func) {
			try {
				func(_props.name);
				_props.event.fire("displayed");
			} catch(e) {
				mvc.log.e(e, "Display View", _props.name);
			}
		},
		/**
		 * Asynchrously and forcely load view from html file and apply parameters to html page. This will affect if the view is currently displaying. "update" event will be raised.
		 * @param func: callback function
		 */
		load : function(func) {
			_private.loadView(function() {
				_props.event.fire("updated")
				var curView = mvc.view.get();
				if(curView != null) {
					if(curView.getName() === _props.name) {
						_public.page().show();

					}
				}
				if(func != undefined) {
					func();
				}

			});
		},
		/**
		 * render loaded view. Bring view page to front and set current view as this view.
		 */
		render : function() {
			$(mvc.opt.appContainer).find("#" + _public.getName()).remove();
			$(mvc.opt.appContainer).append(_props.htmlCode);
			mvc.view.display(_props.name);
		},
		getName : function() {
			return _props.name;
		},
		/**
		 * Reset all parameters
		 */
		resetParam : function() {
			_props.param = {};
		},
		/**
		 * set a viewer variable
		 * @param {Object} name
		 * @param {Object} val
		 */
		setParam : function(name, val) {
			_props["param"][name] = val;
		},
		getParam : function(name) {
			return _props["param"][name];
		},
		/**
		 * Return a jQuery Object within current view
		 * page container will be returned if no selector given.
		 */
		page : function(selector) {
			if( typeof selector == "undefined") {
				return $("#" + _props.name);
			} else {
				return $("#" + _props.name).find(selector);
			}
		},
		/**
		 * set "this" to function scope
		 */
		callback : function(func, that) {
			if( typeof (that) == "undefined") {
				that = this;
			}
			return function() {
				func.apply(that, arguments);

			}
		},
		viewer : function() {
			return $.mvc.curViewer;
		}
	};

	var _props = {
		"name" : name,
		"param" : {},
		"isLoaded" : false,
		"eventObj" : {},
		"initOnce" : false,
		"layout" : "default",
		"uidataPath" : null,
		"htmlPagePath" : null,
		"uidata" : null,
		"event" : new mvc.cls.event(),
		"wrapperTag" : "div",
		"htmlCode":"",
		"isUIdataLoaded":false
	};
	var _private = {
		setOptions : function(opt) {
			for(var key in opt) {
				_props[key] = opt[key];
				_private.optionInteruptter(key);
			}
		},
		optionInteruptter:function(keyName){
			if ("name"===keyName){
				_props.isUIdataLoaded=false;
			}
			if ("uidataPath"===keyName){
				_props.isUIdataLoaded=false;
			}
			
		},
		init : function() {
			mvc.util.copyJSON(_props.event, _public);
		},
		getUIDataPath : function() {
			if(_props.uidataPath == null) {
				return mvc.opt.uidataPath + "/" + _props.name + ".json";
			} else {
				return _props.uidataPath;
			}
		},
		getHtmlPagePath : function() {
			if(_props.htmlPagePath == null) {
				return mvc.opt.pagePath + "/" + _props.name + ".html";
			} else {
				return _props.htmlPagePath;
			}

		},
		loadView : function(callback) {
			var path = _private.getHtmlPagePath();
			var pageID = _props.name;
			var layoutPath = mvc.opt.layoutPath + "/" + _props.layout + ".html";
			if(_props.initOnce === true && $("#" + pageID).length > 0) {
				try {
					callback();
				} catch(e) {
					mvc.log.e(e, "loadView", path);
				}
			}
			mvc.log.i(mvc.string.info.view.lpf + path);
			mvc.ajax.asyncLoad(path, function(pageHtml) {
				if (!_props.isUIdataLoaded){
					_props.uidata = mvc.uidata.getUIDataScope(_private.getUIDataPath());
				}
				var uidata = mvc.util.copyJSON(_props.uidata);
				var params = mvc.util.copyJSON(_props.param, uidata);
				var parsedPage = mvc.parser.parseHtml(pageHtml, params);
				params["__content__"] = parsedPage;
				mvc.ajax.asyncLoad(layoutPath, function(layoutHtml) {
					if(layoutHtml == "") {
						layoutHtml = "<?mvc __content__?>";
					}
					var pageHtml = mvc.parser.parseHtml(layoutHtml, params);
					var obj = {
						html : pageHtml
					};
					_props.event.fire("init", obj,undefined,false);
					var finalHtml = mvc.util.text.format("<{2} id='{0}' style='display:none'>{1}</{3}>", pageID, obj.html, _props.wrapperTag, _props.wrapperTag);
					_props.htmlCode=finalHtml;
					_props.isLoaded=true;
					try {
						callback();
					} catch(e) {
						mvc.log.e(e, "loadView", path);
					}
				})
			})
		}
	};
	_private.init();
	return _public;
});
