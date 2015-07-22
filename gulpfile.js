//Config du projet ( arbo des fichiers )
/**
 * Arborescence attendue :
 * Assets / 
 *   - cssDev               ( fichiers de travaux )
 *   - css                  ( code compilé )
 *   - imgDev               ( fichiers de travaux )
 *   - img                  (images optimisée )
 *   - jsDev                ( fichiers de travaux )
 *   - js                   ( code compilé )
 */
 
var assets         = "assets/",
    compatibilite  = "last 2 versions, >5%, ie 9",
    htmlArray      = false,
    //htmlArray      = ["index.html", "http://www.site.com"];//pages ou fichier a tester pour enlever les styles inutile
    // CSS
    cssDevPath     = assets + "cssDev/",
    cssProdPath    = assets + "css/",
    mainCSS        = "main.css",
    // JS 
    appName        = 'tabz', 
    jsDevPath      = assets + "jsDev/",
    jsProdPath     = assets + "js/",
    jsExportPath   = 'public/',  
    mainJS         = 'app.js',
    // IMG 
    imgProdPath    = assets + "imgDev/",
    imgDevPath     = assets + "img/",

    gulp           = require("gulp"),
	rename         = require("gulp-rename"),
    gutil          = require("gulp-util"),
    plumber        = require("gulp-plumber"),
    options        = require("minimist")(process.argv.slice(2)),
    notify         = require("gulp-notify"),
    
    gzip = require('gulp-gzip'),
    //CSS plugin
    cssnext        = require("gulp-cssnext"),
    uncss          = require("gulp-uncss"),
    cmq            = require("gulp-combine-media-queries"),
	
    //JS plugin
    babel          = require("gulp-babel"),
    concat         = require("gulp-concat"),
    sourcemaps     = require("gulp-sourcemaps");
    
   

gulp.task("styles", function () {
    'use strict';
   return gulp.src(cssDevPath + mainCSS)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(cmq())   // rassemble les differentes déclaration équivalente ( permet de rassembler les differents breakpoints d'un elements en meme temps dans le fichier de travail ) 
        .pipe(cssnext({
            browser: compatibilite, // Configuration de la compatibilité demandé
            //compress: options.prod, // On ne compresse qu'en prod
            sourcemap: !options.prod // On génére le sourcemap sauf en prod ( références cssnext / css compilé )
        }))
        // Si on compile en prod et qu'on a fournis un array de page html, on enleve les css inutilisés
        .pipe( (options.prod && htmlArray !== false ) ? uncss({ html: htmlArray }) : gutil.noop())
        // Super important, on convertit nos streams en fichiers
        .pipe(gulp.dest(cssProdPath)); 
});

gulp.task('compress', function() {
    gulp.src('./assets/js/*.js')
    .pipe(gzip())
    .pipe(gulp.dest('./public/scripts'));
});
// ça pourrait merdouiller avec jquery ... mais bon 
gulp.task("scripts", function () {
    'use strict';
    return gulp.src(jsDevPath + "**/*.js") // Recupération de tous les fichiers js contenu dans le repertoire/sous-repertoire jsDevPath
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(sourcemaps.init())
        .pipe(concat("app.js")) // Concatenation dans le fichier de destination
        .pipe(babel({
            compact: options.prod // Minify quand on compile en prod 
        })) // transpiler es6 -> es5 
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(jsProdPath));  // dossier de destination
});

// Ici on a une tâche de dev qui lance un watch APRES avoir exécuté `styles` une fois
gulp.task("default", ["styles", "scripts"], function () {
    'use strict';
    gulp.watch(cssDevPath + "**/*", ["styles"]);
    gulp.watch(jsDevPath + "**/*", ["scripts"]);
});

gulp.task("export", function() {
    'use strict';
   gulp.src(jsProdPath + 'app.js' )
        .pipe(rename(appName + '.v.dev.js'))
        .pipe(gulp.dest(jsExportPath));

    gulp.src(jsProdPath + 'app.js' )
        .pipe(babel({
            compact: true
        }))
        .pipe(rename(appName +'.v.min.js'))
        .pipe(gulp.dest(jsExportPath));
});