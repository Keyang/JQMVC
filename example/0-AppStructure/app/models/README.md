#Models

Models process data request.

This folder contains model definitions in separated files. For example:

userData.js

		mvc.regModel({
			// model name
			"name":"users",
			
			//proxy used
			"proxy":new mvc.proxy.simpleData(
				{
					"name":"value",
					"age":25
				},
				{
					"name":"Joe",
					"age":30
				}
			),
			
			//filter on data
			"filter":function(item){
				if (item.age>26){
					return false;
				}
				return true;
			}
		});


salaryModel.js

		mvc.regModel({
			"name":"salary",
			"proxy":new mvc.proxy.ajax("./app/model/data/salary.json","json"),
			"sorter":function(itema,itemb){
				if (itema.amount>itemb.amount){
					return 1;
				}
				if (itema.amount===itemb.amount){
					return 0;
				}
				return -1;
			}
		
		});
