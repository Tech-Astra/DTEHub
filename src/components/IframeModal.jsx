import { X, ExternalLink } from 'lucide-react';
import './IframeModal.css';

export default function IframeModal({ url, onClose }) {
    if (!url) return null;

    // Convert standard Google Drive /view URLs to /preview for embedding so it works in iframes.
    let embedUrl = url;
    if (url.includes('drive.google.com/file/d/')) {
        embedUrl = url.split('/view')[0] + '/preview';
    } else if (url.includes('drive.google.com/drive/folders/')) {
        const folderId = url.split('/folders/')[1]?.split('?')[0];
        if (folderId) {
            embedUrl = `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;
        }
    }

    return (
        <div className="iframe-modal-overlay" onClick={onClose}>
            <div className="iframe-modal-container" onClick={e => e.stopPropagation()}>
                <div className="iframe-modal-header">
                    <h3>Document Viewer</h3>
                    <div className="iframe-modal-actions">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="btn-icon" title="Open in new tab">
                            <ExternalLink size={20} />
                        </a>
                        <button className="btn-icon" onClick={onClose} title="Close">
                            <X size={24} />
                        </button>
                    </div>
                </div>
                <div className="iframe-modal-body">
                    <iframe 
                        src={embedUrl} 
                        title="Document Viewer" 
                        allow="autoplay" 
                        frameBorder="0"
                    ></iframe>
                </div>
            </div>
        </div>
    );
}
