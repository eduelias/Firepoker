'use strict';
/*global Firebase*/
/**
 * utils factory
 *
 * This should store all 'generic' code from the app
 * @author Eduardo Elias Saleh <du7@msn.com>
 */
angular.module('firePokerApp')
    .factory('utils', function() {
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
            decks : [{
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
                return { deck: this.decks[1], participants:[] };
            } ,
            fibonacciAvg : function(num) {
                var f = (n, x = 0, y = 1) => y < n ? f(n, y, x + y) : y - n > n - x ? x : y;
                return f(num);
            }
        }
    });