# Портфолио

Сайт-портфолио для GitHub Pages. Главная страница — `index.html`, работы лежат в папке `works/`, и каждую можно открыть в браузере.

## Структура

```
index.html        главная: обо мне, проекты, навыки, контакты
works.js          список работ, которые показываются на главной
works/
  имя-работы/
    index.html    сама работа (плюс её css, js, картинки)
```

## Как добавить свою работу

1. Скопируйте папку с работой в `works/`. Главный файл внутри должен называться `index.html`.
   Имя папки — латиницей, без пробелов: `my-todo-app`.
2. Откройте `works.js` и добавьте запись:
   ```js
   { folder: "my-game", title: "My Game", year: "2026",
     description: "What it is, in English", tags: ["Unity"], cover: "cover.png", code: "https://github.com/..." }
   ```
   `cover` — картинка внутри папки работы для карточки (необязательно, без неё рисуется пиксельная обложка).
3. Папки-заглушки `pixel-platformer`, `browser-game`, `react-app` удалите вместе с их записями.

**Игры на Unity:** File → Build Settings → WebGL, в Player Settings → Publishing Settings поставьте Compression Format: **Disabled** (GitHub Pages не отдаёт .br/.gz правильно). Папку сборки целиком кладите в `works/`.
**Godot:** Project → Export → Web, экспортируйте в папку как `index.html`. Если игра не стартует из-за SharedArrayBuffer — в настройках экспорта выключите Thread Support.

Если работа — React/Vue-проект, кладите в папку собранную версию (`dist/` или `build/`), а не исходники.
В настройках сборки укажите относительные пути (`base: "./"` в Vite, `"homepage": "."` в create-react-app), иначе стили и скрипты не подгрузятся.

## Что поменять на главной

В `index.html` найдите `Your Name` / `YOUR NAME` (заголовок, логотип, подвал, `<title>`) и замените на своё. Там же поправьте тексты «About», уровни навыков, годы опыта и контакты (`you@example.com`, `your_handle`, `your-login`).

## Публикация на GitHub Pages

1. Создайте репозиторий с именем `ваш-логин.github.io` (тогда адрес будет `https://ваш-логин.github.io`).
2. Загрузите туда все файлы из этой папки: **Add file → Upload files**, перетащите их и нажмите **Commit changes**.
3. **Settings → Pages → Source: Deploy from a branch**, ветка `main`, папка `/ (root)` → **Save**.
4. Через минуту-две сайт откроется по адресу из шага 1. Работы будут по адресам вида `https://ваш-логин.github.io/works/имя-работы/`.

Если репозиторий назван иначе (например `portfolio`), адрес будет `https://ваш-логин.github.io/portfolio/` — всё работает так же.
