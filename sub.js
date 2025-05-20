const fs = require("fs");

class SparseMatrixHandler {
  static loadFromFile(filePath) {
    const matrix = { rows: 0, cols: 0, entries: [] };

    try {
      const lines = fs.readFileSync(filePath, "utf-8").split("\n");
      matrix.rows = parseInt(lines[0].split("=")[1]);
      matrix.cols = parseInt(lines[1].split("=")[1]);

      const pattern = /^\(\s*-?\d+\s*,\s*-?\d+\s*,\s*-?\d+\s*\)$/;

      for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (!pattern.test(line)) {
          throw new Error(`Invalid format on line ${i + 1}`);
        }

        const [row, col, value] = line
          .slice(1, -1)
          .split(",")
          .map((s) => parseInt(s.trim()));

        matrix.entries.push({ row, col, value });
      }

      return matrix;
    } catch (err) {
      console.error(`Error reading matrix file: ${err.message}`);
      throw new Error("Matrix file processing failed");
    }
  }

  static applyBinaryOperation(matA, matB, operationFn) {
    if (matA.rows !== matB.rows || matA.cols !== matB.cols) {
      throw new Error("Matrix dimension mismatch");
    }

    const output = {
      rows: matA.rows,
      cols: matA.cols,
      entries: []
    };

    const mapB = new Map(matB.entries.map(({ row, col, value }) => [`${row},${col}`, value]));

    const handleEntry = (entry, isFromA = true) => {
      const key = `${entry.row},${entry.col}`;
      const bVal = isFromA ? mapB.get(key) ?? 0 : 0;
      const resultVal = isFromA ? operationFn(entry.value, bVal) : operationFn(0, entry.value);

      if (resultVal !== 0) {
        output.entries.push({ row: entry.row, col: entry.col, value: resultVal });
      }

      if (isFromA) mapB.delete(key);
    };

    matA.entries.forEach((e) => handleEntry(e));
    matB.entries.forEach((e) => {
      if (mapB.has(`${e.row},${e.col}`)) handleEntry(e, false);
    });

    return output;
  }

  static add(matA, matB) {
    return this.applyBinaryOperation(matA, matB, (a, b) => a + b);
  }

  static subtract(matA, matB) {
    return this.applyBinaryOperation(matA, matB, (a, b) => a - b);
  }

  static multiply(matA, matB) {
    if (matA.cols !== matB.rows) {
      throw new Error("Matrix multiplication not possible: column/row mismatch");
    }

    const result = {
      rows: matA.rows,
      cols: matB.cols,
      entries: []
    };

    const bByRow = matB.entries.reduce((acc, { row, col, value }) => {
      acc[row] = acc[row] || {};
      acc[row][col] = value;
      return acc;
    }, {});

    const resultMap = new Map();

    matA.entries.forEach(({ row: rA, col: cA, value: vA }) => {
      const bRow = bByRow[cA];
      if (!bRow) return;

      for (const [cB, vB] of Object.entries(bRow)) {
        const key = `${rA},${cB}`;
        const prevVal = resultMap.get(key) || 0;
        resultMap.set(key, prevVal + vA * vB);
      }
    });

    for (const [coord, value] of resultMap.entries()) {
      if (value !== 0) {
        const [row, col] = coord.split(",").map(Number);
        result.entries.push({ row, col, value });
      }
    }

    return result;
  }

  static transpose(matrix) {
    return {
      rows: matrix.cols,
      cols: matrix.rows,
      entries: matrix.entries.map(({ row, col, value }) => ({
        row: col,
        col: row,
        value
      }))
    };
  }
}

module.exports = {
  importMatrix: SparseMatrixHandler.loadFromFile,
  addMatrices: SparseMatrixHandler.add,
  subtractMatrices: SparseMatrixHandler.subtract,
  multiplyMatrices: SparseMatrixHandler.multiply,
  transposeMatrix: SparseMatrixHandler.transpose
};
