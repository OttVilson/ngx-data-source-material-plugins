# NgxDataSourceMaterialPlugins

This library helps to connect [ngx-data-source](https://github.com/OttVilson/ngx-data-source) to instances of Angular Material (MatSort)[https://material.angular.io/components/sort/api#MatSort] and [MatPaginator](https://material.angular.io/components/paginator/api#MatPaginator).

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.7.

# How to use
* clone the repository via `git clone git@github.com:OttVilson/ngx-data-source-material-plugins.git`
* navigate to `cd ngx-data-source-material-plugins`
* run `npm install`
* run `npm link ngx-data-source` (this step assumes a local build of [ngx-data-source](https://github.com/OttVilson/ngx-data-source) has been exposed via npm link)
* run `ng build`
* navigate to `cd ./dist/ngx-data-source-material-plugins`
* run `npm link`
* navigate to the project where you intend to use the library
* run `npm link ngx-data-source-material-plugins` (as well as `npm link ngx-data-source`)
* note that since you are dealing with symlinks you are probably going to have a clash for MatSort and MatPaginator; this can be avoided by adding 
```
    "baseUrl": "./",
    "paths": {
      "*": ["node_modules/*", "*"]
    },
```
to tsconfig.json file under `compilerOptions`. See also Scenario 1 in https://github.com/microsoft/TypeScript/issues/8346.
