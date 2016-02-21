angular.module('spaceraiders.routes', [])
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise("/");

        $stateProvider
            .state('login', {
                url: '/',
                templateUrl: 'templates/login.html',
                controller: 'spaceraiderController'
            })
            .state('game', {
                url: '/',
                templateUrl: 'templates/game.html',
                controller: 'spaceraiderController'
            });

    }]);