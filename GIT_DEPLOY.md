# 🔄 Git развертывание на hoster.by

## 🎯 Преимущества Git развертывания:

- ⚡ **Автоматические обновления** при push в репозиторий  
- 🔄 **Версионность** - можно откатиться к любой версии
- 👥 **Командная работа** - несколько разработчиков
- 📦 **Никакого FTP** - все через Git commands
- 🛡️ **Бекапы** автоматически при каждом обновлении

## 🚀 Настройка:

### 1️⃣ **Создайте Git репозиторий**

#### GitHub:
```bash
# В папке проекта:
git init
git add .
git commit -m "Initial commit: cake shop"
git branch -M main
git remote add origin https://github.com/username/cake-shop.git
git push -u origin main
```

#### GitLab (если предпочитаете):
```bash
git remote add origin https://gitlab.com/username/cake-shop.git
git push -u origin main
```

### 2️⃣ **Настройка на hoster.by**

#### A) **Через SSH** (если доступен):
```bash
# Подключитесь по SSH к хостингу
ssh username@ваш-домен.by

# Перейдите в папку сайта
cd public_html

# Клонируйте репозиторий
git clone https://github.com/username/cake-shop.git .

# Установите права
chmod 755 data/
chmod 755 data/photos/
```

#### B) **Через панель управления** (если есть Git интеграция):
1. **Войдите** в панель hoster.by
2. **Найдите раздел** "Git" или "Развертывание"
3. **Укажите URL** репозитория: `https://github.com/username/cake-shop.git`
4. **Выберите ветку:** `main`
5. **Сохраните** настройки

### 3️⃣ **Автоматическое обновление**

#### Webhook для автообновления:
1. **В GitHub** → Settings → Webhooks → Add webhook
2. **Payload URL:** `https://ваш-домен.by/deploy.php?key=cake-shop-deploy-2024`
3. **Content type:** `application/json`
4. **Events:** Just the push event
5. **Сохраните**

**Теперь** при каждом `git push` сайт автоматически обновится!

### 4️⃣ **Рабочий процесс**

```bash
# Локальная разработка:
git add .
git commit -m "Добавил новый торт"
git push origin main

# ↓ Автоматически на hoster.by:
# 1. Webhook получает уведомление
# 2. deploy.php делает git pull
# 3. Обновляет файлы на сервере
# 4. Создает бекап данных
# 5. Сайт обновлен!
```

## 📊 **Альтернативные способы:**

### **GitHub Actions** (автоматизация):
```yaml
# .github/workflows/deploy.yml
name: Deploy to hoster.by
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy via FTP
        uses: SamKirkland/FTP-Deploy-Action@4.0.0
        with:
          server: ftp.ваш-домен.by
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
```

### **GitLab CI/CD**:
```yaml
# .gitlab-ci.yml
deploy:
  script:
    - rsync -av --delete ./ user@хост:/public_html/
  only:
    - main
```

## 🔧 **Настройка безопасности:**

### Файл `.gitignore` (уже создан):
```
data/photos/*           # Не храним загруженные фото в Git
data/products_backup_*  # Не храним бекапы
*.log                   # Не храним логи
```

### Скрытие чувствительных данных:
```php
// В api.php можно вынести в отдельный файл:
$config = [
    'upload_max_size' => 5 * 1024 * 1024,
    'allowed_types' => ['jpg', 'png', 'gif', 'webp'],
    'admin_password' => '12341' // Лучше в переменных окружения
];
```

## 🎯 **Итоговый workflow:**

1. **Разрабатываете локально** (XAMPP/OpenServer)
2. **Коммитите изменения** в Git
3. **Push в GitHub/GitLab**
4. **Webhook автоматически** обновляет hoster.by
5. **Проверяете результат** на живом сайте

## 🚀 **Команды для первой настройки:**

```bash
# 1. Создаем репозиторий
git init
git add .
git commit -m "🎂 Сайт тортов готов к развертыванию"

# 2. Подключаем GitHub
git remote add origin https://github.com/ВАШ_ЛОГИН/cake-shop.git
git push -u origin main

# 3. Настраиваем webhook на hoster.by
# URL: https://ваш-домен.by/deploy.php?key=cake-shop-deploy-2024
```

**После этого любой `git push` будет автоматически обновлять сайт!** 🔄

---

**🎉 Git развертывание значительно упрощает поддержку сайта!**
