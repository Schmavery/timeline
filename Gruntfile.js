var LIVERELOAD_PORT = 35729,
    lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT }),
    mountFolder = function( connect, dir ) {
      return connect.static(require('path').resolve(dir));
    };

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: {
      files: ["src/**/*"],
      tasks: ['typescript'],
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: ["src/**/*", "assets/**/*"]
      }
    },
    connect: {
      options: {
        port: 8000,
        hostname: '0.0.0.0'
      },
      livereload: {
        options: {
          middleware: function( connect ) {
            return [
              lrSnippet,
              mountFolder(connect, '.')
            ];
          }
        }
      }
    },
    open: {
      server: {
        url: 'http://localhost:<%= connect.options.port %>'
      }
    },
    typescript: {
      base: {
        src: ['src/**/*.ts'],
        dest: 'build/game.js',
        options: {
          module: 'amd', //or commonjs
          target: 'es5', //or es3
          basePath: 'src/',
          sourceMap: true,
          declaration: false
        }
      }
    },
    react: {
      single_file_output: {
        files: {
          'src/ui.ts': 'src/ui.jsx'
        }
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-react');

  grunt.registerTask('server', ['react', 'typescript', 'connect:livereload', 'open', 'watch']);

  grunt.registerTask('default', ['server']);
};
