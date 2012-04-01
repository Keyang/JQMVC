mvc.regModel({
	name:"examples",
	proxy:new mvc.proxy.ajax("./app/models/data/examples.json","json"),
	basePath:"./examples/",
	zipall:"https://github.com/Keyang/jqmvc-example/zipball/{0}",
	methods:{
		getExampleByFlag:function(flag,callback){
			var localData=this.getData();
			if (localData!=undefined){
				for (var i=0;i<localData.length;i++){
					var example=localData[i];
					if (example.flag===flag){
						callback(example);
						return;
					}
				}
			}
			callback(undefined);
		},
		getDownloadUrl:function(example){
			return this.props.zipall.replace("{0}",example);
		}
	}
});


mvc.regModel({
	name:"example",
	path:{
		view:"./examples/{0}/app/views/{1}.html",
		controller:"./examples/{0}/app/controllers/{1}.js",
		model:"./examples/{0}/app/models/{1}.js"
	},
	methods:{
		loadCode:function(curExa,type,fn,callback){
			var str=this.props.path[type];
			var path= str.replace("{0}",curExa).replace("{1}",fn);
			this.setProxy(new mvc.proxy.ajax(
				path,"text"
			));
			this.load({},function(err,data){
				callback(err,data);
			});
		}
	}
});
