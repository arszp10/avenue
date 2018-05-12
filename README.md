# Avenue 2.0

Application for modeling traffic flows 
optimization of signaling at single intersection and a networks with coordinated control mode. 


## Demo

* Application homepage [avenue-app.com](http://avenue-app.com/)
* [API docs](http://avenue-app.com/api/doc)

Sign in: [http://avenue-app.com/sign-in](http://avenue-app.com/sign-in)
```
login: test@user.com
password: 123
```

## Installation

In order to deploy the project, it is first necessary to install:
[MongoDB](https://docs.mongodb.com/manual/installation/), [NodeJS 6.1+](https://nodejs.org/en/download/current/)


Clone the repository to your projects directory
```bash
$ git clone https://github.com/kuzinmv/avenue.git
$ cd avenue
```

Install dependencies
```bash
$ npm install
```
May be you need to install [gulp](http://gulpjs.com/)

```bash
$ sudo npm install gulp -g
```

Minify and glue resource files(html, css, js, fonts). All assembled files will be placed in a folder `avenue/backend/public`
```bash
$ gulp build
```

Create an .env file in the root of the project, with following content

```
APP_PATH=/home/username/avenue               # Absolute path to your project folder
BASE_URL=http://localhost:9000               # baseUrl where app will works
MONGODB_PATH=mongodb://localhost/avenue-dev  # dbname
MAILGUN_API_KEY=key-....                     # your mailgun credentials,
```

Ensure that the MongoDB server is running and start the application server
```bash
$ node backend/app 9000
```

Open in browser
```
http://localhost:9000
```



