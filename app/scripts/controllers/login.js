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
    .controller('LoginCtrl', function($scope, $routeParams, $location, $cookies, utils) {

        // deals with the fp cookie
        utils.dealsWithFp($scope);

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
                $cookies.removeObject('fp');
            }
            return success;
        };

        // try to load user by its email
        $scope.setEmail = function() {
            if (utils.loadUser()) {
                $scope.setFullname();
            } else {
                $scope.loginerror = "Game or user not found";
            }
        };

        // Set full name
        $scope.setFullname = function() {
            $cookies.putObject('fp', $scope.fp);
            $scope.game.participants[$scope.fp.user.id] = $scope.fp.user;
            $location.path('/games/' + $routeParams.gid);
            $location.replace();
        };

        // Redirect to game if fullname already set
        $scope.redirectToGameIfFullnameAlreadySet = function() {
            if (
                $routeParams.gid &&
                $location.path() === '/games/join/' + $routeParams.gid &&
                $scope.fp &&
                $scope.fp.user &&
                $scope.fp.user.fullname
            ) {
                $location.path('/games/' + $routeParams.gid).replace();
            }
        };

        // Redirect to game if fullname already set
        $scope.redirectToGameIfFullnameAlreadySet();

        // loads the game if one were provided
        utils.bindGame($scope, $routeParams.gid);
    });