/**
 * View Manager Definition
 * ./html/part_view.js
 */
mvc.ext(mvc.html, "_domViewMgr",mvc.Class.create(mvc.cls.absViewMgr,new (function() {
	var _public = {
		/**
		 * display last view in history stack.
		 */
		back : function() {
			var viewName = this.history.back();
			if(viewName != undefined) {
				this.get(viewName).display(false);
			}
			return viewName;
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
			this.props.viewCls=mvc.html.view_dom;
			$super(_props);
		}
	}

	var _props = {
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
		getPageCls : function() {
			return _props.pageCls;
		}
		
	};
	return _public;
})()));

mvc.html.domViewMgr=new mvc.html._domViewMgr();
