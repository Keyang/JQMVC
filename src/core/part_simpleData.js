/**
 * Simple Data Proxy. Contain data instance.
 * ./part_simpleData.js
 */

mvc.ext(mvc.proxy,"simpleData",mvc.Class.create(mvc.cls.proxy,{
	props:{
		data:null
	},
	initialise:function($super,data){
		this.props.data=data;
		$super();
	},
	load:function(param,callback){
		if (callback){
			callback(null,this.props.data);
		}
	},
	save:function(data,callback){
		this.props.data=data;
		if (callback){
			callback(null,this.props.data);
		}
	}
}));
