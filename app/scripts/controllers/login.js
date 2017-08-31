/*global angular*/
/*global Firebase*/
'use strict';

/**
 * LoginCtrl
 *
 * FirePoker.io is a monolithic well tested app, so for now all it's
 * logic is on this single controller, in the future we could be splitting the logic
 * into diff files and modules.
 *
 * @author Everton Yoshitani <everton@wizehive.com>
 */
angular.module('firePokerApp')
    .controller('LoginCtrl', function ($rootScope, $scope, $cookieStore, $location, $routeParams, angularFire) {
        // Firebase URL
        var URL = 'https://tr-ppoker.firebaseio.com';

        // Initialize Firebase
        var ref = new Firebase(URL);

        // UUID generator
        // Snippet from: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
        var s4 = function () {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        };

        var guid = function () {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        };

        // Load cookies
        $scope.fp = $cookieStore.get('fp');
        if (!$scope.fp) {
            $scope.fp = {};
        }

        // UID
        if (!$scope.fp.user || !$scope.fp.user.id) {
            var uid = guid();
            $scope.fp.user = { id: uid, active: true };
            $cookieStore.put('fp', $scope.fp);
        }

        // GID
        if (!$scope.fp.gid) {
            var gid = guid();
            $scope.fp.gid = gid;
            $cookieStore.put('fp', $scope.fp);
        }

        // Is landing page?
        $rootScope.isLandingPage = function () {
            return $location.path() !== '/';
        };

        // Redirect with a GID to create new games
        $scope.redirectToCreateNewGame = function () {
            if ($location.path() === '/games/new' || $location.path() === '/games/new/') {
                $scope.fp.gid = guid();
                $location.path('/games/new/' + $scope.fp.gid);
                $location.replace();
            }
        };

        // Redirect to game if fullname already set
        $scope.redirectToGameIfFullnameAlreadySet = function () {
            if (
                $routeParams.gid &&
                $location.path() === '/games/join/' + $routeParams.gid &&
                $scope.fp.user.fullname
            ) {
                $location.path('/games/' + $routeParams.gid).replace();
            }
        };

        // load user from storage
        $scope.loadUser = function () {
            var success = false;
            if ($scope.game && $scope.game.participants) {
                angular.forEach($scope.game.participants, function (user) {
                    if (user.email == $scope.fp.user.email) {
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
        $scope.loadGame = function (callback) {
            callback = callback || function () { }
            if ($routeParams.gid) {
                angularFire(ref.child('/games/' + $routeParams.gid), $scope, 'game').then(function () {
                    callback();
                });
            }
        }

        // Set full name
        $scope.setFullname = function () {
            $cookieStore.put('fp', $scope.fp);
            $location.path('/games/' + $routeParams.gid);
            $location.replace();
        };

        // try to load user by its email
        $scope.setEmail = function () {
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
