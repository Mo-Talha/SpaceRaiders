angular.module('core.controller', [])
    .controller('coreController', ['$scope', '$state', 'coreServices',
        function ($scope, $state, coreServices) {
           $scope.username = '';

            $('#randomButton').click(function () {
                coreServices.socket().emit('NEWRANDOMUSER');
                $('#wait').html('<i class="fa fa-cog fa-spin"></i> Searching..');
                coreServices.socket().on('LAUNCHGAME', function(){
                    $('#wait').html('');
                    $state.go('game');
                });
            });

            $(document).ready(function(){
                $(window).mousemove(function(event) {
                    //console.log('X:' + event.pageX);
                    //console.log('Y:' + event.pageY);
                    //$("#spaceship").css({"left" : event.pageX - 50, "top" : event.pageY - 70});
                });
            });

    }]);