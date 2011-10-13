(function init(parent){
	var nameSpace="mvc";
	parent[nameSpace]={};
	var obj=parent[nameSpace];
	obj.ext=function(parent,key,tarObj){
		if (typeof parent!="object"){
			throw("mvc.ext first param should be entry object.");
		}
		if (typeof key!="string"){
			throw("mvc.ext secon param should be key string.");
		}
		parent[key]=tarObj;
	}
})(window)
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
	}
})
mvc.ext(mvc['cls'], '_log', function() {
	var props = {

	}
	var _private = {
		log : function(str) {
			console.log(str);
		}
	}
	var _public = {
		d : function() {

		},
		i : function() {

		},
		/**
		 * Log an error message
		 * @param e: error message as string
		 * @param place: location of the message
		 * @param data: related data
		 */
		e : function(e, place, data) {
			var tmplate="ERROR: {0}. {1}:{2}. At {3}->{4}";
			_private.log(mvc.util.text.format(tmplate,place,data,mvc.getCurrentController().name,mvc.getCurrentController()._action));
		}
	}
	return _public;
})

mvc.ext(mvc,"log", new mvc.cls._log());