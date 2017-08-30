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
                ' <span ng-show="game.owner.id == loggeduser.id || participant.id == loggeduser.id" title="Set as observator" class="glyphicon glyphicon-eye-open" ng-click="participant.active = !participant.active" ng-class="{disabled: participant.active}"></span>' +
                ' <span ng-hide="game.owner.id == loggeduser.id || participant.id == loggeduser.id" title="Set as observator" class="glyphicon glyphicon-eye-open" ng-class="{disabled: true}"></span>' +
                ' <span title="Set as moderator" class="glyphicon" ng-show="game.owner.id == loggeduser.id" ng-click="participant.moderator = !participant.moderator" ng-class="{disabled: !participant.moderator}"> ✪ </span>' +
                ' <span> {{participant.fullname}}</span>' +
                ' <span ng-show="participant.id == game.owner.id"> ♛ </span>' +
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