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
		},
		/**
		 * Check if specified controller and method exists.
		 */
		checkCtl:function(method){
			return _private.checkCtl(method);
		}
	};
	var _props={
		_ctl:null
	};
	var _private={
		checkCtl:function(method){
			if (!_private.isCtlExisted(name)){
				return false;
			}
			if (method){
				if (!mvc.controllers[name][method]){
					return false;
				}
			}
			return true;
		},
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
			if (!_private.isCtlExisted(name)){
				throw("Controller with name:"+name+" Does not exist.");
			}
			var ctl=_props._ctl;
			if (_private.checkMSG(msg)){
				return ctl[msg].apply(ctl,args);
			}
			return;
		},
		postMSG:function(msg,args,callback){
			if (!_private.isCtlExisted(name)){
				throw("Controller with name:"+name+" Does not exist.");
			}
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
mvc.ext(mvc,"regCtl",function(name,controllerObj){
	if (typeof controllerObj!="object"){
		mvc.log.e("Controller should be a JSON object!");
		return false;
	}
	mvc.ext(mvc.controllers,name,controllerObj);
	return true;
});

