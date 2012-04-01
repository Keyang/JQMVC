var example_events={
	".code_list li":{
		"click":function(e){
			var type=$(this).children(".type").val();
			var name=$(this).children(".name").val();
			mvc.ctl("example").sendMSG("showCode",{
				type:type,
				name:name
			});
		}
	}
	
}
