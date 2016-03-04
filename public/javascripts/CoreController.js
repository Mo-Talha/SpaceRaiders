angular.module('core.controller', [])
    .controller('coreController', ['$scope', '$state', 'coreServices',
        function ($scope, $state, coreServices) {
            $scope.username = '';
            $scope.opponent = '';

            var message = $state.params.message;
            if (message){
                var won = $state.params.won;
                if (won){
                    $('#wait').html(message + ' <i class="fa fa-smile-o"></i>');
                } else {
                    $('#wait').html(message + ' <i class="fa fa-frown-o"></i>');
                }
            }

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

            $("#playerButton").click(function(){
                coreServices.socket().emit('NEWUSER', {
                    username: $scope.username,
                    opponent: $scope.opponent
                });
                $('#wait').html('<i class="fa fa-cog fa-spin"></i> Searching..');
                coreServices.socket().on('LAUNCHGAME', function(data){
                    $('#wait').html('');
                    var id = coreServices.socket().id;
                    if (data.alien === $scope.username){
                        $state.go('game', {roomId: data.roomId, player: 'alien'});
                    } else if (data.spaceship === $scope.username){
                        $state.go('game', {roomId: data.roomId, player: 'spaceship'});
                    }
                });
            });

    }]);