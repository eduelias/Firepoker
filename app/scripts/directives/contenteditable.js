'use strict';

/**
 * @ngdoc directive
 * @name firepokerApp.directive:contentEditable
 * @description
 * # contentEditable
 */
angular.module('firePokerApp')
    .directive('contenteditable', function() {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function postLink(scope, element, attrs, ngModel) {
                function read() {
                    ngModel.$setViewValue(element.html());
                }
                ngModel.$render = function() {
                    element.html(ngModel.$viewValue || '');
                };
                element.bind('blur keyup change', function() {
                    scope.$apply(read);
                });
            }
        };
    })
    .directive('usersControl', function() {
        return {
            restrict: 'E',
            replace: true,
            transclude: false,
            scope: { participant: '=participant', game: '=game', loggeduser: '=loggeduser' },
            template: '<div>' +
                ' <span ng-show=" participant.active && (game.owner.id == loggeduser.id || participant.id == loggeduser.id)" class="glyphicon glyphicon-eye-open  clickable" ng-click="participant.active = !participant.active" title="Set as observator"></span>' +
                ' <span ng-show="!participant.active && (game.owner.id == loggeduser.id || participant.id == loggeduser.id)" class="glyphicon glyphicon-eye-close clickable" ng-click="participant.active = !participant.active" title="Set as active player"></span>' +

                ' <span ng-hide="game.owner.id == loggeduser.id || participant.id == loggeduser.id" class="glyphicon glyphicon-eye-open" style="opacity:0.3"></span>' +
                ' <span title="Set as moderator" class="glyphicon clickable" ng-show="game.owner.id == loggeduser.id" ng-click="participant.moderator = !participant.moderator" ng-class="{disabled: !participant.moderator}"> ✪ </span>' +
                ' <span> {{participant.fullname}}</span>' +
                ' <span ng-show="participant.moderator" style="font-size: 1.5em"> ♘ </span>' +
                ' <span ng-show="participant.id == game.owner.id" style="font-size: 1.5em"> ♔ </span>' +
                ' <span ng-show="participant.hasVoted == true" class="glyphicon glyphicon-ok text-success"></span>' +
                '</div>',
            link: function(scope, element, attrs) {

            }
        }
    })
    .directive('input', function() {
        return {
            require: '?ngModel',
            restrict: 'EAC',
            link: function(scope, element, attr) {
                var html = angular.element("<span class='icon-checkbox'>Checkbox icon</span");

                if ((angular.lowercase(element[0].tagName) === "input") && (angular.lowercase(attr.type) === "checkbox"))
                    element.after(html)
            }
        }
    });