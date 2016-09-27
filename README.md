# Avenue - 2.0

Система моделирования транспортных потоков и оптимизации координированных режимов управления. 

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

Минифицируем и склеим ресурсы (html, css, js, fonts)
```bash
$ gulp build
```

Все собранные файлы будут помещены в папку `avenue/backend/public`

Запустите сервер
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
