/*global angular*/
/*global Firebase*/
'use strict';

/**
 * PlayCtrl
 *
 * FirePoker.io is a monolithic well tested app, so for now all it's
 * logic is on this single controller, in the future we could be splitting the logic
 * into diff files and modules.
 *
 * @author Everton Yoshitani <everton@wizehive.com>
 */
angular.module('firePokerApp')
    .controller('PlayCtrl', function($controller, $rootScope, $scope, $cookieStore, $location, $routeParams, utils) {
        $controller('CommonCtrl', {
            $controller: $controller,
            $rootScope: $rootScope,
            $scope: $scope,
            $cookieStore: $cookieStore,
            $location: $location,
            $routeParams: $routeParams,
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
                    $scope.loadGame($scope.SetIsOwner);
                }
                utils.firebase.database().ref('/games/' + $routeParams.gid + '/participants/' + $scope.fp.user.id).set($scope.fp.user);
                var onlineRef = utils.firebase.database().ref('/games/' + $routeParams.gid + '/participants/' + $scope.fp.user.id + '/online');
                var connectedRef = utils.firebase.database().ref('/.info/connected');
                connectedRef.on('value', function(snap) {
                    if (snap.val() === true) {
                        // We're connected (or reconnected)!  Set up our presence state and
                        // tell the server to set a timestamp when we leave.
                        onlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
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

        // removes a vote
        $scope.unvote = function(voter) {
            if ($scope.game.participants[voter.id].hasVoted && $scope.game && $scope.game.estimate && $scope.game.estimate.results) {
                angular.forEach($scope.game.estimate.results, function(vote) {
                    if (vote.user.id == $scope.game.participants[voter.id].id) {
                        var index = $scope.game.estimate.results.indexOf(vote);
                        $scope.game.estimate.results.splice(index, 1);
                        $scope.game.participants[voter.id].hasVoted = false;
                        return;
                    }
                });
            }
        };

        // Estimate story
        $scope.estimate = function(points) {
            if (!$scope.game.estimate.results) {
                $scope.game.estimate.results = [];
            }
            $scope.game.estimate.results.push({ points: points, user: $scope.fp.user });
            $scope.fp.user.estimate = points;
        };

        // Show checkmarks when participant has voted
        $scope.setShowCheckmarks = function() {
            if ($scope.game.estimate && $scope.game.estimate.results) {
                angular.forEach($scope.game.estimate.results, function(result) {
                    if (
                        result &&
                        result.user &&
                        result.user.id &&
                        result.user.id === $scope.fp.user.id
                    ) {
                        $scope.game.participants[result.user.id].hasVoted = true;
                    }
                });
            }
        };

        // Get estimate results average
        $scope.getResultsAverage = function() {
            var avg = 0;
            if ($scope.game.estimate && $scope.game.estimate.results) {
                // here, if the deck has an specific calculation, use it
                var sum = 0;
                angular.forEach($scope.game.estimate.results, function(result) {
                    if (result.points && angular.isNumber(result.points)) {
                        sum += result.points;
                    }
                });
                avg = Math.ceil(sum / $scope.game.estimate.results.length);
                if ($scope.decks[$scope.game.deck.id] && $scope.decks[$scope.game.deck.id].average) {
                    avg = $scope[$scope.decks[$scope.game.deck.id].average](avg);
                }
            }
            return avg;
        };

        // Accept
        $scope.acceptRound = function() {
            $scope.game.estimate.points = $scope.newEstimate.points;
            $scope.game.estimate.endedAt = new Date().getTime();
            $scope.game.estimate.status = 'closed';
            $scope.game.stories[$scope.game.estimate.id] = angular.copy($scope.game.estimate);
            $scope.game.estimate = false;
            angular.forEach($scope.game.participants, function(participant) {
                participant.hasVoted = false;
            });
        };

        // Play again
        $scope.playAgain = function() {
            $scope.game.estimate.results = [];
            $scope.game.estimate.status = 'active';
            angular.forEach($scope.game.participants, function(participant) {
                participant.hasVoted = false;
            });
        };

        // Reveal cards
        $scope.revealCards = function() {
            $scope.game.estimate.status = 'reveal';
        };

        // Redirect to game if fullname already set
        $scope.redirectToGameIfFullnameAlreadySet();

        // Load game and register presence
        $scope.registerPresence();

        // Update view on game changes
        $scope.$watch('game', function(newValue, oldValue) {
            if (newValue === oldValue) {
                return;
            }
            if (!newValue.created) {
                var guid = $routeParams.gid || $scope.fp.gid;
                $location.path('/games/new/' + guid);
                $location.replace();
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