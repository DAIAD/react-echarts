module.exports = function(grunt) {
  
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
        banner: '/*! Package: <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      example: {
        files: { 
          'build/example/main.min.js': ['build/example/main.js'],
        },
      },
      vendor: {
        files: {
          'build/vendor/util.min.js': ['build/vendor/util.js'],
          'build/vendor/react-with-redux.min.js': ['build/vendor/react-with-redux.js'], 
          'build/vendor/echarts.min.js': ['build/vendor/echarts.js'],
        },
      },
    },
    
    browserify: {
      options: {
        transform: [
            ['babelify'],
        ],
      },
      example: {
        options: {
          // Exclude the modules below from being packaged into the main JS file:
          // They will injected in global namespace with their own bundles (build/vendor/*.js).
          exclude: [
            'isomorphic-fetch', 'lodash', 'rgbcolor',
            'react', 'react-dom',
            'redux', 'react-redux', 'redux-thunk', 'redux-logger',
            'echarts', 'echarts/index.simple', 'echarts/index.common', 
          ]
        },
        files: {
          'build/example/main.js': ['example/src/js/main.js'],
        },
      },
      vendor: {
        files: {
          'build/vendor/util.js': ['vendor/js/util.js'],
          'build/vendor/react-with-redux.js': ['vendor/js/react-with-redux.js'],
          'build/vendor/echarts.js': ['vendor/js/echarts.js'],
        },
      },
    },

    copy: {
      options: {
        mode: '0644',
      },
      example: {
        files: [
          {
            expand: true,
            filter: 'isFile',
            cwd: 'build/example',
            src: 'main.js',
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
            cwd: 'example/assets/',
            src: '**',
            dest: prefix,
          },
        ],
      },
      vendor: {
        files: [ 
          {
            expand: true,
            filter: 'isFile',
            cwd: 'build',
            src: 'vendor/*.js',
            dest: prefix,
          },
        ],
      },
    },

    watch: {
      example: {
         files: [
           'example/src/js/**.js',
           'example/src/js/components/**.js',
           'example/src/html/**.html',
           'example/assets/style.css'
         ],
         tasks: ['build:example', 'deploy:example'],
      },
      vendor: {
        files: [
           'vendor/js/**.js', 
        ],
        tasks: ['build:vendor', 'deploy:vendor'],
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-browserify');

  // Register new tasks

  grunt.registerTask('build:example', ['browserify:example', 'uglify:example']);
  grunt.registerTask('build:vendor', ['browserify:vendor', 'uglify:vendor']);
  grunt.registerTask('build', ['browserify', 'uglify']);
  
  grunt.registerTask('deploy:example', ['copy:example']);
  grunt.registerTask('deploy:vendor', ['copy:vendor']);
  grunt.registerTask('deploy', ['copy']);  

  grunt.registerTask('default', 'Greet', function () {
    console.log('Hello Grunt!');
  });
  
};
