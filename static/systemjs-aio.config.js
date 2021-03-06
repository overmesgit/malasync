/**
 * System configuration for Angular samples
 * Adjust as necessary for your application needs.
 */
(function (global) {
  System.config({
    paths: {
      // paths serve as alias
      'npm:': 'static/node_modules/'
    },
    // map tells the System loader where to look for things
    map: {
      // our app is within the app folder
      app: 'static/app',

      // angular bundles
      '@angular/core': 'npm:@angular/core/bundles/core.umd.js',
      '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
      '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js',
      '@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
      '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
      '@angular/http': 'npm:@angular/http/bundles/http.umd.js',
      '@angular/router': 'npm:@angular/router/bundles/router.umd.js',
      '@angular/forms': 'npm:@angular/forms/bundles/forms.umd.js',

      // other libraries
      'rxjs':                      'npm:rxjs',
      'nouislider': 'npm:nouislider',
      'ng2-nouislider': 'npm:ng2-nouislider',
      'ng2-select': 'npm:ng2-select',
      'ng2-dnd': 'npm:ng2-dnd/bundles/index.umd.js',
      'mydatepicker': 'npm:mydatepicker/bundles/mydatepicker.umd.js',
      'mydaterangepicker': 'npm:mydaterangepicker/bundles/mydaterangepicker.umd.js'
    },
    // packages tells the System loader how to load when no filename and/or no extension
    packages: {
      app: { main: './main.js', defaultExtension: 'js'},
      rxjs: { defaultExtension: 'js'},
      'nouislider': { main: 'distribute/nouislider.js', defaultExtension: 'js' },
      'ng2-nouislider': { main: 'src/nouislider.js', defaultExtension: 'js' },
      'ng2-select': { defaultExtension: 'js', main: 'ng2-select.js'}
    }
  });
})(this);
