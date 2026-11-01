import ImageKit from '@imagekit/nodejs';

const client = new ImageKit({
  privateKey: "private_LAJj4M3grU24xLsk91IIirLI7Mg="
});

async function uploadFile(buffer) {
  const response = await client.files.upload({
    file: buffer.toString("base64"),
    fileName: 'image' + Date.now() + ".jpg",
    folder: "products"
  });
  return response
}
export default uploadFile