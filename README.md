# Avenue 2.0

Система моделирования транспортных потоков и оптимизации координированных режимов управления. 


## Demo

* Application homepage [avenue-app.com](http://avenue-app.com/)
* [API docs](http://avenue-app.com/api/doc)

вход: [http://avenue-app.com/sign-in](http://avenue-app.com/sign-in)
```
логин: test@user.com
пароль: 123
```

## Installation

Для того чтобы развернуть проект, предвариельно необходимо установить: 
[MongoDB](https://docs.mongodb.com/manual/installation/), [NodeJS 6.1+](https://nodejs.org/en/download/current/)


Клонируйте репозиторий  в нужную вам директорию
```bash
$ git clone https://github.com/kuzinmv/avenue.git
$ cd avenue
```

Установите зависимости
```bash
$ npm install
```
Возможно вам понадобится установить [gulp](http://gulpjs.com/)

```bash
$ sudo npm install gulp -g
```

Минифицируем и склеим ресурсы (html, css, js, fonts). Все собранные файлы будут помещены в папку `avenue/backend/public`
```bash
$ gulp build
```

Создайте в корне проекта .env файл, примерно следующего содержания

```
APP_PATH=/home/username/avenue               # Absolute path to your project folder
BASE_URL=http://localhost:9000               # baseUrl where app will works
MONGODB_PATH=mongodb://localhost/avenue-dev  # dbname
MAILGUN_API_KEY=key-....                     # your mailgun credentials,
```

Убедитесь что сервер MongoDB запущен и запустите сервер
```bash
$ node backend/app 9000
```

Отройте в браузере
```
http://localhost:9000
```



