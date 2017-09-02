/*global describe*/
/*global beforeEach*/
/*global inject*/
/*global it*/
/*global expect*/
/*global spyOn*/
/*global xit*/
'use strict';
/**
 * NewCtrl Unit Tests
 *
 * @fileoverview Tests the controller methods
 * @version 0.3.0
 * @author Everton Yoshitani <everton@wizehive.com>
 * @todo add remain unit tests and perfect after learn' more about testing
 */
describe('Controller: NewCtrl', function() {
    // Load the controller's module
    beforeEach(module('firePokerApp'));
    beforeEach(module('firebase'));
    beforeEach(module('ngCookies'));

    // Initialize objects
    var NewCtrl,
        scope,
        rootScope,
        location,
        routeParams,
        cookieStore;

    // Location Mock
    // Snippet from: https://github.com/angular-app/angular-app/blob/master/client/test/unit/common/services/breadcrumbs.spec.js
    var LocationMock = function(initialPath) {
        var pathStr = initialPath || '';
        this.path = function(pathArg) {
            return pathArg ? pathStr = pathArg : pathStr;
        };
    };

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope, $injector, $location, $routeParams, $cookieStore /*, angularFire*/ ) {
        scope = $rootScope.$new();
        rootScope = $rootScope;
        location = $location;
        routeParams = $routeParams;
        cookieStore = $cookieStore;
        NewCtrl = $controller('NewCtrl', {
            $scope: scope,
            $location: location
        });
    }));

    // Valid regex match for UUID's
    var VALID_UUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

    // Current valid/available card decks
    var VALID_CARD_DECKS = [{
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

    // Firebase URL
    //var FIREBASE_URL = 'https://tr-ppoker.firebaseio.com';

    // Set a test game for tests
    var setTestGame = function() {
        scope.game = {
            'created': 1382370198911,
            'participants': {
                '558aa568-461f-9bf5-fdc8-c4e5aab51b92': {
                    'active': true,
                    'online': true,
                    'fullname': 'Chrome',
                    'id': '558aa568-461f-9bf5-fdc8-c4e5aab51b92'
                },
                '37b9be39-2598-6e05-0295-33490ef60ad7': {
                    'active': true,
                    'online': true,
                    'fullname': 'Safari',
                    'id': '37b9be39-2598-6e05-0295-33490ef60ad7'
                },
                'eb5c1da2-2cdd-b89f-9369-ea532d1a9b27': {
                    'active': true,
                    'online': true,
                    'fullname': 'Firefox',
                    'id': 'eb5c1da2-2cdd-b89f-9369-ea532d1a9b27'
                },
                '257d4b3a-7972-6552-03f0-ad49b6518992': {
                    'online': 1382370366666,
                    'fullname': 'Offline Estimator',
                    'id': '257d4b3a-7972-6552-03f0-ad49b6518992'
                }
            },
            'estimate': {
                'results': [{
                        'points': 8,
                        'user': {
                            'fullname': 'Firefox',
                            'id': 'eb5c1da2-2cdd-b89f-9369-ea532d1a9b27'
                        }
                    },
                    {
                        'points': 8,
                        'user': {
                            'fullname': 'Safari',
                            'id': '37b9be39-2598-6e05-0295-33490ef60ad7'
                        }
                    },
                    {
                        'points': 16,
                        'user': {
                            'fullname': 'Chrome',
                            'id': '558aa568-461f-9bf5-fdc8-c4e5aab51b92'
                        }
                    }
                ],
                'points': 0,
                'title': 'As a/an user I would like to play planning poker with my team so that we can estimate our user stories',
                'endedAt': false,
                'status': 'active',
                'startedAt': 1382370236239,
                'id': 0
            },
            'owner': {
                'fullname': 'Chrome',
                'id': '558aa568-461f-9bf5-fdc8-c4e5aab51b92'
            },
            'stories': [{
                    'results': false,
                    'points': 0,
                    'title': 'As a/an user I would like to play planning poker with my team so that we can estimate our user stories',
                    'endedAt': false,
                    'status': 'active',
                    'startedAt': 1382370236239,
                    'id': 0
                },
                {
                    'results': false,
                    'points': 0,
                    'title': 'As a/an user I would like to add stories so that I and my team can estimate',
                    'endedAt': false,
                    'status': 'queue',
                    'startedAt': false,
                    'id': 0
                }
            ],
            'name': 'Demo',
            'status': 'active',
            'deck': VALID_CARD_DECKS[0]
        };
    };

    it('should redirect to create a new game with a new GID', function() {
        var oldGID = scope.fp.gid;
        spyOn(location, 'path').andCallFake(new LocationMock().path);
        spyOn(location, 'replace');
        location.path('/games/new');
        scope.redirectToCreateNewGame();
        expect(scope.fp.gid).not.toBe(oldGID);
        expect(scope.fp.gid).toMatch(VALID_UUID);
        expect(location.path.calls.length).toBe(3);
        expect(location.replace.calls.length).toBe(1);
        expect(location.path).toHaveBeenCalledWith('/games/new');
        expect(location.path).toHaveBeenCalledWith();
        expect(location.path).toHaveBeenCalledWith('/games/new/' + scope.fp.gid);
        expect(location.replace).toHaveBeenCalled();
    });

    it('should redirect to set fullname if empty', function() {
        routeParams.gid = scope.fp.gid;
        scope.fp.user.fullname = null;
        spyOn(location, 'path').andCallFake(new LocationMock().path);
        spyOn(location, 'replace');
        location.path('/games/' + routeParams.gid);
        scope.redirectToSetFullnameIfEmpty();
        expect(routeParams.gid).toBe(scope.fp.gid);
        expect(location.path.calls.length).toBe(3);
        expect(location.replace.calls.length).toBe(1);
        expect(location.path).toHaveBeenCalledWith('/games/' + routeParams.gid);
        expect(location.path).toHaveBeenCalledWith();
        expect(location.path).toHaveBeenCalledWith('/games/join/' + routeParams.gid);
        expect(location.replace).toHaveBeenCalled();
    });

    xit('should load the game and set presence', function() {
        // TBD
    });

    it('should create games', function() {
        var newGame = {
            name: 'Test Game',
            description: 'A unit test game',
            stories: 'Story 1\nStore 2\nStory 3',
            deck: VALID_CARD_DECKS[0]
        };
        var expectedStories = [];
        angular.forEach(newGame.stories.split('\n'), function(title) {
            var story = {
                title: title,
                status: 'queue'
            };
            expectedStories.push(story);
        });
        var setNewGameMock = function(game) {
            scope.game = game;
        };
        var now = new Date().getTime() - 1;
        spyOn(scope, 'setNewGame').andCallFake(setNewGameMock);
        spyOn(cookieStore, 'put');
        spyOn(location, 'path').andCallFake(new LocationMock().path);
        spyOn(location, 'replace');
        scope.newGame = newGame;
        routeParams.gid = scope.fp.gid;
        scope.createGame();
        expect(scope.game.stories).toEqual(expectedStories);
        expect(scope.game.status).toBe('active');
        expect(scope.game.created).toBeGreaterThan(now);
        expect(scope.game.owner).toEqual(scope.fp.user);
        expect(scope.game.participants).toBe(false);
        expect(scope.game.estimate).toBe(false);
        expect(scope.game.deck.id).toBe(0);
        expect(cookieStore.put.calls.length).toBe(1);
        expect(location.path.calls.length).toBe(1);
        expect(location.replace.calls.length).toBe(1);
        expect(cookieStore.put).toHaveBeenCalledWith('fp', scope.fp);
        expect(location.path).toHaveBeenCalledWith('/games/' + routeParams.gid);
        expect(location.replace).toHaveBeenCalled();
    });

    xit('should set new games', function() {
        // TBD
    });

    it('should allow add structured stories to the game', function() {
        setTestGame();
        scope.newStory = {
            asA: 'user',
            iWouldLikeTo: 'add stories',
            soThat: 'I and my team can estimate'
        };
        var now = new Date().getTime() - 1;
        var id = 0;
        // cleanup current stories and estimate for test
        delete scope.game.stories;
        scope.game.estimate = false;
        // test
        scope.createStory('structured');
        expect(scope.game.stories[id].title).toEqual('As a/an user I would like to add stories so that I and my team can estimate');
        expect(scope.game.stories[id].results).toBe(false);
        expect(scope.game.stories[id].points).toBe(0);
        expect(scope.game.stories[id].status).toBe('active');
        expect(scope.game.stories[id].startedAt).toBeGreaterThan(now);
        expect(scope.game.stories[id].endedAt).toBe(false);
        expect(scope.game.stories[id].id).toBe(id);
        expect(scope.newStory).toBe(null);
        expect(scope.game.estimate).toEqual(scope.game.stories[id]);
    });

    it('should allow add free-form stories to the game', function() {
        setTestGame();
        scope.newStory = {
            title: 'Test Story',
            notes: 'This is a test story for unit tests'
        };
        var now = new Date().getTime() - 1;
        var id = 0;
        // cleanup current stories and estimate for test
        delete scope.game.stories;
        scope.game.estimate = false;
        // test
        scope.createStory('whatever');
        expect(scope.game.stories[id].title).toEqual('Test Story');
        expect(scope.game.stories[id].results).toBe(false);
        expect(scope.game.stories[id].points).toBe(0);
        expect(scope.game.stories[id].status).toBe('active');
        expect(scope.game.stories[id].startedAt).toBeGreaterThan(now);
        expect(scope.game.stories[id].endedAt).toBe(false);
        expect(scope.game.stories[id].id).toBe(id);
        expect(scope.newStory).toBe(null);
        expect(scope.game.estimate).toEqual(scope.game.stories[id]);
    });

    it('should set a default `newGame` value', function() {
        expect(scope.newGame).toEqual({ deck: VALID_CARD_DECKS[1] });
    });
});