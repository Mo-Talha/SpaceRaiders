angular.module('core.routes', [])
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise("/");

        $stateProvider
            .state('login', {
                url: '/',
                templateUrl: 'templates/login.html',
                controller: 'coreController'
            })
            .state('game', {
                url: '/',
                templateUrl: 'templates/game.html',
                controller: 'coreController'
            });

    }]);