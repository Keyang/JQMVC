(function (parent,opt){
	var nameSpace="mvc";
	parent[nameSpace]={};
	var obj=parent[nameSpace];
	obj.ext=function(parent,key,tarObj){
		if (typeof parent!="object"){
			throw("mvc.ext first param should be entry object.");
		}
		if (typeof key!="string"){
			throw("mvc.ext second param should be key as string.");
		}
		parent[key]=tarObj;
	}
	obj.opt=opt;
})(window,_app_)
mvc.ext(mvc,"cls",{});
mvc.ext(mvc,"util",{
	text:{
		format:function(){
			var args=arguments;
			var str=args[0];
			var rtn=str;
			for (var i=1;i<args.length;i++){
				var index=i-1;
				rtn=rtn.replace("{"+index+"}",args[i]);
			}
			return rtn;
		}
	},
	/**
	 * deeply Copy jsonObj to toJson object
	 * final json object will be returned 
	 */
	copyJSON:function (jsonObj,toJson) {
      var tmpObj= {};
      if (toJson!=undefined) {
        tmpObj=toJson;
      }
      //deep clone for setting json obj
      var tmpOri=jsonObj;
      for (var key in tmpOri) {
        if (!mvc.util.isEmpty(tmpOri[key])) {
          if (tmpOri[key].constructor==Object) {
            tmpObj[key]=mvc.util.copyJSON(tmpOri[key]);
          } else {
            tmpObj[key]=tmpOri[key];
          }
        } else {
          tmpObj[key]=tmpOri[key];
        }
      }
      return tmpObj;
    },
    /**
     * return true if given value is empty.
     */
    isEmpty: function(val) {
      return val==undefined||val===""||val===null||val=== {};
    }
});
/**
 * Log definition
 */
mvc.ext(mvc['cls'], '_log', function() {
	var props = {

	}
	var _private = {
		log : function(str) {
			console.log(str);
		}
	}
	var _public = {
		d : function(debugInfo) {
			debugInfo=debugInfo ||"";
			var template="DEBUG: {0}";
			_private.log(mvc.util.text.format(template,debugInfo));
		},
		i : function(info) {
			info=info || "";
			var template="INFO: {0}";
			_private.log(mvc.util.text.format(template,info));
		},
		/**
		 * Log an error message
		 * @param e: error message as string
		 * @param place: location of the message
		 * @param data: related data
		 */
		e : function(e, place, data) {
			e=e || "";
			if (typeof e==="string"){
			var tmplate="ERROR: {0}. {1}:{2}.";
			_private.log(mvc.util.text.format(tmplate,e,place,data));
			}else{
				throw(e);
			}
		}
	}
	return _public;
});
/**
 * Controller Definition
 */
mvc.ext(mvc.cls, "controller", function() {
	var _props = {
		curCtl : null,
		_ctls : {},
		_controller : {//Controller default settings
			prop : {
				name : "controllerName", // current controller name
				_action : "" // current action will be set dynamically.
			},
			ulti : {
				
			},
			action : {

			}
		}
	};
	
	
	var _private = {
		ctlcls : function(key, param) {
			var components = _props.components;
			var props = _props._controller.props;
			var ulti = _props._controller.ulti;
			var actions = _props._controller.action;
			var that = {};
			//Register pre-defined props
			for(var key in props) {
				that[key] = props[key];
			}
			if( typeof (param["prop"]["name"]) == "undefined") {
				throw ("Please specify a name to controllers");
			} else {
				that["name"] = param["prop"]["name"];
			}
			//Register pre-defined methods
			for(var key in actions) {
				that[key] = __mvc.func.controllerFuncMaker(that, key, actions[key]);
			}

			//Register pre-defined ulties
			for(var key in ulti) {
				that[key] = function(key, ulti, that) {
					return function() {
						return ulti[key].apply(that, arguments);
					}
				}(key, ulti, that);
			}
			//Register user-defined methods,props, ulties, components
			if( typeof (param["prop"]) != "undefined") {
				for(var key in param["prop"]) {
					if( typeof (param["prop"][key]) != "function") {
						that[key] = param["prop"][key];
					}
				}
			}
			if(param["ulti"] != undefined) {
				for(var key in param["ulti"]) {
					that[key] = function(key, ulti, that) {
						return function() {
							try {
								var res = ulti[key].apply(that, arguments);
							} catch(e) {
								console.log("Error in ulti:" + key + " in controller:" + that.name + " Error:" + e);
							}
							return res;
						}
					}(key, param["ulti"], that);
				}
			}
			if(param["action"] != undefined) {
				for(var key in param["action"]) {
					if( typeof (param["action"][key]) != "function") {
						that[key] = param["action"][key];
					} else {
						that[key] = __mvc.func.controllerFuncMaker(that, key, param["action"][key]);
					}
				}
			}
			if(param["components"] != undefined) {
				that["com"] = {};
				//init
				for(var i = 0; i < param["components"].length; i++) {
					if(components[param["components"][i]] != undefined) {
						that["com"][param["components"][i]] = (function() {
							var comName = param["components"][i];
							var com = components[param["components"][i]];
							if( typeof com != "function") {
								return com;
							}
							return function() {
								try {
									return com.apply(com, arguments);
								} catch(e) {
									console.log("error in component:" + comName + " Error:" + e);
								}
							}
						})();
					} else {
						var path = _app_.pluginPath + "P" + param["components"][i] + ".js";
						var res = $.mvc.func.loadPage(path);

						if(res != "") {
							try {

								eval(res);
							} catch(e) {
								console.log("Parse error: " + e + " in componentn:" + param["components"][i]);
							}
						}
						if(components[param["components"][i]] != undefined) {
							that["com"][param["components"][i]] = (function() {
								var comName = param["components"][i];
								var com = components[param["components"][i]];
								if( typeof com != "function") {
									return com;
								}
								return function() {
									try {
										return com.apply(com, arguments);
									} catch(e) {
										console.log("error in component:" + comName + " Error:" + e);
									}
								}
							})();
							continue;
						}
						throw ("Component:" + param["components"][i] + " is not defined");
					}
				}
			}

			if(param["events"] != undefined) {
				that["_uievents"] = param["events"];
			}
			if(param["models"] != undefined) {
				var ms = param["models"];
				if(ms.constructor == Array) {
					for(var i = 0; i < ms.length; i++) {
						that[ms[i]] = $.mvc.model(ms[i]);
					}
				}
			}
			if( typeof (that.name) == "undefined") {
				throw ("name should be specified in a controller");
			}
			if(__mvc.c[that.name] != undefined) {
				throw ("Controller:" + that.name + " has been defined more than once.");
			}

			__mvc.c[that.name] = that;
			//Initialise if init method is defined
			if(that["init"] != undefined) {
				$(document).ready(that["init"]);
			}
		}
	};
	var _public = {
		add : function(key, obj) {
			var param = obj;

		},
		get : function(key) {
			if( typeof key == "undefined") {
				return _props.curCtl;
			} else {
				if(_props._ctls[key] == undefined) {
					mvc.log.e("Cant find controller.", "Key", key);
				}
			}

		}
	};
	return _public;
});

mvc.ext(mvc.cls, "ajax", function() {
	var _props = {
		cachedHtml : {}
	};
	var _private = {
		ajax : function(defparam, userParam) {
			var param = defparam;
			if(userParam !== undefined) {
				for(var key in userParam) {
					param[key] = userParam[key];
				}
			}
			if( typeof mvc.opt.xhr != "undefined") {//fix some issues of jQuery
				param.xhr = mvc.opt.xhr;
			}
			return $.ajax(param);
		},
		asyncLoad : function(path, callback, userParam) {
			function cb(data) {
				try {
					callback(data);
				} catch(e) {
					mvc.log.e(e, "asyncLoad", path);
				}
			}

			if(_props.cachedHtml[path] != undefined) {
				cb(_props.cachedHtml[path]);
				return;
			}
			var param = {
				async : true,
				url : path,
				type : "GET",
				dataType : "text",
				success : function(res) {
					_props.cachedHtml[path]=res;
					cb(res);
				},
				error:function(xhr,text,err){
					mvc.log.e(text,"asyncLoad",path);
					cb("");
				}
			};
			_private.ajax(param,userParam);
		},
		syncLoad : function(path, userParam) {
			var result = null;
			if(_props.cachedHtml[path] != undefined) {
				return _props.cachedHtml[path];
			}
			var param = {
				async : false,
				url : path,
				type : "GET",
				dataType : "text"
			};
			try {
				var _res = _private.ajax(param,userParam);
				if(_res.statusText === "error") {
					mvc.log.e(mvc.string.error.ajax.loadErr, "FilePath", path);
				}
				var res = "";
				//console.log(JSON.stringify(_res));
				if(_res.responseText) {
					res = _res.responseText;
					_props.cachedHtml[path] = res;
				}
				return res;
			} catch(e) {
				mvc.log.e(mvc.string.error.ajax.loadErr, "FilePath", path);
				return "";
			}
		}
	};
	var _public = {
		/**
		 * Synchorous ajax call
		 * @ path url
		 * @ userParam parameters of $.ajax
		 */
		syncLoad : _private.syncLoad,
		/**
		 * Asynchorous ajax call
		 * @ path url
		 * @ callback callback function
		 * @ userParam parameters of $.ajax
		 */
		asyncLoad : _private.asyncLoad
	};
	return _public;
});
/**
 * Part_event.js
 */
mvc.ext(mvc.cls, "event", function(that) {
	var _public = {
		/**
		 * bind a function to an event with key as identifier. If key existed, it will replace existed handler.
		 * @param eventType event type that will be bound.
		 * @param key identifier of the handler.
		 * @param func callback handler.
		 */
		bind : function(eventType, key, func) {
			return _private.bind(eventType, key, func);
		},
		/**
		 * fire an event.
		 * @param eventType event that will be fired.
		 * @param param parameters will be passed in.
		 * @param key handler that will be triggered. if ommited, all handlers of that event type will be triggered.
		 * @param async whether fire the events asynchrously. default is true
		 */
		fire : function(eventType, param, key,async) {
			return _private.fire(eventType, param, key,async);
		},
		/**
		 * same as bind. It will return directly if specified key existed already.
		 * @param eventType event type that will be bound.
		 * @param key identifier of the handler.
		 * @param func handler.
		 */
		bindOnce : function(eventType, key, func) {
			if(_private.eventExists(eventType, key)) {
				return false;
			} else {
				return _public.bind(eventType, key, func);
			}
		},
		/**
		 * Unbind a handler. if Key is ommited all handlers to that eventType will be unbound.
		 */
		unbind : function(eventType, key) {
			if(key != undefined) {

			}
		}
	};

	var _private = {
		unbind : function(eventType, key) {
			if(key != undefined) {
				delete _props.events[eventType][key];
			} else {
				_props.events[eventType] = {};
			}
		},
		bind : function(eventType, key, func) {
			if(_props.events[eventType] == undefined) {
				mvc.log.e(mvc.string.error.event.etnf, "EventType", eventType);
				return false;
			}
			_props.events[eventType][key] = func;
			return true;
		},
		fire : function(eventType, param, key,async) {
			function proc(){
				if(_props.events[eventType] == undefined) {
					mvc.log.e(mvc.string.error.event.etnf, "EventType", eventType);
					return;
				}
				var _funcs = _props.events[eventType];
				if(key != undefined) {
					var func = funcs[key];
					_private.exec(func, param);
				} else {
					for(var key in _funcs) {
						var func = _funcs[key];
						_private.exec(func, param);
					}
				}
			}
			if (async==undefined){
				async=true;
			}
			if (async===true){
				setTimeout(proc, 0);
			}else{
				proc();
			}
			
		},
		exec : function(func, param) {
			if(param == undefined) {
				param = []
			}
			if(!( param instanceof Array)) {
				param = [param];
			}
			try {
				func.apply(_props.scope, param);
			} catch(e) {
				mvc.log.e(e, "Execute event handler", func.toString());
			}

		},
		eventExists : function(eventType, key) {
			try {
				var obj = _props.events[eventType][key];
				if(obj != undefined) {
					return true;
				}
				return false;
			} catch(e) {
				mvc.log.e(e, "Event", eventType + "->" + key);
			}
			return false;
		}
	};
	var _props = {
		events : {
			init : {},
			rendered : {},
			updated : {},
			displayed : {}
		},
		scope : that || {}
	};
	return _public;
});
/**
 * part_parser.js
 */
mvc.ext(mvc.cls, "parser", function() {
	var _public = {
		/**
		 * Parse html code within specific scope(params).
		 * @html Html code be parsed
		 * @param scope JSON object
		 */
		parseHtml : function(html, param) {
			return _private.parseHtml(html, param);
		}
	};
	var _props = {
		startTag : "<?mvc",
		endTag : "?>",
		_basic : {
			__resStack : "",
			echo : function(str) {
				this.__resStack += str;
			}
		}
	};
	var _private = {
		parseHtml : function(__html, param) {
			var __index = -1;
			if(param == undefined || mvc.util.isEmpty(param)) {
				param = {};
			}
			mvc.util.copyJSON(_props._basic, param);
			if(__html == undefined) {
				return "";
			}
			var st = _props.startTag;
			var et = _props.endTag;
			while(( __index = __html.indexOf(st)) != -1) {
				param.__resStack = "";
				var __startPos = __index + st.length + 1;
				var __endPos = __html.indexOf(et, __startPos);
				var __statement = __html.substring(__startPos, __endPos);
				var __val = "";
				__val = mvc.parseExec(__statement, param);
				if(__val == undefined) {
					__val = "";
				}
				__val = param.__resStack + __val;
				__html = __html.replace(__html.substring(__index, __endPos + 2), __val);
			}
			return __html
		}
	};
	return _public;
});

mvc.ext(mvc, "parseExec", function(__code__, __scope__) {
	with(__scope__) {
		try {
			return eval(__code__);
		} catch(e) {
			mvc.log.e(e, "Parse MVC code:", __code__);
		}
	}
});
mvc.ext(mvc, "parseJSON", function(__code__) {
		try {
			return eval("("+__code__+")");
		} catch(e) {
			mvc.log.e(e, "Parse JSON Object:", __code__);
		}
});
mvc.ext(mvc,"string",{
	error:{
		view:{
		"vnun":"View name should not be undefined",
		"vnex":"Cannot set a view as current view that is not existed!"
		},
		ajax:{
			"loadErr":"Ajax loading file error"
			
		},
		event:{
			"etnf":"Event type indicated not found."
		}
	},
	info:{
		view:{
			"ravt":"Trying to render a view that is displaying. Use update method instead.",
			"lpf":"Load Page From:"
		}
	}
});
/**
 * part_uidata.js
 */
mvc.ext(mvc.cls, "uidata", function() {
	var _public = {
		/**
		 * setup global UI data
		 * global UI data can only be changed by this function.
		 */
		setGlobalData : function(jsonObj) {
			_private.setGlobalData(jsonObj);
		},
		getUIDataScope:function(dataPath){
			return _private.getUIDataScope(dataPath);
		}
	}
	var _private = {
		setGlobalData : function(jsonObj) {
			_props.globalData = jsonObj;
		},
		getUIDataScope : function(datapath) {
			var gloObj = mvc.util.copyJSON(_props.globalData);
			var tmpObj ={};
			if(_props.cachedJSON[datapath] != undefined) {
				tmpObj = _props.cachedJSON[datapath];
			} else {
				var res = mvc.ajax.syncLoad(datapath, {
					dataType : "json"
				});
				if(res != undefined && res != "") {
					try {
						if( typeof res == "object") {
							tmpObj = res;
						} else {
							try {
								tmpObj = mvc.parseJSON(res);
							} catch(e) {
								mvc.log.e(e, "Load UI Data", datapath);
							}
						}
						_props.cachedJSON[datapath]=tmpObj;
					} catch(e) {
						mvc.log.e(e, "Load UI Data", datapath);
					}

				}
			}
			tmpObj._global=gloObj;
			return tmpObj;
		}
	}
	var _props = {
		globalData : {},
		cachedJSON : {}
	}
	return _public;

});
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
			for(var key in opt) {
				_props[key] = opt[key];
			}
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
			var curView = mvc.view.get();
			if(curView != null && curView.getName() === _props.name) {
				return;
			}
			mvc.view.setCurView(_props.name);
			_public.display(mvc.opt.interfaces.goForwPage);
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
		"isRendered" : false,
		"eventObj" : {},
		"initOnce" : false,
		"layout" : "default",
		"uidataPath" : null,
		"htmlPagePath" : null,
		"uidata" : null,
		"event" : new mvc.cls.event(),
		"wrapperTag" : "div"
	};
	var _private = {
		init : function() {
			_props.uidata = mvc.uidata.getUIDataScope(_private.getUIDataPath());
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
			$("#" + pageID).remove();
			mvc.ajax.asyncLoad(path, function(pageHtml) {
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
					$(mvc.opt.appContainer).append(finalHtml);
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
/**
 * Generate entries
 */

mvc.ext(mvc,"log", new mvc.cls._log());
mvc.ext(mvc,"ajax",new mvc.cls.ajax());
mvc.ext(mvc,"parser",new mvc.cls.parser());
mvc.ext(mvc,"uidata",new mvc.cls.uidata());
mvc.ext(mvc,"controller", new mvc.cls.controller());
mvc.ext(mvc,"view", new mvc.cls.view());
