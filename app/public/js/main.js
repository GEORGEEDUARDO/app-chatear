$(document).ready(function() {
    
    var mainController = new MainController();

    mainController.init();
});


var MainController = function() {
    var self = this;
    
    self.appEventBus = _.extend({}, Backbone.Events);
    
    self.viewEventBus = _.extend({}, Backbone.Events);
    
    self.init = function() {

	self.chatClient = new ChatClient({ vent: self.appEventBus });
	self.chatClient.connect();

	self.loginModel = new LoginModel();
	
	self.containerModel = new ContainerModel({ viewState: new LoginView({vent: self.viewEventBus, model: self.loginModel})});
	self.containerView = new ContainerView({ model: self.containerModel });

	self.containerView.render();
    }

    self.viewEventBus.on("login", function(name) {
	// socketio login
	self.chatClient.login(name);
    });

    self.viewEventBus.on("chat", function(chat) {
	// socketio chat
	self.chatClient.chat(chat);
    });

    self.appEventBus.on("loginDone", function() {
	self.homeModel = new HomeModel();
	self.homeView  = new HomeView({vent: self.viewEventBus, model: self.homeModel });

	self.containerModel.set("viewState", self.homeView);
    });

    self.appEventBus.on("loginNameBad", function(name) {
	self.loginModel.set("error", "Escriba su Nick para Ingresar");
    });

    self.appEventBus.on("loginNameExists", function(name) {
	self.loginModel.set("error", "Este Nick se esta Usando");
    });

    self.appEventBus.on("usersInfo", function(data) {
	var onlineUsers = self.homeModel.get("onlineUsers");

	var users = _.map(data, function(item) {
	    return new UserModel({name: item});
	});
	
	onlineUsers.reset(users);
    });

    self.appEventBus.on("userJoined", function(username) {
	self.homeModel.addUser(username);

	self.homeModel.addChat({sender: "", message: username + " te has conectado al chat." });
	//self.homeModel.addChat({addressee: "", message: username + " se ha conectado al chat." });    
    });

    self.appEventBus.on("userLeft", function(username) {
	self.homeModel.removeUser(username);

	self.homeModel.addChat({sender: "", message: username + " se ha desconectado del chat." });
    });

    self.appEventBus.on("chatReceived", function(chat) {
	self.homeModel.addChat(chat);
    });
}

