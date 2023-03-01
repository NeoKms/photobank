## Настройка и запуск
### Способ 1. Локальный.
[Загружаем и настраиваем API](https://github.com/NeoKms/photobank_api)

В файле ```./envconfig.js``` меняем переменную ```API_URL``` на адрес API и запускаем приложение.

### Способ 2. Контейнер upachko/photobank.

Должен быть передан enviroment ```VUE_API_URL``` и после старта приложения запущен shell-script ```getenv.sh```

### Способ 3. docker-compose.

В проекте лежат конфигурации для запуска. Надо взять два файла ```services.yaml``` и ```apps.yaml```, заполнить их данными и запустить.

```docker-compose -f services.yaml up -d && docker-compose -f apps.yaml up -d ```

Для работы клиента надо запустить команду ```docker exec -it photobank_client sh -c "cd /usr/share/nginx/html && sh getenv.sh"```

vuejs3, pinia, element-ui, typescript
