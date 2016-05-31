var production = (process.env.NODE_ENV === 'production');

module.exports = function(grunt) {
  
  // Load external tasks
  
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-curl');
  grunt.loadNpmTasks('grunt-browserify');

  // A installation prefix for resources needed for the example
  
  var prefix = grunt.option('prefix') || 'example/public/www';

  // Project configuration.  
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    clean: {
      options: {
        force: true,
      },
      example: {
        src: [
            'build/*', 'example/public/www/*',
        ],
      },
    },
    
    uglify: {
      options: {
        banner: '/*! Package: <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        compress: {
          dead_code: true,
          conditionals: true,
          global_defs: {
            DEBUG: false,
          },
        },
      },
      'example': {
        files: { 
          'build/example/main.min.js': ['build/example/main.js'],
        },
      },
      'vendor': {
        files: {
          'build/vendor/moment-localized.min.js': ['build/vendor/moment-localized.js'],
          'build/vendor/util.min.js': ['build/vendor/util.js'],
          'build/vendor/react.min.js': ['build/vendor/react.js'],
          'build/vendor.min.js': [
            'build/vendor/moment-localized.js',
            'build/vendor/util.js',
            'build/vendor/react.js',
          ],
        },
      },
    },
    
    browserify: {
      options: {
        /* moved to package.json (to be visible for require()ing modules) */
      },
      'example': {
        options: {
          // Exclude the modules below from being packaged into the main JS file:
          external: [
            'fetch',
            'lodash',
            'rgbcolor',
            'moment',
            'numeral',
            'react',
            'react-dom',
            'react-router',
            'react-bootstrap',
            'react-datetime',
            'redux',
            'react-redux',
            'redux-thunk',
            'redux-logger',
            'echarts', 
          ]
        },
        files: {
          'build/example/main.js': ['example/src/js/main.js'],
        },
      },
      'vendor-moment': {
        options: {
          require: ['moment'],
        },
        files: {
          'build/vendor/moment-localized.js': ['vendor/js/moment-localized.js'],
        },
      },
      'vendor-util': {
        options: {
          alias: [
            'isomorphic-fetch:fetch',
            'lodash:lodash',
            'numeral',
            'rgbcolor:rgbcolor',
          ],
        },
        files: {
          'build/vendor/util.js': [],
        },
      },
      'vendor-react': {
        options: {
          require: [
            'react',
            'react-dom',
            'react-addons-pure-render-mixin',
            'react-router',
            'react-bootstrap',
            'react-datetime',
            'redux',
            'react-redux',
            'redux-thunk',
            'redux-logger',
          ],
        },
        files: {
          'build/vendor/react.js': ['vendor/js/react.js'],
        },
      },
    },

    cssmin: {
      options: {
        keepBreaks: true,
      },
      'example': {
        files: {
          'build/example/style.min.css': [
            'example/assets/style.css'
          ],
        },
      },
      'vendor': {
        files: {
          'build/vendor/stylesheets/react-datetime.min.css': [
            'build/vendor/stylesheets/react-datetime.css'
          ],
        },
      },
    },

    curl: {
      options: {},
      'build/vendor/stylesheets/react-datetime.css': 
        'http://rawgit.com/arqex/react-datetime/master/css/react-datetime.css',
      'build/vendor/stylesheets/bootstrap.min.css': 
        'http://maxcdn.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.css',
      'build/vendor/stylesheets/bootstrap-theme.min.css':
        'http://maxcdn.bootstrapcdn.com/bootstrap/latest/css/bootstrap-theme.min.css',
    },

    copy: {
      options: {
        mode: '0644',
      },
      'example': {
        files: [
          {
            expand: true,
            filter: 'isFile',
            cwd: 'build/example',
            src: 'main*.js',
            dest: prefix,
          },
          {
            expand: true,
            filter: 'isFile',
            cwd: 'example/src/html/',
            src: '*.html',
            dest: prefix,
          },
          {
            expand: true,
            filter: 'isFile',
            cwd: 'build/example',
            src: 'style*.css',
            dest: prefix,
          },
        ],
      },
      'vendor': {
        files: [ 
          {
            expand: true,
            filter: 'isFile',
            cwd: 'build',
            src: ['vendor*.js', 'vendor/*.js'],
            dest: prefix,
          },
          {
            expand: true,
            filter: 'isFile',
            cwd: 'build',
            src: 'vendor/stylesheets/*.css',
            dest: prefix,
          },
        ],
      },
    },

    watch: {
      'example': {
         files: [
           'src/js/**.js',
           'src/js/components/**.js',
           'example/src/js/**.js',
           'example/src/js/components/**.js',
           'example/src/js/components/reports-system/**.js',
           'example/src/js/components/reports-measurements/**.js',
           'example/src/js/actions/**.js',
           'example/src/js/reducers/**.js',
           'example/src/html/**.html',
         ],
         tasks: ['build:example', 'deploy:example'],
      },
      'example-stylesheets': {
        files: [
          'example/assets/*.css',
        ],
        tasks: ['build:example-stylesheets', 'deploy:example'],
      },
      'vendor': {
        files: [
           'vendor/js/**.js', 
        ],
        tasks: ['build:vendor', 'deploy:vendor'],
      },
    },
  });

  // Register new tasks

  grunt.registerTask('browserify:vendor', [
    'browserify:vendor-moment',
    'browserify:vendor-util',
    'browserify:vendor-react'
  ]);
  
  grunt.registerTask('curl:vendor-stylesheets', [
    'curl:build/vendor/stylesheets/react-datetime.css',
    'curl:build/vendor/stylesheets/bootstrap.min.css',
    'curl:build/vendor/stylesheets/bootstrap-theme.min.css',
  ]);
 
  grunt.registerTask('build:example', 'Build example application', function () {
    var tasks = ['browserify:example'];
    production && tasks.push('uglify:example');
    grunt.task.run(tasks);
  });
  
  grunt.registerTask('build:example-stylesheets', ['cssmin:example']);
 
  grunt.registerTask('build:vendor', 'Bundle vendor libraries', function () {
    var tasks = ['browserify:vendor'];
    production && tasks.push('uglify:vendor');
    grunt.task.run(tasks);
  });
  
  grunt.registerTask('build:vendor-stylesheets', ['curl:vendor-stylesheets', 'cssmin:vendor']);
  
  grunt.registerTask('build', [
    'build:vendor-stylesheets', 'build:vendor', 
    'build:example-stylesheets', 'build:example',
  ]);
  
  grunt.registerTask('deploy:example', ['copy:example']);
  grunt.registerTask('deploy:vendor', ['copy:vendor']);
  grunt.registerTask('deploy', ['deploy:vendor', 'deploy:example']);  

  grunt.registerTask('default', 'Greet', function () {
    console.log('Hello Grunt!');
  });
  
};
