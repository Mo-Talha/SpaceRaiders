angular.module('core.controller', [])
    .controller('coreController', ['$scope', '$state', 'coreServices',
        function ($scope, $state, coreServices) {
            $scope.username = '';
            $scope.opponent = '';

            $('#randomButton').click(function () {
                coreServices.socket().emit('NEWRANDOMUSER');
                $('#wait').html('<i class="fa fa-cog fa-spin"></i> Searching..');
                coreServices.socket().on('LAUNCHGAME', function(data){
                    $('#wait').html('');
                    var id = coreServices.socket().id;
                    if (data.alien.slice(2) === id){
                        $state.go('game', {roomId: data.roomId, player: 'alien'});
                    } else if (data.spaceship.slice(2) === id){
                        $state.go('game', {roomId: data.roomId, player: 'spaceship'});
                    }
                });
            });

    }]);