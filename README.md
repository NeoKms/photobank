## Настройка
### Способ 1. Локальный.
[Загружаем и настраиваем API](https://github.com/NeoKms/photobank_api)

В файле ```./envconfig.js``` меняем переменную ```API_URL``` на адрес API и запускаем приложение.

### Способ 2. Контейнер.

Должен быть передан enviroment ```VUE_API_URL``` и после старта приложения запущен shell-script ```getenv.sh```

## Дока стора 
https://pinia.vuejs.org/cookbook/migration-vuex.html#usage-inside-components
## Дока дизайнера
https://element-plus.org/en-US/component/icon.html#icon-collection

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Для подключения пре-коммита

```sh
npm run prepare
```