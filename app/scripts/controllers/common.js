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
    .controller('CommonCtrl', function(
        $controller,
        $rootScope, $firebaseObject, $scope, $cookieStore, $location, $routeParams, utils) {

        // Load cookies
        $scope.fp = $cookieStore.get('fp');
        if (!$scope.fp) {
            $scope.fp = {};
        }

        // UID
        if (!$scope.fp.user || !$scope.fp.user.id) {
            var uid = utils.guid();
            $scope.fp.user = { id: uid, active: true, hasVoted: false };
            $cookieStore.put('fp', $scope.fp);
        }

        // GID
        if (!$scope.fp.gid) {
            var gid = utils.guid();
            $scope.fp.gid = gid;
            $cookieStore.put('fp', $scope.fp);
        }

        // Set Defaults
        $scope.game = false;
        $scope.showCardDeck = true;
        $scope.showSelectEstimate = false;
        $scope.disablePlayAgainAndRevealButtons = false;
        $scope.showCards = false;

        // loads the game, only
        $scope.loadGame = function(callback) {
            callback = callback || function() {}
            if ($routeParams.gid) {
                var ref = utils.firebase.database().ref('/games/' + $routeParams.gid);
                var syncobj = $firebaseObject(ref);
                syncobj.$bindTo($scope, 'games');
                callback($scope.games);
            }
        };

        $scope.loadGame(function(object) {
            if (!object) {
                $location.path('/games/new/' + $routeParams.gid);
                $location.replace();
            }
        })




        // test if owner and sets it
        $scope.SetIsOwner = function() {
            // Is current user the game owner?
            if ($scope.game.owner && $scope.game.owner.id && $scope.game.owner.id === $scope.fp.user.id) {
                $scope.isOwner = true;
            } else {
                $scope.isOwner = false;
            }
        };

        // Logout
        $scope.logout = function() {
            $cookieStore.remove('fp');
            $location.path('/');
            $location.replace();
        };

        // syncs the db with storage
        $scope.syncFp = function() {
            $scope.fp.user = angular.extend($scope.fp.user, $scope.game.$child('participant/' + $scope.fp.user.id));
            $cookieStore.put('fp', $scope.fp);
        };

        // loads the game, only
        $scope.loadGame = function(callback) {
            callback = callback || function() {}
            if ($routeParams.gid) {
                var ref = utils.firebase.database().ref('/games/' + $routeParams.gid);
                var syncobj = $firebaseObject(ref);
                syncobj.$bindTo($scope, 'games');
            }
        };

        // count the participants by a comparer function
        $scope.countParticipantsByFilter = function(comparator) {
            var totalOfOnlineParticipants = 0;
            if ($scope.game && $scope.game.participants) {
                angular.forEach($scope.game.participants, function(participant) {
                    if (comparator(participant)) {
                        totalOfOnlineParticipants++;
                    }
                });
            }
            return totalOfOnlineParticipants;
        }

        // Get total of active participants
        $scope.totalOfOnlineParticipants = function() {
            return $scope.countParticipantsByFilter(function(participant) {
                return participant.online === true && participant.active === true;
            });
        };

        // Get total of observers
        $scope.totalOfObservers = function() {
            return $scope.countParticipantsByFilter(function(participant) {
                return participant.online === true && participant.active === false;
            });
        };

        // Redirect to set fullname if empty
        $scope.redirectToSetFullnameIfEmpty();
    });