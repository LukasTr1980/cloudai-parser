import React from 'react';

const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className = '', ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`flex-shrink-0 ${className}`}
        {...props}
    >
        <path d="M4 18v2h16v-2H4zm8-14l-5 5h3v6h4v-6h3l-5-5z" />
    </svg>
);

export default UploadIcon;

const LanguageIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className = '', ...props }) => (
    <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="square"
        strokeLinejoin="miter"
        fill="none"
        className={`flex-shrink-0 ${className}`}
        {...props}
    >
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" d="M12,22 C14.6666667,19.5757576 16,16.2424242 16,12 C16,7.75757576 
        14.6666667,4.42424242 12,2 C9.33333333,4.42424242 8,7.75757576 8,12 C8,16.2424242 9.33333333,19.5757576 12,22 Z" />
        <path strokeLinecap="round" d="M2.5 9L21.5 9M2.5 15L21.5 15" />
    </svg>
);

const PrivacyIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className = '', ...props }) => (
    <svg viewBox="0 0 1024 1024"
        className={`flex-shrink-0 ${className}`}
        {...props}
        xmlns="http://www.w3.org/2000/svg">
        <circle cx="512" cy="512" r="512" fill='currentColor' />
        <path fill='white' d="M512 517.4c-20.1-.2-36.5 15.8-36.7 35.9-.1 10.6 4.4 
        20.7 12.4 27.7v33.9c0 13.5 10.9 24.4 24.4 24.4 13.5 0 24.4-10.9 24.4-24.4V581c15.1-13.2 
        16.6-36.2 3.4-51.3-7.2-7.9-17.3-12.4-27.9-12.3zm121.9-97.5v-48.8c0-67.3-54.6-121.9-121.9-121.9s-121.9 
        54.6-121.9 121.9v48.8c-40.4 0-73.1 32.7-73.1 73.1v170.6c0 40.4 32.7 73.1 73.1 73.1h243.8c40.4 0 73.1-32.7 
        73.1-73.1V493c0-40.4-32.7-73.1-73.1-73.1zm-195-48.8c0-40.4 32.7-73.1 73.1-73.1s73.1 32.7 73.1 73.1v48.8H438.9v-48.8zm219.4 
        292.5c0 13.5-10.9 24.4-24.4 24.4H390.1c-13.5 0-24.4-10.9-24.4-24.4V493c0-13.5 10.9-24.4 24.4-24.4h243.8c13.5 0 24.4 10.9 24.4 24.4v170.6z" />
    </svg>
);

const PDFIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className = '', ...props }) => (
    <svg
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
        className={`flex-shrink-0 ${className}`}
        {...props}
    >
        <g stroke="none" strokeWidth="1" fill="none">
            <g fill="currentColor" transform="translate(85.333333, 42.666667)">
                <path d="M75.9466667,285.653333 C63.8764997,278.292415 49.6246897,275.351565 
                35.6266667,277.333333 L1.42108547e-14,277.333333 L1.42108547e-14,405.333333 L28.3733333,405.333333 
                L28.3733333,356.48 L40.5333333,356.48 C53.1304778,357.774244 65.7885986,354.68506 76.3733333,347.733333 
                C85.3576891,340.027178 90.3112817,328.626053 89.8133333,316.8 C90.4784904,304.790173 85.3164923,293.195531 
                75.9466667,285.653333 L75.9466667,285.653333 Z M53.12,332.373333 C47.7608867,334.732281 41.8687051,335.616108 
                36.0533333,334.933333 L27.7333333,334.933333 L27.7333333,298.666667 L36.0533333,298.666667 C42.094796,298.02451 
                48.1897668,299.213772 53.5466667,302.08 C58.5355805,305.554646 61.3626692,311.370371 61.0133333,317.44 
                C61.6596233,323.558965 58.5400493,329.460862 53.12,332.373333 L53.12,332.373333 Z M150.826667,277.333333 
                L115.413333,277.333333 L115.413333,405.333333 L149.333333,405.333333 C166.620091,407.02483 184.027709,403.691457 
                199.466667,395.733333 C216.454713,383.072462 225.530463,362.408923 223.36,341.333333 C224.631644,323.277677 
                218.198313,305.527884 205.653333,292.48 C190.157107,280.265923 170.395302,274.806436 150.826667,277.333333 
                L150.826667,277.333333 Z M178.986667,376.32 C170.098963,381.315719 159.922142,383.54422 149.76,382.72 L144.213333,382.72 
                L144.213333,299.946667 L149.333333,299.946667 C167.253333,299.946667 174.293333,301.653333 181.333333,308.053333 
                C189.877212,316.948755 194.28973,329.025119 193.493333,341.333333 C194.590843,354.653818 189.18793,367.684372 
                178.986667,376.32 L178.986667,376.32 Z M254.506667,405.333333 L283.306667,405.333333 L283.306667,351.786667 
                L341.333333,351.786667 L341.333333,329.173333 L283.306667,329.173333 L283.306667,299.946667 L341.333333,299.946667 
                L341.333333,277.333333 L254.506667,277.333333 L254.506667,405.333333 L254.506667,405.333333 Z M234.666667,7.10542736e-15 
                L9.52127266e-13,7.10542736e-15 L9.52127266e-13,234.666667 L42.6666667,234.666667 L42.6666667,192 L42.6666667,169.6 
                L42.6666667,42.6666667 L216.96,42.6666667 L298.666667,124.373333 L298.666667,169.6 L298.666667,192 L298.666667,234.666667 
                L341.333333,234.666667 L341.333333,106.666667 L234.666667,7.10542736e-15 L234.666667,7.10542736e-15 Z" />
            </g>
        </g>
    </svg>
);

const IMGIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        className={`flex-shrink-0 ${className}`}
        {...props}
    >
        <g>
            <path fill='currentColor' d="M378.413,0H208.297h-13.168l-9.314,9.314L57.02,138.102l-9.314,9.314v13.176v265.514
		c0,47.36,38.527,85.895,85.895,85.895h244.812c47.353,0,85.881-38.535,85.881-85.895V85.896C464.294,38.528,425.766,0,378.413,0z
		M432.497,426.105c0,29.877-24.214,54.091-54.084,54.091H133.601c-29.87,0-54.084-24.214-54.084-54.091V160.591h83.717
		c24.884,0,45.063-20.178,45.063-45.07V31.804h170.116c29.87,0,54.084,24.214,54.084,54.092V426.105z"/>
            <path fill='currentColor' d="M162.94,251.968c-5.851,0-10.054,4.21-10.054,10.592v72.804c0,6.388,4.203,10.599,10.054,10.599
		c5.698,0,9.915-4.21,9.915-10.599V262.56C172.855,256.178,168.638,251.968,162.94,251.968z"/>
            <path fill='currentColor' d="M265.621,251.968c-5.977,0-9.244,3.261-12.219,10.326l-19.299,44.547h-0.545l-19.69-44.547
		c-3.114-7.066-6.382-10.326-12.358-10.326c-6.647,0-11.004,4.622-11.004,11.954v72.398c0,6.109,3.812,9.643,9.245,9.643
		c5.153,0,8.965-3.534,8.965-9.643v-44.554h0.67l14.398,33.138c2.848,6.522,5.167,8.428,9.775,8.428
		c4.622,0,6.926-1.906,9.789-8.428l14.258-33.138h0.684v44.554c0,6.109,3.658,9.643,9.091,9.643c5.432,0,9.105-3.534,9.105-9.643
		v-72.398C276.486,256.59,272.269,251.968,265.621,251.968z"/>
            <path fill='currentColor' d="M356.363,293.806h-19.02c-5.153,0-8.42,3.121-8.42,7.876c0,4.755,3.268,7.876,8.42,7.876h6.256
		c0.545,0,0.81,0.272,0.81,0.816c0,3.533-0.266,6.654-1.089,9.098c-1.9,5.844-7.737,9.51-14.803,9.51
		c-8.015,0-13.043-3.938-15.068-10.187c-1.089-3.393-1.494-7.876-1.494-19.83c0-11.953,0.406-16.296,1.494-19.696
		c2.025-6.382,6.927-10.32,14.802-10.32c5.977,0,10.459,1.899,13.993,6.786c2.709,3.805,5.432,4.895,8.825,4.895
		c5.028,0,9.091-3.666,9.091-8.965c0-2.171-0.67-4.078-1.76-5.977c-4.888-8.287-15.207-14.397-30.149-14.397
		c-16.436,0-29.199,7.471-33.962,22.412c-2.038,6.515-2.583,11.682-2.583,25.262c0,13.581,0.545,18.74,2.583,25.262
		c4.762,14.942,17.526,22.413,33.962,22.413c16.436,0,28.921-8.288,33.683-23.09c1.634-5.16,2.304-12.77,2.304-20.919v-0.95
		C364.238,296.654,361.39,293.806,356.363,293.806z"/>
        </g>
    </svg>
);

const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className = '', ...props }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`flex-shrink-0 ${className}`}
        {...props}
    >
        <path fillRule="evenodd" clipRule="evenodd" d="M21 8C21 6.34315 19.6569 5 18 5H10C8.34315 5 7 6.34315 7 8V20C7 21.6569 
8.34315 23 10 23H18C19.6569 23 21 21.6569 21 20V8ZM19 8C19 7.44772 18.5523 7 18 7H10C9.44772 7 9 7.44772 9 8V20C9 20.5523 
9.44772 21 10 21H18C18.5523 21 19 20.5523 19 20V8Z" fill="currentColor" />
        <path d="M6 3H16C16.5523 3 17 2.55228 17 2C17 1.44772 16.5523 1 16 1H6C4.34315 1 3 2.34315 3 4V18C3 18.5523 3.44772 19 4 
19C4.55228 19 5 18.5523 5 18V4C5 3.44772 5.44772 3 6 3Z" fill="currentColor" />
    </svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className = '', ...props }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`flex-shrink-0 ${className}`}
        {...props}
    >
        <path d="M4 12.6111L8.92308 17.5L20 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ErrorIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className = '', ...props }) => (
    <svg
        className={`text-red-500 flex-shrink-0 ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
        />
    </svg>
);

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className = '', ...props }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`flex-shrink-0 ${className}`}
        {...props}
    >
        <path d="M3 15C3 17.8284 3 19.2426 3.87868 20.1213C4.75736 21 6.17157 21 9 21H15C17.8284 21 19.2426 21 
20.1213 20.1213C21 19.2426 21 17.8284 21 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 3V16M12 16L16 11.625M12 16L8 11.625" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

const OpenSourceIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className = '', ...props }) => (
    <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={`flex-shrink-0 ${className}`}
        {...props}
    >
        <g>
            <path fill="none" d="M0 0H24V24H0z" />
            <path fill='currentColor' d="M12 2c5.523 0 10 4.477 10 10 0 4.4-2.841 8.136-6.789 9.473l-.226.074-2.904-7.55C13.15 
        13.95 14 13.054 14 12c0-1.105-.895-2-2-2s-2 .895-2 2c0 1.077.851 1.955 1.917 1.998l-2.903 7.549-.225-.074C4.84 
        20.136 2 16.4 2 12 2 6.477 6.477 2 12 2zm0 2c-4.418 0-8 3.582-8 8 0 2.92 1.564 5.475 3.901 6.872l1.48-3.849C8.534 14.29 
        8 13.207 8 12c0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.207-.535 2.29-1.38 3.023.565 1.474 1.059 2.757 1.479 3.85C18.435 17.475 20 
        14.92 20 12c0-4.418-3.582-8-8-8z"/>
        </g>
    </svg>
);

const DeleteIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className = '', ...props }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`flex-shrink-0 ${className}`}
        {...props}
    >
        <path d="M10 12V17" stroke='currentColor' strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 12V17" stroke='currentColor' strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 7H20" stroke='currentColor' strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10" stroke='currentColor' strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke='currentColor' strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

const AvatarIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className = '', ...props }) => (
    <svg
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
        className={`flex-shrink-0 ${className}`}
        {...props}
    >
        <path d="m 8 1 c -1.65625 0 -3 1.34375 -3 3 s 1.34375 3 3 3 s 3 -1.34375 3 -3 s -1.34375 -3 -3 -3 z m -1.5 7 c 
    -2.492188 0 -4.5 2.007812 -4.5 4.5 v 0.5 c 0 1.109375 0.890625 2 2 2 h 8 c 1.109375 0 2 -0.890625 2 -2 v -0.5 c 0 
    -2.492188 -2.007812 -4.5 -4.5 -4.5 z m 0 0" fill="#2e3436" />
    </svg>
)

const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className = '', ...props }) => (
    <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        className={`flex-shrink-0 ${className}`}
        {...props}
    >
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
)

export {
    UploadIcon,
    LanguageIcon,
    PrivacyIcon,
    PDFIcon,
    IMGIcon,
    CopyIcon,
    CheckIcon,
    ErrorIcon,
    DownloadIcon,
    OpenSourceIcon,
    DeleteIcon,
    AvatarIcon,
    GoogleIcon,
};

