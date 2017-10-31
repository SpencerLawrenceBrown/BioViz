module.exports = function(grunt) {
	grunt.initConfig({
		less: {
			development: {
				files: {
				"public/css/style.css": "src/less/style.less" // destination file and source file
			}
		}
    },
    watch: {
      files: ['src/**/*.less'],
      tasks: ['less']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['less', 'watch']);

};