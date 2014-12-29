var Task = function(prefix) {
  var self = this;
  self.prefix = prefix;
  self.commands = [];
};

Task.prototype.register = function(phrase, callback) {
  var self = this;
  // combines the prefix with a regex to find matches in the todo
  // list
  phrase = self.prefix + ' ' + phrase;
  var regex = new RegExp(phrase);
  self.commands.push({
    regex: regex,
    callback: callback
  });
};

Task.prototype.parse = function(task) {
  var self = this;
  var string = task.text.toLowerCase();
  // filter on matches
  var matches = self.commands.filter(function(command) {
    return command.regex.test(string);
  });

  if(matches.length != 1) {
    return task;
  }

  var command = matches[0];
  var results = command.regex.exec(string);
  // there is almost definitely a better way to do this.
  var params = results[1];
  console.log('Executing: %s', string);
  command.callback.call(self, params);
  task.executed = true;
  return task;
}

module.exports = Task;
