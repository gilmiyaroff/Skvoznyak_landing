# SKVOZNYAK — Landing pages

Публичный репозиторий маркетингового сайта SKVOZNYAK. Программа (backend, CRM/attribution, PostgreSQL) разворачивается **отдельно на VPS** и **не входит** в этот репозиторий.

## Содержимое

- `index.html` — русский лендинг для `skvoznyak.kz`
- `kz/index.html` — казахский лендинг для `skvoznyak.kz/kz/`
- `en/index.html` — английский лендинг для `skvoznyak.com/en/`
- `assets/styles.css` и `assets/site.js` — адаптивный интерфейс и форма
- `assets/skvoznyak-logo.webp` — фирменный логотип из существующих материалов SKVOZNYAK
- `functions/api/lead.js` — обработчик заявок для **Cloudflare Pages Functions**
- `privacy/`, `kz/privacy/` и `en/privacy/` — предварительные тексты о персональных данных

**Не храните токены, ключи API и реальные данные пользователей в публичном репозитории.**

## Публикация через Cloudflare Pages

1. Cloudflare → Workers & Pages → Create → Pages → Connect to Git.
2. GitHub repository: `gilmiyaroff/Skvoznyak_landing`.
3. Production branch: `main`.
4. Framework preset: **None**.
5. Build command: **пусто** (для статического HTML сборка не нужна).
6. Build output directory: `.` (корень репозитория).
7. После первого deployment подключите custom domains `skvoznyak.kz` и `skvoznyak.com`. Убедитесь, что DNS каждого домена направлен на Pages по подсказкам Cloudflare.
8. Корень `.kz` показывает RU; `/kz/` показывает KZ; корень `.com` переводит посетителя на `/en/`. Все три локализации используют один Pages-проект.
9. Переключатель в шапке: **KZ · RU · EN**, без флагов. Он поддерживается на всех лендингах и страницах конфиденциальности.

После успешного подключения push в `main` автоматически публикует новые версии страниц. Preview branches можно тестировать отдельно.

## Обработка заявок

Форма отправляет POST на `/api/lead`. Она **не собирает заявки до настройки** двух защищённых секретов в Cloudflare Pages → Settings → Variables and Secrets:

- `TELEGRAM_BOT_TOKEN` — токен созданного для проекта Telegram-бота.
- `TELEGRAM_CHAT_ID` — ID чата, куда бот вправе писать.

Не помещайте значения в GitHub или `index.html`. Создайте их как **Secrets** для production environment, затем повторно разверните проект. Проверьте форму с реальным тестовым номером; успех отображается только после подтверждения API Telegram.

При отсутствии настроек сервер отвечает HTTP 503, а интерфейс не заявляет об успешной отправке. Для промышленного запуска рекомендуется дополнительно включить Cloudflare Turnstile и ограничение частоты запросов.

## Перед публичным запуском

- [ ] Указать юридическое имя оператора данных, контактный email, срок хранения и условия передачи данных в `privacy/index.html`, `kz/privacy/index.html` и `en/privacy/index.html`.
- [ ] Проверить соблюдение применимых правил обработки персональных данных в Казахстане, включая использование зарубежного мессенджера.
- [ ] Настроить Telegram secrets и отправить тестовую заявку с `skvoznyak.kz`, `skvoznyak.kz/kz/` и `skvoznyak.com/en/`.
- [ ] Проверить мобильную верстку, все три локализации и ссылки.
- [ ] Убедиться, что Pages проект не конфликтует с `staging.skvoznyak.kz` и будущим `app.skvoznyak.kz` на VPS.

## Проверка локально

Для просмотра статической части:

```bash
python3 -m http.server 8000
```

Открыть `http://localhost:8000` и `http://localhost:8000/en/`. Обработчик `/api/lead` при таком запуске работать не будет — для этого нужен Cloudflare Pages Runtime.

Демонстрационные показатели на экранном макете не являются реальными результатами клиентов.
