describe("Log event",function(){
	it("can log error as string",function(){
		mvc.log.e("Test Error","Test Place","Test Data");
	});
	
	it ("can log error as object",function(){
		try{
			throw("this is an error object.");
		}catch(e){
			mvc.log.e(e,"Test Place","Test Data");
		}
	});
	
	it("can record info", function(){
		mvc.log.i("This is some information");
	})
	
	it("can record debug info", function(){
		mvc.log.d("This is some debug info");
	})
})
