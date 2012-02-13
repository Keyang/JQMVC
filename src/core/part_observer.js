/**
 * Observer
 * part_observer.js
 */

mvc.ext(mvc.cls, "observer", mvc.Class.create({
	notify : function() {
		throw ("notify is not overwritten");
	}
}));

mvc.ext(mvc.cls, "subject", mvc.Class.create(mvc.cls.observer,{
	props : {
		observers : {},
		name:null
	},
	initialise:function(name){
		this.props.name=name;
	},
	getName:function(){
		return this.props.name;
	},
	unsubscribe : function(name) {
		if (this.props.observers[name]){
			delete this.props.observers[name];
		}
	},
	subscribe : function(name, observer) {
		if (observer.notify===undefined){
			throw("subscribed object should be subclass of observer");
		}
		this.props.observers[name]=observer;
	},
	notifyAll : function() {
		for(var key in this.props.observers) {
			var ob = this.props.observers[key];
			ob.notify.apply(ob,arguments);
		}
	},
	notify:function(){
		//empty
	}
}));
