function myFunc() {
  console.log("RUNNING");
}

console.log("BEGIN");

setTimeout(() => console.log("RUNNING"), 1500);

console.log("END");
