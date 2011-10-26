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
		if (parent[key]!=undefined){
			mvc.log.i("Overwritten extention detected.");
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
	copyJSON:function (jsonObj,toJson,override) {
      var tmpObj= {};
      if (toJson!=undefined) {
        tmpObj=toJson;
      }
      //deep clone for setting json obj
      var tmpOri=jsonObj;
      for (var key in tmpOri) {
      	if(override===false){
      		if (tmpObj[key]!=undefined){
      			continue;
      		}
      	}
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
 * part_ajax.js
 */

mvc.ext(mvc.cls, "ajax", function() {
	var _props = {
		cachedHtml : {}
		//TODO cache facility
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
		 * @param scope scope that will be used for event handler. (this)
		 */
		fire : function(eventType, param, key,async,scope) {
			return _private.fire(eventType, param, key,async,scope);
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
			return _private.unbind(eventType,key);
		},
	};

	var _private = {
		setScope:function(scope){
			_props.scope=scope;
		},
		unbind : function(eventType, key) {
			if(key != undefined) {
				delete _props.events[eventType][key];
			} else {
				_props.events[eventType] = {};
			}
		},
		bind : function(eventType, key, func) {
			if(_props.events[eventType] == undefined) {
				_props.events[eventType]={};
			}
			_props.events[eventType][key] = func;
			return true;
		},
		fire : function(eventType, param, key,async,scope) {
			function proc(){
				if(_props.events[eventType] == undefined) {
					return;
				}
				var _funcs = _props.events[eventType];
				if(key != undefined) {
					var func = funcs[key];
					_private.exec(func, param,scope);
				} else {
					for(var key in _funcs) {
						var func = _funcs[key];
						_private.exec(func, param,scope);
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
		exec : function(func, param,scope) {
			if(param == undefined) {
				param = []
			}
			if (scope==undefined){
				scope=_props.scope;
			}
			if(!( param instanceof Array)) {
				param = [param];
			}
			try {
				func.apply(scope, param);
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
		back : function() {
			return _private.back();
		},
		/**
		 * Change the name of view.
		 */
		changeName : function(oldName, newName) {
			return _private.changeName(oldName, newName);
		}
		//Event interfaces
	}

	var _props = {
		curView : null,
		_views : {},
		viewRendering : null,
		history : new mvc.cls.history(),
		events : new mvc.cls.event()
	};
	var _private = {
		init : function() {
			_public['event'] = _props.events;
		},
		changeName : function(oldName, newName) {
			var view = _private.get(oldName);
			view.setOptions({
				name : newName
			});
			_props._views[newName] = view;
			delete _props._views[oldName];
		},
		back : function() {
			var viewName = _props.history.back();
			if(viewName != undefined) {
				_private.display(viewName, false);
			}
		},
		reset : function(name) {
			_props._views[name] = new mvc.cls._view(name);
		},
		loadRender : function(name) {
			if(_private.isViewExisted(name) === false) {
				return;
			}
			mvc.log.i("Current Loading View:" + name);
			var view = _props.viewRendering = _private.get(name);
			view.load(function() {
				mvc.log.i("Intended Rendering View:" + view.getName());
				if(_props.viewRendering.getName() == view.getName()) {
					view.render();
				} else {
					var tmp = "View Render Interrupted for:" + view.getName();
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
		display : function(name, forward) {
			if(!_public.isViewExisted(name)) {
				mvc.log.e(mvc.string.error.view["vnex"], "Display View", name);
				return;
			}
			try {
				var view = _public.get(name);
				var oldView=_props.curView;
				_props.curView = view;
				var func = mvc.opt.interfaces.goForwPage;
				if(forward === false) {
					func = mvc.opt.interfaces.goBackPage;
				} else {
					if (oldView!=null){
						_props.history.push(oldView.getName());
					}
				}
				view.display(func);
			} catch(e) {
				mvc.log.e(e, "Display View", name);
			}

		}
	};
	_private.init();
	return _public;
});
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
		 * @param func function that will be used for displaying. It could be Interface.goForwPage or Interface.goBackPage.
		 */
		display : function(func) {
			try {
				func(_props.name);
				_public.fire("displayed");
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
			return _private.page(selector);
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
		"uidataPath" : null,
		"htmlPagePath" : null,
		"uidata" : null,
		"event" : new mvc.cls.event(_public),
		"wrapperTag" : "div",
		"htmlCode" : "",
		"isUIdataLoaded" : false
	};
	var _private = {
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
			_props.event.fire(eventType, param, key, async);
			mvc.view.event.fire(eventType, param, key, async, _public);
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
				if(!_props.isUIdataLoaded) {
					_props.uidata = mvc.uidata.getUIDataScope(_private.getUIDataPath());
				}
				var uidata = mvc.util.copyJSON(_props.uidata);
				var params = mvc.util.copyJSON(_props.param, uidata);
				var obj = {
					html : pageHtml
				};
				_public.fire("beforeParse", obj, undefined, false);
				var parsedPage = mvc.parser.parseHtml(obj.html, params);
				obj.html = parsedPage;
				_public.fire("afterParse", obj, undefined, false);
				var finalHtml = mvc.util.text.format("<{2} id='{0}' style='display:none'>{1}</{3}>", pageID, obj.html, _props.wrapperTag, _props.wrapperTag);
				_props.htmlCode = finalHtml;
				_props.isLoaded = true;
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
})/**
 * Generate entries
 */

mvc.ext(mvc,"log", new mvc.cls._log());
mvc.ext(mvc,"ajax",new mvc.cls.ajax());
mvc.ext(mvc,"parser",new mvc.cls.parser());
mvc.ext(mvc,"uidata",new mvc.cls.uidata());
mvc.ext(mvc,"view", new mvc.cls.view());
