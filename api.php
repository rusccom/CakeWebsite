<?php
/**
 * PHP бэкенд для hoster.by
 * Поддерживает: загрузку/сохранение данных, загрузку фото
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Обработка preflight запросов
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Пути к файлам
$dataFile = 'data/products.json';
$photosDir = 'data/photos/';

// Создаем папки если их нет
if (!is_dir('data')) mkdir('data', 0755, true);
if (!is_dir($photosDir)) mkdir($photosDir, 0755, true);

// Определяем действие
$method = $_SERVER['REQUEST_METHOD'];
$action = $_SERVER['HTTP_X_ACTION'] ?? '';

try {
    if ($method === 'GET') {
        getData();
    } elseif ($method === 'POST' && $action === 'upload') {
        uploadPhoto();
    } elseif ($method === 'POST' && $action === 'delete_photo') {
        deletePhoto();
    } elseif ($method === 'POST') {
        saveData();
    } else {
        throw new Exception('Неизвестный запрос');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

function getData() {
    global $dataFile;
    
    if (file_exists($dataFile)) {
        echo file_get_contents($dataFile);
    } else {
        // Создаем дефолтные данные
        $defaultData = [
            'categories' => [
                [
                    'id' => 'chocolate',
                    'name' => 'Шоколадные',
                    'description' => 'Торты на основе шоколада',
                    'created' => date('c'),
                    'color' => '#8B4513'
                ],
                [
                    'id' => 'fruit',
                    'name' => 'Фруктовые',
                    'description' => 'Легкие торты с фруктами',
                    'created' => date('c'),
                    'color' => '#FF6347'
                ]
            ],
            'products' => [
                [
                    'id' => 1,
                    'title' => 'Шоколадный рай',
                    'description' => 'Роскошный многослойный торт из бельгийского шоколада',
                    'price' => 2500,
                    'category' => 'chocolate',
                    'weight' => '1.5 кг',
                    'serves' => '8-10 человек',
                    'photos' => [],
                    'created' => date('c'),
                    'updated' => date('c')
                ]
            ]
        ];
        
        file_put_contents($dataFile, json_encode($defaultData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo json_encode($defaultData);
    }
}

function saveData() {
    global $dataFile;
    
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        throw new Exception('Некорректные данные JSON');
    }
    
    if (!isset($data['categories']) || !isset($data['products'])) {
        throw new Exception('Отсутствуют обязательные поля');
    }
    
    // Бекап
    if (file_exists($dataFile)) {
        copy($dataFile, $dataFile . '.backup.' . date('Y-m-d_H-i-s'));
    }
    
    // Сохраняем
    $result = file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    if ($result === false) {
        throw new Exception('Ошибка сохранения файла');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Данные сохранены успешно'
    ]);
}

function uploadPhoto() {
    global $photosDir;
    
    if (!isset($_FILES['photo'])) {
        throw new Exception('Файл не найден');
    }
    
    $file = $_FILES['photo'];
    
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Ошибка загрузки: ' . $file['error']);
    }
    
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowedTypes)) {
        throw new Exception('Неподдерживаемый тип файла');
    }
    
    if ($file['size'] > 5 * 1024 * 1024) {
        throw new Exception('Файл слишком большой (макс 5MB)');
    }
    
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $fileName = 'cake-' . time() . '-' . rand(1000, 9999) . '.' . $extension;
    $filePath = $photosDir . $fileName;
    
    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        throw new Exception('Ошибка сохранения файла');
    }
    
    echo json_encode([
        'success' => true,
        'filename' => $fileName,
        'url' => $filePath
    ]);
}

function deletePhoto() {
    global $photosDir;
    
    $input = json_decode(file_get_contents('php://input'), true);
    $filename = $input['filename'] ?? '';
    
    if (empty($filename)) {
        throw new Exception('Не указано имя файла');
    }
    
    $filePath = $photosDir . basename($filename);
    
    if (!file_exists($filePath)) {
        throw new Exception('Файл не найден');
    }
    
    if (!unlink($filePath)) {
        throw new Exception('Ошибка удаления файла');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Файл удален'
    ]);
}
?>
