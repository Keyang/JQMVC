/**
 * user view class
 */
mvc.ext(mvc.cls, "_view", function(name) {
	var _props = {
		"name" : name,
		"param" : {},
		"isRendered" : false,
		"eventObj" : {},
		"initOnce" : false,
		"layout" : "default",
		"uidataPath" : null,
		"htmlPagePath" : null,
		"uidata":null
	};
	var _private = {
		getUIDataPath:function(){
			if (_props.uidataPath==null){
				return mvc.opt.uidataPath +  "/" + _props.name + ".json";
			}else{
				return _props.uidataPath;
			}
		},
		init:function(){
			_props.uidata=mvc.uidata.getUIDataScope(_private.getUIDataPath());
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
			var layoutPath = mvc.opt.layoutPath + _props.layout + ".html";
			if(_props.initOnce === true && $("#" + pageID).length > 0) {
				try{
					callback();
				}catch(e){
					mvc.log.e(e,"loadView",path);
				}
			}
			mvc.log.i(mvc.string.info.view.lpf+path);
			$("#"+pageID).remove();
			mvc.ajax.asyncLoad(path,function(pageHtml){
				var uidata=mvc.util.copyJSON(_props.uidata);
				var params=mvc.util.copyJSON(_props.param,uidata);
				var parsedPage=mvc.parser.parseHtml(pageHtml,params);
				params["__content__"]=parsedPage;
				mvc.ajax.asyncLoad(layoutPath,function(layoutHtml){
					var finalHtml=mvc.util.text.format("<div id='{0}' style='display:none'>{1}</div>",pageID,mvc.parser.parseHtml(layoutHtml,params));
					_props.
					$("body").append(finalHtml);
					try{
						callback();
					}catch(e){
						mvc.log.e(e,"loadView",path);
					}
				})
			})
			//pre-clean
			var pageObj = $("#" + pageID);
			if(pageObj.length > 0) {
				pageObj.remove();
			}
			$.mvc.curViewer.pageID = name + "_" + action;
			var param = $.mvc._viewer.getScopeParam();
			res = __mvc.func.parseHtml(res, param);
			$.mvc.curViewer.content = res;
			var lres = __mvc.func.loadPage(layoutPath);
			//load defined layout
			var finalHtml = $.mvc.func.parseHtml(lres, param);
			finalHtml = "<div id='" + pageID + "'>" + finalHtml + "</div>";
			//before page loading
			$("body").append(finalHtml);
			// It may cause problem on iOS with Webkit browsers. innerHtml is buggy on those browsers.
			__mvc.v[pageID] = $.mvc.curViewer;
			$.mvc.curViewer.fire("initpage");
			//after page loading
			$.mvc.curViewer.fire("beforepagerender");
			//before page render
			try {
				_app_.interfaces.goForwPage(pageID);

				return true;
			} catch(e) {
				console.log("Error in goForwPage implementation:" + e + ". Please check your implementation");
				return false;
			}
		}
	};
	var _public = {
		/**
		 * Set Data JSON file path that is used for UI
		 * Set to null if using default UI data Path.
		 * @param path should be relative path to index.html or absolute path.
		 */
		setUIDataPath:function(path){
			_props.uidataPath = path;
		},
		/**
		 * Set page template path that will be rendered.
		 * Set to null if using default html page Path.
		 * @param path should be relative path to index.html or absolute path.
		 */
		setHtmlPagePath : function(path) {
			_props.htmlPagePath = path;
		},
		/**
		 * Display this view.
		 */
		display:function(){
			
		},
		/**
		 * Asynchrously update view without displaying. This will affect if the view has been displayed.
		 * @param func: callback function
		 */
		update : function(func) {
			
		},
		/**
		 * apply all configures and disply the page.
		 */
		render : function() {
			_public.update();

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
	_private.init();
	return __public;
})