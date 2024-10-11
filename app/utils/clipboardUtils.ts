import { ClipBoardUitlsProps } from "../types"

export const handleCopyToClipboard = ({
    extractedText,
    setCopied,
}: ClipBoardUitlsProps) => {
    if (extractedText) {
        navigator.clipboard
            .writeText(extractedText)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch((err) => {
                console.error('Could not copy text: ', err);
            });
    }
};