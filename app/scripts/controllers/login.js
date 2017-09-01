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
    .controller('LoginCtrl', function($controller, $rootScope, $scope, $cookieStore, $location, $routeParams, angularFire, utils) {
        $controller('PresetCtrl', {
            $controller: $controller,
            $rootScope: $rootScope,
            $scope: $scope,
            $cookieStore: $cookieStore,
            $location: $location,
            $routeParams: $routeParams,
            angularFire: angularFire,
            utils: utils
        });

        // load user from storage
        $scope.loadUser = function() {
            var success = false;
            if ($scope.game && $scope.game.participants) {
                angular.forEach($scope.game.participants, function(user) {
                    if (user.email === $scope.fp.user.email) {
                        $scope.fp.user = user;
                        success = true;
                    }
                });
            }
            if (!success) {
                $cookieStore.remove('fp');
            }
            return success;
        };

        // loads the game, only
        $scope.loadGame = function(callback) {
            callback = callback || function() {}
            if ($routeParams.gid) {
                angularFire(utils.firebase.child('/games/' + $routeParams.gid), $scope, 'game').then(function() {
                    callback();
                });
            }
        }

        // Set full name
        $scope.setFullname = function() {
            $cookieStore.put('fp', $scope.fp);
            $location.path('/games/' + $routeParams.gid);
            $location.replace();
        };

        // try to load user by its email
        $scope.setEmail = function() {
            if ($scope.loadUser()) {
                $cookieStore.put('fp', $scope.fp);
                $location.path('/games/' + $routeParams.gid);
                $location.replace();
            } else {
                $scope.loginerror = "Game or user not found";
            }
        };

        // loads the game if one were provided
        $scope.loadGame();

        // Redirect to game if fullname already set
        $scope.redirectToGameIfFullnameAlreadySet();
    });