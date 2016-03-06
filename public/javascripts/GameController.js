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
                $(playerHealthBar).css('top', '76%').rotate(180);
                $(opponentHealthBar).css('right', '0.01%');
                $(playerHealth).css({"top": "80%", "left":"13px"});
                $(opponentHealth).css({"top": "4.25%", "right":"13px"});
            } else if (player === 'spaceship'){
                $(playerHealthBar).css('top', '76%').rotate(180);
                $(opponentHealthBar).css('right', '0.01%');
                $(playerHealth).css({"top": "80%", "left":"13px"});
                $(opponentHealth).css({"top": "4.25%", "right":"13px"});
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
                        animateLaser(laser, 'TOPRIGHT', checkCollision, event.pageX + 28, event.pageY - 45, 1000);
                    } else if (Math.abs(imageAngle) === 90){
                        animateLaser(laser, 'RIGHT', checkCollision, event.pageX + 28, event.pageY - 15, 1000);
                    } else if (Math.abs(imageAngle) > 90 && Math.abs(imageAngle) < 180){
                        animateLaser(laser, 'BOTTOMRIGHT', checkCollision, event.pageX + 28, event.pageY + 15, 1000);
                    } else if (Math.abs(imageAngle) === 180){
                        animateLaser(laser, 'BOTTOM', checkCollision, event.pageX - 1, event.pageY + 15, 1000);
                    } else if (Math.abs(imageAngle) > 180 && Math.abs(imageAngle) < 270){
                        animateLaser(laser, 'BOTTOMLEFT', checkCollision, event.pageX - 28, event.pageY + 15, 1000);
                    } else if (Math.abs(imageAngle) === 270){
                        animateLaser(laser, 'LEFT', checkCollision, event.pageX - 28, event.pageY - 15, 1000);
                    } else if (Math.abs(imageAngle) > 270 && Math.abs(imageAngle) < 360){
                        animateLaser(laser, 'TOPLEFT', checkCollision, event.pageX - 28, event.pageY - 45, 1000);
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
                                "top": "-=" + $(window).height() + "px",
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
                                "top": "+=" + $(window).height() + "px",
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
                                "top": "+=" + $(window).height() + "px",
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
                                "top": "-=" + $(window).height() + "px",
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
                    }
                };

                function getPosition(element, rotated) {
                    var position = $(element).position();
                    var width = $(element).width();
                    var height = $(element).height();
                    if (rotated){
                        return {
                            x: [
                                position.left,
                                position.left + height
                            ],
                            y: [
                                position.top,
                                position.top + width
                            ]
                        };
                    }
                    return {
                        x: [
                            position.left,
                            position.left + width
                        ],
                        y: [
                            position.top,
                            position.top + height
                        ]
                    };
                }

                function comparePositions(coordinate1, coordinate2) {
                    //Left most coordinate
                    var x1 = coordinate1[0] < coordinate2[0] ? coordinate1 : coordinate2;
                    var x2 = coordinate1[0] < coordinate2[0] ? coordinate2 : coordinate1;
                    return (x1[1] > x2[0] || x1[0] === x2[0]);
                }

                var checkCollisions = function (element){

                    var laserPosition = getPosition(element);
                    var imageAngle = $(opponentImageId).getRotateAngle()[0];
                    if (isNaN(imageAngle)) imageAngle = 0;

                    var rotated = false;
                    if (Math.abs(imageAngle) != 0 && Math.abs(imageAngle) != 180) rotated = true;

                    var imagePosition = getPosition(opponentImageId, rotated);

                    var horizontalMatch = comparePositions(laserPosition.x, imagePosition.x);
                    var verticalMatch = comparePositions(laserPosition.y, imagePosition.y);
                    
                    if (Math.abs(imageAngle) == 0 || Math.abs(imageAngle) == 180){
                        horizontalMatch = comparePositions(laserPosition.x, imagePosition.x);
                        verticalMatch = comparePositions(laserPosition.y, imagePosition.y);
                    } else {
                        horizontalMatch = comparePositions(laserPosition.x, imagePosition.x);
                        verticalMatch = comparePositions(laserPosition.y, imagePosition.y);
                        if (verticalMatch){
                            console.log("Laser y: " + laserPosition.y);
                            console.log("Vertical match y: " + imagePosition.x);

                            var circle = $("<div style='background-color: red; border-radius: 5px; width: 5px; height: 5px;'></div>");
                            var circle2 = $("<div style='background-color: red; border-radius: 5px; width: 5px; height: 5px;'></div>");
                            $(circle).css({"position": "absolute"});
                            $(circle).css({"left": imagePosition.x[0], "top": imagePosition.y[0]});
                            $(circle2).css({"position": "absolute"});
                            $(circle2).css({"left": imagePosition.x[0], "top": imagePosition.y[1]});
                            $("#spaceshipPlayer").append(circle);
                            $("#spaceshipPlayer").append(circle2);
                            //$(element).stop();

                        }
                    }

                    var hit = horizontalMatch && verticalMatch;
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