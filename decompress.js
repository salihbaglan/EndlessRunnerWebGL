const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const buildDir = path.join(__dirname, 'Build');

const files = fs.readdirSync(buildDir).filter(f => f.endsWith('.br'));

if (files.length === 0) {
    console.log('No .br files found in Build/');
    process.exit(0);
}

files.forEach(file => {
    const inputPath = path.join(buildDir, file);
    const outputPath = path.join(buildDir, file.replace('.br', ''));
    console.log(`Decompressing: ${file} -> ${path.basename(outputPath)}`);
    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);
    const decompress = zlib.createBrotliDecompress();
    input.pipe(decompress).pipe(output);
    output.on('finish', () => {
        fs.unlinkSync(inputPath);
        console.log(`  ✓ Done. Removed original: ${file}`);
    });
});
