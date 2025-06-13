let express = require("express");
let ex = express();
let path = require("path");

let port = 23239;
console.log('song shen');

let server = ex.listen(port, () => {
  let port = server.address().port;
  console.log(`server started on ${port}`);
})