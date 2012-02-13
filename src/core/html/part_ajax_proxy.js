/**
 *
 * ajax proxy
 *
 * ./html/part_ajax_proxy.js
 */

mvc.ext(mvc.proxy, "ajax", mvc.Class.create(mvc.cls.proxy, {
	props : {
		url : "",
		cfg_ajax:null,
		dataType:"text"
	},
	load : function(params, callback) {
		var url=this.props.url;
		if (params!=undefined&&typeof params==="object"){
			url+="?";
			for (var key in params){
				url+=key+"="+params[key]+"&";
			}
		}
		var that=this;
		var param = {
			async : true,
			url : url,
			type : "GET",
			dataType : this.props.dataType,
			success : function(res) {
				if (callback){
					callback(res);
				}
			},
			error : function(xhr, text, err) {
				mvc.log.e(text, "asyncLoad", that.props.url);
				if (callback){
					callback(res);
				}
			}
		};
		if(this.props.cfg_ajax != null) {// global configuration
			for(var key in this.props.cfg_ajax) {
				param[key] = this.props.cfg_ajax[key];
			}
		}
		$.ajax(param);
	},
	initialise:function(url,dataType){
		if (url==undefined){
			throw("Ajax proxy needs url as param of constructor.");
		}
		this.props.url=url;
		this.props.cfg_ajax=mvc.opt.ajax;
		this.props.dataType=dataType;
	}
}));
