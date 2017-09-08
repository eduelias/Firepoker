'use strict';
/*global angular*/
/**
 * utils factory
 *
 * This should store all 'generic' code from the app
 * @author Eduardo Elias Saleh <du7@msn.com>
 */
angular.module('firePokerApp')
    .factory('utils', ['$firebaseArray', '$firebaseObject', '$cookies', '$routeParams', '$location',
        function($firebaseArray, $firebaseObject, $cookies, $routeParams, $location) {
            return {
                app: null,
                s4: function() {
                    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                },
                // UUID generator
                // Snippet from: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript        
                guid: function() {
                    return this.s4() + this.s4() + '-' +
                        this.s4() + '-' + this.s4() + '-' + this.s4() +
                        '-' + this.s4() + this.s4() + this.s4();
                },
                get firebase() {
                    if (!this.app) {
                        var config = {
                            apiKey: "AIzaSyCCfiXucRTg3aSlb8cQYbKqUWRUjWsrGXE",
                            authDomain: "tr-ppoker.firebaseapp.com",
                            databaseURL: "https://tr-ppoker.firebaseio.com",
                            projectId: "tr-ppoker",
                            storageBucket: "tr-ppoker.appspot.com",
                            messagingSenderId: "86189525068"
                        };
                        this.app = firebase.initializeApp(config);
                    }
                    return this.app;
                },
                decks: [{
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
                ],
                get newGame() {
                    return { deck: this.decks[1], participants: [] };
                },
                fibonacciAvg: function(results) {
                    return this.fibonacciNearest(this.avg(results));
                },
                fibonacciNearest: function(num) {
                    var f = (n, x = 0, y = 1) => y < n ? f(n, y, x + y) : y - n > n - x ? x : y;
                    return f(num);
                },
                avg: function(results) {
                    var avg = 0;
                    var sum = 0;
                    angular.forEach(results, function(result) {
                        if (result.points && angular.isNumber(result.points)) {
                            sum += result.points;
                        }
                    });
                    avg = Math.ceil(sum / results.length);
                    return avg;
                },
                doIfGameExists: function(gameid, callback) {
                    this.firebase.database().ref('games/' + gameid).once('value', function(snapshot) {
                        if (snapshot.val() !== null) {
                            callback(snapshot);
                        }
                    });
                },
                loadGame: function(gameid, callback) {
                    callback = callback || function(a, b) {}
                    if (gameid) {
                        var ref = this.firebase.database().ref('games/' + gameid);
                        var syncGames = $firebaseObject(ref);
                        ref.once('value', function(snap) {
                            callback(snap, syncGames);
                        });
                    }
                },
                bindGame: function($scope, gameid, callback) {
                    callback = callback || function(a) {}
                    this.loadGame(gameid, function(snap, sync) {
                        sync.$bindTo($scope, 'game');
                        callback($scope.game);
                    });
                },
                dealsWithFp: function($scope) {
                    // Load cookies
                    $scope.fp = $cookies.getObject('fp');
                    if (!$scope.fp) {
                        $scope.fp = {};
                    }

                    // UID
                    if (!$scope.fp.user || !$scope.fp.user.id) {
                        var uid = this.guid();
                        $scope.fp.user = { id: uid, active: true, hasVoted: false, online: true };
                        $cookies.putObject('fp', $scope.fp);
                        $location.path('/games/join/' + $routeParams.gid);
                        $location.replace();
                    }

                    // GID
                    if (!$scope.fp.gid) {
                        var gid = this.guid();
                        $scope.fp.gid = gid;
                        $cookies.putObject('fp', $scope.fp);
                    }
                },
                dealsWithRouting: function($scope) {
                    if (
                        $routeParams.gid &&
                        $location.path() === '/games/' + $routeParams.gid &&
                        !$scope.fp.user.fullname
                    ) {
                        $location.path('/games/join/' + $routeParams.gid);
                        $location.replace();
                    }
                }
            }
        }
    ]);