import express from "express";

const app = express();
const port = 3000;

const getData = (req, res) => {
    res.send({ message: `Provided data: ${JSON.stringify(req.body)}` });
}

app.post('/get-data', getData);

app.listen(port, () => {
    console.log(`Server listening to http://localhost:${port}`);
})

export default getData;