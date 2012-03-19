function test_model() {
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
			contact.load({}, function() {
				contact.notifyAll();
				ajaxview.show();
			});
		});
		it("can update data", function() {
			var ajaxview = mvc.viewMgr.get("ajax");
			var contact = mvc.modelMgr.get("contact");
			contact.load({}, function() {
				contact.notifyAll();
			});
		});
		it("can reg multiple models", function() {
			mvc.modelMgr.regModel({
				"name" : "model1",
				"data" : "mydata"
			});

			mvc.modelMgr.regModel({
				"name" : "model2",
				"data" : "mydata"
			});

			var model1 = mvc.modelMgr.get("model1");
			expect("object").toEqual( typeof model1);
			expect("model1").toEqual(model1.props.name);
		});
		it("can assign data directly", function() {
			var m = mvc.modelMgr.regModel({
				"name" : "model1",
				"proxy" : new mvc.proxy.simpleData({
					"data" : "value",
					"value" : "hello"
				})

			});
			m.load({}, function(err, data) {
				expect("value").toEqual(data.data);
				expect("hello").toEqual(data.value);
			});
		});
	});
	describe("model data default process", function() {

		it("can filter data with conditions", function() {
			var m = mvc.modelMgr.regModel({
				"name" : "arryModel",
				"proxy" : new mvc.proxy.simpleData([1, 2, 3, 4, 5, 6, 7]),
				"filter" : function(item) {
					if(item > 5) {
						return false;
					}
				}
			});
			m.load({}, function(err, data) {
				var dataStr = data.join("");
				expect("12345").toEqual(dataStr);
			});
		});
		it("can sort data with conditions", function() {
			var m = mvc.modelMgr.regModel({
				"name" : "arryModel",
				"proxy" : new mvc.proxy.simpleData([1, 2, 3, 4, 5, 6, 7]),
				"sorter" : function(a, b) {
					if(a > b) {
						return -1;
					} else {
						return 1;
					}
				}
			});
			m.load({}, function(err, data) {
				var dataStr = data.join("");
				expect("7654321").toEqual(dataStr);
			});
		});
		it("can set both sorter and filter", function() {
			var m = mvc.modelMgr.regModel({
				"name" : "arryModel",
				"proxy" : new mvc.proxy.simpleData([1, 2, 3, 4, 5, 6, 7]),
				"sorter" : function(a, b) {
					if(a > b) {
						return -1;
					} else {
						return 1;
					}
				},
				"filter" : function(item) {
					if(item > 5) {
						return false;
					}
				}
			});
			m.load({}, function(err, data) {
				var dataStr = data.join("");
				expect("54321").toEqual(dataStr);
			});
		});
		it("can set soter and filter after data is loaded", function() {
			var m = mvc.modelMgr.regModel({
				"name" : "arryModel",
				"proxy" : new mvc.proxy.simpleData([1, 2, 3, 4, 5, 6, 7])
			});
			m.load({}, function(err, data) {
				var dataStr = data.join("");
				expect("1234567").toEqual(dataStr);
				m.setFilter(function(item) {
					if(item > 5) {
						return false;
					}
				});
				m.setSorter(function(a, b) {
					if(a > b) {
						return -1;
					} else {
						return 1;
					}
				});
				dataStr = m.getData().join("");
				expect("54321").toEqual(dataStr);
			});
		});
		it("can remove soter or filter", function() {
			var data = [{
				name : "John",
				age : "23"
			}, {
				name : "Danniel",
				age : "26"
			}, {
				name : "Cian",
				age : "20"
			}, {
				name : "Tom",
				age : "28"
			}];
			var m = mvc.modelMgr.regModel({
				"name" : "people",
				"proxy" : new mvc.proxy.simpleData(data),
				filter : function(data) {
					if(data.age > 27) {
						return false;
					}
				},
				sorter : function(a, b) {
					if(a.name > b.name) {
						return 1;
					} else {
						return -1
					}
				}
			});
			m.load({}, function(err, data) {
				expect(3).toEqual(data.length);
				expect("Cian").toEqual(data[0].name);
				expect("John").toEqual(data[2].name);
				m.setSorter(null);
				m.setFilter(null);
				data = m.getData();
				expect(4).toEqual(data.length);
				expect("John").toEqual(data[0].name);
				expect("Tom").toEqual(data[3].name);
			});
		});
	});
}