export async function uploadFile(
    file: File,
    onProgress: (percentage: number) => void
) {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    return new Promise<{ fileName: string }>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percentage = (event.loaded / event.total) * 100;
                onProgress(percentage);
            }
        });

        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (error) {
                        console.error(error);
                        reject(new Error('Failed to parse server response'));
                    }
                } else {
                    try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        const errorMessage = errorResponse.message || 'Upload failed';
                        reject(new Error(errorMessage));
                    } catch (parseError) {
                        console.error('Failed to parse error response:', parseError);
                        reject(new Error('Upload failed'));
                    }
                }
            }
        };

        xhr.open('POST', '/api/upload');
        xhr.withCredentials = true;
        xhr.setRequestHeader('X-Api-Token', window.API_TOKEN);
        xhr.send(formData);
    });
}