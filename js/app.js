requirejs.config({
     "baseUrl": "js/lib",
     "paths": {
         "app": "../app",
         "jquery": "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery"
     }
 })


 requirejs(["app/main"]);
