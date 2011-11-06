/**
 * user view class
 * part_viewcls.js
 */
mvc.ext(mvc.cls, "_view", function(name) {
	var _public = {
		/**
		 * fire an event.
		 * @param eventType event that will be fired.
		 * @param param parameters will be passed in.
		 * @param key handler that will be triggered. if ommited, all handlers of that event type will be triggered.
		 * @param async whether fire the events asynchrously. default is true
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
			try {
				if(forward === false) {
					func = mvc.opt.interfaces.goBackPage;
				} else {
					func = mvc.opt.interfaces.goForwPage;
				}
				func(_props.name);
				_public.fire("displayed");
			} catch(e) {
				mvc.log.e(e, "Display View", _props.name);
			}
		},
		/**
		 * Asynchrously and forcely load view to memory. callback when it is done.
		 * @param func: callback function
		 * @param isReload: forcely reload
		 */
		load : function(func,isReload) {
			return _private.load(func,isReload);
		},
		/**
		 * Load stored html to dom.
		 */
		loadDom : function() {
			return _private.loadDom();
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
			return _private.page(selector);
		}
	};

	var _props = {
		"name" : name,
		"param" : {},
		"loadStatus" : "init",
		"eventObj" : {},
		"initOnce" : false,
		"uidataPath" : null,
		"htmlPagePath" : null,
		"uidata" : null,
		"event" : new mvc.cls.event(_public),
		"wrapperTag" : "div",
		"htmlCode" : "",
		"isUIdataLoaded" : false
	};
	var _private = {
		loadDom : function() {
			if (_props.loadStatus==="loaded"){
				$(mvc.opt.appContainer).find("#" + _public.getName()).remove();
				$(mvc.opt.appContainer).append(_props.htmlCode);
				_public.fire("domReady",_public.page(),undefined,false);
			}else{
				mvc.log.e("trying to load dom that is not loaded:"+_props.name);
			}
		},
		deferExec:function(func){
			if ("loaded"===_props.loadStatus){
				if (func!=undefined){
					func();
				}
			}else if ("beforeLoad"===_props.loadStatus || "beforeParse" === _props.loadStatus || "afterParse"===_props.loadStatus){
				if (func!=undefined){
					_public.bind("loaded","_tmpCb",function(){
						_public.unbind("loaded","_tmpCb");
						func();
					})
				}
			}
		},
		load:function(func,isReload){
			if (isReload===true){
				_props.loadStatus="init";
			}
			if ("init"!=_props.loadStatus){
				_private.deferExec(func);
				return ;
			}
			_private.loadView(function() {
				/*_props.event.fire("updated")
				var curView = mvc.view.get();
				if(curView != null) {
					if(curView.getName() === _props.name) {
						_public.page().show();
					}
				}*/
				if(func != undefined) {
					func();
				}

			});
		},
		page : function(selector) {
			if( typeof selector == "undefined") {
				return $(mvc.opt.appContainer).find("#" + _props.name);
			} else {
				return $(mvc.opt.appContainer).find("#" + _props.name).find(selector);
			}
		},
		removeDom : function() {
			_private.page().remove();
		},
		fire : function(eventType, param, key, async) {
			var res=_props.event.fire(eventType, param, key, async);
			return mvc.view.event.fire(eventType, res, key, async, _public);
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
			mvc.util.copyJSON(_props.event, _public, false);
			_public.bind("beforeLoad","_changeStatus",function(){
				_props.loadStatus="loading";
			});
			_public.bind("beforeParse","_changeStatus",function(){
				_props.loadStatus="parsing";
			});
			_public.bind("loaded","_changeStatus",function(){
				_props.loadStatus="loaded";
			});
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
			_public.fire("beforeLoad");
			mvc.log.i(mvc.string.info.view.lpf + path);
			mvc.ajax.asyncLoad(path, function(pageHtml) {
				if(!_props.isUIdataLoaded) {
					_props.uidata = mvc.uidata.getUIDataScope(_private.getUIDataPath());
				}
				var uidata = mvc.util.copyJSON(_props.uidata);
				var params = mvc.util.copyJSON(_props.param, uidata);
				pageHtml=_public.fire("beforeParse", pageHtml, undefined, false);
				var parsedPageHtml = mvc.parser.parseHtml(pageHtml, params);
				parsedPageHtml=_public.fire("afterParse", parsedPageHtml, undefined, false);
				var finalHtml = mvc.util.text.format("<{2} id='{0}' style='display:none'>{1}</{3}>", pageID,parsedPageHtml, _props.wrapperTag, _props.wrapperTag);
				_props.htmlCode = finalHtml;
				_public.fire("loaded");
				try {
					callback();
				} catch(e) {
					mvc.log.e(e, "loadView", path);
				}
			})
		}
	};
	_private.init();
	return _public;
});
