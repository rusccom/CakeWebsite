<?php
/**
 * Автоматическое развертывание через Git webhook
 * Для hoster.by с GitHub/GitLab интеграцией
 */

// Безопасность: проверяем секретный ключ
$secretKey = 'cake-shop-deploy-2024'; // Измените на свой
$receivedKey = $_GET['key'] ?? $_POST['key'] ?? '';

if ($receivedKey !== $secretKey) {
    http_response_code(403);
    die('Access denied');
}

// Логирование
$logFile = 'deploy.log';
function writeLog($message) {
    global $logFile;
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$timestamp] $message\n", FILE_APPEND);
}

writeLog("=== Начало развертывания ===");

try {
    // Определяем папки
    $projectDir = __DIR__;
    $publicHtmlDir = '/home/' . get_current_user() . '/public_html';
    
    // Если мы уже в public_html - хорошо
    if (strpos($projectDir, 'public_html') !== false) {
        $targetDir = $projectDir;
        $needCopy = false;
    } else {
        // Если мы не в public_html - будем копировать туда
        $targetDir = $publicHtmlDir;
        $needCopy = true;
    }
    
    chdir($projectDir);
    writeLog("Рабочая папка: $projectDir");
    writeLog("Целевая папка: $targetDir");
    writeLog("Нужно копирование: " . ($needCopy ? 'да' : 'нет'));
    
    // Проверяем наличие Git
    exec('which git 2>/dev/null', $output, $gitCheck);
    if ($gitCheck !== 0) {
        throw new Exception('Git не найден на сервере');
    }
    
    writeLog("Git найден");
    
    // Проверяем что это Git репозиторий
    if (!is_dir('.git')) {
        throw new Exception('Это не Git репозиторий');
    }
    
    // Делаем бекап текущей версии
    $backupDir = "backup_" . date('Y-m-d_H-i-s');
    exec("cp -r data/ $backupDir/", $output, $backupResult);
    if ($backupResult === 0) {
        writeLog("Создан бекап данных: $backupDir");
    }
    
    // Получаем последние изменения
    exec('git fetch origin 2>&1', $output, $fetchResult);
    writeLog("Git fetch: " . implode("\n", $output));
    
    if ($fetchResult !== 0) {
        throw new Exception('Ошибка git fetch: ' . implode("\n", $output));
    }
    
    // Переключаемся на main/master ветку и обновляем
    exec('git reset --hard origin/main 2>&1', $output, $resetResult);
    writeLog("Git reset: " . implode("\n", $output));
    
    if ($resetResult !== 0) {
        // Пробуем master ветку
        exec('git reset --hard origin/master 2>&1', $output, $masterResult);
        if ($masterResult !== 0) {
            throw new Exception('Ошибка git reset');
        }
    }
    
    // Проверяем что важные файлы на месте
    $requiredFiles = ['index.html', 'admin.html', 'api.php', 'data/products.json'];
    foreach ($requiredFiles as $file) {
        if (!file_exists($file)) {
            writeLog("Предупреждение: файл $file не найден");
        }
    }
    
    // Создаем папки если их нет
    if (!is_dir('data')) {
        mkdir('data', 0755, true);
        writeLog("Создана папка data/");
    }
    
    if (!is_dir('data/photos')) {
        mkdir('data/photos', 0755, true);
        writeLog("Создана папка data/photos/");
    }
    
    // Копируем файлы в public_html если нужно
    if ($needCopy) {
        writeLog("Копируем файлы в public_html...");
        
        // Список файлов для копирования
        $filesToCopy = [
            'index.html', 'admin.html', 'api.php', 'deploy.php',
            'assets/', 'data/'
        ];
        
        foreach ($filesToCopy as $item) {
            $source = $projectDir . '/' . $item;
            $dest = $targetDir . '/' . $item;
            
            if (file_exists($source)) {
                if (is_dir($source)) {
                    exec("cp -r '$source' '$dest'", $copyOutput, $copyResult);
                } else {
                    exec("cp '$source' '$dest'", $copyOutput, $copyResult);
                }
                
                if ($copyResult === 0) {
                    writeLog("Скопировано: $item");
                } else {
                    writeLog("Ошибка копирования: $item");
                }
            }
        }
        
        // Устанавливаем права в целевой папке
        chdir($targetDir);
        chmod('data', 0755);
        chmod('data/photos', 0755);
        writeLog("Установлены права в public_html");
    } else {
        // Устанавливаем права в текущей папке
        chmod('data', 0755);
        chmod('data/photos', 0755);
        writeLog("Установлены права на папки");
    }
    
    $deployTime = date('Y-m-d H:i:s');
    writeLog("=== Развертывание завершено успешно: $deployTime ===");
    
    // Отправляем результат
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'message' => 'Развертывание завершено успешно',
        'timestamp' => $deployTime,
        'backup' => $backupDir ?? null
    ]);
    
} catch (Exception $e) {
    $error = $e->getMessage();
    writeLog("ОШИБКА: $error");
    
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $error,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>
