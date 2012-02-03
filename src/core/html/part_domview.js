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
	display : function($super,forward) {
		var obj = this.$();
		if(obj.length == 0) {
			this.loadDom(true);
		}
		try {
			if(forward === true) {
				func = mvc.opt.interfaces.goBackPage;
			} else {
				func = mvc.opt.interfaces.goForwPage;
			}
			func(this.getName());
			return $super();
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
