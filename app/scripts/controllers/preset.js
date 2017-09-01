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

        $scope.decks = [{
                id: 0,
                cards: [0, 1, 2, 4, 8, 16, 32, 64, 128, '?', '☕'],
                description: '0, 1, 2, 4, 8, 16, 32, 64, 128 and ?,☕'
            },
            {
                id: 1,
                cards: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?', '☕'],
                description: '0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89 and ?,☕',
                average: 'fibonacciAvg'
            },
            {
                id: 2,
                cards: [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, '?', '☕'],
                description: '0, ½, 1, 2, 3, 5, 8, 13, 20, 40, 100, and ?,☕'
            }
        ];

        // this should not be here
        $scope.fibonacciAvg = function(num) {
            var f = (n, x = 0, y = 1) => y < n ? f(n, y, x + y) : y - n > n - x ? x : y;
            return f(num);
        };

        // Set Defaults
        $scope.newGame = { deck: $scope.decks[1] };
        $scope.showCardDeck = true;
        $scope.showSelectEstimate = false;
        $scope.disablePlayAgainAndRevealButtons = false;
        $scope.showCards = false;

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

        // loads the game, only
        $scope.loadGame = function(callback) {
            callback = callback || function() {}
            if ($routeParams.gid) {
                angularFire(utils.firebase.child('/games/' + $routeParams.gid), $scope, 'game').then(function() {
                    callback();
                });
            }
        };

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
            $scope.loginerror = false;
            $scope.setNewGame(newGame);
            $cookieStore.put('fp', $scope.fp);
            $location.path('/games/' + $routeParams.gid);
            $location.replace();
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
            $scope.showCardDeck = true;
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

        // Set story
        $scope.setStory = function(index) {
            $scope.cancelRound();
            $scope.game.estimate = $scope.game.stories[index];
            $scope.game.estimate.status = 'active';
            $scope.game.estimate.id = index;
            $scope.game.estimate.startedAt = new Date().getTime();
            $scope.game.estimate.endedAt = false;
            $scope.showCardDeck = true;
        };

        // Delete story
        $scope.deleteStory = function(index) {
            $scope.game.stories.splice(index, 1);
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

        // Get total of active participants
        $scope.totalOfOnlineParticipants = function() {
            var totalOfOnlineParticipants = 0;
            if ($scope.game && $scope.game.participants) {
                angular.forEach($scope.game.participants, function(participant) {
                    if (participant.online === true && participant.active === true) {
                        totalOfOnlineParticipants++;
                    }
                });
            }
            return totalOfOnlineParticipants;
        };

        // Get total of observers
        $scope.totalOfObservers = function() {
            var totalOfOnlineParticipants = 0;
            if ($scope.game && $scope.game.participants) {
                angular.forEach($scope.game.participants, function(participant) {
                    if (participant.online === true && participant.active === false) {
                        totalOfOnlineParticipants++;
                    }
                });
            }
            return totalOfOnlineParticipants;
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

        // Reveal cards
        $scope.revealCards = function() {
            $scope.game.estimate.status = 'reveal';
        };

        // Set new game
        $scope.setNewGame = function(game) {
            utils.firebase.child('/games/' + $routeParams.gid).set(game);
        };

        // Redirect with a GID to create new games
        $scope.redirectToCreateNewGame();

        // Redirect to set fullname if empty
        $scope.redirectToSetFullnameIfEmpty();
    });