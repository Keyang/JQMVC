mvc.ext(mvc.controllers,"myCtl",{
	funca:function(){
		var sum=1;
		sum=1;
		for (var i=1;i<64;i=i+0.0000001){
			sum*=i;
		};
		
		return sum;
	}
	
})


describe("controller",function(){
	var view=null;
	var index=0;
	beforeEach(function(){
		var viewName="ctl"+index;
		view=mvc.view.get(viewName);
	})
	afterEach(function(){
		var viewName=view.getName();
		mvc.view.loadRender(viewName);
		index++;
	})
	it ("can send synchronous/asynchronous message",function(){
		view.bind("init","addBtns",function(html){
			html.html="<input type='button' value='sync' id='btn1'/><br/><input type='button' value='async' id='btn2'/>";
		})
		view.bind("displayed","addEvents",function(){
			var page=view.page();
			page.find("#btn1").click(function(){
				var data1=new Date();
				var res=mvc.ctl("myCtl").sendMSG("funca");
				var data2=new Date();
				var span=data2.getTime()-data1.getTime();
				console.log("time consumed:"+span);
				console.log("result:"+res);
				view.page().append("<p>aa</p>");
			});
			page.find("#btn2").click(function(){
				var data1=new Date();
				mvc.ctl("myCtl").postMSG("funca",undefined,function(res){
					var data3=new Date();
					console.log("time consumed:"+(data3.getTime()-data1.getTime()));
					console.log("result:"+res);
				})
				var data2=new Date();
				console.log("returned time in:"+(data2.getTime()-data1.getTime()));
				view.page().append("<p>aa</p>");				
			});
		})
	})
})
