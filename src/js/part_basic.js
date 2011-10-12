(function init(parent){
	var nameSpace="mvc";
	parent[nameSpace]={};
	var obj=parent[nameSpace];
	obj.ext=function(parent,key,tarObj){
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
