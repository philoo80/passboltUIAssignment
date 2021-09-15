module.exports = function(grunt) {

  var banner = '/**!\n'+
    ' * @name\t\t<%= pkg.name %>\n'+
    ' * @version\t\tv<%= pkg.version %>\n' +
    ' * @date\t\t<%= grunt.template.today("yyyy-mm-dd") %>\n' +
    ' * @copyright\t<%= pkg.copyright %>\n' +
    ' * @source\t\t<%= pkg.repository %>\n'+
    ' * @license\t\t<%= pkg.license %>\n */';

	// ========================================================================
	// Configure task options

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			all: [
				'build/css/*',
				'src/css/**',
			],
      css: [
        'src/css/**'
      ]
		},
		less: {
      options: {
        javascriptEnabled: true
      },
			public: {
				expand: true,
				flatten: true,
				cwd: "src/less/",
				src: "*.less",
				dest: "src/css/",
				ext: ".css"
			},
      theme_default: {
        expand: true,
        flatten: true,
        cwd: "src/less/themes/default",
        src: "*.less",
        dest: "src/css/themes/default",
        ext: ".css"
      },
      theme_midgar: {
        expand: true,
        flatten: true,
        cwd: "src/less/themes/midgar",
        src: "*.less",
        dest: "src/css/themes/midgar",
        ext: ".css"
      },
      theme_philoo: {
        expand: true,
        flatten: true,
        cwd: "src/less/themes/philoo",
        src: "*.less",
        dest: "src/css/themes/philoo",
        ext: ".css"
      }
		},
		shell: {
      'build-apps': {
        command: [
          'npm run build'
        ].join('&& ')
      }
		},
		cssmin: {
			public: {
				expand: true,
				cwd: 'src/css/',
				src: ['*.css', '!*.min.css'],
				dest: 'build/css/',
				ext: '.min.css'
			},
      theme_default: {
        expand: true,
        cwd: 'src/css/themes/default',
        src: ['*.css', '!*.min.css'],
        dest: 'build/css/themes/default',
        ext: '.min.css'
      },
      theme_midgar: {
        expand: true,
        cwd: 'src/css/themes/midgar',
        src: ['*.css', '!*.min.css'],
        dest: 'build/css/themes/midgar',
        ext: '.min.css'
      },
      theme_philoo: {
        expand: true,
        cwd: 'src/css/themes/philoo',
        src: ['*.css', '!*.min.css'],
        dest: 'build/css/themes/philoo',
        ext: '.min.css'
      }

		},
    header: {
      public: {
        options: {
          text: banner
        },
        expand: true,
        cwd: 'build/css',
        src: ['*.css', '*.min.css'],
        dest: 'build/css',
        ext: '.min.css'
      },
      default: {
        options: {
          text: banner
        },
        expand: true,
        cwd: 'build/css/themes/default',
        src: ['*.min.css'],
        dest: 'build/css/themes/default',
        ext: '.min.css'
      },
      midgar: {
        options: {
          text: banner
        },
        expand: true,
        cwd: 'build/css/themes/midgar',
        src: ['*.min.css'],
        dest: 'build/css/themes/midgar',
        ext: '.min.css'
      },
      philoo: {
        options: {
          text: banner
        },
        expand: true,
        cwd: 'build/css/themes/philoo',
        src: ['*.min.css'],
        dest: 'build/css/themes/philoo',
        ext: '.min.css'
      }
    },
    symlink: {
      options: {
        // Enable overwrite to delete symlinks before recreating them
        overwrite: true,
      },
      expanded: {
        files: [
          {
            expand: true,
            overwrite: true,
            cwd: 'src',
            src: ['locales'],
            dest: 'build'
          },
        ]
      },
    },
    i18next: {
      externalize: {
        src: 'src/**/*.{js,html}',
        dest: 'src',
        options: {
          lngs: ['en-UK'],
          func: {
            list: ['this.props.t', 'this.translate'], // function use to parse and find new translation
            extensions: ['.js', '.jsx']
          },
          trans: {
            component: 'Trans',
            i18nKey: 'i18nKey',
            defaultsKey: 'defaults',
            extensions: ['.js', '.jsx'],
            fallbackKey: true
          },
          nsSeparator: false,
          keySeparator: false,
          defaultNs: 'common',
          resource: {
            loadPath: 'src/locales/{{lng}}/{{ns}}.json',
            savePath: 'locales/{{lng}}/{{ns}}.json'
          },
          removeUnusedKeys: true,
          sort: true,
          debug: false,
        }
      }
    },
		watch: {
			less: {
				files: [
					'Gruntfile.js',
					'package.json',
					'src/less/*.less',
					'src/less/**/*.less'
        ],
				tasks: ['css']
			}
		}
	});

	// ========================================================================
	// Initialise

	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-symlink');
	grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-header');
	grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('i18next-scanner');

	// ========================================================================
	// Register Tasks

  // grunt.registerTask('bundle-reports', [ 'shell:bundle-reports']);

	// 'grunt' will check code quality, and if no errors,
	// compile LESS to CSS, and minify and concatonate all JS and CSS
	grunt.registerTask('default', [ 'clean:all', 'less', 'cssmin', 'header', 'shell:build-apps', 'externalize-locale-string', 'symlink']);
  grunt.registerTask('css', [ 'clean:css', 'less']);
  grunt.registerTask('externalize-locale-string', ['i18next']);
};
