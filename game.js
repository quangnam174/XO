document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");
    const message = document.getElementById("message");
    const overlay = document.getElementById("overlay");
    const winnerMessage = document.getElementById("winner-message");
    const startOverlay = document.getElementById("start-overlay");
    const startBtn = document.getElementById("start-btn");
    const resetBtn = document.getElementById("reset-btn");
    let currentPlayer = "X";
    let gameActive = false; // Bắt đầu trò chơi chưa hoạt động
    let gameState = Array(10000).fill("");
    let turnTimeout;
    let turnInterval;
    let xTimeLeft = 30;
    let oTimeLeft = 30;
    let gameEnded = false;
    let visibilityTimeouts = []; // Mảng lưu trữ các timeout

    // Hiển thị overlay bắt đầu trò chơi khi trang được tải
    startOverlay.classList.add("active");

    function checkForWin(gameState, player) {
        // Chuyển đổi gameState sang ma trận 2D để dễ dàng kiểm tra
        let matrix = [];
        for (let i = 0; i < 100; i++) {
            matrix[i] = gameState.slice(i * 100, (i + 1) * 100);
        }

        // Kiểm tra hàng ngang
        for (let i = 0; i < 100; i++) {
            for (let j = 0; j <= 96; j++) {
                if (matrix[i][j] === player && matrix[i][j + 1] === player &&
                    matrix[i][j + 2] === player && matrix[i][j + 3] === player &&
                    matrix[i][j + 4] === player) {
                    return [i * 100 + j, i * 100 + j + 1, i * 100 + j + 2, i * 100 + j + 3, i * 100 + j + 4];
                }
            }
        }

        // Kiểm tra cột dọc
        for (let i = 0; i <= 96; i++) {
            for (let j = 0; j < 100; j++) {
                if (matrix[i][j] === player && matrix[i + 1][j] === player &&
                    matrix[i + 2][j] === player && matrix[i + 3][j] === player &&
                    matrix[i + 4][j] === player) {
                    return [i * 100 + j, (i + 1) * 100 + j, (i + 2) * 100 + j, (i + 3) * 100 + j, (i + 4) * 100 + j];
                }
            }
        }

        // Kiểm tra đường chéo từ trái sang phải
        for (let i = 0; i <= 96; i++) {
            for (let j = 0; j <= 96; j++) {
                if (matrix[i][j] === player && matrix[i + 1][j + 1] === player &&
                    matrix[i + 2][j + 2] === player && matrix[i + 3][j + 3] === player &&
                    matrix[i + 4][j + 4] === player) {
                    return [i * 100 + j, (i + 1) * 100 + j + 1, (i + 2) * 100 + j + 2, (i + 3) * 100 + j + 3, (i + 4) * 100 + j + 4]
                }
            }
        }

        // Kiểm tra đường chéo từ phải sang trái
        for (let i = 0; i <= 96; i++) {
            for (let j = 4; j < 100; j++) {
                if (matrix[i][j] === player && matrix[i + 1][j - 1] === player &&
                    matrix[i + 2][j - 2] === player && matrix[i + 3][j - 3] === player &&
                    matrix[i + 4][j - 4] === player) {
                    return [i * 100 + j, (i + 1) * 100 + j - 1, (i + 2) * 100 + j - 2, (i + 3) * 100 + j - 3, (i + 4) * 100 + j - 4];
                }
            }
        }

        return null;
    }

    function handleCellClick(event) {
        const clickedCell = event.target;
        const clickedCellIndex = Array.from(board.children).indexOf(clickedCell);

        if (gameState[clickedCellIndex] !== "" || !gameActive) {
            return;
        }

        handleCellPlayed(clickedCell, clickedCellIndex);
        handleResultValidation();
    }

    function handleCellPlayed(clickedCell, index) {
        if (gameEnded) return; // Dừng nếu trò chơi đã kết thúc

        gameState[index] = currentPlayer;
        const playerToDisplay = currentPlayer; // Lưu lại người chơi hiện tại
        clickedCell.innerText = playerToDisplay;
        clickedCell.classList.add("played");

        const initialTimeout = setTimeout(() => {
            if (gameEnded) return; // Dừng nếu trò chơi đã kết thúc
            clickedCell.innerText = "";
            function toggleVisibility() {
                const visibilityOffTimeout = setTimeout(() => {
                    if (gameEnded) return; // Dừng nếu trò chơi đã kết thúc
                    clickedCell.innerText = playerToDisplay; // Sử dụng giá trị lưu lại
                    const visibilityOnTimeout = setTimeout(() => {
                        if (gameEnded) return; // Dừng nếu trò chơi đã kết thúc
                        clickedCell.innerText = "";
                        toggleVisibility();
                    }, 5000);
                    visibilityTimeouts.push(visibilityOnTimeout);
                }, 15000);
                visibilityTimeouts.push(visibilityOffTimeout);
            }
            toggleVisibility();
        }, 10000);
        visibilityTimeouts.push(initialTimeout);

        clearTimeout(turnTimeout);
        clearInterval(turnInterval);
        startTurnTimeout();
    }

    function startTurnTimeout() {
        clearInterval(turnInterval);

        if (currentPlayer === "X") {
            xTimeLeft = 30;
        } else {
            oTimeLeft = 30;
        }

        updateTimerDisplay();

        turnInterval = setInterval(() => {
            if (currentPlayer === "X") {
                xTimeLeft--;
            } else {
                oTimeLeft--;
            }

            updateTimerDisplay();

            if (xTimeLeft === 0 || oTimeLeft === 0) {
                clearInterval(turnInterval);
                clearTimeout(turnTimeout);
                gameActive = false;
                showOverlay(`Người chơi ${currentPlayer === "X" ? "O" : "X"} đã thắng do hết thời gian`, false); // Không trì hoãn
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        document.getElementById("x-timer").innerText = `X: ${xTimeLeft}s`;
        document.getElementById("o-timer").innerText = `O: ${oTimeLeft}s`;
    }

    function handleResultValidation() {
        const winningCombination = checkForWin(gameState, currentPlayer);

        if (winningCombination) {
            gameEnded = true;
            message.innerText = `Người chơi ${currentPlayer} đã chiến thắng`;
            gameActive = false;

            clearTimeout(turnTimeout);
            clearInterval(turnInterval);

            // Đặt đồng hồ về 30
            xTimeLeft = 30;
            oTimeLeft = 30;
            updateTimerDisplay();

            highlightWinningCells(winningCombination);
            showOverlay(`Người chơi ${currentPlayer} đã chiến thắng`, true); // Truyền delay
            return;
        }

        if (!gameState.includes("")) {
            message.innerText = "Hòa";
            gameEnded = true;
            gameActive = false;
            showOverlay("Hòa", true); // Truyền delay
            return;
        }

        currentPlayer = currentPlayer === "X" ? "O" : "X";
        message.innerText = `It's ${currentPlayer}'s turn`;
        startTurnTimeout();
    }


    function highlightWinningCells(winningCombination) {
        winningCombination.forEach(index => {
            board.children[index].classList.add("highlight");
            board.children[index].classList.remove("play");
            board.children[index].innerText = gameState[index];
        });

        Array.from(board.children).forEach((cell, index) => {
            if (gameState[index]) {
                cell.innerText = gameState[index];
            }
        });
    }

    function showOverlay(text, delay) {
        if (delay) {
            setTimeout(() => {
                winnerMessage.innerText = text;
                overlay.classList.add("active");
            }, 3000);
        } else {
            winnerMessage.innerText = text;
            overlay.classList.add("active");
        }
    }

    function resetGame() {
        currentPlayer = "X";
        gameActive = false; // Trò chơi chưa bắt đầu
        gameEnded = false; // Đặt lại cờ báo hiệu trò chơi kết thúc
        gameState = Array(10000).fill("");
        message.innerText = `It's ${currentPlayer}'s turn`;
        overlay.classList.remove("active");
        startOverlay.classList.remove("active"); // Ẩn overlay bắt đầu trò chơi
    
        visibilityTimeouts.forEach(timeout => clearTimeout(timeout));
        visibilityTimeouts = [];
    
        Array.from(board.children).forEach(cell => {
            cell.innerText = "";
            cell.classList.remove("highlight");
            cell.classList.remove("played");
        });
    
        clearTimeout(turnTimeout);
        clearInterval(turnInterval);
        xTimeLeft = 30;
        oTimeLeft = 30;
        updateTimerDisplay();
    
        // Gọi hàm startGame() để bắt đầu trò chơi ngay lập tức
        startGame();
    }
    
    

    function startGame() {
        gameActive = true;
        startOverlay.classList.remove("active"); 
        startTurnTimeout();
    }

    function createBoard() {
        for (let i = 0; i < 10000; i++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.addEventListener("click", handleCellClick);

            board.appendChild(cell);
        }
    }

    createBoard();
    message.innerText = `It's ${currentPlayer}'s turn`;

    startBtn.addEventListener("click", startGame); 
    resetBtn.addEventListener("click", resetGame);

    updateTimerDisplay();
});
