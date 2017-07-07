module.exports = function (grunt) {

    grunt.initConfig({
        babel: {
            options: {
                sourceMap: true,
                presets: ['es2015']
            },
            dist: {
                files: {
                    'processing/assets/js/app.js': 'assets/js/app.js',
                    'processing/assets/js/setup.js': 'assets/js/setup.js',
                    'processing/assets/js/database.js': 'assets/js/database.js'
                }
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['processing/assets/js/database.js', 'processing/assets/js/setup.js', 'processing/assets/js/app.js'],
                dest: 'processing/assets/js/main.js'
            },
        },
        uglify: {
            options: {
                compress: {
                    drop_console: true
                }
            },
            my_target: {
                files: {
                    'dist/assets/js/main.min.js': ['processing/assets/js/main.js']
                }
            }
        },
        concat_css: {
            options: {},
            all: {
                src: ["assets/css/**/*.css"],
                dest: "processing/assets/css/compiled.css"
            }
        },
        postcss: {
            options: {
                map: true, // inline sourcemaps
                processors: [
                    require("postcss-import")(),
                    require("postcss-url")(),
                    require("postcss-cssnext")(),
                    require("postcss-browser-reporter")(),
                    require("postcss-reporter")(),
                    require("cssnano")({ autoprefixer: false })
                ]
            },
            dist: {
                src: 'processing/assets/css/compiled.css',
                dest: 'dist/assets/css/style.css'
            }
        },
        processhtml: {
            dist: {
                files: {
                    'dist/app.html': ['app.html']
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-concat-css');
    grunt.loadNpmTasks('grunt-postcss');

    grunt.loadNpmTasks('grunt-processhtml');

    // Default task(s).
    grunt.registerTask('production', ['babel', 'concat', 'uglify', 'concat_css', 'postcss', 'processhtml']);

};