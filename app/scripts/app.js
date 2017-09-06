'use strict';

angular.module('firePokerApp', ['firebase', 'ngCookies', 'ngRoute'])
    .config(function($routeProvider, $locationProvider) {
        $locationProvider.hashPrefix('');
        $routeProvider
            .when('/', {
                templateUrl: 'views/games/index.html',
                controller: 'CommonCtrl'
            })
            .when('/games/new', {
                templateUrl: 'views/games/new.html',
                controller: 'NewCtrl'
            })
            .when('/games/new/:gid', {
                templateUrl: 'views/games/new.html',
                controller: 'NewCtrl'
            })
            .when('/games/:gid', {
                templateUrl: 'views/games/play.html',
                controller: 'PlayCtrl'
            })
            .when('/games/join/:gid', {
                templateUrl: 'views/games/join.html',
                controller: 'LoginCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    });