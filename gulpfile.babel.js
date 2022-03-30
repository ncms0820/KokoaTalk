import gulp from "gulp";
import del from "del";
import gulpSass from "gulp-sass";
import dartSass from "sass";
import minify from "gulp-csso";
import autoprefixer from "gulp-autoprefixer";
import image from "gulp-image";
import bro from "gulp-bro";
import babelify from "babelify";
import ws from "gulp-webserver";
import ghPages from "gulp-gh-pages";
import htmlmin from "gulp-htmlmin";

const sass = gulpSass(dartSass);

const routes = {
  css: {
    watch: "src/scss/*",
    src: "src/scss/styles.scss",
    dest: "dist/css",
  },
  img: {
    src: "src/img/*",
    dest: "dist/img",
  },
  js: {
    watch: "src/js/**/*.js",
    src: "src/js/main.js",
    dest: "dist/js",
  },
  html: {
    src: "src/**/*.html",
    dest: "dist",
  },
};

const webserver = () => gulp.src("dist").pipe(ws({ livereload: true, open: true }));

const html = () => {
  return gulp
    .src(routes.html.src)
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        removeComments: true,
      })
    )
    .pipe(gulp.dest(routes.html.dest));
};

const styles = () =>
  gulp
    .src(routes.css.src)
    .pipe(sass.sync().on("error", sass.logError))
    .pipe(
      autoprefixer({
        flexbox: true,
        grid: "autoplace",
      })
    )
    .pipe(minify())
    .pipe(gulp.dest(routes.css.dest));

const img = () => gulp.src(routes.img.src).pipe(image()).pipe(gulp.dest(routes.img.dest));
const js = () =>
  gulp
    .src(routes.js.src)
    .pipe(
      bro({
        transform: [babelify.configure({ presets: ["@babel/preset-env"] }), ["uglifyify", { global: true }]],
      })
    )
    .pipe(gulp.dest(routes.js.dest));

const watch = () => {
  gulp.watch(routes.css.watch, styles);
  gulp.watch(routes.img.src, img);
  gulp.watch(routes.js.watch, js);
  gulp.watch(routes.html.src, html);
};

const clean = () => del(["dist", ".publish"]);
const deployer = () => gulp.src("dist/**/*").pipe(ghPages());

const prepare = gulp.series([clean, img]);

const assets = gulp.series([html, styles, js]);

const live = gulp.parallel([watch, webserver]);

export const build = gulp.series([prepare, assets]);
export const dev = gulp.series([build, live]);
export const deploy = gulp.series([build, deployer, clean]);
