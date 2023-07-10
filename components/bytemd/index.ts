import dynamic from 'next/dynamic';

const BytemdEditor = dynamic(() => import('./editor'));
const BytemdViewer = dynamic(() => import('./viewer'));

export { BytemdEditor, BytemdViewer };
