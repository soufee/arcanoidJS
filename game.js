var game = {
    width: 640,
    height: 360,
    ctx: undefined,
    platform: undefined,
    ball: undefined,
    rows: 4,
    cols: 8,
    running: true,
    score: 0,
    blocks: [],
    sprites: {
        background: undefined,
        platform: undefined,
        ball: undefined,
        block: undefined,
    },
    init: function () {
        var canvas = document.getElementById("mycanvas");
        this.ctx = canvas.getContext("2d");
        window.addEventListener("keydown", function (e) {
            if (e.keyCode == 37) {
                game.platform.dx = -game.platform.velocity;
            } else if (e.keyCode == 39) {
                game.platform.dx = game.platform.velocity;
            } else if (e.keyCode == 32) {
                game.platform.releaseBall();
            }
        });
        this.ctx.font = "20px Arial";
        this.ctx.fillStyle = "#ffffff";
        window.addEventListener("keyup", function (e) {
            game.platform.stop();
        });
    },
    load: function () {
        for (var key in this.sprites) {
            this.sprites[key] = new Image();
            this.sprites[key].src = "images/" + key + ".png";
        }
    },
    create: function () {
        for (var row = 0; row < this.rows; row++) {
            for (var col = 0; col < this.cols; col++) {
                this.blocks.push({
                    x: 68 * col + 50,
                    y: 38 * row + 35,
                    width: 64,
                    height: 32,
                    isAlive: true,
                });
            }
        }
    },
    start: function () {
        this.init();
        this.load();
        this.create();
        this.run();

    },
    render: function () {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.ctx.drawImage(this.sprites.background, 0, 0);
        this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
        //  this.ctx.drawImage(this.sprites.ball, this.ball.x, this.ball.y);
        this.ctx.drawImage(this.sprites.ball, this.ball.width * this.ball.frame, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, 22, 22);

        this.blocks.forEach(function (element) {
            if (element.isAlive) {
                this.ctx.drawImage(this.sprites.block, element.x, element.y);
            }
        }, this);
        this.ctx.fillText("SCORE: "+game.score, 15, this.height - 15);
    },
    update: function () {
        if (this.ball.collide(this.platform)) {
            this.ball.bumpPlatform(this.platform);
        }
        if (this.platform.dx) {
            this.platform.move();
        }
        if (this.ball.dx || this.ball.dy) {
            this.ball.move();
        }
        this.blocks.forEach(function (element) {
            if (element.isAlive) {
                if (this.ball.collide(element)) {
                    this.ball.bumpBlock(element);
                }
            }
        }, this);
        this.ball.checkBounds();

    },
    run: function () {
        this.update();
        this.render();
        if (this.running) {
            window.requestAnimationFrame(function () {
                game.run();
            });
        }
    },

    over: function (message) {
        this.running = false;
        alert(message);
        window.location.reload();
    }
};
game.ball = {
    width: 16,
    height: 16,
    frame: 0,
    x: 320,
    y: 278,
    dx: 0,
    dy: 0,
    velocity: 3,
    jump: function () {
        this.dy = -this.velocity;
        this.dx = -this.velocity;
    },
    move: function () {
        this.x += this.dx;
        this.y += this.dy;
    },
    collide: function (element) {
        var x = this.x + this.dx;
        var y = this.y + this.dy;
        if (x + 22 > element.x &&
            x < element.x + element.width &&
            y + 22 > element.y &&
            y < element.y + element.height
        ) {
            return true;
        }
        return false;
    },
    onTheLeftSide: function (platform) {
        return (this.x + 11) < (platform.x + platform.width / 2);
    },
    bumpPlatform: function (platform) {
        this.dy = -this.velocity;
        this.dx = this.onTheLeftSide(platform) ? -this.velocity : this.velocity;
    },
    bumpBlock: function (block) {
        this.dy *= -1;
        block.isAlive = false;
        ++game.score;
        if (game.score>=game.blocks.length){
            game.over("You win!");
        }
    },
    checkBounds: function () {
        var x = this.x + this.dx;
        var y = this.y + this.dy;

        if (x < 0) {
            this.x = 0;
            this.dx = this.velocity;
        } else if (x + 22 > game.width) {
            this.x = game.width - 22;
            this.dx = -this.velocity;
        } else if (y < 0) {
            this.y = 0;
            this.dy = this.velocity;
        } else if (y + 22 > game.height) {
            game.over("You loooooooseee");
        }
    },
};
window.addEventListener("load", function () {
    game.start();
});

game.platform = {
    x: 285,
    y: 300,
    velocity: 6,
    dx: 0,
    ball: game.ball,
    width: 96,
    height: 16,
    move: function () {
        this.x += this.dx;
        if (this.ball) {
            this.ball.x += this.dx;
        }
    },
    stop: function () {
        this.dx = 0;
        if (this.ball) {
            this.ball.dx = 0;
        }
    },
    releaseBall: function () {
        if (this.ball) {
            this.ball.jump();
            this.ball = false;
        }
    }
};