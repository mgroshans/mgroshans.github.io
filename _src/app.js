var express = require('express');
var app = express();


app.use(express.static('../', {
        extensions: ['html', 'ico']
    }));
app.listen(8080);
