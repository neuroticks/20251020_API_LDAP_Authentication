const fs = require('fs');
const path = require('path');

function printDirectoryTree(dirPath, prefix = '', isLast = true) {
    try {
        const items = fs.readdirSync(dirPath);
        const validItems = items.filter(item => !item.startsWith('.'));

        console.log(prefix + (isLast ? '└── ' : '├── ') + path.basename(dirPath) + '/');

        const newPrefix = prefix + (isLast ? '    ' : '│   ');

        validItems.forEach((item, index) => {
            const itemPath = path.join(dirPath, item);
            const isItemLast = index === validItems.length - 1;

            try {
                const stats = fs.statSync(itemPath);

                if (stats.isDirectory()) {
                    printDirectoryTree(itemPath, newPrefix, isItemLast);
                } else {
                    console.log(newPrefix + (isItemLast ? '└── ' : '├── ') + item);
                }
            } catch (error) {
                console.log(newPrefix + (isItemLast ? '└── ' : '├── ') + item + ' [erro de leitura]');
            }
        });
    } catch (error) {
        console.log(prefix + (isLast ? '└── ' : '├── ') + path.basename(dirPath) + '/ [acesso negado]');
    }
}

// Uso: node script.js
const startPath = process.argv[2] || '.';
console.log('Árvore de diretórios:');
printDirectoryTree(startPath);