import { useEffect, useState } from "react";

const NUM_ROWS = 3;
const NUM_COLS = 3;
const X_CHAR = "X";
const O_CHAR = "O";
const TIMES_CONTINUOS_WIN = 3;

function deepCopy2DArray(arr) {
  if (!Array.isArray(arr)) {
    return arr;
  }

  const copy = [];

  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      copy.push(deepCopy2DArray(arr[i]));
    } else {
      copy.push(arr[i]);
    }
  }

  return copy;
}

function Square({ value, onSquareClick, isHighlight }) {
  return (
    <button
      className={isHighlight ? "square square-highlight" : "square"}
      style={{
        cursor: "pointer",
      }}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  const [isWinner, setIsWinner] = useState(false);
  const [arrayIndexHighLight, setArrayIndexHighLight] = useState(null);
  const [isDraw, setIsDraw] = useState(false);

  function handleClick(indexRow, indexCol) {
    if (isWinner || squares[indexRow][indexCol]) {
      return;
    }

    const nextSquares = deepCopy2DArray(squares);
    if (xIsNext) {
      nextSquares[indexRow][indexCol] = "X";
    } else {
      nextSquares[indexRow][indexCol] = "O";
    }
    onPlay(nextSquares, [indexRow, indexCol]);

    const winner = calculateWinner(nextSquares);

    setIsWinner(winner.isWin);
    setArrayIndexHighLight(winner.arrayIndexHighLight);
    setIsDraw(checkDraw(nextSquares));
  }

  useEffect(() => {
    const winner = calculateWinner(squares);
    setIsWinner(winner.isWin);
    setArrayIndexHighLight(winner.arrayIndexHighLight);
  }, [squares]);

  let status;
  if (isWinner) {
    status = "Winner: " + (xIsNext ? "O" : "X");
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  if (isDraw) {
    status = "Result: Draw";
  }

  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        {squares.map((eleRow, _indexRow) => (
          <div key={_indexRow}>
            {eleRow.map((eleCol, _indexCol) => (
              <Square
                value={eleCol}
                key={_indexCol}
                onSquareClick={() => handleClick(_indexRow, _indexCol)}
                isHighlight={
                  arrayIndexHighLight
                    ? checkIsHighlight(
                        arrayIndexHighLight,
                        _indexRow,
                        _indexCol
                      )
                    : false
                }
              />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([initSquares(NUM_ROWS, NUM_COLS)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const [currentSquares, setCurrentSquares] = useState(history[currentMove]);
  const [isASC, setIsASC] = useState(true);
  const [moves, setMoves] = useState();
  const [moveHistory, setMoveHistory] = useState([]);

  function handlePlay(nextSquares, positionMove) {
    setHistory((pre) => [...pre, nextSquares]);
    setCurrentMove(history.length);
    setCurrentSquares(nextSquares);
    setMoveHistory((pre) => [...pre, positionMove]);
  }

  function jumpTo(move) {
    setCurrentMove(move);
    setCurrentSquares(history[move]);
  }

  useEffect(() => {
    const movesTemp = history.map((squares, _indexMove) => {
      let description;
      description = isASC
        ? `Go to move #${_indexMove}`
        : `Go to move #${history.length - 1 - _indexMove}`;

      if (description.includes("#0")) {
        description = "Go to game start";
      } else {
        description = isASC
          ? `${description}: (${moveHistory[_indexMove - 1]})`
          : `${description}: (${moveHistory[history.length - _indexMove - 2]})`;
      }

      return (
        <li key={isASC ? _indexMove : history.length - _indexMove - 1}>
          <button
            onClick={() =>
              jumpTo(isASC ? _indexMove : history.length - _indexMove - 1)
            }
          >
            {description}
          </button>
        </li>
      );
    });

    setMoves(movesTemp);
  }, [isASC, history]);

  function toggleButton() {
    setIsASC(!isASC);
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <div>
          {currentMove === 0
            ? "You are at game start"
            : `You are at move #${currentMove}`}
        </div>
        <div>
          <button style={{ cursor: "pointer" }} onClick={toggleButton}>
            {isASC ? "ASC" : "DESC"}
          </button>
        </div>
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  let isWin = false;
  let arrayIndexHighLight = null;

  squares.forEach((row, _index) => {
    const colEle = squares.map((rowEle) => rowEle[_index]);
    const diagonalLineRight = squares.map(
      (rowEle, rowEleIndex) => rowEle[rowEleIndex]
    );
    const diagonalLineLeft = squares.map(
      (rowEle, rowEleIndex) => rowEle[squares.length - 1 - rowEleIndex]
    );

    if (checkWinner(row)) {
      arrayIndexHighLight = [
        [_index, 0],
        [_index, 1],
        [_index, 2],
      ];
      isWin = true;
    }

    if (checkWinner(colEle)) {
      arrayIndexHighLight = [
        [0, _index],
        [1, _index],
        [2, _index],
      ];
      isWin = true;
    }

    if (checkWinner(diagonalLineRight)) {
      arrayIndexHighLight = [
        [0, 0],
        [1, 1],
        [2, 2],
      ];
      isWin = true;
    }

    if (checkWinner(diagonalLineLeft)) {
      arrayIndexHighLight = [
        [0, 2],
        [1, 1],
        [2, 0],
      ];
      isWin = true;
    }
  });

  return {
    arrayIndexHighLight,
    isWin,
  };
}

function checkWinner(array, type) {
  const convertArray = array.join("");
  if (
    convertArray.includes(X_CHAR.repeat(TIMES_CONTINUOS_WIN)) ||
    convertArray.includes(O_CHAR.repeat(TIMES_CONTINUOS_WIN))
  ) {
    return true;
  }

  return false;
}

function checkIsHighlight(arrayIndexHighLight, indexRow, indexCol) {
  let isHighlight = false;
  for (let i = 0; i < arrayIndexHighLight.length; i++) {
    if (
      arrayIndexHighLight[i][0] === indexRow &&
      arrayIndexHighLight[i][1] === indexCol
    ) {
      isHighlight = true;
    }
  }

  return isHighlight;
}

function initSquares(numRows, numCols) {
  let squares = new Array(numRows);

  for (let i = 0; i < numRows; i++) {
    squares[i] = new Array(numCols).fill(null);
  }

  return squares;
}

function checkDraw(squares) {
  const flatArray = squares.flat();
  const isNullExists = flatArray.includes(null);

  return !isNullExists;
}
