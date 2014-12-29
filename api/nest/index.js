var Task = require('../task');
var NestTask = function() {
  var self = this;
  Task.call(self, 'temperature');
  self.credentials = require('./.credentials');
  self.api = require('unofficial-nest-api');
  self.loggedIn = false;
  self.data = null;

  // register commands
  self.register('((\\w+)\\s*(\\w+))+ degrees', self.setTemperature);
  self.register('home', self.setHome);
  self.register('away', self.setAway);

  self.login();
};

NestTask.prototype = Object.create(Task.prototype);
NestTask.prototype.constructor = NestTask;

NestTask.prototype.login = function(callback) {
  var self = this;
  console.log('Connecting to Nest...');
  if(self.loggedIn && self.data) {
    callback.call(self);
    return;
  }
  self.api.login(self.credentials.username, self.credentials.password, function(err, data) {
    if(err) {
      throw err.message;
    }
    self.loggedIn = true;
    self.api.fetchStatus(function(data) {
      self.data = data;
      console.log('Connected to Nest.');
      if(callback) {
        callback.call(self);
      }
    });
  });
};

NestTask.prototype.setTemperature = function(temp) {
  var self = this;
  self.convertTemperature(temp, function(number) {
    console.log('Setting temperature to %d degrees...', number);
    self.login(function() {
      for(var deviceId in self.data.device) {
        if(self.data.device.hasOwnProperty(deviceId)) {
          var device = self.data.shared[deviceId];
          self.api.setTemperature(deviceId, self.api.ftoc(number));
        }
      }
    });
  });
};

NestTask.prototype.convertTemperature = function(temp, callback) {
  var self = this;
  var wolfram = require('wolfram-alpha')
  var client = wolfram.createClient(self.credentials.wolframAlphaApiKey, null);
  client.query(temp, function(err, results) {
    if(err) {
      throw err;
    }
    // filter results to find input
    var text = results[0].subpods[0].text;
    var number = parseInt(text);
    callback(number);
  });
};

NestTask.prototype.setHome = function() {
  var self = this;
  console.log('Setting Nest to home...');
  self.login(function() {
    self.api.setHome();
  });
};

NestTask.prototype.setAway = function() {
  var self = this;
  console.log('Setting Nest to away...');
  self.login(function() {
    self.api.setAway();
  });
};

module.exports = NestTask;
