/*global describe*/
/*global beforeEach*/
/*global inject*/
/*global it*/
/*global expect*/
/*global spyOn*/
/*global xit*/
'use strict';

var url = 'https://www.gstatic.com/firebasejs/3.6.6/firebase.js';
var newScript = document.createElement('script');
newScript.setAttribute('src', url);
document.head.appendChild(newScript);

var url = 'https://cdn.firebase.com/libs/angularfire/2.3.0/angularfire.min.js';
var newScript = document.createElement('script');
newScript.setAttribute('src', url);
document.head.appendChild(newScript);

/**
 * PlayCtrl Unit Tests
 *
 * @fileoverview Tests the controller methods
 * @version 0.3.0
 * @author Everton Yoshitani <everton@wizehive.com>
 * @todo add remain unit tests and perfect after learn' more about testing
 */
describe('Controller: PlayCtrl', function() {
    // Load the controller's module
    beforeEach(module('firePokerApp'));
    beforeEach(module('ngCookies'));
    beforeEach(module('ngRoute'));

    // Initialize objects
    var PlayCtrl,
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
        PlayCtrl = $controller('PlayCtrl', {
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

    it('should set an user id (UID) if empty', function() {
        expect(scope.fp.user.id).toMatch(VALID_UUID);
    });

    it('should set a group id (GID) if empty', function() {
        expect(scope.fp.gid).toMatch(VALID_UUID);
    });

    it('should return false if path equals to `/` when calling isLandingPage()', function() {
        location.path('/');
        expect(rootScope.isLandingPage()).toBe(false);
    });

    it('should return true if path equals to `/` when calling isLandingPage()', function() {
        location.path('/games');
        expect(rootScope.isLandingPage()).toEqual(true);
    });

    it('should redirect to create a new game with a new GID', function() {
        var oldGID = scope.fp.gid;
        spyOn(location, 'path').and.callFake(new LocationMock().path);
        spyOn(location, 'replace');
        location.path('/games/new');
        scope.redirectToCreateNewGame();
        expect(scope.fp.gid).not.toBe(oldGID);
        expect(scope.fp.gid).toMatch(VALID_UUID);
        expect(location.path.calls.count()).toBe(3);
        expect(location.replace.calls.count()).toBe(1);
        expect(location.path).toHaveBeenCalledWith('/games/new');
        expect(location.path).toHaveBeenCalledWith();
        expect(location.path).toHaveBeenCalledWith('/games/new/' + scope.fp.gid);
        expect(location.replace).toHaveBeenCalled();
    });

    it('should redirect to set fullname if empty', function() {
        routeParams.gid = scope.fp.gid;
        scope.fp.user.fullname = null;
        spyOn(location, 'path').and.callFake(new LocationMock().path);
        spyOn(location, 'replace');
        location.path('/games/' + routeParams.gid);
        scope.redirectToSetFullnameIfEmpty();
        expect(routeParams.gid).toBe(scope.fp.gid);
        expect(location.path.calls.count()).toBe(3);
        expect(location.replace.calls.count()).toBe(1);
        expect(location.path).toHaveBeenCalledWith('/games/' + routeParams.gid);
        expect(location.path).toHaveBeenCalledWith();
        expect(location.path).toHaveBeenCalledWith('/games/join/' + routeParams.gid);
        expect(location.replace).toHaveBeenCalled();
    });

    xit('should load the game and set presence', function() {
        // TBD
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

    it('should allow users to set stories for estimating', function() {
        setTestGame();
        //var currentStory = scope.game.estimate;
        var newStoryId = 1;
        var now = new Date().getTime() - 1;
        spyOn(scope, 'cancelRound');
        scope.setStory(newStoryId);
        expect(scope.cancelRound).toHaveBeenCalled();
        expect(scope.game.estimate.title).toEqual(scope.game.stories[newStoryId].title);
        expect(scope.game.estimate.id).toEqual(newStoryId);
        expect(scope.game.estimate.status).toEqual('active');
        expect(scope.game.estimate.startedAt).toBeGreaterThan(now);
        expect(scope.game.estimate.endedAt).toBe(false);
    });

    it('should allow the game owner to delete stories', function() {
        setTestGame();
        var totalOfStories = scope.game.stories.length;
        var firstStoryTitle = scope.game.stories[0].title;
        scope.deleteStory(0);
        expect(scope.game.stories.length).toEqual(totalOfStories - 1);
        expect(scope.game.stories[0].title).not.toEqual(firstStoryTitle);
    });

    it('should allow users to set their full names', function() {
        // //this should go to the login controller
        // spyOn(cookieStore, 'put');
        // spyOn(location, 'path').and.callFake(new LocationMock().path);
        // spyOn(location, 'replace');
        // routeParams.gid = scope.fp.gid;
        // scope.setFullname();
        // expect(cookieStore.put).toHaveBeenCalledWith('fp', scope.fp);
        // expect(location.path).toHaveBeenCalledWith('/games/' + routeParams.gid);
        // expect(location.replace).toHaveBeenCalled();
    });

    it('should calculate the results average points', function() {
        setTestGame();
        expect(scope.getResultsAverage()).toBe(11);
    });

    it('should give the total number of active participants in the game', function() {
        setTestGame();
        expect(scope.totalOfOnlineParticipants()).toBe(3);
    });

    it('should allow the game owner to accept the round', function() {
        setTestGame();
        var now = new Date().getTime() - 1;
        var idx = scope.game.estimate.id;
        scope.newEstimate = { points: 10 };
        scope.acceptRound();
        expect(scope.game.stories[idx].endedAt).toBeGreaterThan(now);
        expect(scope.game.stories[idx].status).toBe('closed');
        expect(scope.game.estimate).toBe(false);
    });

    it('should allow the game owner to play again the round', function() {
        setTestGame();
        scope.playAgain();
        expect(scope.game.estimate.results).toEqual([]);
    });

    it('should allow the game owner to cancel the round', function() {
        setTestGame();
        var idx = scope.game.estimate.id;
        scope.cancelRound();
        expect(scope.game.estimate).toBe(false);
        expect(scope.game.stories[idx].startedAt).toBe(false);
        expect(scope.game.stories[idx].endedAt).toBe(false);
        expect(scope.game.stories[idx].status).toBe('queue');
    });

    it('should allow the game owner to reveal the cards in the round', function() {
        setTestGame();
        scope.revealCards();
        expect(scope.game.estimate.status).toBe('reveal');
    });

    it('should set a card deck array that can be used in games', function() {
        expect(scope.decks).toEqual(VALID_CARD_DECKS);
    });

    it('should set a default `newGame` value', function() {
        expect(scope.newGame).toEqual({ deck: VALID_CARD_DECKS[1] });
    });

    it('should set a default `showCardDeck` value', function() {
        expect(scope.showCardDeck).toBe(true);
    });

    it('should set a default `showSelectEstimate` value', function() {
        expect(scope.showSelectEstimate).toBe(false);
    });

    it('should set a default `disablePlayAgainAndRevealButtons` value', function() {
        expect(scope.disablePlayAgainAndRevealButtons).toBe(false);
    });

    it('should set a default `showCards` value', function() {
        expect(scope.showCards).toBe(false);
    });

    it('should set `showCardDeck` to false if the user already estimated the story', function() {
        setTestGame();
        scope.game.estimate.results[0].user.id = scope.fp.user.id;
        scope.setShowCardDeck();
        expect(scope.showCardDeck).toBe(false);
    });

    it('should set `showSelectEstimate` to true if the user is the game owner', function() {
        setTestGame();
        scope.game.owner.id = scope.fp.user.id;
        scope.setShowSelectEstimate();
        expect(scope.showSelectEstimate).toBe(true);
    });

    it('should set `newEstimate` average points', function() {
        setTestGame();
        scope.setNewEstimate();
        expect(scope.newEstimate).toEqual({ points: scope.getResultsAverage() });
    });

    it('should set `disablePlayAgainAndRevealButtons` to true if the estimate results are empty', function() {
        setTestGame();
        scope.game.estimate.results = [];
        scope.setDisablePlayAgainAndRevealButtons();
        expect(scope.disablePlayAgainAndRevealButtons).toBe(true);
    });

    it('should set `disablePlayAgainAndRevealButtons` to true if the estimate results is not set', function() {
        setTestGame();
        delete scope.game.estimate.results;
        scope.setDisablePlayAgainAndRevealButtons();
        expect(scope.disablePlayAgainAndRevealButtons).toBe(true);
    });

    it('should set `showCards` to true if the current round status is equal to `reveal`', function() {
        setTestGame();
        scope.game.estimate.status = 'reveal';
        scope.setShowCards();
        expect(scope.showCards).toBe(true);
    });

    // it('should set `showCards` to true if all participants estimated the current round', function() {
    //     setTestGame();
    //     scope.setShowCards();
    //     expect(scope.showCards).toBe(true);
    // });

});