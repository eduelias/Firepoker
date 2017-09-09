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
    .controller('PlayCtrl', function($controller, $rootScope, $firebaseObject, $scope, $cookieStore, $location, $routeParams, utils) {

        utils.dealsWithFp($scope);
        utils.dealsWithRouting($scope);

        Object.defineProperty($scope, "newEstimate", {
            get: function() {
                return { points: $scope.getResultsAverage() };
            },
            set: function() {}
        });

        Object.defineProperty($scope, "isOwner", {
            get: function() {
                return ($scope.fp &&
                    $scope.fp.user &&
                    $scope.game &&
                    $scope.game.owner &&
                    $scope.game.owner.id === $scope.fp.user.id);
            },
            set: function(value) {}
        });

        Object.defineProperty($scope, "showCards", {
            get: function() {
                if ($scope.game &&
                    $scope.game.estimate &&
                    $scope.game.estimate.status === 'reveal') {
                    return true;
                } else if (
                    $scope.game.estimate &&
                    $scope.game.estimate.results &&
                    $scope.game.estimate.results.length &&
                    $scope.game.estimate.results.length >= $scope.totalOfOnlineParticipants() &&
                    $scope.allVotersVoted()
                ) {
                    return true;
                }
                return false;
            },
            set: function() {}
        });

        // disable play again and reveal
        Object.defineProperty($scope, "disablePlayAgainAndRevealButtons", {
            get: function() {
                return (!$scope.game.estimate || !$scope.game.estimate.results || $scope.game.estimate.results.length === 0);
            },
            set: function() {}
        });

        // disable play again and reveal
        Object.defineProperty($scope, "showCardDeck", {
            get: function() {
                if ($scope.game.estimate && $scope.game.estimate.results) {
                    angular.forEach($scope.game.estimate.results, function(result) {
                        if (
                            result &&
                            result.user &&
                            result.user.id &&
                            $scope.fp.user &&
                            result.user.id === $scope.fp.user.id
                        ) {
                            return false;
                        }
                    });
                }
                return true;
            },
            set: function() {}
        });

        // Set Defaults
        $scope.game = {};
        $scope.showSelectEstimate = false;
        $scope.showCards = false;

        // loads the game, only
        $scope.loadGame = function(callback) {
            utils.bindGame($scope, $routeParams.gid, function() {
                callback();
                $scope.registerPresence();
            });
        };

        // Load game and register presence
        $scope.registerPresence = function() {
            utils.doIfGameExists($routeParams.gid, function(game) {
                var onlineRef = utils.firebase.database().ref('games/' + $routeParams.gid + '/participants/' + $scope.fp.user.id + '/online');
                var connectedRef = utils.firebase.database().ref('/.info/connected');
                connectedRef.on('value', function(snap) {
                    if (snap.val() === true) {
                        // We're connected (or reconnected)!  Set up our presence state and
                        // tell the server to set a timestamp when we leave.
                        onlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
                        onlineRef.set(true);
                    }
                });
            });
        };

        // Load the game data
        $scope.loadGame(function() {
            // Update view on game changes
            $scope.$watch('game', function(newValue, oldValue) {
                if (!newValue.created) {
                    var guid = $routeParams.gid || $scope.fp.gid;
                    $location.path('/games/new/' + guid);
                    $location.replace();
                    return;
                }
                // $scope.setShowSelectEstimate();
                // $scope.setShowCheckmarks();
                // $scope.setNewEstimate();
                // $scope.setDisablePlayAgainAndRevealButtons();
                // $scope.setShowCards();
                $scope.setUnestimatedStoryCount();
                // $scope.syncFp();
            });
        });

        // Set unestimated stories count
        $scope.setUnestimatedStoryCount = function() {
            $scope.unestimatedStoriesCount = 0;
            angular.forEach($scope.game.stories, function(story) {
                if (story.status === 'queue') {
                    $scope.unestimatedStoriesCount++;
                }
            });
        };

        // Create story
        $scope.createStory = function(type) {
            if (type === 'structured') {
                var title = 'As a/an ' +
                    $scope.newStory.asA +
                    ' I would like to ' +
                    $scope.newStory.iWouldLikeTo +
                    ' so that ' +
                    $scope.newStory.soThat;
                $scope.newStory.title = title;
                delete $scope.newStory.asA;
                delete $scope.newStory.iWouldLikeTo;
                delete $scope.newStory.soThat;
            }
            $scope.newStory.results = false;
            $scope.newStory.points = 0;
            $scope.newStory.status = 'queue';
            $scope.newStory.startedAt = false;
            $scope.newStory.endedAt = false;
            if (!$scope.game.stories) {
                $scope.game.stories = [];
            }
            $scope.game.stories.push($scope.newStory);
            $scope.newStory = null;
            // Set this story if there is none active
            // maybe this is good thing todo only if the queue is empty
            if (!$scope.game.estimate) {
                $scope.setStory($scope.game.stories.length - 1);
            }
        };

        // Cancel round
        $scope.cancelRound = function() {
            if ($scope.game.estimate) {
                var idx = $scope.game.estimate.id;

                $scope.game.stories[idx].startedAt = false;
                $scope.game.stories[idx].endedAt = false;
                $scope.game.stories[idx].status = 'queue';
                $scope.game.estimate = false;
                angular.forEach($scope.game.participants, function(participant) {
                    participant.hasVoted = false;
                });
            }
        };

        // Set story
        $scope.setStory = function(index) {
            $scope.cancelRound();
            $scope.game.estimate = $scope.game.stories[index];
            $scope.game.estimate.status = 'active';
            $scope.game.estimate.id = index;
            $scope.game.estimate.startedAt = new Date().getTime();
            $scope.game.estimate.endedAt = false;
            utils.firebase.database().ref('games/' + $scope.game.id + '/estimate').set($scope.game.stories[index]);
            utils.firebase.database().ref('games/' + $scope.game.id + '/stories/' + index).set($scope.game.stories);
        };

        // Delete story
        $scope.deleteStory = function(index) {
            $scope.game.stories.splice(index, 1);
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

        // enable/disable user as moderator
        $scope.toggleModerator = function(participant) {
            $scope.game.participants[participant.id].moderator = !$scope.game.participants[participant.id].moderator;
        };

        // $scope.toggleObservator = function() {
        //     $scope.game.participants[$scope.fp.user.id].active = !$scope.game.participants[$scope.fp.user.id].active;
        // };

        // // Set card deck visibility
        // $scope.setShowCardDeck = function() {
        //     $scope.showCardDeck = true;
        //     if ($scope.game.estimate && $scope.game.estimate.results) {
        //         angular.forEach($scope.game.estimate.results, function(result) {
        //             if (
        //                 result &&
        //                 result.user &&
        //                 result.user.id &&
        //                 $scope.fp.user &&
        //                 result.user.id === $scope.fp.user.id
        //             ) {
        //                 $scope.showCardDeck = false;
        //             }
        //         });
        //     }
        // };

        // // Set estimation form visibility
        // $scope.setShowSelectEstimate = function() {
        //     $scope.showSelectEstimate = false;
        //     if (
        //         $scope.game.estimate &&
        //         $scope.game.owner &&
        //         $scope.fp.user &&
        //         (
        //             $scope.game.owner.id === $scope.fp.user.id
        //         )
        //     ) {
        //         $scope.showSelectEstimate = true;
        //     }
        // };

        // // Set new estimate average points
        // $scope.setNewEstimate = function() {
        //     $scope.newEstimate = { points: $scope.getResultsAverage() };
        // };

        // // Disable play again and reveal buttons if results are empty
        // $scope.setDisablePlayAgainAndRevealButtons = function() {
        //     if (!$scope.game.estimate) {
        //         return;
        //     }

        //     if (!$scope.game.estimate.results || $scope.game.estimate.results.length === 0) {
        //         $scope.disablePlayAgainAndRevealButtons = true;
        //     } else {
        //         $scope.disablePlayAgainAndRevealButtons = false;
        //     }
        // };

        // // Show cards?
        // $scope.setShowCards = function() {
        //     $scope.showCards = false;
        //     if ($scope.game.estimate.status === 'reveal') {
        //         $scope.showCards = true;
        //     } else if (
        //         $scope.game.estimate &&
        //         $scope.game.estimate.results &&
        //         $scope.game.estimate.results.length &&
        //         $scope.game.estimate.results.length >= $scope.totalOfOnlineParticipants() &&
        //         $scope.allVotersVoted()
        //     ) {
        //         $scope.showCards = true;
        //     }
        // };

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

        // // removes a vote
        $scope.unvote = function(voter) {
            if ($scope.game.participants[voter.id].hasVoted && $scope.game && $scope.game.estimate && $scope.game.estimate.results) {
                angular.forEach($scope.game.estimate.results, function(vote) {
                    if (vote.user.id === $scope.game.participants[voter.id].id) {
                        var index = $scope.game.estimate.results.indexOf(vote);
                        $scope.game.estimate.results.splice(index, 1);
                        $scope.game.participants[voter.id].hasVoted = false;
                        $scope.game.participants[voter.id].estimated = false;
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
            if ($scope.game.participants[$scope.fp.user.id].hasVoted) {
                $scope.unvote($scope.fp.user);
            }
            $scope.fp.user.estimate = points;
            $scope.game.participants[$scope.fp.user.id].estimate = points;

            $scope.fp.user.hasVoted = true;
            $scope.game.participants[$scope.fp.user.id].hasVoted = true;

            $scope.game.estimate.results.push({ points: points, user: $scope.fp.user, when: new Date().getTime() });
        };

        // // Show checkmarks when participant has voted
        // $scope.setShowCheckmarks = function() {
        //     if ($scope.game.estimate && $scope.game.estimate.results) {
        //         angular.forEach($scope.game.estimate.results, function(result) {
        //             if (
        //                 result &&
        //                 result.user &&
        //                 result.user.id &&
        //                 result.user.id === $scope.fp.user.id
        //             ) {
        //                 $scope.game.participants[result.user.id].hasVoted = true;
        //             }
        //         });
        //     }
        // };

        // Get estimate results average
        $scope.getResultsAverage = function() {
            if (!$scope || !$scope.game || !$scope.game.deck) {
                return 0;
            }
            var res = 0;
            if (!$scope.game.deck.average) {
                $scope.game.deck.average = 'avg'
            }
            if ($scope.game.estimate && $scope.game.estimate.results) {
                res = utils[$scope.game.deck.average]($scope.game.estimate.results);
            }
            return res;
        };

        // // Accept
        // $scope.acceptRound = function() {
        //     $scope.game.estimate.points = $scope.newEstimate.points;
        //     $scope.game.estimate.endedAt = new Date().getTime();
        //     $scope.game.estimate.status = 'closed';
        //     $scope.game.stories[$scope.game.estimate.id] = angular.copy($scope.game.estimate);
        //     $scope.game.estimate = false;
        //     angular.forEach($scope.game.participants, function(participant) {
        //         participant.hasVoted = false;
        //     });
        // };

        // // Play again
        // $scope.playAgain = function() {
        //     $scope.game.estimate.results = [];
        //     $scope.game.estimate.status = 'active';
        //     angular.forEach($scope.game.participants, function(participant) {
        //         participant.hasVoted = false;
        //     });
        // };

        // // Reveal cards
        // $scope.revealCards = function() {
        //     $scope.game.estimate.status = 'reveal';
        // };

        // // Redirect to game if fullname already set
        // $scope.redirectToGameIfFullnameAlreadySet();

        // // Load game and register presence
        // $scope.registerPresence();        
    });