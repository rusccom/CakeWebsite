<?php
/**
 * Простое развертывание через Git webhook
 * Только git pull + установка прав доступа
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
    $projectDir = __DIR__;
    chdir($projectDir);
    writeLog("Рабочая папка: $projectDir");
    
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
    
    // Устанавливаем права на папки
    if (is_dir('data')) {
        chmod('data', 0755);
        writeLog("Установлены права на папку data/");
    }
    
    if (is_dir('data/photos')) {
        chmod('data/photos', 0755);
        writeLog("Установлены права на папку data/photos/");
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
