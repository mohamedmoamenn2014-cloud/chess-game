
const PIECES = {
  white: {
    king: "♚",
    queen: "♛",
    rook: "♜",
    bishop: "♝",
    knight: "♞",
    pawn: "♟",
  },
  black: {
    king: "♚",
    queen: "♛",
    rook: "♜",
    bishop: "♝",
    knight: "♞",
    pawn: "♟",
  },
};


// قيم القطع، تستخدم في تقييم حركات الروبوت وفي حساب سكور اللاعب
const PIECE_VALUES = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 100,
};

class Piece {
  constructor(type, color, row, col) {
    this.type = type;
    this.color = color;
    this.row = row;
    this.col = col;
    this.hasMoved = false;
  }

  getSymbol() {
    return PIECES[this.color][this.type];
  }

  canMoveTo(targetRow, targetCol, board, enPassantTarget = null) {
    // سيتم تنفيذ منطق الحركة لكل قطعة
    switch (this.type) {
      case "pawn":
        return this.canPawnMoveTo(targetRow, targetCol, board, enPassantTarget);
      case "rook":
        return this.canRookMoveTo(targetRow, targetCol, board);
      case "knight":
        return this.canKnightMoveTo(targetRow, targetCol, board);
      case "bishop":
        return this.canBishopMoveTo(targetRow, targetCol, board);
      case "queen":
        return this.canQueenMoveTo(targetRow, targetCol, board);
      case "king":
        return this.canKingMoveTo(targetRow, targetCol, board);
      default:
        return false;
    }
  }

  canPawnMoveTo(targetRow, targetCol, board, enPassantTarget = null) {
    const direction = this.color === "white" ? -1 : 1;
    const startRow = this.color === "white" ? 6 : 1;

    // حركة للأمام
    if (this.col === targetCol) {
      // خطوة واحدة
      if (targetRow === this.row + direction && !board[targetRow][targetCol]) {
        return true;
      }
      // خطوتان من البداية
      if (this.row === startRow && targetRow === this.row + 2 * direction && !board[targetRow][targetCol]) {
        return true;
      }
    }
    // أكل قطري
    else if (Math.abs(this.col - targetCol) === 1 && targetRow === this.row + direction) {
      // أكل عادي
      if (board[targetRow][targetCol] && board[targetRow][targetCol].color !== this.color) {
        return true;
      }
      // الأكل بالمرور
      if (enPassantTarget && targetRow === enPassantTarget.row && targetCol === enPassantTarget.col) {
        return true;
      }
    }

    return false;
  }

  canRookMoveTo(targetRow, targetCol, board) {
    // حركة أفقية أو عمودية
    if (this.row !== targetRow && this.col !== targetCol) {
      return false;
    }

    return this.isPathClear(targetRow, targetCol, board);
  }

  canKnightMoveTo(targetRow, targetCol, board) {
    const rowDiff = Math.abs(this.row - targetRow);
    const colDiff = Math.abs(this.col - targetCol);

    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  }

  canBishopMoveTo(targetRow, targetCol, board) {
    // حركة قطرية
    if (Math.abs(this.row - targetRow) !== Math.abs(this.col - targetCol)) {
      return false;
    }

    return this.isPathClear(targetRow, targetCol, board);
  }

  canQueenMoveTo(targetRow, targetCol, board) {
    return this.canRookMoveTo(targetRow, targetCol, board) || this.canBishopMoveTo(targetRow, targetCol, board);
  }

  canKingMoveTo(targetRow, targetCol, board) {
    const rowDiff = Math.abs(this.row - targetRow);
    const colDiff = Math.abs(this.col - targetCol);

    // حركة عادية
    if (rowDiff <= 1 && colDiff <= 1) {
      return true;
    }

    // التبييت
    if (!this.hasMoved && this.row === targetRow && Math.abs(this.col - targetCol) === 2) {
      const direction = targetCol > this.col ? 1 : -1;
      const rookCol = direction === 1 ? 7 : 0;
      const rook = board[this.row][rookCol];

      // التحقق من وجود القلعة وعدم حركتها
      if (rook && rook.type === "rook" && !rook.hasMoved) {
        // التحقق من خلو المسار
        const startCol = Math.min(this.col, rookCol) + 1;
        const endCol = Math.max(this.col, rookCol);

        for (let col = startCol; col < endCol; col++) {
          if (board[this.row][col]) {
            return false;
          }
        }

        return true;
      }
    }

    return false;
  }

  isPathClear(targetRow, targetCol, board) {
    const rowStep = targetRow > this.row ? 1 : targetRow < this.row ? -1 : 0;
    const colStep = targetCol > this.col ? 1 : targetCol < this.col ? -1 : 0;

    let currentRow = this.row + rowStep;
    let currentCol = this.col + colStep;

    while (currentRow !== targetRow || currentCol !== targetCol) {
      if (board[currentRow][currentCol]) {
        return false;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }

    return true;
  }
}

// كلاس اللعبة
class ChessGame {
  constructor(gameMode = "friend", difficulty = "medium") {
    this.board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));
    this.currentPlayer = "white";
    this.selectedSquare = null;
    this.gameStatus = "playing";
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
    this.enPassantTarget = null; // مربع الأكل بالمرور
    this.lastMove = null; // آخر حركة
    this.gameMode = gameMode; // 'friend' أو 'computer'
    this.difficulty = difficulty; // 'easy', 'medium', 'hard'
    this.isComputerThinking = false;

    this.initializeBoard();
    this.renderBoard();
    this.updateDisplay();
  }

  initializeBoard() {
    // إعداد القطع السوداء
    this.board[0][0] = new Piece("rook", "black", 0, 0);
    this.board[0][1] = new Piece("knight", "black", 0, 1);
    this.board[0][2] = new Piece("bishop", "black", 0, 2);
    this.board[0][3] = new Piece("queen", "black", 0, 3);
    this.board[0][4] = new Piece("king", "black", 0, 4);
    this.board[0][5] = new Piece("bishop", "black", 0, 5);
    this.board[0][6] = new Piece("knight", "black", 0, 6);
    this.board[0][7] = new Piece("rook", "black", 0, 7);

    for (let col = 0; col < 8; col++) {
      this.board[1][col] = new Piece("pawn", "black", 1, col);
    }

    // إعداد القطع البيضاء
    for (let col = 0; col < 8; col++) {
      this.board[6][col] = new Piece("pawn", "white", 6, col);
    }

    this.board[7][0] = new Piece("rook", "white", 7, 0);
    this.board[7][1] = new Piece("knight", "white", 7, 1);
    this.board[7][2] = new Piece("bishop", "white", 7, 2);
    this.board[7][3] = new Piece("queen", "white", 7, 3);
    this.board[7][4] = new Piece("king", "white", 7, 4);
    this.board[7][5] = new Piece("bishop", "white", 7, 5);
    this.board[7][6] = new Piece("knight", "white", 7, 6);
    this.board[7][7] = new Piece("rook", "white", 7, 7);
  }

  renderBoard() {
    const boardElement = document.getElementById("chess-board");
    boardElement.innerHTML = "";

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement("div");
        square.className = `square ${(row + col) % 2 === 0 ? "light" : "dark"}`;
        square.dataset.row = row;
        square.dataset.col = col;

        const piece = this.board[row][col];
        if (piece) {
          const pieceElement = document.createElement("div");
          let pieceClass = `piece ${piece.color}-piece`;
          if (piece.type === "bishop") {
            pieceClass += " bishop-piece";
          }
          pieceElement.className = pieceClass;
          pieceElement.textContent = piece.getSymbol();
          square.appendChild(pieceElement);
        }

        square.addEventListener("click", (e) => this.handleSquareClick(row, col));
        boardElement.appendChild(square);
      }
    }
  }

  handleSquareClick(row, col) {
    if (this.gameStatus !== "playing") return;
    if (this.isComputerThinking) return;
    if (this.gameMode === "computer" && this.currentPlayer === "black") return;

    const clickedPiece = this.board[row][col];

    if (this.selectedSquare) {
      const [selectedRow, selectedCol] = this.selectedSquare;

      if (selectedRow === row && selectedCol === col) {
        // إلغاء التحديد
        this.clearSelection();
        return;
      }

      const selectedPiece = this.board[selectedRow][selectedCol];
      if (selectedPiece && this.isValidMove(selectedPiece, row, col)) {
        this.makeMove(selectedPiece, row, col);
        this.clearSelection();
        this.switchPlayer();
        this.checkGameStatus();
      } else {
        this.clearSelection();
        if (clickedPiece && clickedPiece.color === this.currentPlayer) {
          this.selectSquare(row, col);
        }
      }
    } else {
      if (clickedPiece && clickedPiece.color === this.currentPlayer) {
        this.selectSquare(row, col);
      }
    }
  }

  selectSquare(row, col) {
    this.selectedSquare = [row, col];
    this.highlightSquare(row, col);
    this.showPossibleMoves(row, col);
  }

  clearSelection() {
    this.selectedSquare = null;
    this.clearHighlights();
  }

  highlightSquare(row, col) {
    const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    square.classList.add("selected");
  }

  clearHighlights() {
    document.querySelectorAll(".square").forEach((square) => {
      square.classList.remove("selected", "possible-move", "capture-move", "king-in-check");
    });
  }

  showPossibleMoves(row, col) {
    const piece = this.board[row][col];
    if (!piece) return;

    for (let targetRow = 0; targetRow < 8; targetRow++) {
      for (let targetCol = 0; targetCol < 8; targetCol++) {
        if (this.isValidMove(piece, targetRow, targetCol)) {
          const square = document.querySelector(`[data-row="${targetRow}"][data-col="${targetCol}"]`);
          const targetPiece = this.board[targetRow][targetCol];

          if (targetPiece && targetPiece.color !== piece.color) {
            // حركة أكل - لون أحمر فاتح
            square.classList.add("capture-move");
          } else {
            // حركة عادية - لون أخضر
            square.classList.add("possible-move");
          }
        }
      }
    }
  }

  isValidMove(piece, targetRow, targetCol) {
    // التحقق من الحدود
    if (targetRow < 0 || targetRow >= 8 || targetCol < 0 || targetCol >= 8) {
      return false;
    }

    // التحقق من وجود قطعة من نفس اللون في المربع المستهدف
    const targetPiece = this.board[targetRow][targetCol];
    if (targetPiece && targetPiece.color === piece.color) {
      return false;
    }

    // التحقق من قواعد حركة القطعة
    if (!piece.canMoveTo(targetRow, targetCol, this.board, this.enPassantTarget)) {
      return false;
    }

    // التحقق من عدم تعريض الملك للخطر
    return !this.wouldExposeKing(piece, targetRow, targetCol);
  }

  wouldExposeKing(piece, targetRow, targetCol) {
    // محاكاة الحركة
    const originalPiece = this.board[targetRow][targetCol];
    const originalRow = piece.row;
    const originalCol = piece.col;

    this.board[targetRow][targetCol] = piece;
    this.board[originalRow][originalCol] = null;
    piece.row = targetRow;
    piece.col = targetCol;

    // البحث عن الملك
    let kingRow, kingCol;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const p = this.board[row][col];
        if (p && p.type === "king" && p.color === piece.color) {
          kingRow = row;
          kingCol = col;
          break;
        }
      }
    }

    // التحقق من تهديد الملك
    const isInCheck = this.isSquareUnderAttack(kingRow, kingCol, piece.color === "white" ? "black" : "white");

    // إعادة الحالة الأصلية
    this.board[originalRow][originalCol] = piece;
    this.board[targetRow][targetCol] = originalPiece;
    piece.row = originalRow;
    piece.col = originalCol;

    return isInCheck;
  }

  isSquareUnderAttack(row, col, attackerColor) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && piece.color === attackerColor) {
          if (piece.canMoveTo(row, col, this.board, this.enPassantTarget)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  makeMove(piece, targetRow, targetCol) {
    let capturedPiece = this.board[targetRow][targetCol];

    // التعامل مع التبييت
    if (piece.type === "king" && Math.abs(piece.col - targetCol) === 2) {
      const direction = targetCol > piece.col ? 1 : -1;
      const rookCol = direction === 1 ? 7 : 0;
      const newRookCol = piece.col + direction;
      const rook = this.board[piece.row][rookCol];

      // تحريك القلعة
      this.board[piece.row][rookCol] = null;
      this.board[piece.row][newRookCol] = rook;
      rook.col = newRookCol;
      rook.hasMoved = true;
    }

    // التعامل مع الأكل بالمرور
    if (piece.type === "pawn" && this.enPassantTarget && targetRow === this.enPassantTarget.row && targetCol === this.enPassantTarget.col) {
      const capturedPawnRow = piece.color === "white" ? targetRow + 1 : targetRow - 1;
      capturedPiece = this.board[capturedPawnRow][targetCol];
      this.board[capturedPawnRow][targetCol] = null;
    }

    // إضافة القطعة المأسورة
    if (capturedPiece) {
      this.capturedPieces[capturedPiece.color].push(capturedPiece);
    }

    // تحديث هدف الأكل بالمرور
    this.enPassantTarget = null;
    if (piece.type === "pawn" && Math.abs(piece.row - targetRow) === 2) {
      this.enPassantTarget = {
        row: (piece.row + targetRow) / 2,
        col: piece.col,
      };
    }

    // تسجيل الحركة
    const moveNotation = this.getMoveNotation(piece, targetRow, targetCol, capturedPiece);
    this.moveHistory.push(moveNotation);
    this.lastMove = { piece, from: { row: piece.row, col: piece.col }, to: { row: targetRow, col: targetCol } };

    // تحديث موقع القطعة
    this.board[piece.row][piece.col] = null;
    this.board[targetRow][targetCol] = piece;
    piece.row = targetRow;
    piece.col = targetCol;
    piece.hasMoved = true;

    // التحقق من ترقية الجندي
    if (piece.type === "pawn" && (targetRow === 0 || targetRow === 7)) {
      this.promotePawn(piece);
    }

    this.renderBoard();
    this.updateCapturedPieces();
  }

  promotePawn(pawn) {
    // عرض نافذة الترقية
    const modal = document.getElementById("promotion-modal");
    const piecesContainer = document.getElementById("promotion-pieces");

    piecesContainer.innerHTML = "";
    const promotionPieces = ["queen", "rook", "bishop", "knight"];

    promotionPieces.forEach((pieceType) => {
      const pieceElement = document.createElement("div");
      pieceElement.className = `promotion-piece ${pawn.color}-piece`;
      pieceElement.textContent = PIECES[pawn.color][pieceType];
      pieceElement.onclick = () => {
        pawn.type = pieceType;
        modal.style.display = "none";
        this.renderBoard();
      };
      piecesContainer.appendChild(pieceElement);
    });

    modal.style.display = "flex";
  }

  getMoveNotation(piece, targetRow, targetCol, capturedPiece) {
    const files = "abcdefgh";
    const ranks = "87654321";

    let notation = "";

    if (piece.type !== "pawn") {
      notation += piece.getSymbol();
    }

    if (capturedPiece) {
      if (piece.type === "pawn") {
        notation += files[piece.col];
      }
      notation += "x";
    }

    notation += files[targetCol] + ranks[targetRow];

    return notation;
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === "white" ? "black" : "white";
    this.updateDisplay();
    this.rotateBoard();

    // إذا كان الدور للكمبيوتر
    if (this.gameMode === "computer" && this.currentPlayer === "black" && this.gameStatus === "playing") {
      this.makeComputerMove();
    }
  }

  rotateBoard() {
    const boardElement = document.getElementById("chess-board");
    const gameContainer = document.querySelector(".game-container");
    const notification = document.getElementById("rotation-notification");

    // إظهار إشعار الدوران
    notification.style.display = "block";

    // إضافة تأثير بصري أثناء الدوران
    gameContainer.style.transform = "scale(0.95)";

    setTimeout(() => {
      if (this.currentPlayer === "black") {
        boardElement.classList.add("rotated");
      } else {
        boardElement.classList.remove("rotated");
      }

      // إعادة الحجم الطبيعي وإخفاء الإشعار
      setTimeout(() => {
        gameContainer.style.transform = "scale(1)";
        notification.style.display = "none";
      }, 500);
    }, 100);
  }

  checkGameStatus() {
    const isInCheck = this.isKingInCheck(this.currentPlayer);
    const hasValidMoves = this.hasValidMoves(this.currentPlayer);

    // إزالة تأثير الكش السابق
    this.clearCheckHighlight();

    if (isInCheck && !hasValidMoves) {
      this.gameStatus = "checkmate";
      const humanWon = this.gameMode === "computer" && this.currentPlayer === "black";
      document.getElementById("game-status").textContent = `Checkmate! ${this.currentPlayer === "white" ? "Black" : "White"} wins!`;
      this.highlightKingInCheck();

      if (typeof GamePix !== "undefined" && typeof GamePix.happyMoment === "function") {
        GamePix.happyMoment();
      }

      if (humanWon) {
        const result = this.recordPlayerWin();
        this.showWinOverlay(result);
      }
    } else if (!hasValidMoves) {
      this.gameStatus = "stalemate";
      document.getElementById("game-status").textContent = "Draw!";
    } else if (isInCheck) {
      document.getElementById("game-status").textContent = "Check!";
      this.highlightKingInCheck();
    } else {
      document.getElementById("game-status").textContent = "Ready to play";
    }
  }

 
  recordPlayerWin() {
    let level = parseInt(localStorage.getItem("chessPlayerLevel") || "0", 10);
    level += 1;
    localStorage.setItem("chessPlayerLevel", String(level));

    if (typeof GamePix !== "undefined" && typeof GamePix.updateLevel === "function") {
      GamePix.updateLevel(level);
    }

    const order = ["easy", "medium", "hard"];
    const completedDifficulty = this.difficulty;
    const currentIndex = order.indexOf(this.difficulty);
    const isMaxDifficulty = currentIndex === order.length - 1;

    if (!isMaxDifficulty) {
      this.difficulty = order[currentIndex + 1];
    }

    return { level, completedDifficulty, isMaxDifficulty };
  }

  getDifficultyLabel(difficulty = this.difficulty) {
    const labels = { easy: "Easy", medium: "Medium", hard: "Hard"};
    return labels[difficulty] || difficulty;
  }

  // بيظهر رسالة الفوز في نص الشاشة بدل شريط الحالة السفلي
  showWinOverlay(result) {
    const modal = document.getElementById("win-modal");
    const titleEl = document.getElementById("win-title");
    const subtitleEl = document.getElementById("win-subtitle");
    const nextBtn = document.getElementById("win-next-btn");
    if (!modal || !titleEl || !subtitleEl || !nextBtn) return;

    if (result.isMaxDifficulty) {
      titleEl.textContent = "👑 You are the Chess King!";
      subtitleEl.textContent = `You beat ${this.getDifficultyLabel(result.completedDifficulty)} — Level ${result.level}`;
      nextBtn.style.display = "none";
    } else {
      titleEl.textContent = `🎉 You won the ${this.getDifficultyLabel(result.completedDifficulty)} level!`;
      subtitleEl.textContent = `Level ${result.level} — next up: ${this.getDifficultyLabel()}`;
      nextBtn.style.display = "inline-block";
    }

    modal.style.display = "flex";
  }

  highlightKingInCheck() {
    // البحث عن الملك المهدد
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.type === "king" && piece.color === this.currentPlayer) {
          const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
          square.classList.add("king-in-check");
          break;
        }
      }
    }
  }

  clearCheckHighlight() {
    document.querySelectorAll(".king-in-check").forEach((square) => {
      square.classList.remove("king-in-check");
    });
  }

  isKingInCheck(color) {
    // البحث عن الملك
    let kingRow, kingCol;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.type === "king" && piece.color === color) {
          kingRow = row;
          kingCol = col;
          break;
        }
      }
    }

    return this.isSquareUnderAttack(kingRow, kingCol, color === "white" ? "black" : "white");
  }

  hasValidMoves(color) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color === color) {
          for (let targetRow = 0; targetRow < 8; targetRow++) {
            for (let targetCol = 0; targetCol < 8; targetCol++) {
              if (this.isValidMove(piece, targetRow, targetCol)) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  updateDisplay() {
    const playerElement = document.getElementById("current-player");
    playerElement.textContent = this.currentPlayer === "white" ? "⚪ White" : "⚫ Black";

    // تغيير لون خلفية اللاعب الحالي
    if (this.currentPlayer === "black") {
      playerElement.classList.add("black-turn");
    } else {
      playerElement.classList.remove("black-turn");
    }
  }

  updateCapturedPieces() {
    const whiteContainer = document.getElementById("captured-white");
    const blackContainer = document.getElementById("captured-black");

    whiteContainer.innerHTML = "";
    blackContainer.innerHTML = "";

    this.capturedPieces.white.forEach((piece) => {
      const pieceElement = document.createElement("span");
      pieceElement.className = "captured-piece white-piece";
      pieceElement.textContent = piece.getSymbol();
      whiteContainer.appendChild(pieceElement);
    });

    this.capturedPieces.black.forEach((piece) => {
      const pieceElement = document.createElement("span");
      pieceElement.className = "captured-piece black-piece";
      pieceElement.textContent = piece.getSymbol();
      blackContainer.appendChild(pieceElement);
    });

    // سكور اللاعب (الأبيض) = مجموع قيم القطع السوداء اللي أكلها
    const playerScore = this.capturedPieces.black.reduce((total, piece) => total + (PIECE_VALUES[piece.type] || 0), 0);
    if (typeof GamePix !== "undefined" && typeof GamePix.updateScore === "function") {
      GamePix.updateScore(playerScore);
    }
  }

  // منطق الذكاء الاصطناعي
  makeComputerMove() {
    if (this.isComputerThinking) return;

    this.isComputerThinking = true;
    document.getElementById("game-status").textContent = "Computer is thinking...";

    setTimeout(() => {
      const bestMove = this.getBestMove();
      if (bestMove) {
        const piece = this.board[bestMove.fromRow][bestMove.fromCol];
        this.makeMove(piece, bestMove.toRow, bestMove.toCol);
        this.clearSelection();
        this.switchPlayer();
        this.checkGameStatus();
      }
      this.isComputerThinking = false;
    }, 1000); // تأخير لإظهار أن الكمبيوتر يفكر
  }

  getBestMove() {
    const allMoves = this.getAllPossibleMoves("black");
    if (allMoves.length === 0) return null;

    switch (this.difficulty) {
      case "easy":
        return this.getRandomMove(allMoves);
      case "medium":
        return this.getMediumMove(allMoves);
      case "hard":
        return this.getHardMove(allMoves);
     
      
    }
  }

  getAllPossibleMoves(color) {
    const moves = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color === color) {
          for (let targetRow = 0; targetRow < 8; targetRow++) {
            for (let targetCol = 0; targetCol < 8; targetCol++) {
              if (this.isValidMove(piece, targetRow, targetCol)) {
                moves.push({
                  fromRow: row,
                  fromCol: col,
                  toRow: targetRow,
                  toCol: targetCol,
                  piece: piece,
                });
              }
            }
          }
        }
      }
    }
    return moves;
  }

  getRandomMove(moves) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  getMediumMove(moves) {
    // أولوية للحركات التي تأكل قطع
    const captureMoves = moves.filter((move) => this.board[move.toRow][move.toCol] !== null);

    if (captureMoves.length > 0) {
      return captureMoves[Math.floor(Math.random() * captureMoves.length)];
    }

    return this.getRandomMove(moves);
  }

  getHardMove(moves) {
    let bestMove = null;
    let bestScore = -Infinity;

    for (const move of moves) {
      const score = this.evaluateMove(move);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove || this.getRandomMove(moves);
  }

  evaluateMove(move) {
    let score = 0;

    // نقاط أكل القطع
    const targetPiece = this.board[move.toRow][move.toCol];
    if (targetPiece) {
      score += PIECE_VALUES[targetPiece.type] || 0;
    }

    // نقاط التحكم في المركز
    const centerSquares = [
      [3, 3],
      [3, 4],
      [4, 3],
      [4, 4],
    ];
    if (centerSquares.some(([r, c]) => r === move.toRow && c === move.toCol)) {
      score += 0.5;
    }

    return score;
  }

}

// متغير اللعبة العام
let game;

// متغير شكل المربعات
let currentSquareStyle = "classic";

// تهيئة اللعبة عند تحميل الصفحة
window.onload = function () {
  showModeSelection();
  setSquareStyle("classic");
};

// دوال التحكم في القوائم
function showModeSelection() {
  document.getElementById("game-mode-selection").style.display = "block";
  document.getElementById("difficulty-selection").style.display = "none";
  document.getElementById("game-content").classList.remove("active");
  const header = document.getElementById("game-header");
  if (header) header.style.display = "";
}

function showDifficultySelection() {
  document.getElementById("game-mode-selection").style.display = "none";
  document.getElementById("difficulty-selection").style.display = "block";
}

function startFriendGame() {
  game = new ChessGame("friend");
  startGame();
}

function startComputerGame(difficulty) {
  game = new ChessGame("computer", difficulty);
  startGame();
}

function startGame() {
  document.getElementById("game-mode-selection").style.display = "none";
  document.getElementById("difficulty-selection").style.display = "none";
  document.getElementById("game-content").classList.add("active");
  const header = document.getElementById("game-header");
  if (header) header.style.display = "none";
  requestAnimationFrame(fitBoardSize);
}

function backToMenu() {
  const content = document.getElementById("game-content");
  if (content) content.classList.remove("board-only");
  showModeSelection();
}

// وضع "عرض الرقعة فقط" - يخفي كل شيء غير رقعة الشطرنج ليضمن ظهور اللعبة كاملة دون أي تمرير
function toggleBoardOnly() {
  const content = document.getElementById("game-content");
  if (content) content.classList.toggle("board-only");
  requestAnimationFrame(fitBoardSize);
}

// دالة تغيير شكل المربعات
function setSquareStyle(style) {
  currentSquareStyle = style;

  // إزالة جميع أنماط المربعات
  const board = document.getElementById("chess-board");
  board.classList.remove("squares-classic", "squares-rounded");

  // إضافة النمط الجديد
  board.classList.add(`squares-${style}`);

  // تحديث الأزرار
  document.querySelectorAll(".frame-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.querySelector(`[data-frame="${style}"]`).classList.add("active");
}

// وظيفة إعادة تشغيل اللعبة
function resetGame() {
  if (game) {
    const gameMode = game.gameMode;
    const difficulty = game.difficulty;
    game = new ChessGame(gameMode, difficulty);
  }
}

// زرار "المستوى الجاي" في نافذة الفوز: يقفل النافذة ويبدأ لعبة جديدة
// بالصعوبة الأصعب (اتخزنت بالفعل في game.difficulty)
function advanceToNextDifficulty() {
  document.getElementById("win-modal").style.display = "none";
  resetGame();
}

function closeWinModal() {
  document.getElementById("win-modal").style.display = "none";
}

// إغلاق نافذة الترقية عند النقر خارجها
document.getElementById("promotion-modal").addEventListener("click", function (e) {
  if (e.target === this) {
    this.style.display = "none";
  }
});

// إغلاق نافذة الفوز عند النقر خارجها
document.getElementById("win-modal").addEventListener("click", function (e) {
  if (e.target === this) {
    this.style.display = "none";
  }
});

// إضافة أصوات للحركات (اختياري)
function playMoveSound() {
  // يمكن إضافة ملف صوتي هنا
}

// إضافة اختصارات لوحة المفاتيح
document.addEventListener("keydown", function (e) {
  if (e.key === "r" || e.key === "R") {
    resetGame();
  }
  if (e.key === "Escape") {
    if (game && game.selectedSquare) {
      game.clearSelection();
    }
  }
});

// حساب مقاس رقعة الشطرنج بدقة بناءً على المساحة الفعلية المتاحة (وليس تقدير تقريبي)
// لضمان ظهور اللعبة بالكامل دون أي تمرير (scroll) داخل الـ iframe مهما كان مقاسه
function fitBoardSize() {
  const content = document.getElementById("game-content");
  if (!content || !content.classList.contains("active")) return;

  const vw = window.innerWidth;

  if (content.classList.contains("board-only")) {
    const vh = window.innerHeight;
    const size = Math.max(120, Math.min(vh, vw) * 0.94);
    document.documentElement.style.setProperty("--board-size", size + "px");
    return;
  }

  // نستخدم الارتفاع الفعلي المتاح لـ game-content (بعد ما الفليكس بتاعه
  // بياخد في الاعتبار عنوان اللعبة وباقي العناصر اللي فوقه تلقائيًا)
  const contentRect = content.getBoundingClientRect();

  const topControls = document.querySelector(".top-controls");
  const topControlsHeight = topControls ? topControls.getBoundingClientRect().height : 0;

  const infoBar = document.querySelector(".game-info-bar");
  const infoBarStyle = getComputedStyle(infoBar);
  const infoBarHeight =
    infoBar.getBoundingClientRect().height +
    parseFloat(infoBarStyle.marginTop) +
    parseFloat(infoBarStyle.marginBottom);

  const boardArea = document.querySelector(".board-area");
  const boardAreaGap = parseFloat(getComputedStyle(boardArea).gap) || 0;
  const sidePanel = document.querySelector(".captured-white");
  const sidePanelWidth = sidePanel ? sidePanel.getBoundingClientRect().width : 0;

  const containerStyle = getComputedStyle(document.getElementById("game-container"));
  const padH = parseFloat(containerStyle.paddingLeft) + parseFloat(containerStyle.paddingRight);

  const safetyMargin = 6;
  const availableHeight = contentRect.height - topControlsHeight - infoBarHeight - safetyMargin;
  const availableWidth = vw - padH - sidePanelWidth * 2 - boardAreaGap * 2 - safetyMargin;

  const size = Math.max(100, Math.min(640, availableHeight, availableWidth));
  document.documentElement.style.setProperty("--board-size", size + "px");
}

window.addEventListener("resize", fitBoardSize);
window.addEventListener("orientationchange", fitBoardSize);
window.addEventListener("load", fitBoardSize);
document.addEventListener("DOMContentLoaded", fitBoardSize);

// ---- GamePix SDK integration ----

// Prevent the page from scrolling on arrow keys / space so it doesn't
// interfere with normal play.
window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", " "].includes(event.key)) {
    event.preventDefault();
  }
});
window.addEventListener("wheel", (event) => event.preventDefault(), {
  passive: false,
});

// Tell GamePix the game has finished loading and is ready to play.
window.addEventListener("load", () => {
  if (typeof GamePix !== "undefined" && typeof GamePix.loaded === "function") {
    GamePix.loaded();
  }
});
