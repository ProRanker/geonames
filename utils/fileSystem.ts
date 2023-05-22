import axios from 'axios';
import * as _fs from 'fs';
import * as _fs2 from 'fs/promises';
import * as zip from 'node-stream-zip';
import * as _path from 'path';
import * as temp from 'temp';

export function readFile(file: string) {
  return _fs.readFileSync(file).toString();
}

export function writeFile(file: string, data: string) {
  createFolder(_path.dirname(file));

  if (_fs.existsSync(file)) {
    _fs.unlinkSync(file);
  }

  _fs.writeFileSync(file, data);
}

export function deleteFile(file: string) {
  if (_fs.existsSync(file)) {
    _fs.unlinkSync(file);
  }
}

export function createFolder(folder: string) {
  if (!_fs.existsSync(_path.dirname(folder))) {
    createFolder(_path.dirname(folder));
  }

  if (!_fs.existsSync(folder)) {
    _fs.mkdirSync(folder);
  }
}

export function existsPath(path: string) {
  return _fs.existsSync(path);
}

export function resolvePath(path: string) {
  return _path.resolve(path);
}

export function dirname(path: string) {
  return _path.dirname(path);
}

export function downloadFile(url: string, ext?: string) {
  const path = temp.path({ suffix: `.${ext}` });

  return {
    ext, path,
    download: () => {
      return new Promise((resolve, reject) => {
        axios.get(url, { responseType: 'stream' }).then(response => {
          response.data.pipe(_fs.createWriteStream(_path.resolve(path))).on('finish', resolve).on('error', reject);
        }).catch(reject);
      });
    },
    size: async () => {
      const stats = await _fs2.stat(path);
      return stats.size;
    },
    delete: async () => {
      await _fs2.rm(path);
    }
  };
}

export function readZip(file: string) {
  return new zip.async({ file });
}