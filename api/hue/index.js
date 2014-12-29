var Task = require('../task');
var HueTask = function() {
  var self = this;
  Task.call(self, 'lighting');
  self.bridge = null;
  self.api = null;
  self.lights = null;
  self.connected = false;
  self.hue = require('node-hue-api');
  self.credentials = require('./.credentials');

  // register commands
  self.register('active', self.turnOnDefault);
  self.register('off', self.turnOff);
  self.register('backdrop (\\w+)', self.setScene);

  if(!self.bridge || !self.api) {
    self.connect(function() {
      console.log('Connected to Hue.');
      console.log('%d lights found.', self.lights.length);
    });
  }
};
HueTask.prototype = Object.create(Task.prototype);
HueTask.prototype.constructor = HueTask;

HueTask.prototype.connect = function(callback) {
  var self = this;
  console.log('Connecting to Hue...');
  self.hue.locateBridges(function(err, bridges) {
    if(err) throw err;
    // TODO: refactor to work with multiple bridges
    if(bridges.length < 1) {
      throw 'No bridges found!';
    }
    self.bridge = bridges[0];
    self.api = new self.hue.HueApi(self.bridge.ipaddress, self.credentials.username);
    self.findLights(callback);
  });
};

HueTask.prototype.findLights = function(callback) {
  var self = this;
  if(!self.api) throw 'Hue is not connected.';
  self.api.lights(function(err, result) {
    if(err) throw err;
    self.lights = result.lights;
    if(callback) {
      callback.call(self, self.lights);
    }
  });
};

HueTask.prototype.turnOnDefault = function() {
  var self = this;
  var state = self.hue.lightState.create().on().rgb(255,255,255);
  for(var i in self.lights) {
    var light = self.lights[i];
    console.log('Turning on: %s', light.name);
    self.api.setLightState(light.id, state, function(err, lights) {
      if(err) console.log('Error turning on: %s', err);
    });
  }
};

HueTask.prototype.turnOff = function() {
  var self = this;
  var state = self.hue.lightState.create().off();
  for(var i in self.lights) {
    var light = self.lights[i];
    console.log('Turning off: %s', light.name);
    self.api.setLightState(light.id, state, function(err, lights) {
      if(err) console.log('Error turning off: %s', err);
    });
  }
};

HueTask.prototype.setScene = function(scene) {
  var self = this;
  console.log('Loading scene %s...', scene);
  var settings;
  try {
    settings = require('./scenes/' + scene + '.json');
  } catch(err) {
    console.log('Could not find %s.', scene);
    return;
  }

  for(var i in settings) {
    var group = settings[i];
    var state = self.hue.lightState.create().on();
    state.brightness(group.brightness);
    if(group.rgb) {
      var rgb = group.rgb;
      state.rgb(rgb[0], rgb[1], rgb[2]);
    }
    if(group.xy) {
      var xy = group.xy;
      state.xy(xy[0], xy[1]);
    }
    if(group.effect) {
      state.effect(group.effect);
    }
    for(var i in group.lights) {
      var id = group.lights[i];
      self.api.setLightState(id, state, function(err, lights) {
        if(err) console.log('Error configuring: %s', err);
      });
    }
  }
};

module.exports = HueTask;
