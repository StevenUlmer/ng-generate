var chalk = require('chalk');
var fs = require('fs'); // Filesystem
var readline = require('readline'); // Readline
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var namecase = require('../helpers/format/name.js');
var factory = require('../templates/factory/factory.js');
var spec = require('../templates/factory/factory.spec.js');

var formattedName;
var location = process.cwd() + '/services/';
var completed = [];

exports.generate = function(name, options) {
  formattedName = namecase.format(name);

  // Does directory exist?
  generateDirectory();

  function generateDirectory() {
    var expectedDir = location + name;

    // Generate the root location directory if it doesn't exist
    fs.stat(location, function(err, stats) {
      if (stats === undefined) {
        fs.mkdir(location, function(){});
      }
    });

    // Generate the file's target directory if it doesn't exist.
    fs.stat(expectedDir, function(err, stats) {
      if (stats === undefined) {
        fs.mkdir(expectedDir, function(err){
          if (err) {
            console.log(chalk.red.bold('**ERROR** Directory not created.'));
            console.log(chalk.red('Process Exiting. Factory generation failed.'));
            process.exit();
          } else {
            if (!options.spec) {
              generateFile('.factory.js', factory.template(formattedName));
            }
            generateFile('.factory.spec.js', spec.template(formattedName));
          }
        });
      } else {
        console.log(chalk.red.bold('**ERROR** File exists.'));
        console.log(chalk.red('Process Exiting. Factory generation failed.'));
        process.exit();
      }
    });
  }

  function generateFile(ext, fileContents) {
    var expectedFilename = name + ext;
    var expectedFilepath = pathForFilename(name, ext);
    console.log(chalk.green('Creating %s...'), expectedFilename);

    fs.writeFile(expectedFilepath, fileContents, function(err) {
      if (err) throw err;
      completed.push(expectedFilename);

      finished();
    });
  }

  /////////////////////

  function pathForFilename(name, ext) {
    return location + name + '/' + name + ext;
  }

  function finished() {
    if (completed.length === 2 && !options.spec) {
      console.log(chalk.green.bold('Finished! Please add mobi.' + formattedName.camel + ' to your module manifest files.'));
      process.exit();
    }

    if (completed.length === 1 && options.spec) {
      console.log(chalk.green.bold('Finished adding spec!'));
      process.exit();
    }
  }
};
