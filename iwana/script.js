const cvs = document.getElementById("game");
const ctx = cvs.getContext("2d");
const kidImg = new Image();


const kidWidth = 14;
const moveWidth = 4;

const GRAVITY = 1.8;
const FPS = 1000 / 60;
const cvsWidth = cvs.width;
const cvsHeight = cvs.height;

const floorY = cvsHeight - kidWidth;
const leftWallX = 0;
const rightWallX = cvsWidth - kidWidth;

let x = cvsWidth / 2;
let y = floorY;
let vx = 0;
let vy = 0;

let inJump = false;
let jumpCount = 0;
let frameCount = 0;
let jumpLevel = 0;
let prevNoJumpKey = false;
let kidDirction = "left";
let prevKidDirection = "left";

kidImg.src = "./kid.png";

const draw = () => {
    ctx.clearRect(0, 0, cvsWidth, cvsHeight);
    if (kidDirction === "left") {
        if (prevKidDirection === "right") {
            ctx.scale(-1, 1);
            ctx.translate(-cvsWidth, 0);
        }
        ctx.drawImage(kidImg, x, y, kidWidth, kidWidth);
        prevKidDirection = "left";
    } else if (kidDirction === "right") {
        if (prevKidDirection === "left") {
            ctx.scale(-1, 1);
            ctx.translate(-cvsWidth, 0);
        }
        ctx.drawImage(kidImg, cvsWidth - x, y, kidWidth, kidWidth);
        prevKidDirection = "right";
    }
    //console.log("draw");
}
kidImg.onload = draw;
console.log(234);

let keyStatus = {};

//キーボードが押されたときの処理
document.onkeydown = (e) => {
    if(e.key == "ArrowRight") keyStatus.right = true;
    else if(e.key == "ArrowLeft") keyStatus.left = true;
    else if(e.key == "Shift") keyStatus.jump = true;
}

//キーボードが離されたときの処理
document.onkeyup = (e) => {
    if(e.key == "ArrowRight") keyStatus.right = false;
    else if(e.key == "ArrowLeft") keyStatus.left = false;
    else if(e.key == "Shift") keyStatus.jump = false;
}

/*
document.addEventListener("keydown", (e) => {
    console.log(e.key);
    if (e.key == "ArrowRight") {
        x += moveWidth;
        console.log("ArrowRight")
        draw();
    } else if (e.key == "ArrowLeft") {
        x -= moveWidth;
        console.log("ArrowLeft")
        draw();
    } else if (e.key == "Shift") {
        x -= moveWidth;
        console.log("Shift")
        draw();
    }

    console.log(x, y);
});
*/

window.onload = function() {
    startTime = performance.now();
    mainLoop();
}


const update = () => {
    // ジャンプキー押下
    if (keyStatus.jump) {
        console.log(jumpCount);
        // ジャンプし始め
        if (jumpCount === 0) {
            jumpCount = 1;
            jumpLevel = 1;
        } else {
            if (jumpLevel === 1 && prevNoJumpKey) {
                jumpCount = 1;
                jumpLevel = 2;
                console.log("2段目");
            }
            const maxJumpFlame = 15;
            if (jumpCount < maxJumpFlame) {
                vy = jumpCount - maxJumpFlame;
            }
        }
        prevNoJumpKey = false;
    } else {
        prevNoJumpKey = true;
    }

    if(jumpCount) jumpCount++;

    if (y < floorY) vy += GRAVITY;

    // 床
    if(y > floorY) {
        inJump = false;
        jumpCount = 0;
        jumpLevel = 0;
        vy = 0;
        y = floorY;
        console.log("床")
    }

    if(keyStatus.left) {
        if (x > leftWallX) x -= moveWidth;
        kidDirction = "left";
    } else if(keyStatus.right) {
        if (x < rightWallX) x += moveWidth;
        kidDirction = "right";
    }

    y += vy;
}

const mainLoop = () => {
    const nowTime = performance.now();
    const nowFrame = (nowTime - startTime) / FPS;

    if (nowFrame > frameCount) {
        let c = 0;
        while (nowFrame > frameCount) {
            frameCount++;
            update();
            c++;
            if (c >= 4) break;
        }
        draw();
    }

    requestAnimationFrame(mainLoop);
}
