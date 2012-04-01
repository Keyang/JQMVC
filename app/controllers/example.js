mvc.regCtl("example",{
	"curExample":null,
	"default":function(){
		var examples=mvc.modelMgr.get("examples");
		var that=this;
		examples.load({},function(err,data){
			var view=mvc.view("example_list");
			view.setUIData({data:data});
			view.show();
			view.setDomEvent({
				".example_list li":{
					"click":function(e){
						var flag=$(this).find(".flag").val();
						mvc.ctl("example").sendMSG("example",flag);
					}
				}
			});
		});
	},
	"example":function(flag){
		var examples=mvc.modelMgr.get("examples");
		var that=this;
		examples.load({},function(err,data){
			examples.getExampleByFlag(flag,function(data){
				data.url=examples.props.basePath+data.flag+"/index.html";
				data.downloadUrl=examples.getDownloadUrl(data.flag);
				that.curExample=data;
				var exaView=mvc.view("example");
				exaView.setUIData(data);
				exaView.setDomEvent(example_events);
				exaView.show();
			});
			
		});
	},
	"showCode":function(params){
		var type=params.type;
		var name=params.name;
		var example=mvc.modelMgr.get("example");
		example.loadCode(this.curExample.flag,type,name,function(err,data){
			if (err){
				exaView.$("#code_area").text(err);
				throw (err);
			}else{
				var exaView=mvc.view("example");
				exaView.$("#type").text(type);
				exaView.$("#name").text(name);
				exaView.$("#code_area").text(data);
			}
		});
	}
});
