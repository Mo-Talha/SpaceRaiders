angular.module('core.controller', [])
    .controller('coreController', ['$scope', '$state', 'coreServices',
        function ($scope, $state, coreServices) {
           $scope.username = '';

            $('#randomButton').click(function () {
                coreServices.socket().emit('NEWRANDOMUSER');
                $('#wait').html('<i class="fa fa-cog fa-spin"></i> Searching..');
                coreServices.socket().on('LAUNCHGAME', function(data){
                    $('#wait').html('');
                    $state.go('game');
                    var id = coreServices.socket().id;
                    if (data.alien.slice(2) === id || true){
                        setTimeout(function(){
                            $("#alien").addClass("rotate").css({"top": "75%"});
                            $('#spaceship').addClass("rotate").css("top", "1%");
                        }, 50);
                        console.log("Your an alien");
                    } else if (data.spaceship.slice(2) === id){
                        console.log("Your the spaceship");
                    }
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