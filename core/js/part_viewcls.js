/**
 * user view class
 * part_viewcls.js
 */
mvc.ext(mvc.cls, "_view", function(name, domEvent) {
	var _public = {
		/**
		 * Synchorously load / render / display current view.
		 */
		show:function(){
			return _private.show();
		},
		/**
		 * fire an event.
		 * @param eventType event that will be fired.
		 * @param param parameters will be passed in.
		 * @param key handler that will be triggered. if ommited, all handlers of that event type will be triggered.
		 * @param async whether fire the events asynchrously. default is false
		 */
		fire : function(eventType, param, key, async) {
			return _private.fire(eventType, param, key, async);
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
		 * @param forward Is page go forward or backward.
		 */
		display : function(forward) {
			return _private.display(forward);
		},
		/**
		 * Asynchrously and forcely load view to memory. "loaded" event will be triggered if it is done.
		 * @param isReload: forcely reload
		 * @param cb: callback func once loaded
		 */
		load : function(isReload) {
			return _private.load(isReload);
		},
		/**
		 * Load stored html to dom.
		 * @param isReload. default false.
		 */
		loadDom : function(isReload) {
			return _private.loadDom(isReload);
		},
		removeDom : function() {
			return _private.removeDom();
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
		$ : function(selector) {
			return _private.page(selector);
		},
		/**
		 * remove this view
		 */
		remove:function(){
			return _private.remove();
		}
	};

	var _props = {
		"name" : name,
		"param" : {},
		"loadStatus" : "init", // init,  loading, parsing, loaded
		"eventObj" : {}, // beforeLoad, beforeParse,afterParse, loaded, domReady, displayed
		"initOnce" : false,
		"uidataPath" : null,
		"htmlPagePath" : null,
		"uidata" : null,
		"events" : new mvc.cls.event(_public),
		"wrapperTag" : "div",
		"htmlCode" : "",
		"isUIdataLoaded" : false
	};
	var _private = {
		remove:function(){
			_private.removeDom();
			_props.loadStatus="removed";
			for (var key in _public){
				_public[key]=function(){};
			}
		},
		display:function(forward){
			var obj=_private.page();
			if (obj.length==0){
				_private.loadDom(true);
			}
			try {
				if(forward === false) {
					func = mvc.opt.interfaces.goBackPage;
				} else {
					func = mvc.opt.interfaces.goForwPage;
				}
				func(_props.name);
				_public.fire("displayed", {}, undefined, false);
			} catch(e) {
				mvc.log.e(e, "Display View", _props.name);
			}
		},
		show:function(){
			_private.load();
			_private.loadDom();
			_private.display(true);
		},
		loadDom : function(isReload) {
			if (isReload==undefined){
				isReload=false;
			}
			if (_props.loadStatus!="loaded"){
				_private.removeDom();
				_private.load(true);
			}
			if(_props.loadStatus === "loaded") {
				if(mvc.$("#" + _public.getName()).length === 0 || isReload===true) {
					mvc.$().append(_props.htmlCode);
					_public.fire("domReady", _public.$(), undefined, false);
				}
				return;
				
			}else{
				mvc.log.e("Cannot load view properly.","view name:",_public.getName());
			}
			
		},
		deferExec : function(func) {
			if("loaded" === _props.loadStatus) {
				if(func != undefined) {
					func();
				}
			} else if("beforeLoad" === _props.loadStatus || "beforeParse" === _props.loadStatus || "afterParse" === _props.loadStatus) {
				if(func != undefined) {
					_public.bind("loaded", "_tmpCb", function() {
						_public.unbind("loaded", "_tmpCb");
						func();
					})
				}
			}
		},
		load : function(isReload) {
			if(isReload === true) {
				_props.loadStatus = "init";
				_props.htmlCode = "";
			}
			if("loaded" === _props.loadStatus) {
				return;
			}
			if("init" != _props.loadStatus) {
				return;
			}
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
			_public.fire("beforeLoad");
			mvc.log.i(mvc.string.info.view.lpf + path);
			var pageHtml = mvc.ajax.syncLoad(path);
			if(!_props.isUIdataLoaded) {
				_props.uidata = mvc.uidata.getUIDataScope(_private.getUIDataPath());
			}
			var uidata = mvc.util.copyJSON(_props.uidata);
			var params = mvc.util.copyJSON(_props.param, uidata);
			_props.loadStatus = "loading";
			pageHtml = _public.fire("beforeParse", pageHtml, undefined, false);
			var parsedPageHtml = mvc.parser.parseHtml(pageHtml, params);
			_props.loadStatus = "parsing";
			parsedPageHtml = _public.fire("afterParse", parsedPageHtml, undefined, false);
			var finalHtml = mvc.util.text.format("<{1} id='{0}' class='{3}'>{4}</{2}>", pageID,  _props.wrapperTag, _props.wrapperTag,mvc.viewMgr.getPageCls(),parsedPageHtml);
			_props.htmlCode = finalHtml;
			_props.loadStatus = "loaded";
			_public.fire("loaded", {}, undefined, false);
		},
		page : function(selector) {
			if(mvc.$("#" + _props.name).length==0) {
				mvc.log.e("View DOM is not ready.", "View:", _public.getName());
				return;
			}
			if( typeof selector == "undefined") {
				return mvc.$("#" + _props.name);
			} else {
				return mvc.$("#" + _props.name).find(selector);
			}
		},
		removeDom : function() {
				mvc.$("#" + _props.name).remove();
		},
		fire : function(eventType, param, key, async) {
			var res = mvc.viewMgr.events.fire(eventType, param, key, async, _public);
			return _props.events.fire(eventType, res, key, async);
			 
		},
		setOptions : function(opt) {
			for(var key in opt) {
				_private.optionInteruptter(key);
				_props[key] = opt[key];

			}
		},
		optionInteruptter : function(keyName) {
			if("name" === keyName) {
				_props.isUIdataLoaded = false;
				_private.removeDom();
			}
			if("uidataPath" === keyName) {
				_props.isUIdataLoaded = false;
			}

		},
		init : function() {
			mvc.util.copyJSON(_props.events, _public, false);
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

		}
	};
	_private.init();
	return _public;
});
