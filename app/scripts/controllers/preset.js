/*global angular*/

'use strict';
/**
 * PresetCtrl
 *
 * This is a 'preset', a commom code container to run 
 * on child controllers avoiding code duplication
 * 
 * It handles common stuff like:
 * Are you on the right place? No? Go there, then.
 * Are you logged in? So, please give me credentials.
 * Your game is ready? No? So, let me start it for you.
 * 
 * Some of this code was based/copied from the old author
 * @author Everton Yoshitani <everton@wizehive.com>
 * 
 * Some of this code is mine
 * @author Eduardo Elias Saleh <du7@msn.com>
 */
angular.module('firePokerApp')
    .controller('PresetCtrl', function(
        $controller,
        $rootScope, $scope, $cookieStore, $location, $routeParams, angularFire, utils) {

        // Load cookies
        $scope.fp = $cookieStore.get('fp');
        if (!$scope.fp) {
            $scope.fp = {};
        }

        // UID
        if (!$scope.fp.user || !$scope.fp.user.id) {
            var uid = utils.guid();
            $scope.fp.user = { id: uid, active: true };
            $cookieStore.put('fp', $scope.fp);
        }

        // GID
        if (!$scope.fp.gid) {
            var gid = utils.guid();
            $scope.fp.gid = gid;
            $cookieStore.put('fp', $scope.fp);
        }

        // Is landing page?
        $rootScope.isLandingPage = function() {
            return $location.path() !== '/';
        };

        // Redirect with a GID to create new games
        $scope.redirectToCreateNewGame = function() {
            if ($location.path() === '/games/new' || $location.path() === '/games/new/') {
                $scope.fp.gid = utils.guid();
                $location.path('/games/new/' + $scope.fp.gid);
                $location.replace();
            }
        };

        // Redirect to set fullname if empty
        $scope.redirectToSetFullnameIfEmpty = function() {
            if (
                $routeParams.gid &&
                $location.path() === '/games/' + $routeParams.gid &&
                !$scope.fp.user.fullname
            ) {
                $location.path('/games/join/' + $routeParams.gid);
                $location.replace();
            }
        };

        // Redirect to game if fullname already set
        $scope.redirectToGameIfFullnameAlreadySet = function() {
            if (
                $routeParams.gid &&
                $location.path() === '/games/join/' + $routeParams.gid &&
                $scope.fp.user.fullname
            ) {
                $location.path('/games/' + $routeParams.gid).replace();
            }
        };

        // Redirect with a GID to create new games
        $scope.redirectToCreateNewGame();

        // Redirect to set fullname if empty
        $scope.redirectToSetFullnameIfEmpty();
    });