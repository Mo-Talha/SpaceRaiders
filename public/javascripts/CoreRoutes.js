angular.module('core.routes', [])
    .config(['$stateProvider', '$urlRouterProvider', "$locationProvider",
        function($stateProvider, $urlRouterProvider, $locationProvider) {

        $urlRouterProvider.otherwise("/");
        $locationProvider.html5Mode(true);

        $stateProvider
            .state('login', {
                url: '/',
                templateUrl: 'templates/login.html',
                controller: 'coreController',
                params: {message: '', won: false}
            })
            .state('game', {
                url: '/',
                templateUrl: 'templates/game.html',
                controller: 'gameController',
                params: {roomId: '', player: ''}
            });

    }]);