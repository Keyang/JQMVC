describe("observer", function() {
	var val1 = 0;
	var myObCls = mvc.Class.create(mvc.cls.observer, {
		notify : function(num) {
			if(num === undefined) {
				val1 += 5;
			} else {
				val1 = num;
			}

		}
	});
	var mySub = new mvc.cls.subject();

	it("can subscribe multiple observers", function() {
		for(var i = 0; i < 5; i++) {
			mySub.subscribe(i, new myObCls());
		}
	});
	it("can unsubscribe observer", function() {
		mySub.unsubscribe(0);
	});
	it("can notify all observers", function() {
		mySub.notifyAll();
		expect(20).toEqual(val1);
	});
	it("can notify observers with param", function() {
		mySub.notifyAll("text");
		expect("text").toEqual(val1);
	})
});
describe("model", function() {
	mvc.modelMgr.regModel({
		name : "contact",
		proxy : new mvc.proxy.ajax("./app/data.json", "json")
	});

	it("can load data and subscribe updated info", function() {
		var ajaxview = mvc.viewMgr.get("ajax");
		ajaxview.bindModel(mvc.modelMgr.get("contact"));
		var contact = mvc.modelMgr.get("contact");
		contact.load({},function() {
			contact.notifyAll(); 
			ajaxview.show();
		});
	});
	
	it ("can update data",function(){
		var ajaxview=mvc.viewMgr.get("ajax");
		var contact=mvc.modelMgr.get("contact");
		contact.load({},function() {
			contact.notifyAll(); 
		});
	});
	
	it ("can reg multiple models",function(){
		mvc.modelMgr.regModel({
			"name":"model1",
			"data":"mydata"
		});
		
		mvc.modelMgr.regModel({
			"name":"model2",
			"data":"mydata"
		});
		
		var model1=mvc.modelMgr.get("model1");
		expect("object").toEqual(typeof model1);
		expect("model1").toEqual(model1.props.name);
	});
});
