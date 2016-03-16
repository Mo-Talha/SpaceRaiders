angular.module('game.controller', [])
    .controller('gameController', ['$scope', '$state', 'coreServices',
        function ($scope, $state, coreServices) {

            var roomId = $state.params.roomId;
            var player = $state.params.player;
            var opponent = player === 'alien' ? 'spaceship': 'alien';
            var playerImageId = "#" + player;
            var opponentImageId = "#" + opponent;
            var playerHealthBar = "#" + player + "HealthBar";
            var opponentHealthBar = "#" + opponent + "HealthBar";
            var playerHealth = "#" + player + "Health";
            var opponentHealth = "#" + opponent + "Health";

            var alienContext = $('#alien')[0].getContext("2d");
            var alienImage = new Image();
            alienImage.src = 'images/alien.png';
            alienImage.onload = function(){
                alienContext.drawImage(alienImage, 0, 0, 100, 140);
            };

            var alienHealthBarContext = $('#alienHealthBar')[0].getContext("2d");
            var alienHealthBarImage = new Image();
            alienHealthBarImage.src = 'images/alienHealthBar.png';
            alienHealthBarImage.onload = function(){
                alienHealthBarContext.drawImage(alienHealthBarImage, 0, 0, 45, 150);
            };

            var spaceshipContext = $('#spaceship')[0].getContext("2d");
            var spaceshipImage = new Image();
            spaceshipImage.src = 'images/spaceship.png';
            spaceshipImage.onload = function(){
                spaceshipContext.drawImage(spaceshipImage, 0, 0, 100, 140);
            };

            var spaceshipHealthBarContext = $('#spaceshipHealthBar')[0].getContext("2d");
            var spaceshipHealthBarImage = new Image();
            spaceshipHealthBarImage.src = 'images/alienHealthBar.png';
            spaceshipHealthBarImage.onload = function(){
                spaceshipHealthBarContext.drawImage(spaceshipHealthBarImage, 0, 0, 45, 150);
            };

            if (player === 'alien'){
                $(playerImageId).css("top", "77%").rotate(180);
                $(opponentImageId).css("top", "1%").rotate(180);
                $(playerHealthBar).css('bottom', '1%').rotate(180);
                $(opponentHealthBar).css({'right': '0.01%', 'top': '1%'});
                $(playerHealth).css({"bottom": "29.6875px", "left":"13px"});
                $(opponentHealth).css({"top": "29.6875px", "right":"13px"});
            } else if (player === 'spaceship'){
                $(playerHealthBar).css('bottom', '1%').rotate(180);
                $(opponentHealthBar).css({'right': '0.01%', 'top': '1%'});
                $(playerHealth).css({"bottom": "29.6875px", "left":"13px"});
                $(opponentHealth).css({"top": "29.6875px", "right":"13px"});
            }

            $(document).ready(function(){

                $(document).keydown(function(e) {
                    var angle = $(playerImageId).getRotateAngle()[0];
                    if (isNaN(angle)) angle = 0;
                    switch(e.which) {
                        case 65:
                            //A
                            $(playerImageId).rotate(angle - 45);
                            coreServices.socket().emit('PLAYERROTATE', roomId, {
                                degree: 45
                            });
                            break;
                        case 68:
                            //D
                            $(playerImageId).rotate(angle + 45);
                            coreServices.socket().emit('PLAYERROTATE', roomId, {
                                degree: -45
                            });
                            break;
                        default:
                            e.preventDefault();
                            return;
                    }
                });

                $(window).mousemove(function(event) {
                    //console.log("X: " + event.pageX + " Y: " + event.pageY);
                    $(playerImageId).css({"left" : event.pageX - 50, "top": event.pageY - 70});
                    coreServices.socket().emit('PLAYERMOVEMENT', roomId, {
                        x: event.pageX,
                        y: event.pageY
                    });
                });

                $(document).click(function(event){
                    shootLaser(player, event, true);
                    coreServices.socket().emit('PLAYERSHOOT', roomId);
                    return false;
                });

                coreServices.socket().on('PLAYERMOVEMENT', function(data){
                    var x = data.x - 50;
                    var y = $(window).height() - data.y - 70;
                    $(opponentImageId).css({"left" : x, "top": y});
                });

                coreServices.socket().on('PLAYERROTATE', function(data){
                    var currentAngle = $(opponentImageId).getRotateAngle()[0];
                    if (isNaN(currentAngle)) currentAngle = 0;
                    var angle = data.degree + currentAngle;
                    $(opponentImageId).rotate(angle);
                });

                coreServices.socket().on('PLAYERSHOOT', function(){
                    var x = parseInt($(opponentImageId).css("left").replace("px", "")) + 50;
                    var y = parseInt($(opponentImageId).css("top").replace("px", "")) + 70;
                    var event = {
                        pageX: x,
                        pageY: y
                    };
                    shootLaser(opponent, event, false);
                });

                coreServices.socket().on('PLAYERHIT', function(){
                    var y = parseInt($(playerHealth).css('height').replace('px', '')) - 15;
                    $(playerHealth).css('height', y);
                    $(playerHealth).css('width', 19);
                    if (y <= 0){
                        endGame();
                        $state.go('login', {message: 'You lost', won: false});
                    }
                });

                var shootLaser = function(player, event, checkCollision){
                    var imageAngle = $("#" + player).getRotateAngle()[0];
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
                        animateLaser(laser, 'TOP', checkCollision, event.pageX - 1, event.pageY - 50, 1000);
                    } else if (Math.abs(imageAngle) > 0 && Math.abs(imageAngle) < 90){
                        animateLaser(laser, 'TOPRIGHT', checkCollision, event.pageX + 28, event.pageY - 45, 2000);
                    } else if (Math.abs(imageAngle) === 90){
                        animateLaser(laser, 'RIGHT', checkCollision, event.pageX + 28, event.pageY - 15, 1000);
                    } else if (Math.abs(imageAngle) > 90 && Math.abs(imageAngle) < 180){
                        animateLaser(laser, 'BOTTOMRIGHT', checkCollision, event.pageX + 28, event.pageY + 15, 2000);
                    } else if (Math.abs(imageAngle) === 180){
                        animateLaser(laser, 'BOTTOM', checkCollision, event.pageX - 1, event.pageY + 15, 1000);
                    } else if (Math.abs(imageAngle) > 180 && Math.abs(imageAngle) < 270){
                        animateLaser(laser, 'BOTTOMLEFT', checkCollision, event.pageX - 28, event.pageY + 15, 2000);
                    } else if (Math.abs(imageAngle) === 270){
                        animateLaser(laser, 'LEFT', checkCollision, event.pageX - 28, event.pageY - 15, 1000);
                    } else if (Math.abs(imageAngle) > 270 && Math.abs(imageAngle) < 360){
                        animateLaser(laser, 'TOPLEFT', checkCollision, event.pageX - 28, event.pageY - 45, 2000);
                    } else {
                        console.log("Error. Cannot find correct ship position.");
                    }
                };

                var animateLaser = function(laser, position, checkCollision, leftStart, topStart, speed){
                    $(laser).css({"left":leftStart, "top": topStart});
                    if (position === 'TOP'){
                        $(laser).animate(
                            {
                                "top": "-=" + $(window).height() + "px"
                            },
                            {
                                duration: speed,
                                "easing": "linear",
                                step: function(){
                                    if (checkCollision){
                                        checkCollisions(laser);
                                    }
                                },
                                complete: function(){
                                    $(this).remove();
                                }
                            }
                        );
                    } else if (position === 'TOPRIGHT'){
                        $(laser).animate(
                            {
                                "top": "-=" + ($(window).width() * (Math.tan(0.785398))),
                                "left": "+=" + $(window).width()
                            },
                            {
                                duration: speed,
                                "easing": "linear",
                                step: function(){
                                    if (checkCollision){
                                        checkCollisions(laser);
                                    }
                                },
                                complete: function(){
                                    $(this).remove();
                                }
                            }
                        );
                    } else if (position === 'RIGHT'){
                        $(laser).animate(
                            {
                                "left": "+=" + $(window).width() + "px"
                            },
                            {
                                duration: speed,
                                "easing": "linear",
                                step: function(){
                                    if (checkCollision){
                                        checkCollisions(laser);
                                    }
                                },
                                complete: function(){
                                    $(this).remove();
                                }
                            }
                        );
                    } else if (position === 'BOTTOMRIGHT'){
                        $(laser).animate(
                            {

                                "top": "+=" + $(window).height(),
                                "left": "+=" + ($(window).height() * (Math.tan(0.785398)))
                            },
                            {
                                duration: speed,
                                "easing": "linear",
                                step: function(){
                                    if (checkCollision){
                                        checkCollisions(laser);
                                    }
                                },
                                complete: function(){
                                    $(this).remove();
                                }
                            }
                        );
                    } else if (position === 'BOTTOM'){
                        $(laser).animate(
                            {
                                "top": "+=" + $(window).height() + "px"
                            },
                            {
                                duration: speed,
                                "easing": "linear",
                                step: function(){
                                    if (checkCollision){
                                        checkCollisions(laser);
                                    }
                                },
                                complete: function(){
                                    $(this).remove();
                                }
                            }
                        );
                    } else if (position === 'BOTTOMLEFT'){
                        $(laser).animate(
                            {
                                "top": "+=" + ($(window).height() * (Math.tan(0.785398))),
                                "left": "-=" + $(window).height()
                            },
                            {
                                duration: speed,
                                "easing": "linear",
                                step: function(){
                                    if (checkCollision){
                                        checkCollisions(laser);
                                    }
                                },
                                complete: function(){
                                    $(this).remove();
                                }
                            }
                        );
                    } else if (position === 'LEFT'){
                        $(laser).animate(
                            {
                                "left": "-=" + $(window).width() + "px"
                            },
                            {
                                duration: speed,
                                "easing": "linear",
                                step: function(){
                                    if (checkCollision){
                                        checkCollisions(laser);
                                    }
                                },
                                complete: function(){
                                    $(this).remove();
                                }
                            }
                        );
                    } else if (position === 'TOPLEFT'){
                        $(laser).animate(
                            {
                                "top": "-=" + ($(window).width() * (Math.tan(0.785398))),
                                "left": "-=" + $(window).width()
                            },
                            {
                                duration: speed,
                                "easing": "linear",
                                step: function(){
                                    if (checkCollision){
                                        checkCollisions(laser);
                                    }
                                },
                                complete: function(){
                                    $(this).remove();
                                }
                            }
                        );
                    }
                };

                function getLaserPosition(element) {
                    var position = $(element).position();
                    var x = position.left;
                    var y = position.top;

                    return {
                        x: x,
                        y: y
                    };
                }

                function getImagePosition(element){
                    var angle = $(element).getRotateAngle()[0];
                    if (isNaN(angle)) angle = 0;
                    angle *= Math.PI / 180;

                    var position = $(element).position();
                    var width = Math.abs(($(element).width() * Math.cos(Math.abs(angle)))) + Math.abs(($(element).height() * Math.sin(Math.abs(angle))));
                    var height = Math.abs(($(element).height() * Math.cos(Math.abs(angle)))) + Math.abs(($(element).width() * Math.sin(Math.abs(angle))));

                    var x = position.left + (width/2);
                    var y = position.top + (height/2);

                    return {
                        x: x,
                        y: y
                    };
                }

                function comparePositions(coordinate1, coordinate2) {
                    var x1 = coordinate1.x > coordinate2.x ? coordinate1.x : coordinate2.x;
                    var x2 = coordinate1.x < coordinate2.x ? coordinate1.x : coordinate2.x;
                    var y1 = coordinate1.y > coordinate2.y ? coordinate1.y : coordinate2.y;
                    var y2 = coordinate1.y < coordinate2.y ? coordinate1.y : coordinate2.y;
                    return (Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2)));
                }

                var testCollisons = function(x, y){
                    var circle = $("<div style='background-color: white; border-radius: 5px; width: 5px; height: 5px;'></div>");
                    $(circle).css({"position": "absolute"});
                    $(circle).css({"left": x, "top": y});
                    $("#spaceshipPlayer").append(circle);
                };

                var checkCollisions = function (element){

                    var laserPosition = getLaserPosition(element);
                    var imagePosition = getImagePosition(opponentImageId);

                    var hit = false;
                    var distance = comparePositions(laserPosition, imagePosition);

                    if (distance <= ($(opponentImageId).width() / 2)){
                        hit = true;
                    }

                    if (hit) {
                        $(element).stop();
                        $(element).remove();

                        var y = parseInt($(opponentHealth).css('height').replace('px', '')) - 15;
                        $(opponentHealth).css('height', y);
                        $(opponentHealth).css('width', 19);

                        coreServices.socket().emit('PLAYERHIT', roomId);

                        if (y <= 0){
                            endGame();
                            $state.go('login', {message: "You won!", won: true});
                        }

                    }
                };

                var endGame = function(){
                    $('.laser-beam').stop();
                    $(document).unbind();
                    $(window).unbind();
                    coreServices.socket().off('PLAYERMOVEMENT');
                    coreServices.socket().off('PLAYERROTATE');
                    coreServices.socket().off('PLAYERSHOOT');
                    coreServices.socket().off('PLAYERHIT');
                    coreServices.socket().disconnect();
                    coreServices.socket().connect();
                };

            });

        }]);