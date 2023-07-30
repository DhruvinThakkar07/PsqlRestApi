const express = require("express");
const client = require("./db");
const bodyParser = require("body-parser");

const app = express();
app.use(express.json());
app.use(bodyParser.json());

client.connect();

app.get("/table", (req, res) => {
    const query = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';";
  
    client.query(query, (e, r, f) => {
      if (e) {
        res.send(e);
      } else {
        const tables = r.rows.map((row) => row.table_name);
        res.send(tables);
      }
    });
  });

  app.get("/table/:tableName", (req, res) => {
    const { tableName } = req.params;
  
    const query = `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1;`;
  
    client.query(query, [tableName], (e, r, f) => {
      if (e) {
        res.send(e);
      } else {
        const schema = r.rows;
        res.send(schema);
      }
    });
  });
  

app.get("/table/:tableName/data", (req, res)=>{
    const selectFields = req.query.select;
    const filterFields = req.query.filter;
    const selectClause = selectFields ? selectFields : "*";
    const whereClause = filterFields ? `WHERE ${filterFields}` : "";
    client.query(`SELECT ${selectClause} FROM ${req.params.tableName} ${whereClause}`, (e, r, f)=>{
        if(e){
            res.send(e);
        }
        else{
            res.send(r.rows);
        }
    });
    // client.end;
});

app.post("/table/:tableName/data", (req, res)=>{
  const data = req.body;
  const columns = Object.keys(data).join(", ");
  const values = Object.values(data).map((val)=>`'${val}'`).join(", ");
  const query = `INSERT INTO ${req.params.tableName} (${columns}) VALUES (${values});`;
  console.log(query);
    client.query(query, (e, r)=>{
        if(e){
            res.send(e);
        }
        else{
            res.send("Successfully inserted");
        }
    });
    // client.end;
});

app.put("/table/:tableName/data", (req, res)=>{
    const updateFields = req.body;
    const filterFields = req.query.filter;
    const whereClause = filterFields ? `WHERE ${filterFields}` : "";
    const updateClause = Object.entries(updateFields).map(([key, value])=>`${key}='${value}'`).join(", ");
    client.query(`UPDATE ${req.params.tableName} SET ${updateClause} ${whereClause}`, (e, r, f)=>{
        if(e){
            res.send(e);
        }
        else{
            res.send("Successfully updated");
        }
    });
    // client.end;
});

app.delete('/table/:tableName/data', (req, res)=> {
    const filterFields = req.query.filter;
    const whereClause = filterFields ? `WHERE ${filterFields}` : "";
    client.query(`DELETE FROM ${req.params.tableName} ${whereClause}`, (e, r, f)=>{
        if(e){
            res.send(e)
        }
        else{
          res.send('Deleted successfully');
        }
    });
    // client.end;
});

app.listen(3000, (req, res)=>{
  console.log("Listening to port 3000...");
});