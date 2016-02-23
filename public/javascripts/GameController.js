angular.module('game.controller', [])
    .controller('gameController', ['$scope', '$state', 'coreServices',
        function ($scope, $state, coreServices) {

            var player = $state.params.player;
            var opponent = player === 'alien' ? 'spaceship': 'alien';
            var roomId = $state.params.roomId;

            if (player === 'alien'){
                $("#alien").css({"top": "77%"}).rotate(180);
                $('#spaceship').css("top", "1%").rotate(180);
            }

            $(document).ready(function(){
                var imageId = '#' + player;

                $(document).keydown(function(e) {
                    var angle = $(imageId).getRotateAngle()[0];
                    if (!angle) angle = 0;
                    switch(e.which) {
                        case 65:
                            //A
                            $(imageId).rotate({animateTo:(angle - 45)});
                            break;
                        case 68:
                            //D
                            $(imageId).rotate({animateTo:(angle + 45)});
                            break;
                        default:
                            return;
                    }
                });

                $(window).mousemove(function(event) {
                    $(imageId).css({"left" : event.pageX - 50, "top": event.pageY - 70});
                    coreServices.socket().emit('PLAYERMOVEMENT', roomId, {
                        x: $(imageId).position().left,
                        y: $(imageId).position().top
                    });
                });

                coreServices.socket().on('PLAYERMOVEMENT', function(data){
                    var opponentImageId = '#' + opponent;
                    $(opponentImageId).css({"left" : data.x, "top": data.y});
                });

            });





        }]);