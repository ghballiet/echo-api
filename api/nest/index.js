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
  var words = temp.toLowerCase().split(' '),
      placeCount = 0,
      digits = 0,
      noNumber = true,
      negative = words[0] == 'negative' ? true : false,
      numberNames = {
        ones: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'],
        tens: ['twenty', 'thirty', 'fourty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'],
        large: ['thousand', 'million', 'billion', 'trillion', 'quadrillion'] // Number.MAX_VALUE is around 9 quadrillion
      };
  for(var i = 0; i < words.length; i++) {
    var ones = numberNames.ones.indexOf(words[i]),
      tens = numberNames.tens.indexOf(words[i]), 
      large = numberNames.large.indexOf(words[i]);
    if(ones > -1)
      placeCount += ones;
    if(tens > -1)
      placeCount += 10*(tens+2);
    if(words[i] == 'hundred')
      placeCount *= 100;
    if(large > -1) {
      placeCount *= Math.pow(1000, large+1),
      digits += placeCount, 
      placeCount = 0;
    }
    noNumber = ones > -1 || tens > -1 || words[i] == 'hundred' || large > -1 ? false : true;
  }
  if(placeCount > 0 && placeCount < 1000)
    digits += placeCount;
  if(negative)
    digits *= -1;
  if(!noNumber)
    callback(digits);
  else
    console.log('Couldn\'t understand temperature!');
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
