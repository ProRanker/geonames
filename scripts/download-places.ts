import { createWriteStream } from 'fs';

import { deleteFile, downloadFile, readZip } from '../utils/fileSystem';

const url = 'http://download.geonames.org/export/dump/allCountries.zip';

const readStream = async function* (stream: NodeJS.ReadableStream) {
  let remainder = '';

  for await (const buf of stream) {
    let end;

    let text = remainder + buf.toString();
    while ((end = text.indexOf('\n')) !== -1) {
      yield text.slice(0, end).split('\t');
      text = text.slice(end + 1);
    }

    remainder = text;
  }

  if (remainder.length > 0) {
    yield remainder.split('\t');
  }
};

void (async () => {
  // const file = downloadFile(url, 'zip');
  // await file.download();

  // const zip = readZip(file.path);
  const zip = readZip('D:\\Libraries\\Downloads\\allCountries-places.zip');
  const data = await zip.stream('allCountries.txt');

  const outputFile = './scripts/places.txt';
  deleteFile(outputFile);
  const output = createWriteStream(outputFile);

  const cols = [0, 1, 4, 5, 8, 10, 11, 12, 13];

  for await (const line of readStream(data)) {
    if (!line[7].startsWith('PPL')) continue;

    output.write(line.filter((_x, i) => cols.includes(i)).join('\t'));
    output.write('\n');
  }

  output.end();

  await zip.close();
  // await file.delete();
})();