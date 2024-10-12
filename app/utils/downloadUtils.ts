export function downloadTextFile({ extractedText, fileName }: { extractedText: string; fileName: string }) {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;

    link.download = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}