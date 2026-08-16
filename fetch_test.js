const url = "https://docs.google.com/spreadsheets/d/1m5ft9l56LbdkBuIJp44H1YWKSevuZsP2ucIG7RQxz2E/gviz/tq?tqx=out:json&gid=0&nocache=" + Date.now();
fetch(url)
  .then(r => r.text())
  .then(text => {
    const jsonStr = text.replace(/^[^(]+\(/, '').replace(/\);?\s*$/, '');
    const data = JSON.parse(jsonStr);
    console.log(JSON.stringify(data.table.cols, null, 2));
    console.log(JSON.stringify(data.table.rows[0], null, 2));
    console.log(JSON.stringify(data.table.rows[1], null, 2));
  })
  .catch(console.error);
