/*global angular*/
'use strict';

/**
 * LoginCtrl
 *
 * FirePoker.io is a monolithic well tested app, so for now all it's
 * I'm moving most of the code from one controller to another in a atempt to 
 * clean/organize/improve this code.
 * 
 * Most of this code was based/copied from the old author
 * @author Everton Yoshitani <everton@wizehive.com>
 * 
 * Some of this code is mine too
 * @author Eduardo Elias Saleh <du7@msn.com>
 */
angular.module('firePokerApp')
    .controller('NewCtrl', function($controller, $rootScope, $scope, $cookieStore, $location, $routeParams, utils) {
        $controller('CommonCtrl', {
            $controller: $controller,
            $rootScope: $rootScope,
            $scope: $scope,
            $cookieStore: $cookieStore,
            $location: $location,
            $routeParams: $routeParams,
            utils: utils
        });

        // Set new game
        $scope.setNewGame = function(game) {
            utils.firebase.database().ref('/games/' + $routeParams.gid).set(game);
            $scope.game = game;
        };

        // Create game
        $scope.createGame = function() {
            var stories = [],
                newGame = angular.copy($scope.newGame);
            if (newGame.stories) {
                angular.forEach(newGame.stories.split('\n'), function(title) {
                    var story = {
                        title: title,
                        status: 'queue'
                    };
                    stories.push(story);
                });
            }
            newGame.stories = stories;
            newGame.status = 'active';
            newGame.created = new Date().getTime();
            newGame.owner = $scope.fp.user;
            newGame.participants = false;
            newGame.estimate = false;
            $scope.isOwner = true;
            $scope.loginerror = false;
            $scope.setNewGame(newGame);
            $cookieStore.put('fp', $scope.fp);
            $location.path('/games/' + $routeParams.gid);
            $location.replace();
        };
    });