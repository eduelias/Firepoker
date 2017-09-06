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
    .controller('NewCtrl', function($controller, $firebaseObject, $rootScope, $scope, $cookies, $location, $routeParams, utils) {
        $scope.decks = utils.decks;
        $scope.newGame = utils.newGame;
        // Load cookies
        $scope.fp = $cookies.getObject('fp');
        if (!$scope.fp) {
            $scope.fp = {};
        }

        // UID
        if (!$scope.fp.user || !$scope.fp.user.id) {
            var uid = utils.guid();
            $scope.fp.user = { id: uid, active: true, hasVoted: false };
            $cookies.putObject('fp', $scope.fp);
        }

        // GID
        if (!$scope.fp.gid) {
            var gid = utils.guid();
            $scope.fp.gid = gid;
            $cookies.putObject('fp', $scope.fp);
        }

        // Set new game
        $scope.setNewGame = function(game) {
            utils.firebase.database().ref('games/' + $routeParams.gid).set(game);
            $scope.gameRef = utils.firebase.database().ref('games/' + $routeParams.gid);
            $cookies.putObject('fp', $scope.fp);
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
            newGame.participants[$scope.fp.user.id] = $scope.fp.user;
            newGame.estimate = false;
            $scope.isOwner = true;
            $scope.loginerror = false;
            $scope.setNewGame(newGame);
            $location.path('/games/' + $routeParams.gid);
            $location.replace();
        };

        if ($location.path() === '/games/new' || $location.path() === '/games/new/') {
            $scope.fp.gid = utils.guid();
            $location.path('/games/new/' + $scope.fp.gid);
            $location.replace();
        }
    });