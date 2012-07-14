// This is the main application configuration file.  It is a Grunt
// configuration file, which you can learn more about here:
// https://github.com/cowboy/grunt/blob/master/docs/configuring.md
module.exports = function(grunt) {

  grunt.initConfig({

    // The clean task ensures all files are removed from the dist/ directory so
    // that no files linger from previous builds.
    clean: ["dist/", "../public/"],

    // The lint task will run the build configuration and the application
    // JavaScript through JSHint and report any errors.  You can change the
    // options for this task, by reading this:
    // https://github.com/cowboy/grunt/blob/master/docs/task_lint.md
    lint: {
      files: [
        "build/config.js", "app/**/*.js"
      ]
    },

    // The jshint option for scripturl is set to lax, because the anchor
    // override inside main.js needs to test for them so as to not accidentally
    // route.
    jshint: {
      options: {
        scripturl: true
      }
    },

    // The jade task compiles all application templates into underscore.js
    // templates using the Jade template engine. You will need to install
    // jade globally in order to run this task.
    //
    // The jst task depends on these templates to exist, so if you decide to
    // remove this, ensure jst is updated accordingly.
    jade: {
      compile: {
        files: {
          "dist/debug/templates": [
            "app/templates/**/*.jade"
          ]
        }
      }
    },

    // The jst task compiles all application templates into JavaScript
    // functions with the underscore.js template function from 1.2.4.  You can
    // change the namespace and the template options, by reading this:
    // https://github.com/gruntjs/grunt-contrib/blob/master/docs/jst.md
    //
    // The concat task depends on this file to exist, so if you decide to
    // remove this, ensure concat is updated accordingly.
    jst: {
      "dist/debug/templates.js": [
        "app/templates/**/*.html"
      ]
    },


    // The concatenate task is used here to merge the almond require/define
    // shim and the templates into the application code.  It's named
    // dist/debug/require.js, because we want to only load one script file in
    // index.html.
    concat: {
      "../public/javascripts/require.js": [
        "assets/js/libs/almond.js",
        "dist/debug/templates.js",
        "dist/debug/require.js",
        "assets/js/libs/swfobject.js"
      ]
    },

    // The stylus task compiles all application stylesheets into regular css
    // using Stylus and Nib. You will need to install stylus and nib globally.
    //
    // The mincss task depends on this file to exist, so if you decide to
    // remove this, ensure concat is updated accordingly.
    stylus: {
      compile: {
        files: {
          "dist/debug/style.css": "app/stylesheets/style.styl"
        }
      }
    },

    // This task uses the MinCSS Node.js project to take all your CSS files in
    // order and concatenate them into a single CSS file named index.css.  It
    // also minifies all the CSS as well.
    mincss: {
      "../public/stylesheets/style.css": [
        "assets/css/h5bp.css",
        "assets/css/bootstrap.css",
        "dist/debug/style.css"
      ]
    },

    // Takes the built require.js file and minifies it for filesize benefits.
    min: {
      "../public/javascripts/require.js": [
        "dist/debug/require.js"
      ]
    },

    // This task uses James Burke's excellent r.js AMD build tool.  In the
    // future other builders may be contributed as drop-in alternatives.
    requirejs: {
      // Include the main configuration file.
      mainConfigFile: "app/config.js",

      // Output file.
      out: "dist/debug/require.js",

      // Root application module.
      name: "config",

      // Do not wrap everything in an IIFE.
      wrap: false
    },

    // The headless QUnit testing environment is provided for "free" by Grunt.
    // Simply point the configuration to your test directory.
    qunit: {
      all: ["test/qunit/*.html"]
    },

    // The headless Jasmine testing is provided by grunt-jasmine-task. Simply
    // point the configuration to your test directory.
    jasmine: {
      all: ["test/jasmine/*.html"]
    },

    watch: {
      scripts: {
        files: [
          "app/stylesheets/**/*.styl",
          "app/**/*.js",
          "app/templates/**/*.html"
        ],
        tasks: 'debug'
      },
    }

  });

  // The default task will remove all contents inside the dist/ folder, lint
  // all your code, precompile all the underscore templates into
  // dist/debug/templates.js, compile all the application code into
  // dist/debug/require.js, and then concatenate the require/define shim
  // almond.js and dist/debug/templates.js into the require.js file.
  grunt.registerTask("default", "clean lint jst requirejs concat");

  // The debug task is simply an alias to default to remain consistent with
  // debug/release.
  grunt.registerTask("debug", "default stylus mincss");

  // The release task will run the debug tasks and then minify the
  // dist/debug/require.js file and CSS files.
  grunt.registerTask("release", "default min stylus mincss");

};
