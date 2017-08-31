'use strict';

/**
 * @ngdoc directive
 * @name firepokerApp.directive:contentEditable
 * @description
 * # contentEditable
 */
angular.module('firePokerApp')
    .directive('usersControl', function () {
        return {
            restrict: 'E',
            replace: true,
            transclude: false,
            scope: { p: '=participant', game: '=game', lusr: '=loggeduser' },
            // link: function(scope, element, attrs) {
            //     scope.hi
            // },
            template: '<div style="font-size: 1.1em">' +
            ' <span ng-show=" p.active && (game.owner.id == lusr.id || p.id == lusr.id)" class="glyphicon glyphicon-eye-open  clickable big-font" ng-click="p.active = !p.active" title="Set as observator"></span>' +
            ' <span ng-show="!p.active && (game.owner.id == lusr.id || p.id == lusr.id)" class="glyphicon glyphicon-eye-close clickable big-font" ng-click="p.active = !p.active" title="Set as active player"></span>' +
            ' <span ng-hide="game.owner.id == lusr.id || p.id == lusr.id" class="glyphicon glyphicon-eye-open big-font" style="opacity:0.3"></span>' +
            ' <span title="Set as moderator" class="fonticon clickable big-font" ng-show="game.owner.id == lusr.id" ng-click="$parent.toggleModerator(p)" ng-class="{disabled: !p.moderator}"> ✪ </span>' +
            ' <span> {{p.fullname}}</span>' +
            ' <span ng-show="p.moderator" class="big-font" title="I´m a moderator"> ♘ </span>' +
            ' <span ng-show="p.id == game.owner.id" class="big-font" title="I´m the owner"> ♔ </span>' +
            ' <span ng-show="game.participants[p.id].hasVoted == true" class="glyphicon glyphicon-ok text-success big-font"></span>' +
            '</div>',
            link: function (scope, element, attrs) {

            }
        }
    });