/**
 * Model Proxy
 * part_proxy.js
 * 
 */

mvc.ext(mvc.cls,"proxy",mvc.Class.create(mvc.cls.observer,{
	load:function(callback){
		throw("load method is not implemented");
	},
	save:function(res,callback){
		throw("save method is not implemented");
	},
	exec:function(cmd,params,callback){
		if (this[cmd]===undefined){
			throw("command:"+cmd+" is not implemented in proxy.");
		}
		params.push(callback);
		return this[cmd].apply(this,params);
	}
}));

mvc.ext(mvc,"proxy",{});

mvc.ext(mvc,"regProxy",function(){
	
});


