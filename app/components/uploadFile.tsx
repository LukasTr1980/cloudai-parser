export async function uploadFile(
    file: File,
    onProgress: (percentage: number) => void
) {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percentage = (event.loaded / event.total) * 100;
                onProgress(percentage);
            }
        });

        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve('File uploaded successfully');
                } else {
                    reject(new Error('Upload failed'));
                }
            }
        };

        xhr.open('POST', '/api/upload');
        xhr.send(formData);
    });
}