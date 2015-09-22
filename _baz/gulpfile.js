	
	/*
	 *	# BazBuild Gulpfile
	 *
	 *	This gulp file should be running during development. It will compile
	 * 	Javascript, LESS, SCSS and also compress and optimise images.
	 *
	 *	The settings of the GulpFile can be controlled from the config.json file
	 *	in this directory.
	 *
	 *
	 *	## config.json
	 *
	 *	production-ready:	When true all CSS and JS will be minified during
	 *						build.
	 *
	 *	folder-names: 		These folder names will be used when the JS, CSS
	 *						and images finish being processed.
	 *
	 *	output-path-depth: 	If the '_dev' folder is not stored within your 
	 *						project route you can assign it's depth here.
	 *
	 *	paths: 				The build process watches folders for changes and
	 *						then compiles code from other files.
	 *
	 *	watch-paths: 		The list of folders that will be watched for changes
	 *
	 *	input-paths: 		The list of files that, when watch triggers, will be
	 *						compiled and output to production folder level.
	 *
	 */




	/*
	 *	# Requirements
	 *
	 *	Gulp plugins depended on for progressing images and compiling code.
	 *
	 */
	var	gulp 			= require("gulp"),
		less 			= require('gulp-less'),
		sass 			= require('gulp-sass'),
		path 			= require('path'),
		globule 		= require('globule'),
		minify 			= require('gulp-cssmin'),
		notify 			= require('gulp-notify'),
		plumber 		= require('gulp-plumber'),
		rename 			= require('gulp-rename'),
		sourcemaps 		= require('gulp-sourcemaps'),
		uglify 			= require('gulp-uglify'),
		runSequence 	= require('run-sequence'),
		imagemin 		= require('gulp-imagemin'),
		fileinclude 	= require('gulp-file-include'),
		include 		= require('gulp-include'),
		replace 		= require('gulp-replace'),
		header 			= require('gulp-header'),
		del           	= require('del'),
		config 			= require('./config.json');





	/*
	 *	Compile CSS
	 *
	 *	Switch between SCSS or LESS depending on settings
	 *
	 */
	gulp.task(config['task-names']['styles'], function(callback){

		// If SCSS is enabled, only run LESS compile
		if( config['css-preprocessor']['scss'] ){
			runSequence( config['task-names']['scss'], callback );
		}

		// If not, assume LESS is wanted (default)
		else {
			runSequence( config['task-names']['less'], callback );
		}

	});




	/*
	 *	Compile LESS
	 *
	 *	Compile the main LESS file and export the CSS to production folder.
	 *
	 */
	gulp.task(config['task-names']['less'], function(){
		return gulp.src( config.paths['input-paths']['less-files'] )
			.pipe(plumber({ errorHandler: handleError }))
			.pipe(sourcemaps.init())
			.pipe(less())
			.pipe(header( headerComment() ))
			.pipe(sourcemaps.write( config['source-maps']['source-map-path'] ))
			.pipe(gulp.dest( outputPath('styles') ))
			.pipe(plumber.stop());
	});




	/*
	 *	Compile SCSS
	 *
	 *	Compile the main SCSS file and export the CSS to production folder.
	 *
	 */
	gulp.task(config['task-names']['scss'], function(){
		return gulp.src( config.paths['input-paths']['scss-files'] )
			.pipe(plumber({ errorHandler: handleError }))
			.pipe(sourcemaps.init())
			.pipe( sass({ onError: handleError}) )
			.pipe(header( headerComment() ))
			.pipe(sourcemaps.write( config['source-maps']['source-map-path'] ))
			.pipe(gulp.dest( outputPath('styles') ))
			.pipe(plumber.stop());
	});




	/*
	 *	Optimise Images
	 *
	 *	Run all images through optimisation
	 *
	 */
	gulp.task(config['task-names']['images'], function(){
		return gulp.src( config.paths['input-paths']['image-files'] )
			.pipe(plumber({ errorHandler: handleError }))
			.pipe( imagemin({
				progressive: true,
				interlaced: true
			}) )
			.pipe(gulp.dest( outputPath('images') ))
			.pipe(plumber.stop());
	});




	/*
	 *	Compile JS
	 *
	 *	Compile and optimise all the project JS into the production folder
	 *
	 */
	gulp.task(config['task-names']['js'], function(){
		return gulp.src( config.paths['input-paths']['js-files'] )
			.pipe(sourcemaps.init())
			.pipe(plumber({ errorHandler: handleError }))
			.pipe(include())
			.pipe(header( headerComment() ))
			.pipe(sourcemaps.write('./maps'))
			.pipe(gulp.dest( outputPath('scripts') ))
			.pipe(plumber.stop());
	});




	/*
	 *	Cleanup
	 *
	 *	During the initial start of gulp the production folder will be cleaned
	 *	up.
	 *
	 */
	gulp.task(config['task-names']['cleanup'], function(){
		console.log(
			del.sync([ outputPath('styles') + '**' ], {force: true}),
			del.sync([ outputPath('scripts') + '**' ], {force: true}),
			del.sync([ outputPath('images') + '**' ], {force: true})
		);
		return;
	});




	/*
	 *	Dev Build
	 *
	 *	Run the development build task. Run initially to give you a fresh build
	 *	of your project after cleanup.
	 *
	 */
	gulp.task(config['task-names']['dev-build'], function(callback){
		runSequence(
			config['task-names']['styles'],
			config['task-names']['js'],
			config['task-names']['images'],
			callback
		);
	});




	/*
	 *	Watchers
	 *
	 *	Setup all the gulp watchers.
	 *
	 */
	gulp.task("watch", function(){

		// Watch the LESS Files
		gulp.watch(config.paths['watch-paths']['less-files'], [
			config['task-names']['styles']
		]);

		// Watch the SCSS Files
		gulp.watch(config.paths['watch-paths']['scss-files'], [
			config['task-names']['styles']
		]);

		// Watch the JS Files
		gulp.watch(config.paths['watch-paths']['js-files'], [
			config['task-names']['js']
		]);

		// Watch the Image Files
		gulp.watch(config.paths['watch-paths']['image-files'], [
			config['task-names']['images']
		]);

	});




	/*
	 *	Default
	 *
	 *	Setup the watchers and run the default tasks.
	 *
	 */
	gulp.task('default', function(callback){
		runSequence(
			"watch",
			config['task-names']['cleanup'],
			config['task-names']['dev-build'],
			callback
		);
	});









	/*
	 *	Utilities
	 *
	 *	A collection of functions to do and return basic things.
	 *
	 */




	/*
	 *	outputPath
	 *
	 *	Return the output path for a type of resource.
	 *
	 */
	var outputPath = function(key){
		var depth = config['output-path-depth'];
		var outputFolder = config['output-folders'][key];
		return depth + outputFolder;
	}




	/*
	 *	outputFile
	 *
	 *	Return the output path for a type of resource.
	 *
	 */
	var outputFile = function(key){
		var outputFile = config['output-files'][key];
		return '/' + outputFile;
	}




	/*
	 *	headerComment
	 *
	 *	Build the comment to be added to the start of compiled code
	 *
	 */
	var headerComment = function(key){
		var useComment = config['header-comment']['allow'];
		var headerComment = config['header-comment']['body'];
		return (useComment)? '/* ' + headerComment + ' */' + "\n" : '';
	}




	/*
	 *	handleError
	 *
	 *	If an error happens notifiy us.
	 *
	 */

	var handleError = function(err){
		console.error(err);
		return notify().write(err)
	}