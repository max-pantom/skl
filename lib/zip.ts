const textEncoder = new TextEncoder();

const crcTable = new Uint32Array(256).map((_, index) => {
  let value = index;

  for (let bit = 0; bit < 8; bit += 1) {
    value = (value & 1) === 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }

  return value >>> 0;
});

type ZipEntry = {
  path: string;
  content: string;
};

function crc32(bytes: Uint8Array) {
  let value = 0xffffffff;

  for (const byte of bytes) {
    value = crcTable[(value ^ byte) & 0xff] ^ (value >>> 8);
  }

  return (value ^ 0xffffffff) >>> 0;
}

function writeUint16(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value, true);
}

function writeUint32(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value >>> 0, true);
}

function toDosDateTime(date: Date) {
  const year = Math.min(Math.max(date.getUTCFullYear(), 1980), 2107);
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = Math.floor(date.getUTCSeconds() / 2);

  return {
    date: ((year - 1980) << 9) | (month << 5) | day,
    time: (hours << 11) | (minutes << 5) | seconds,
  };
}

export function buildZipArchive(entries: ZipEntry[]) {
  const now = toDosDateTime(new Date());
  const files = entries.map((entry) => {
    const nameBytes = textEncoder.encode(entry.path);
    const contentBytes = textEncoder.encode(entry.content);
    const checksum = crc32(contentBytes);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const localHeaderView = new DataView(localHeader.buffer);
    writeUint32(localHeaderView, 0, 0x04034b50);
    writeUint16(localHeaderView, 4, 20);
    writeUint16(localHeaderView, 6, 0);
    writeUint16(localHeaderView, 8, 0);
    writeUint16(localHeaderView, 10, now.time);
    writeUint16(localHeaderView, 12, now.date);
    writeUint32(localHeaderView, 14, checksum);
    writeUint32(localHeaderView, 18, contentBytes.length);
    writeUint32(localHeaderView, 22, contentBytes.length);
    writeUint16(localHeaderView, 26, nameBytes.length);
    writeUint16(localHeaderView, 28, 0);
    localHeader.set(nameBytes, 30);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralHeaderView = new DataView(centralHeader.buffer);
    writeUint32(centralHeaderView, 0, 0x02014b50);
    writeUint16(centralHeaderView, 4, 20);
    writeUint16(centralHeaderView, 6, 20);
    writeUint16(centralHeaderView, 8, 0);
    writeUint16(centralHeaderView, 10, 0);
    writeUint16(centralHeaderView, 12, now.time);
    writeUint16(centralHeaderView, 14, now.date);
    writeUint32(centralHeaderView, 16, checksum);
    writeUint32(centralHeaderView, 20, contentBytes.length);
    writeUint32(centralHeaderView, 24, contentBytes.length);
    writeUint16(centralHeaderView, 28, nameBytes.length);
    writeUint16(centralHeaderView, 30, 0);
    writeUint16(centralHeaderView, 32, 0);
    writeUint16(centralHeaderView, 34, 0);
    writeUint16(centralHeaderView, 36, 0);
    writeUint32(centralHeaderView, 38, 0);
    centralHeader.set(nameBytes, 46);

    return {
      localHeader,
      centralHeader,
      contentBytes,
    };
  });

  let localOffset = 0;
  const fileParts: Uint8Array[] = [];

  for (const file of files) {
    writeUint32(new DataView(file.centralHeader.buffer), 42, localOffset);
    fileParts.push(file.localHeader, file.contentBytes);
    localOffset += file.localHeader.length + file.contentBytes.length;
  }

  const centralDirectoryOffset = localOffset;
  const centralDirectorySize = files.reduce((sum, file) => sum + file.centralHeader.length, 0);

  const endOfCentralDirectory = new Uint8Array(22);
  const endView = new DataView(endOfCentralDirectory.buffer);
  writeUint32(endView, 0, 0x06054b50);
  writeUint16(endView, 4, 0);
  writeUint16(endView, 6, 0);
  writeUint16(endView, 8, files.length);
  writeUint16(endView, 10, files.length);
  writeUint32(endView, 12, centralDirectorySize);
  writeUint32(endView, 16, centralDirectoryOffset);
  writeUint16(endView, 20, 0);

  const totalSize =
    fileParts.reduce((sum, part) => sum + part.length, 0) + centralDirectorySize + endOfCentralDirectory.length;
  const archive = new Uint8Array(totalSize);
  let offset = 0;

  for (const part of fileParts) {
    archive.set(part, offset);
    offset += part.length;
  }

  for (const file of files) {
    archive.set(file.centralHeader, offset);
    offset += file.centralHeader.length;
  }

  archive.set(endOfCentralDirectory, offset);

  return archive;
}
