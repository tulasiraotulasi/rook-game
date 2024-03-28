var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container", // Make sure to have a div with this id in your index.html
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};
let currentX;
let currentY;
let player;
let boxes;

var game = new Phaser.Game(config);

function preload() {
  this.load.image("chessboard", "/assets/chessboard.png");
  this.load.image("rookidle", "/assets/rookidle.png");
  this.load.image("player1", "/assets/player1.png");
  this.load.image("player2", "/assets/player2.png");
  this.load.image("box", "/assets/box.png");
  boxes = this.add.group();
}

function create() {
  this.add.image(400, 300, "chessboard"); // Adjust position as needed
  this.add.image(400, 50, "player1");
  this.add.image(400, 550, "player2");
  let s = this.add
    .text(400, 300, "Start Game", { fontSize: "32px", fill: "#ffffff" })
    .setOrigin(0.5);
  setTimeout(() => {
    s.destroy();
  }, 1500);
  s.scence;

  const numRows = 8;
  const numCols = 8;
  const tileSize = 42;
  const tileColors = [0xffffff, 0x000000];
  const gridOpacity = 0.1;

  const gridWidth = numCols * tileSize;
  const gridHeight = numRows * tileSize;
  const startX = (this.sys.game.config.width - gridWidth) / 2;
  const startY = (this.sys.game.config.height - gridHeight) / 2;
  console.log(startX, startY);

  player = this.add.sprite(
    startX + gridWidth - tileSize / 2,
    startY + tileSize / 2,
    "rookidle"
  );

  socket.on("playerMoved", (position) => {
    player.x = position.x;
    player.y = position.y;
  });

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      // Calculate position of the tile
      const x = startX + j * tileSize;
      const y = startY + i * tileSize;

      const colorIndex = (i + j) % 2;
      const color = tileColors[colorIndex];

      // Create the tile
      const tile = this.add.graphics({
        fillStyle: { color: color, alpha: gridOpacity },
      });
      tile.fillRect(x, y, tileSize, tileSize);
      tile.setInteractive();

      this.input.on("pointerdown", function (pointer) {
        const gridX = Math.floor((pointer.x - startX) / tileSize);
        const gridY = Math.floor((pointer.y - startY) / tileSize);
        console.log(gridX, gridY, "grid");
        // Check if the click occurred within the grid boundaries by user
        if (gridX >= 0 && gridX < numCols && gridY >= 0 && gridY < numRows) {
          if (
            (gridX < currentX && gridY === currentY) ||
            (gridX === currentX && gridY > currentY)
          ) {
            player.setPosition(
              startX + gridX * tileSize + tileSize / 2,
              startY + gridY * tileSize + tileSize / 2
            );
            boxes.clear(true, true);
            socket.emit("playerMove", { x: player.x, y: player.y });
            socket.emit("playerCurrentPosition", {
              cx: gridX,
              cy: gridY,
            });
            addBoxImage();
            currentX = gridX;
            currentY = gridY;
          }
        }
      });
    }
  }
  currentX = Math.floor((player.x - startX) / tileSize);
  currentY = Math.floor((player.y - startY) / tileSize);
  console.log(currentX, currentY, "current");

  socket.on("playerMoved", (position) => {
    player.x = position.x;
    player.y = position.y;
  });
  socket.on("playerCurrentPosition", (current) => {
    currentX = current.cx;
    currentY = current.cy;
  });

  const addBoxImage = () => {
    for (let i = 253; i < player.x; i += 42) {
      let b = this.add.image(i, player.y, "box");
      boxes.add(b);
      for (let j = player.y + 42; j <= 447; j += 42) {
        if (player.x - i === 42) {
          let bb = this.add.image(i + 42, j, "box");
          boxes.add(bb);
        }
      }
    }
    if (player.x == 253) {
      for (let j = player.y + 42; j <= 447; j += 42) {
        let bb = this.add.image(player.x, j, "box");
        boxes.add(bb);
      }
    }
  };
  addBoxImage();
}

function update() {
  if (currentX === 0 && currentY === 7) {
    // this.scene.stop();
    this.add
      .text(400, 300, "You Win", { fontSize: "32px", fill: "#ffffff" })
      .setOrigin(0.5);
  }
}
// game.scene.add("lobby", lobbyScene);
// game.scene.add("start", startScene);
// game.scene.add("chessboard", chessboardScene);
// game.scene.start("start");
// socket.on("startGame", function () {
//   game.scene.stop("start");
//   game.scene.start("lobby");
// });
// function create() {}

// let lobbyScene = {
//   create: function () {
//     this.add.rectangle(400, 300, 1000, 600, 0xffffff);
//     this.add
//       .text(400, 300, "Lobby Full", { fontSize: "32px", fill: "#000000" })
//       .setOrigin(0.5);
//   },
// };

// let startScene = {
//   create: function () {
//     this.add.rectangle(400, 300, 1000, 600, 0x000000);
//     this.add
//       .text(400, 300, "Start", {
//         fontSize: "32px",
//         fill: "#ffffff",
//       })
//       .setOrigin(0.5);
//   },
// };

// let chessboardScene = {
//   create: function () {},
// };
