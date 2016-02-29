angular.module('game.controller', [])
    .controller('gameController', ['$scope', '$state', 'coreServices',
        function ($scope, $state, coreServices) {

            var player = $state.params.player;
            var opponent = player === 'alien' ? 'spaceship': 'alien';
            var roomId = $state.params.roomId;

            if (player === 'alien'){
                $("#alien").css("top", "77%").rotate(180);
                $("#spaceship").css("top", "1%").rotate(180);
                $("#alienHealthBar").css('top', '76%').rotate(180);
                $("#spaceshipHealthBar").css('right', '0.01%').rotate(180);
                $("#alienHealth").css({"top": "80%", "left":"1.75%", "height": '101px', "width": '19px'});
                $("#spaceshipHealth").css({"top": "4.25%", "right":"1.75%", "height": '101px', "width": '19px'});
            } else if (player === 'spaceship'){
                $("#alienHealthBar").css('right', '0.01%');
                $("#spaceshipHealthBar").css('top', '76%');
                $("#spaceshipHealth").css({"top": "80%", "left":"1.75%", "height": '101px', "width": '19px'});
                $("#alienHealth").css({"top": "4.25%", "right":"1.75%", "height": '101px', "width": '19px'});
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
                    shootLaser(player, event);
                    coreServices.socket().emit('PLAYERSHOOT', roomId);
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

                coreServices.socket().on('PLAYERSHOOT', function(){
                    var opponentImageId = "#" + opponent;
                    var x = parseInt($(opponentImageId).css("left").replace("px", "")) + 50;
                    var y = parseInt($(opponentImageId).css("top").replace("px", "")) + 70;
                    var event = {
                        pageX: x,
                        pageY: y
                    };
                    shootLaser(opponent, event);
                });

                var shootLaser = function(player, event){
                    var imageId = '#' + player;
                    var imageAngle = $(imageId).getRotateAngle()[0];
                    if (isNaN(imageAngle)) imageAngle = 0;
                    if (imageAngle < 0) imageAngle += 360;
                    var laser = null;

                    if (player === 'alien'){
                        var alienLaser = $('<div class="laser-beam purple"></div>');
                        $(alienLaser).rotate(imageAngle);
                        $("#alienPlayer").append(alienLaser);
                        if (imageAngle > 180) imageAngle -= 180;
                            else imageAngle += 180;
                        while (imageAngle > 360) imageAngle = imageAngle - 360;
                        laser = alienLaser;
                    } else if (player === 'spaceship'){
                        var spaceshipLaser = $('<div class="laser-beam red"></div>');
                        $(spaceshipLaser).rotate(imageAngle);
                        $("#spaceshipPlayer").append(spaceshipLaser);
                        while (imageAngle > 360) imageAngle = imageAngle - 360;
                        laser = spaceshipLaser;
                    }

                    if (Math.abs(imageAngle) === 0 || Math.abs(imageAngle) === 360){
                        //Top
                        animateLaser(laser, 'TOP', event.pageX - 1, event.pageY - 50, 1000);
                    } else if (Math.abs(imageAngle) > 0 && Math.abs(imageAngle) < 90){
                        //Top right
                        animateLaser(laser, 'TOPRIGHT', event.pageX + 28, event.pageY - 45, 1000);
                    } else if (Math.abs(imageAngle) === 90){
                        //Right
                        animateLaser(laser, 'RIGHT', event.pageX + 28, event.pageY - 15, 1000);
                    } else if (Math.abs(imageAngle) > 90 && Math.abs(imageAngle) < 180){
                        //Bottom right
                        animateLaser(laser, 'BOTTOMRIGHT', event.pageX + 28, event.pageY + 15, 1000);
                    } else if (Math.abs(imageAngle) === 180){
                        //Bottom
                        animateLaser(laser, 'BOTTOM', event.pageX - 1, event.pageY + 15, 1000);
                    } else if (Math.abs(imageAngle) > 180 && Math.abs(imageAngle) < 270){
                        //Bottom left
                        animateLaser(laser, 'BOTTOMLEFT', event.pageX - 28, event.pageY + 15, 1000);
                    } else if (Math.abs(imageAngle) === 270){
                        //Left
                        animateLaser(laser, 'LEFT', event.pageX - 28, event.pageY - 15, 1000);
                    } else if (Math.abs(imageAngle) > 270 && Math.abs(imageAngle) < 360){
                        //Top left
                        animateLaser(laser, 'TOPLEFT', event.pageX - 28, event.pageY - 45, 1000);
                    } else {
                        console.log("Error. Cannot find correct ship position.");
                    }
                };

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