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
            URL: 'https://tr-ppoker.firebaseio.com',
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
            get firebase() { return new Firebase(this.URL); }
        }
    })