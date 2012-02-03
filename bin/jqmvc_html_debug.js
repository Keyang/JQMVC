/**
 * part_basic.js
 */

(function(parent, opt) {
	var nameSpace = "mvc";
	parent[nameSpace] = {};
	var obj = parent[nameSpace];
	obj.ext = function(parent, key, tarObj) {
		if( typeof parent != "object") {
				throw("mvc.ext first param should be entry object.");
		}
		if( typeof key != "string") {
			throw ("mvc.ext second param should be key as string.");
		}
		if(parent[key] != undefined) {
			mvc.log.i("Overwritten extention detected.");
		}
		parent[key] = tarObj;
	}
	obj.opt = opt;
})(window, _app_);
mvc.ext(mvc, "cls", {});
mvc.ext(mvc, "util", {
	text : {
		format : function() {
			var args = arguments;
			var str = args[0];
			var rtn = str;
			for(var i = 1; i < args.length; i++) {
				var index = i - 1;
				rtn = rtn.replace("{" + index + "}", args[i]);
			}
			return rtn;
		}
	},
	/**
	 * deeply Copy jsonObj to toJson object
	 * final json object will be returned
	 */
	copyJSON : function(jsonObj, toJson, override) {
		var tmpObj = {};
		if(toJson != undefined) {
			tmpObj = toJson;
		}
		//deep clone for setting json obj
		var tmpOri = jsonObj;
		for(var key in tmpOri) {
			if(override === false) {
				if(tmpObj[key] != undefined) {
					continue;
				}
			}
			if(!mvc.util.isEmpty(tmpOri[key])) {
				if(tmpOri[key].constructor == Object) {
					tmpObj[key] = mvc.util.copyJSON(tmpOri[key]);
				} else {
					tmpObj[key] = tmpOri[key];
				}
			} else {
				tmpObj[key] = tmpOri[key];
			}
		}
		return tmpObj;
	},
	/**
	 * return true if given value is empty.
	 */
	isEmpty : function(val) {
		return val == undefined || val === "" || val === null || val === {};
	}
});

/**
 * part_class.js
 */
mvc.ext(mvc, "Class", (function() {

	function isFunction(param) {
		if( typeof param == "function") {
			return true;
		}
		return false;
	};

	function subclass() {
	};

	function apply(host, items) {
		for(var key in items) {
			host[key] = items[key];
		}
	}

	function $A(arr) {
		var rtn = new Array();
		for(var i = 0; i < arr.length; i++) {
			rtn.push(arr[i]);
		}
		return rtn;
	}

	function argumentNames(func) {
		var names = func.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1].replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '').replace(/\s+/g, '').split(',');
		return names.length == 1 && !names[0] ? [] : names;
	}

	function create() {
		var parent = null, properties = $A(arguments);
		if(isFunction(properties[0])) {
			parent = properties.shift();
		}

		function mvclass() {
			this.initialise.apply(this, arguments);
		}

		apply(mvclass, mvc.Class.Methods);
		mvclass.superclass = parent;
		mvclass.subclasses = [];

		if(parent) {
			subclass.prototype = parent.prototype;
			mvclass.prototype = new subclass;
			parent.subclasses.push(mvclass);
		}

		mvclass.addMethods(properties[0]);

		if(!mvclass.prototype.initialise) {
			mvclass.prototype.initialise = function() {
			};
		}
		mvclass.prototype.constructor = mvclass;
		return mvclass;
	}

	function addMethods(source) {
		var ancestor = this.superclass && this.superclass.prototype;

		for(var key in source) {
			var property = key, value = source[key];
			if(ancestor && isFunction(value) && argumentNames(value)[0] == "$super") {
				var oldValue = value;
				value = (function() {
					var curFunc = oldValue;
					var m = property;
					return function() {
						var that=this;
						var method = function() {
								return ancestor[m].apply(that, arguments);
							};
						var argu = $A(arguments) || [];
						argu.unshift(method);
						curFunc.apply(this, argu);
					}
				})();
			}
			this.prototype[property] = value;
		}

		return this;
	}

	return {
		create : create,
		Methods : {
			addMethods : addMethods
		}
	};
})());
/**
 * console Log definition
 * part_log.js
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
		/**
		 * Debug message
		 */
		d : function(debugInfo) {
			debugInfo=debugInfo ||"";
			var template="DEBUG: {0}";
			_private.log(mvc.util.text.format(template,debugInfo));
		},
		/**
		 * Info Message
		 */
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
		},
		/**
		 * Warning message
		 */
		w:function(str){
			var template="WARNNING: {0}";
			_private.log(mvc.util.text.format(template,str));
		}
	}
	return _public;
});

mvc.log=new mvc.cls._log();
/**
 * Controller Definition
 * part_controller.js
 */
mvc.ext(mvc,"ctl",function(name){
	var _public={
		/**
		 * Send Message to this controller synchronously.
		 */
		sendMSG:function(msg,args){
			return _private.sendMSG(msg,args);
		},
		/**
		 * Post Message to this controller asynchronously. 
		 */
		postMSG:function(msg,args,callback){
			return _private.postMSG(msg,args,callback);
		}
	};
	var _props={
		_ctl:null
	};
	var _private={
		checkMSG:function(msg){
			var ctl=_props._ctl;
			if (ctl[msg]!=undefined){
				if (typeof ctl[msg] ==="function"){
					return true;
				}else{
					mvc.log.i("Detected non-function item assigned to controller.");
				}
			}else{
				mvc.log.i("Refered non-defined message:"+msg);
			}
			return false;
		},
		sendMSG:function(msg,args){
			var ctl=_props._ctl;
			if (_private.checkMSG(msg)){
				return ctl[msg].apply(ctl,args);
			}
			return;
		},
		postMSG:function(msg,args,callback){
			var ctl=_props._ctl;
			if (_private.checkMSG(msg)){
				setTimeout(function(){
					var res=ctl[msg].apply(ctl,args);
					if (callback!=undefined && typeof callback==="function"){
						callback(res);
					}
				},0)
			}
			return;
		},
		init:function(){
			if (!_private.isCtlExisted(name)){
				throw("Controller with name:"+name+" Does not exist.");
			}
			_props._ctl=mvc.controllers[name];
		},
		isCtlExisted:function(name){
			if (mvc.controllers[name]==undefined){
				return false;
			}
			return true;
		}
	}
	_private.init();
	return _public;
});

mvc.ext(mvc,"controllers",{}); //empty controller entry
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
		 * @param override existed function. default true
		 */
		bind : function(eventType, key, func, override) {
			return _private.bind(eventType, key, func, override);
		},
		/**
		 * fire an event.
		 * @param eventType event that will be fired.
		 * @param param parameters will be passed in.
		 * @param key handler that will be triggered. if ommited, all handlers of that event type will be triggered.
		 * @param async whether fire the events asynchrously. default is false
		 * @param scope scope that will be used for event handler. (this)
		 */
		fire : function(eventType, param, key, async, scope) {
			return _private.fire(eventType, param, key, async, scope);
		},
		/**
		 * It will unbind itself if it has been fired.
		 * @param eventType event type that will be bound.
		 * @param key identifier of the handler.
		 * @param func handler.
		 * @param override existed function. default true
		 */
		bindFireOnce : function(eventType, key, func, override) {
			return _public.bind(eventType, key, function() {
				_public.unbind(eventType, key);
				return func.apply(this, arguments);
			}, override);
		},
		/**
		 * Unbind a handler. if Key is ommited all handlers to that eventType will be unbound.
		 */
		unbind : function(eventType, key) {
			return _private.unbind(eventType, key);
		},
	};

	var _private = {
		setScope : function(scope) {
			_props.scope = scope;
		},
		unbind : function(eventType, key) {
			if(key != undefined) {
				delete _props.events[eventType][key];
			} else {
				_props.events[eventType] = {};
			}
		},
		bind : function(eventType, key, func, override) {
			if(override == undefined) {
				override = true;
			}
			if(_props.events[eventType] == undefined) {
				_props.events[eventType] = {};
			}
			if(_props.events[eventType][key] != undefined) {
				if(override === false) {
					return true;
				}
			}
			_props.events[eventType][key] = func;
			return true;
		},
		fire : function(eventType, param, key, async, scope) {
			function proc() {
				if(_props.events[eventType] == undefined) {
					return param;
				}
				var _funcs = _props.events[eventType];
				var res = param;
				if(key != undefined) {
					var func = funcs[key];
					res = _private.exec(func, param, scope);
				} else {
					for(var key in _funcs) {
						var func = _funcs[key];
						res = _private.exec(func, res, scope);
						if(res === undefined) {
							res = param;
						}
					}
				}
				if(res === undefined) {
					res = param;
				}
				return res;
			}

			if(async == undefined) {
				async = false;
			}
			if(async === true) {
				setTimeout(proc, 0);
			} else {
				return proc();
			}
		},
		exec : function(func, param, scope) {
			if(param == undefined) {
				param = []
			}
			if(scope == undefined) {
				scope = _props.scope;
			}
			if(!( param instanceof Array)) {
				param = [param];
			}
			try {
				return func.apply(scope, param);
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
 *  abstract view class
 * part_viewcls.js
 */
mvc.ext(mvc.cls, "absview", mvc.Class.create({
		"viewMgr":null,
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
		 * fire an event of both global and private.
		 * @param eventType event that will be fired.
		 * @param param parameters will be passed in.
		 * @param key handler that will be triggered. if ommited, all handlers of that event type will be triggered.
		 * @param async whether fire the events asynchrously. default is false
		 */
		fire : function(eventType, param, key, async) {
			var res;
			if (this.viewMgr!=null){
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
				if (typeof this[key] == "function" ){
					this[key] = function() {};
				}else{
					this[key]=null;
				}
			}
		}
}));
/**
 * Abstract view manager class
 * part_absViewMgr.js
 * 
 */
mvc.ext(mvc.cls,"absViewMgr",mvc.Class.create({
	initialise:function(){
		this.events=new mvc.cls['event']();
	}
}))
/**
 * part_history.js
 */
mvc.ext(mvc.cls, "history", function() {
	var _public={
		/**
		 * push a entry to stack.
		 */
		push:function(name){
			return _private.push(name);
		},
		/**
		 * clear stack
		 */
		clear:function(){
			return _private.clear();
		},
		/**
		 * back to a specified entry.
		 * back to last entry if name is ommited.
		 */
		back:function(name){
			return _private.back(name);
		}
	}
	var _props = {
		stack : [],
	}
	var _private = {
		push : function(pageID) {
			if(pageID && pageID != null) {
				_props.stack.push(pageID);
			}
		},
		clear : function(clearDom) {
				_props.stack = [];
		},
		pop : function() {
			return _props.stack.pop();
		},
		back : function(pageID) {
			var lastPageID = "";
			if(pageID === undefined) {//back to last page
				lastPageID = _private.pop();
				while(_props.stack.length > 0 && ( typeof (lastPageID) == "undefined" || mvc.util.isEmpty(lastPageID) || $("#" + lastPageID).length == 0)) {
					lastPageID = _private.pop();
				}
			} else {//back to page with id: pageID
				while(_props.stack.length > 0 && pageID != lastPageID) {// check whether specified page has been loaded.
					lastPageID = _private.pop();
				}
				if(lastPageID != pageID) {// cannot find page in history stack. Load specified page from scratch.
					lastPageID=pageID;
				}
			}
			if(lastPageID != undefined && lastPageID != null) {
				return lastPageID;
			}
		}
	}
	
	return _public;
});
/**
 * ./html/part_html_init.js
 */

mvc.ext(mvc,"html",{});
mvc.ext(mvc, "$", function(selector) {
	if(selector != undefined) {
		return $(mvc.opt.appContainer).find(selector);
	} else {
		return $(mvc.opt.appContainer);
	}
});/**
 * ./html/part_ajax.js
 */

mvc.ext(mvc.html, "ajax", new (function() {
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
})());
/**
 * View Manager Definition
 * ./html/part_view.js
 */
mvc.ext(mvc.html, "_domViewMgr",mvc.Class.create(mvc.cls.absViewMgr,new (function() {
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
		 * @param cb, callback function when async is true
		 */
		preLoad : function(viewArr, async,cb) {
			return _private.preLoad(viewArr,async,cb);
		},
		/**
		 * preload all views
		 * @param async. default true
		 * @param cb. callback function when async is true
		 */
		preLoadAll : function(async,cb) {
			return _private.preLoadAll(async,cb);
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
		},
		initialise : function($super) {
			$super();
			this.props=_props;
			this.events.bind("displayed", "_history_event", function() {
				var curView = _private.get();
				if(curView != null) {
					_props.history.push(curView.getName());
				}
				_props.curView = this;
			});
		}
	}

	var _props = {
		curView : null,
		_views : {},
		history : new mvc.cls.history(),
		events : new mvc.cls.event(),
		pageCls : "page"
	};
	var _private = {
		preLoad : function(viewArr, async,cb) {
			var count=viewArr.length;
			for (var i=0;i<viewArr.length;i++){
				var view=viewArr[i];
				if (async===false){
					view.loadDom();
				}else{
					(function(){
						var v=view;
						setTimeout(function(){
							v.loadDom();
							count--;
							if (count===0){
								if (cb && typeof cb ==="function"){
									cb();
								}
							}
						},1)
					})();
				}
			}
		},
		preLoadAll : function(async,cb) {
			var count=0;
			for (var key in _props._views){
				count++;
			}
			_private.each(function(v) {
				if(async === false) {
					v.loadDom();
				} else {
					setTimeout(function() {
						v.loadDom();
						count--;
						if (count===0){
							if (cb && typeof cb==="function"){
								cb();
							}
						}
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
		back : function() {
			var viewName = _props.history.back();
			if(viewName != undefined) {
				_private.get(viewName).display(false);
			}
			return viewName;
		},
		reset : function(name) {
			return _props._views[name] = new mvc.html.view_dom(name);
		},
		get : function(name) {
			if( typeof name == "undefined") {
				return _props.curView;
			}
			if(_props._views[name] != undefined) {
				return _props._views[name];
			} else {
				var obj = new mvc.html.view_dom(name);
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
	return _public;
})()));

mvc.html.domViewMgr=new mvc.html._domViewMgr();
/**
 *  view class based on jQuery
 * Events registered:  beforeLoad, beforeParse,afterParse, loaded, domReady, displayed
 * ./html/part_viewcls.js
 */
mvc.ext(mvc.html, "view_dom", mvc.Class.create(mvc.cls.absview, {
	uidata : {},
	"wrapperTag" : "div",
	"htmlPagePath" : null,
	"loadStatus" : "init", // init,  loading, parsing, loaded
	initialise : function($super, name) {
		this.viewMgr=mvc.html.domViewMgr;
		$super(name);
	},
	/**
	 * Synchorously load / render / display current view.
	 */
	show : function() {
		this.load();
		this.loadDom();
		this.display(true);
	},
	/**
	 * Display this view.
	 * @param forward Is page go forward or backward.
	 */
	display : function(forward) {
		var obj = this.$();
		if(obj.length == 0) {
			this.loadDom(true);
		}
		try {
			if(forward === false) {
				func = mvc.opt.interfaces.goBackPage;
			} else {
				func = mvc.opt.interfaces.goForwPage;
			}
			func(this.getName());
			this.fire("displayed", {}, undefined, false);
		} catch(e) {
			mvc.log.e(e, "Display View", this.getName());
		}
	},
	/**
	 * Asynchrously and forcely load view to memory. "loaded" event will be triggered if it is done.
	 * @param isReload: forcely reload
	 * @param cb: callback func once loaded
	 */
	load : function(isReload) {
		if(isReload === true) {
			this.loadStatus = "init";
			this.op_buf = "";
		}
		if("loaded" === this.loadStatus) {
			return;
		}
		if("init" != this.loadStatus) {
			return;
		}
		var path = "";
		if(this.htmlPagePath == null) {
			path = mvc.opt.pagePath + "/" + this.getName() + ".html";
		} else {
			path = this.htmlPagePath;
		}
		var pageID = this.getName();
		// var layoutPath = mvc.opt.layoutPath + "/" + _props.layout + ".html";
		this.fire("beforeLoad");
		mvc.log.i(mvc.string.info.view.lpf + path);
		var pageHtml = mvc.html.ajax.syncLoad(path);
		// if(!_props.isUIdataLoaded) {
		// _props.uidata = mvc.html.uidata.getUIDataScope(_private.getUIDataPath());
		// }
		var uidata = mvc.util.copyJSON(this.uidata);
		var params = uidata;
		this.loadStatus = "loading";
		pageHtml = this.fire("beforeParse", pageHtml, undefined, false);
		var parsedPageHtml = mvc.html.parser.parseHtml(pageHtml, params);
		this.loadStatus = "parsing";
		parsedPageHtml = this.fire("afterParse", parsedPageHtml, undefined, false);
		if(this.op_buf != null && this.op_buf != "") {
			parsedPageHtml = this.op_buf + parsedPageHtml;
		}
		var finalHtml = mvc.util.text.format("<{1} id='{0}' class='{3}'>{4}</{2}>", pageID, this.wrapperTag, this.wrapperTag, this.viewMgr.getPageCls(), parsedPageHtml);

		this.op_buf = finalHtml;
		this.loadStatus = "loaded";
		this.fire("loaded", {}, undefined, false);
	},
	/**
	 * Load stored html to dom.
	 * @param isReload. default false.
	 */
	loadDom : function(isReload) {
		if(isReload == undefined) {
			isReload = false;
		}
		if(this.loadStatus != "loaded") {
			this.removeDom();
			this.load(true);
		}
		if(this.loadStatus === "loaded") {
			if(mvc.$("#" + this.getName()).length === 0 || isReload === true) {
				mvc.$().append(this.op_buf);
				this.fire("domReady", this.$(), undefined, false);
			}
			return;

		} else {
			mvc.log.e("Cannot load view properly.", "view name:", this.getName());
		}
	},
	removeDom : function() {
		mvc.$("#" + this.name).remove();
	},
	/**
	 * Return a jQuery Object indicating a html element in current view
	 * page container will be returned if no selector given.
	 */
	$ : function(selector) {
		if( typeof selector != "undefined") {
			return mvc.$("#" + this.name).find(selector);

		}
		return mvc.$("#" + this.name);
	},
	/**
	 * remove this view
	 */
	remove : function($super) {
		this.removeDom();
		$super();
	},
	/**
	 * set dom events to view
	 */
	setDomEvent : function(domEvent) {
		var that = this;
		function bindEvent() {
			for(var selector in domEvent) {
				for(var evnt in domEvent[selector]) {
					that.$(selector).unbind(evnt);
					that.$(selector).bind(evnt, domEvent[selector][evnt]);
				}
			}
		}

		if(this.$().length === 0) {
			this.events.bind("domReady", "_setDomEvents", function() {
				this.events.unbind("domReady", "_setDomEvents");
				bindEvent();
			})
		} else {
			bindEvent();
		}
	}
}));
/**
 * Parser of <?mvc code ?>.
 * ./html/part_parser.js
 */
mvc.ext(mvc.html, "parser", new (function() {
	var _public = {
		/**
		 * Parse html code within specific scope(params).
		 * @html Html code be parsed
		 * @param scope JSON object
		 */
		parseHtml : function(html, param) {
			return _private.parseHtml(html, param);
		},
		addScopeItem:function(key,val){
			if (key && val){
				_props._basic[key]=val;
			}
		},
		removeScopeItem:function(key){
			if (key && _props._basic[key]){
				delete _props._basic[key];
			}
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
				__val = mvc.html.parseExec(__statement, param);
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
})());

mvc.ext(mvc.html, "parseExec", function(__code__, __scope__) {
	with(__scope__) {
		try {
			return eval(__code__);
		} catch(e) {
			mvc.log.e(e, "Parse MVC code:", __code__);
		}
	}
});
mvc.ext(mvc.html, "parseJSON", function(__code__) {
		try {
			return eval("("+__code__+")");
		} catch(e) {
			mvc.log.e(e, "Parse JSON Object:", __code__);
		}
});

/**
 * Element is a re-usable UI component in views.
 * It is an extension of domview. It mainly adds an "element" method to html parser. 
 * "element" method will search for specified re-useable ui element file and pull the file content using ajax.
 *  the content will be returned.
 * 
 * "element" method can be used in an iteration way.
 * 
 * elements code is DOM parsable code or MVC HTML parser understandable code (<?mvc ?>).
 * 
 * ./html/part_html_element.js
 * 
 */
mvc.ext(mvc.html,"element",function(){
	try{
		if (mvc.html.parser == undefined){
			throw ("MVC HTML parser is not ready");
		}
	}catch(e){
		mvc.log.e(e);
	}
	//stub method
	function _element(name,params){
		if (params==undefined) {
          params= {};
        }
        var path=mvc.opt.elementPath+"/"+name+".html";
        var res= mvc.html.ajax.syncLoad(path);
        res=mvc.html.parser.parseHtml(res,params);
        return res;
	}
	
	//TODO add confg check
	mvc.html.parser.removeScopeItem("element");
	mvc.html.parser.addScopeItem("element",_element);
});

mvc.html.element();
