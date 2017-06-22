# Avenue 2.0

Система моделирования транспортных потоков и оптимизации координированных режимов управления. 
[Краткое описание принципов работы модели](https://docs.google.com/document/d/1mdmcT0b6X0agkceEUA5OEeeyhi6zV6zl3avihBE69j4/edit?usp=sharing)

## Demo

[Работающий проект](http://avenue-2p0.herokuapp.com/) на heroku (возможно придется подождать или обновить еще раз)

[API docs](http://avenue-2p0.herokuapp.com/api/v1/doc)

вход: [http://avenue-2p0.herokuapp.com/sign-in](http://avenue-2p0.herokuapp.com/sign-in)
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


Убедитесь что сервер MongoDB запущен и запустите сервер
```bash
$ node backend/app
```

Отройте в браузере
```
http://localhost:9000
```


## Connections
По умолчанию программа будет использовать следующие  параметры для соединения  
```js 
baseUrl:  'http://localhost:9000',
database: 'mongodb://localhost/avenue-dev',
```
