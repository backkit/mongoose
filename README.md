# mongoose

### install & autoconfigure

```
npm install --save @backkit/mongoose
```

### prefered way to connect 1.0.0+

with auth

```
url: mongodb+srv://YOUR_HOST
db: YOUR_DB
user: YOUR_USER
pass: YOUR_PASSWORD
options:
  useNewUrlParser: true
  useUnifiedTopology: true
  autoIndex: true
```

without auth

```
url: mongodb://localhost:55001
db: test
options:
  useNewUrlParser: true
  useUnifiedTopology: true
  autoIndex: true
```