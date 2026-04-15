const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');

const folders = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory() && !['.git', '.github', 'docs', 'node_modules'].includes(d.name))
  .map(d => d.name);

const structure = {};
const fileContents = {};

folders.forEach(folder => {
  const folderPath = path.join(ROOT, folder);
  let files = [];
  try {
    files = fs.readdirSync(folderPath)
      .filter(f => f.endsWith('.md') || f.endsWith('.txt') || !f.includes('.'));
    files.forEach(file => {
      const filePath = path.join(folderPath, file);
      try {
        fileContents[`${folder}/${file}`] = fs.readFileSync(filePath, 'utf8');
      } catch {}
    });
  } catch {}
  structure[folder] = files;
});

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevOps Preparation Docs</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2em; }
    h1 { color: #2c3e50; }
    .folder-list, .file-list { list-style: none; padding: 0; }
    .folder { font-weight: bold; margin-top: 1em; cursor: pointer; color: #2980b9; }
    .file { margin-left: 1em; cursor: pointer; color: #16a085; }
    .file:hover, .folder:hover { text-decoration: underline; }
    #content { margin-top: 2em; padding: 1em; border: 1px solid #eee; background: #fafafa; }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
</head>
<body>
  <h1>DevOps Preparation Docs</h1>
  <ul id="folders" class="folder-list"></ul>
  <div id="content"></div>
  <script>
    const structure = JSON.parse(atob('${Buffer.from(JSON.stringify(structure)).toString('base64')}'));
    const fileContents = JSON.parse(atob('${Buffer.from(JSON.stringify(fileContents)).toString('base64')}'));
    const foldersEl = document.getElementById('folders');
    const contentEl = document.getElementById('content');
    Object.keys(structure).forEach(folder => {
      const folderLi = document.createElement('li');
      folderLi.textContent = folder;
      folderLi.className = 'folder';
      folderLi.onclick = () => {
        contentEl.innerHTML = '';
        const files = structure[folder];
        if (files.length === 0) {
          contentEl.innerHTML = '<em>No files in this folder.</em>';
        } else {
          const fileList = document.createElement('ul');
          fileList.className = 'file-list';
          files.forEach(file => {
            const fileLi = document.createElement('li');
            fileLi.textContent = file;
            fileLi.className = 'file';
            fileLi.onclick = () => {
              const content = fileContents[folder + '/' + file] || 'No content.';
              // Render Markdown if .md file, else plain text
              if (file.endsWith('.md')) {
                contentEl.innerHTML = marked.parse(content);
              } else {
                contentEl.innerHTML = '<pre style="white-space: pre-wrap;">' + content + '</pre>';
              }
            };
            fileList.appendChild(fileLi);
          });
          contentEl.appendChild(fileList);
        }
      };
      foldersEl.appendChild(folderLi);
    });
  </script>
</body>
</html>`;

fs.mkdirSync(DOCS, { recursive: true });
fs.writeFileSync(path.join(DOCS, 'index.html'), html);
