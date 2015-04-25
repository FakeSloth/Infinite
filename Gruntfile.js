// jscs:disable
module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({

        jshint: {
            files: ['Gruntfile.js', 'infinite/**/*.js'],
            options: {
                multistr: true,
                sub: true
            }
        }

    });

    grunt.registerTask('default', ['jshint']);

};
