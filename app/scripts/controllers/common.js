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
        $rootScope, $scope, $cookieStore, $location, $routeParams, utils) {
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

        // test if owner and sets it
        $scope.SetIsOwner = function() {
            // Is current user the game owner?
            if ($scope.game.owner && $scope.game.owner.id && $scope.game.owner.id === $scope.fp.user.id) {
                $scope.isOwner = true;
            } else {
                $scope.isOwner = false;
            }
        };

        // Redirect with a GID to create new games
        $scope.redirectToCreateNewGame = function() {
            if ($location.path() === '/games/new' || $location.path() === '/games/new/') {
                $scope.fp.gid = utils.guid();
                $location.path('/games/new/' + $scope.fp.gid);
                $location.replace();
            }
        };

        // try to load user by its email
        $scope.setEmail = function() {
            if ($scope.loadUser()) {
                $scope.setFullname();
            } else {
                $scope.loginerror = "Game or user not found";
            }
        };

        // Set full name
        $scope.setFullname = function() {
            $cookieStore.put('fp', $scope.fp);
            $location.path('/games/' + $routeParams.gid);
            $location.replace();
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
                var connectedRef = utils.firebase.database().ref('/games/' + $routeParams.gid);
                connectedRef.on('value', function(snap) {
                    if (snap.val() === true) {
                        $scope.game = snap.val();
                        callback();
                    }
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
            $scope.showCardDeck = true;
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

        // Redirect with a GID to create new games
        $scope.redirectToCreateNewGame();

        // Redirect to set fullname if empty
        $scope.redirectToSetFullnameIfEmpty();
    });