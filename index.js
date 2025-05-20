const fs = require("fs");
const readline = require("readline");
const matrixOps = require("./sub");

function displayHeader() {
  console.log("==================================================");
  console.log("             WELCOME TO MATRIX TOOL               ");
  console.log("==================================================");
}

function showDivider() {
  console.log("--------------------------------------------------");
}

function promptUserChoice() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log("\nAvailable Operations:");
    console.log("1. Matrix Addition");
    console.log("2. Matrix Subtraction");
    console.log("3. Matrix Multiplication");
    console.log("4. Exit");

    rl.question("Please select an option (1-4): ", (input) => {
      rl.close();
      resolve(input.trim());
    });
  });
}

function displayOutput(opType, matrixResult) {
  console.log("\n================= OUTPUT =================");
  console.log(`Action Performed: ${opType.toUpperCase()}`);
  console.log("------------------------------------------");
  console.log(matrixResult);
  console.log("==========================================\n");
}

async function runMatrixTool() {
  displayHeader();

  console.log("\nReading matrix data files...");
  const matA = matrixOps.importMatrix("matrixfile1.txt");
  const matB = matrixOps.importMatrix("matrixfile3.txt");
  const matB_T = matrixOps.transposeMatrix(matB);
  console.log("Matrices loaded successfully!");

  while (true) {
    showDivider();

    const input = await promptUserChoice();

    showDivider();

    let resultMatrix;
    let selectedOp;

    switch (input) {
      case "1":
        selectedOp = "Addition";
        resultMatrix = matrixOps.addMatrices(matA, matB);
        break;
      case "2":
        selectedOp = "Subtraction";
        resultMatrix = matrixOps.subtractMatrices(matA, matB);
        break;
      case "3":
        selectedOp = "Multiplication";
        resultMatrix = matrixOps.multiplyMatrices(matA, matB_T);
        break;
      case "4":
        console.log("Exiting the Matrix Tool. Goodbye!");
        console.log("==================================================");
        return;
      default:
        console.warn("⚠️ Invalid input. Please enter a number between 1 and 4.");
        continue;
    }

    console.log("Calculating result...");
    displayOutput(selectedOp, resultMatrix);
  }
}

runMatrixTool();
