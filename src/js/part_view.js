/**
 * View Definition
 */
mvc.ext(mvc.cls,"view",function(){
	var _props={
		curView:null,
		_views:{}
	};
	var _private={
	};
	var _public={
		/**
		 * Get or created a view with specific name
		 * Push created view to view manager.
		 * If no name is given, current view will be returned.
		 */
		get:function(name){
			if (typeof name=="undefined"){
				return _props.curView;
			}
			if (_props._views[name]!=undefined){
				return _props._views[name];
			}else{
				var obj=new mvc.cls._view(name);
				_props._views[name]=obj;
				return obj;
			}
			
		},
		isViewExisted:function(name){
			if (typeof name=="undefined"){
				mvc.log.e(mvc.string.error.view["vnun"],"mvc.view.isViewExisted with parameter:",name);
				return false;
			}
			if (_props._views[name]!=undefined){
				return true;
			}else{
				return false;
			}
		},
		setCurView:function(name){
			if (!_public.isViewExisted(name)){
				mvc.log.e(mvc.string.error.view["vnex"],"View Name",name);
				return;
			}
			_props.curView=_public.get(name);
		}
	}
	return _public;
})
