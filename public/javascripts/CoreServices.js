angular.module('core.services', [])
    .factory('coreServices', ['$http', function ($http) {
        var socket = io();

        return {
            socket: function(){
                return socket;
            }

        };
    }]);