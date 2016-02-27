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
                    if (isNaN(angle)) angle = 0;
                    switch(e.which) {
                        case 65:
                            //A
                            $(imageId).rotate(angle - 45);
                            coreServices.socket().emit('PLAYERROTATE', roomId, {
                                degree: 45
                            });
                            break;
                        case 68:
                            //D
                            $(imageId).rotate(angle + 45);
                            coreServices.socket().emit('PLAYERROTATE', roomId, {
                                degree: -45
                            });
                            break;
                        default:
                            e.preventDefault();
                            return;
                    }
                });

                $(document).click(function(event){
                    if (player === 'alien'){
                        var alienLaser = $('<div class="laser-beam purple"></div>');
                        $("#alienPlayer").append(alienLaser);
                        animateLaser(alienLaser, event.pageX - 1, event.pageY - 50, 1000);
                    } else if (player === 'spaceship'){
                        var spaceshipLaser = $('<div class="laser-beam red"></div>');
                        $("#spaceshipPlayer").append(spaceshipLaser);
                        animateLaser(spaceshipLaser, event.pageX - 1, event.pageY - 65, 1000);
                    }
                });

                $(window).mousemove(function(event) {
                    $(imageId).css({"left" : event.pageX - 50, "top": event.pageY - 70});
                    coreServices.socket().emit('PLAYERMOVEMENT', roomId, {
                        x: event.pageX,
                        y: event.pageY
                    });
                });

                coreServices.socket().on('PLAYERMOVEMENT', function(data){
                    var opponentImageId = '#' + opponent;
                    var x = data.x - 50;
                    var y = $(window).height() - data.y - 70;
                    $(opponentImageId).css({"left" : x, "top": y});
                });

                coreServices.socket().on('PLAYERROTATE', function(data){
                    var opponentImageId = '#' + opponent;
                    var currentAngle = $(opponentImageId).getRotateAngle()[0];
                    if (isNaN(currentAngle)) currentAngle = 0;
                    var angle = data.degree + currentAngle;
                    $(opponentImageId).rotate(angle);
                });

                var animateLaser = function(element, leftStart, topStart, speed){
                    $(element).css({"left":leftStart, "top": topStart});
                    $(element).animate(
                        {
                            "top": "+=-" + $(window).height() + "px"
                        },
                        {
                            duration: speed,
                            "easing": "linear",
                            complete: function(){
                                $(this).remove();
                            }
                        }
                    );
                };


            });

        }]);