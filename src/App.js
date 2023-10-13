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

function Board({
  xIsNext,
  squares,
  onPlay,
  getNewestSquare,
  setNewestCurrentMove,
}) {
  const [isWinner, setIsWinner] = useState(false);
  const [arrayIndexHighLight, setArrayIndexHighLight] = useState(null);
  const [isDraw, setIsDraw] = useState(false);

  function handleClick(indexRow, indexCol) {
    if (isWinner || squares[indexRow][indexCol]) {
      return;
    }

    if (calculateWinner(getNewestSquare()).isWin) {
      setNewestCurrentMove();
      return;
    }

    const newestSquare = getNewestSquare();
    const nextSquares = deepCopy2DArray(newestSquare);
    if (xIsNext) {
      nextSquares[indexRow][indexCol] = X_CHAR;
    } else {
      nextSquares[indexRow][indexCol] = O_CHAR;
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
    status = "Winner: " + (xIsNext ? O_CHAR : X_CHAR);
  } else {
    status = "Next player: " + (xIsNext ? X_CHAR : O_CHAR);
  }

  if (isDraw) {
    status = "Result: Draw";
  }

  useEffect(() => {
    if (isWinner) {
      status = "Winner: " + (xIsNext ? O_CHAR : X_CHAR);
    } else {
      status = "Next player: " + (xIsNext ? X_CHAR : O_CHAR);
    }

    if (isDraw) {
      status = "Result: Draw";
    }
  }, [squares]);

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
  const [moves, setMoves] = useState([]);
  const [moveHistory, setMoveHistory] = useState([]);

  useEffect(() => {
    const movesTemp = generateMoves();

    setMoves(sortMoves(movesTemp, isASC));
  }, [history]);

  useEffect(() => {}, [setMoves, isASC]);

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

  function setNewestCurrentMove() {
    setCurrentMove(history.length);
    setCurrentSquares(getNewestSquare());
  }

  function getNewestSquare() {
    return history[history.length - 1];
  }

  function generateMoves() {
    return history.map((squares, _indexMove) => {
      let description;

      if (_indexMove === currentMove) {
        description = `You are at move #${currentMove}`;
      } else {
        description = isASC
          ? `Go to move #${_indexMove}`
          : `Go to move #${history.length - 1 - _indexMove}`;
      }

      if (description.includes("#0")) {
        description = "Go to game start";
      } else {
        description = isASC
          ? `${description}: (${moveHistory[_indexMove - 1]})`
          : `${description}: (${moveHistory[history.length - _indexMove - 2]})`;
      }

      return {
        description,
        order: _indexMove,
      };
    });
  }

  async function toggleButton() {
    setIsASC(!isASC);
    const movesTemp = sortMoves(moves, !isASC);
    setMoves(movesTemp);
  }

  function sortMoves(array, isAscendent) {
    return array.sort((a, b) =>
      isAscendent ? a.order - b.order : b.order - a.order
    );
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
          getNewestSquare={getNewestSquare}
          setNewestCurrentMove={setNewestCurrentMove}
        />
      </div>
      <div className="game-info">
        <div>
          <button style={{ cursor: "pointer" }} onClick={toggleButton}>
            {isASC ? "ASC" : "DESC"}
          </button>
        </div>
        <ol>
          {moves.length !== 0 &&
            moves.map((move) =>
              move.description.includes("are at move") ? (
                <li key={move.order}>
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => jumpTo(move.order)}
                  >
                    {move.description}
                  </div>
                </li>
              ) : (
                <li key={move.order}>
                  <button onClick={() => jumpTo(move.order)}>
                    {move.description}
                  </button>
                </li>
              )
            )}
        </ol>
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
