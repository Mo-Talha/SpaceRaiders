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
                    var imageId = '#' + player;
                    var imageAngle = $(imageId).getRotateAngle()[0];
                    if (isNaN(imageAngle)) imageAngle = 0;
                    if (player === 'alien'){
                        var alienLaser = $('<div class="laser-beam purple"></div>');
                        $(alienLaser).rotate(imageAngle);
                        $("#alienPlayer").append(alienLaser);
                        imageAngle -= 180;
                        while (imageAngle > 360) imageAngle = imageAngle - 360;
                        if (Math.abs(imageAngle) === 0 || Math.abs(imageAngle) === 360){
                            //Top
                            animateLaser(alienLaser, 'TOP', event.pageX - 1, event.pageY - 50, 1000);
                        } else if (Math.abs(imageAngle) > 0 && Math.abs(imageAngle) < 90){
                            //Top right
                            animateLaser(alienLaser, 'TOPRIGHT', event.pageX + 28, event.pageY - 45, 1000);
                        } else if (Math.abs(imageAngle) === 90){
                            //Right
                            animateLaser(alienLaser, 'RIGHT', event.pageX + 28, event.pageY - 15, 1000);
                        } else if (Math.abs(imageAngle) > 90 && Math.abs(imageAngle) < 180){
                            //Bottom right
                            animateLaser(alienLaser, 'BOTTOMRIGHT', event.pageX + 28, event.pageY + 15, 1000);
                        } else if (Math.abs(imageAngle) === 180){
                            //Bottom
                            animateLaser(alienLaser, 'BOTTOM', event.pageX - 1, event.pageY + 15, 1000);
                        } else if (Math.abs(imageAngle) > 180 && Math.abs(imageAngle) < 270){
                            //Bottom left
                            animateLaser(alienLaser, 'BOTTOMLEFT', event.pageX - 28, event.pageY + 15, 1000);
                        } else if (Math.abs(imageAngle) === 270){
                            //Left
                            animateLaser(alienLaser, 'LEFT', event.pageX - 28, event.pageY - 15, 1000);
                        } else if (Math.abs(imageAngle) > 270 && Math.abs(imageAngle) < 360){
                            //Top left
                            animateLaser(alienLaser, 'TOPLEFT', event.pageX - 28, event.pageY - 45, 1000);
                        } else {
                            console.log("Error. Cannot find correct ship position.");
                        }
                    } else if (player === 'spaceship'){
                        var spaceshipLaser = $('<div class="laser-beam red"></div>');
                        $(spaceshipLaser).rotate(imageAngle);
                        $("#spaceshipPlayer").append(spaceshipLaser);
                        while (imageAngle > 360) imageAngle = imageAngle - 360;
                        if (Math.abs(imageAngle) === 0 || Math.abs(imageAngle) === 360){
                            //Top
                            animateLaser(spaceshipLaser, 'TOP', event.pageX - 1, event.pageY - 50, 1000);
                        } else if (Math.abs(imageAngle) > 0 && Math.abs(imageAngle) < 90){
                            //Top right
                            animateLaser(spaceshipLaser, 'TOPRIGHT', event.pageX + 28, event.pageY - 45, 1000);
                        } else if (Math.abs(imageAngle) === 90){
                            //Right
                            animateLaser(spaceshipLaser, 'RIGHT', event.pageX + 28, event.pageY - 15, 1000);
                        } else if (Math.abs(imageAngle) > 90 && Math.abs(imageAngle) < 180){
                            //Bottom right
                            animateLaser(spaceshipLaser, 'BOTTOMRIGHT', event.pageX + 28, event.pageY + 15, 1000);
                        } else if (Math.abs(imageAngle) === 180){
                            //Bottom
                            animateLaser(spaceshipLaser, 'BOTTOM', event.pageX - 1, event.pageY + 15, 1000);
                        } else if (Math.abs(imageAngle) > 180 && Math.abs(imageAngle) < 270){
                            //Bottom left
                            animateLaser(spaceshipLaser, 'BOTTOMLEFT', event.pageX - 28, event.pageY + 15, 1000);
                        } else if (Math.abs(imageAngle) === 270){
                            //Left
                            animateLaser(spaceshipLaser, 'LEFT', event.pageX - 28, event.pageY - 15, 1000);
                        } else if (Math.abs(imageAngle) > 270 && Math.abs(imageAngle) < 360){
                            //Top left
                            animateLaser(spaceshipLaser, 'TOPLEFT', event.pageX - 28, event.pageY - 45, 1000);
                        } else {
                            console.log("Error. Cannot find correct ship position.");
                        }
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

                var animateLaser = function(element, position, leftStart, topStart, speed){
                    $(element).css({"left":leftStart, "top": topStart});
                    if (position === 'TOP'){
                        $(element).animate(
                            {
                                "top": "-=" + $(window).height() + "px"
                            },
                            {
                                duration: speed,
                                "easing": "linear",
                                complete: function(){
                                    $(this).remove();
                                }
                            }
                        );
                    } else if (position === 'TOPRIGHT'){
                        $(element).animate(
                            {
                                "top": "-=" + $(window).height() + "px",
                                "left": "+=" + $(window).width() + "px"
                            },
                            {
                                duration: speed,
                                "easing": "linear",
                                complete: function(){
                                    $(this).remove();
                                }
                            }
                        );
                    } else if (position === 'RIGHT'){
                        $(element).animate(
                            {
                                "left": "+=" + $(window).width() + "px"
                            },
                            {
                                duration: speed,
                                "easing": "linear",
                                complete: function(){
                                    $(this).remove();
                                }
                            }
                        );
                    } else if (position === 'BOTTOMRIGHT'){
                        $(element).animate(
                            {
                                "top": "+=" + $(window).height() + "px",
                                "left": "+=" + $(window).width() + "px"
                            },
                            {
                                duration: speed,
                                "easing": "linear",
                                complete: function(){
                                    $(this).remove();
                                }
                            }
                        );
                    } else if (position === 'BOTTOM'){
                        $(element).animate(
                            {
                                "top": "+=" + $(window).height() + "px"
                            },
                            {
                                duration: speed,
                                "easing": "linear",
                                complete: function(){
                                    $(this).remove();
                                }
                            }
                        );
                    } else if (position === 'BOTTOMLEFT'){
                        $(element).animate(
                            {
                                "top": "+=" + $(window).height() + "px",
                                "left": "-=" + $(window).width() + "px"
                            },
                            {
                                duration: speed,
                                "easing": "linear",
                                complete: function(){
                                    $(this).remove();
                                }
                            }
                        );
                    } else if (position === 'LEFT'){
                        $(element).animate(
                            {
                                "left": "-=" + $(window).width() + "px"
                            },
                            {
                                duration: speed,
                                "easing": "linear",
                                complete: function(){
                                    $(this).remove();
                                }
                            }
                        );
                    } else if (position === 'TOPLEFT'){
                        $(element).animate(
                            {
                                "top": "-=" + $(window).height() + "px",
                                "left": "-=" + $(window).width() + "px"
                            },
                            {
                                duration: speed,
                                "easing": "linear",
                                complete: function(){
                                    $(this).remove();
                                }
                            }
                        );
                    }
                };


            });

        }]);