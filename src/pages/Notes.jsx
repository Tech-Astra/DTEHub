import { Search, Download, FileText, Star } from 'lucide-react';
import './Notes.css';

const notesData = [
    { id: 1, title: 'Data Structures & Algorithms', chapter: 'Ch 4: Trees & Graphs', author: 'Prof. Sharma', size: '2.1 MB', rating: 4.8 },
    { id: 2, title: 'Operating Systems', chapter: 'Ch 3: Process Scheduling', author: 'Dr. R. K. Singh', size: '3.4 MB', rating: 4.5 },
    { id: 3, title: 'Computer Networks', chapter: 'Ch 6: Transport Layer', author: 'Prof. Sharma', size: '1.8 MB', rating: 4.7 },
    { id: 4, title: 'Software Engineering', chapter: 'Ch 2: SDLC Models', author: 'Mrs. Anjali', size: '4.2 MB', rating: 4.6 },
    { id: 5, title: 'Database Management', chapter: 'Ch 5: Normalization', author: 'Dr. R. K. Singh', size: '2.5 MB', rating: 4.9 },
    { id: 6, title: 'Digital Electronics', chapter: 'Ch 1: Boolean Algebra', author: 'Mr. Verma', size: '1.5 MB', rating: 4.4 },
];

export default function Notes() {
    return (
        <div className="container notes-page">
            <div className="page-header">
                <h1 className="page-title">Resource Notes</h1>
                <p className="page-subtitle">Access premium study materials curated for your syllabus.</p>
            </div>

            <div className="notes-layout">
                <aside className="sidebar">
                    <div className="filter-group">
                        <h3 className="filter-title">BRANCH</h3>
                        <label className="checkbox-label">
                            <input type="radio" name="branch" defaultChecked /> Computer Science
                        </label>
                        <label className="checkbox-label">
                            <input type="radio" name="branch" /> Mechanical Engg.
                        </label>
                        <label className="checkbox-label">
                            <input type="radio" name="branch" /> Electrical Engg.
                        </label>
                        <label className="checkbox-label">
                            <input type="radio" name="branch" /> Civil Engg.
                        </label>
                    </div>

                    <div className="filter-group">
                        <h3 className="filter-title">SEMESTER</h3>
                        <label className="checkbox-label">
                            <input type="radio" name="sem" /> Semester 1
                        </label>
                        <label className="checkbox-label">
                            <input type="radio" name="sem" /> Semester 2
                        </label>
                        <label className="checkbox-label">
                            <input type="radio" name="sem" defaultChecked /> Semester 3
                        </label>
                        <label className="checkbox-label">
                            <input type="radio" name="sem" /> Semester 4
                        </label>
                    </div>
                </aside>

                <main className="notes-content">
                    <div className="search-bar-modern">
                        <Search className="search-icon" size={20} />
                        <input type="text" placeholder="Search notes, subjects or authors..." />
                    </div>

                    <div className="notes-grid">
                        {notesData.map(note => (
                            <div key={note.id} className="note-card card">
                                <div className="note-header">
                                    <h4 className="note-subject">{note.title}</h4>
                                    <FileText size={20} className="note-icon" />
                                </div>
                                <p className="note-chapter">{note.chapter}</p>
                                <p className="note-author">{note.author}</p>

                                <button className="btn-primary w-full mt-4">
                                    <Download size={18} /> Download
                                </button>

                                <div className="note-meta">
                                    <span className="note-size">{note.size}</span>
                                    <span className="note-rating flex-center gap-1">
                                        <Star size={14} fill="currentColor" color="var(--accent-hover)" /> {note.rating}/5
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
