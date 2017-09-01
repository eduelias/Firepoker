/*global angular*/
/*global Firebase*/
'use strict';

/**
 * MainCtrl
 *
 * FirePoker.io is a monolithic well tested app, so for now all it's
 * logic is on this single controller, in the future we could be splitting the logic
 * into diff files and modules.
 *
 * @author Everton Yoshitani <everton@wizehive.com>
 */
angular.module('firePokerApp')
    .controller('MainCtrl', function($controller, $rootScope, $scope, $cookieStore, $location, $routeParams, angularFire, utils) {
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

        // enable/disable user as moderator
        $scope.toggleModerator = function(participant) {
            $scope.game.participants[participant.id].moderator = !$scope.game.participants[participant.id].moderator;
        };

        // Load game and register presence
        $scope.registerPresence = function() {
            if ($routeParams.gid && ($location.path() === '/games/' + $routeParams.gid)) {
                if (!$scope.game) {
                    $scope.loadGame(function() {
                        // Is current user the game owner?
                        if ($scope.game.owner && $scope.game.owner.id && $scope.game.owner.id === $scope.fp.user.id) {
                            $scope.isOwner = true;
                        } else {
                            $scope.isOwner = false;
                        }
                    });
                }
                utils.firebase.child('/games/' + $routeParams.gid + '/participants/' + $scope.fp.user.id).set($scope.fp.user);
                var onlineRef = utils.firebase.child('/games/' + $routeParams.gid + '/participants/' + $scope.fp.user.id + '/online');
                var connectedRef = utils.firebase.child('/.info/connected');
                connectedRef.on('value', function(snap) {
                    if (snap.val() === true) {
                        // We're connected (or reconnected)!  Set up our presence state and
                        // tell the server to set a timestamp when we leave.
                        onlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
                        onlineRef.set(true);
                    }
                });
            }
        };

        $scope.toggleObservator = function() {
            $scope.game.participants[$scope.fp.user.id].active = !$scope.game.participants[$scope.fp.user.id].active;
        };

        // Set card deck visibility
        $scope.setShowCardDeck = function() {
            $scope.showCardDeck = true;
            if ($scope.game.estimate && $scope.game.estimate.results) {
                angular.forEach($scope.game.estimate.results, function(result) {
                    if (
                        result &&
                        result.user &&
                        result.user.id &&
                        $scope.fp.user &&
                        result.user.id === $scope.fp.user.id
                    ) {
                        $scope.showCardDeck = false;
                    }
                });
            }
        };

        // Set estimation form visibility
        $scope.setShowSelectEstimate = function() {
            $scope.showSelectEstimate = false;
            if (
                $scope.game.estimate &&
                $scope.game.owner &&
                $scope.fp.user &&
                (
                    $scope.game.owner.id === $scope.fp.user.id
                )
            ) {
                $scope.showSelectEstimate = true;
            }
        };

        // Set new estimate average points
        $scope.setNewEstimate = function() {
            $scope.newEstimate = { points: $scope.getResultsAverage() };
        };

        // Disable play again and reveal buttons if results are empty
        $scope.setDisablePlayAgainAndRevealButtons = function() {
            if (!$scope.game.estimate) {
                return;
            }

            if (!$scope.game.estimate.results || $scope.game.estimate.results.length === 0) {
                $scope.disablePlayAgainAndRevealButtons = true;
            } else {
                $scope.disablePlayAgainAndRevealButtons = false;
            }
        };

        // Show cards?
        $scope.setShowCards = function() {
            $scope.showCards = false;
            if ($scope.game.estimate.status === 'reveal') {
                $scope.showCards = true;
            } else if (
                $scope.game.estimate &&
                $scope.game.estimate.results &&
                $scope.game.estimate.results.length &&
                $scope.game.estimate.results.length >= $scope.totalOfOnlineParticipants() &&
                $scope.allVotersVoted()
            ) {
                $scope.showCards = true;
            }
        };

        // seek non-voted voters
        $scope.allVotersVoted = function() {
            var voted = true;
            angular.forEach($scope.game.participants, function(participant) {
                if (participant.online === true && participant.active === true && participant.hasVoted !== true) {
                    voted = false;
                }
            });

            return voted;
        };

        // Set unestimated stories count
        $scope.setUnestimatedStoryCount = function() {
            $scope.unestimatedStoriesCount = 0;
            angular.forEach($scope.game.stories, function(story) {
                if (story.status === 'queue') {
                    $scope.unestimatedStoriesCount++;
                }
            });
        };

        // Logout
        $scope.logout = function() {
            $cookieStore.remove('fp');
            $location.path('/');
            $location.replace();
        };

        // syncs the db with storage
        $scope.syncFp = function() {
            $scope.fp.user = angular.extend($scope.fp.user, $scope.game.participants[$scope.fp.user.id]);
            $cookieStore.put('fp', $scope.fp);
        };

        // Redirect to game if fullname already set
        $scope.redirectToGameIfFullnameAlreadySet();

        // Load game and register presence
        $scope.registerPresence();

        // Update view on game changes
        $scope.$watch('game', function(game) {
            if (!game) {
                return;
            }
            $scope.setShowCardDeck();
            $scope.setShowSelectEstimate();
            $scope.setShowCheckmarks();
            $scope.setNewEstimate();
            $scope.setDisablePlayAgainAndRevealButtons();
            $scope.setShowCards();
            $scope.setUnestimatedStoryCount();
            $scope.syncFp();
        });

    });