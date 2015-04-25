module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({

        jshint: {
            files: ['Gruntfile.js', 'infinite/**/*.js']
        },

        jscs: {
            src: ['Gruntfile.js', 'infinite/**/*.js'],
            options: {
                config: '.jscsrc'
            }
        }

    });

    grunt.registerTask('default', ['jshint', 'jscs']);

};
