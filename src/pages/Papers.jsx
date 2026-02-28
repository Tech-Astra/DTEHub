import { Search, Download, Eye, FileText } from 'lucide-react';
import './Papers.css';

const papersData = [
    { id: 101, year: '2023', subject: 'Computer Networks (CS301)', type: 'End Semester (E.S.)', exam: 'Regular', code: 'CS301' },
    { id: 102, year: '2023', subject: 'Database Systems (CS303)', type: 'Mid-Term (M.T.)', exam: 'Regular', code: 'CS303' },
    { id: 103, year: '2023', subject: 'Data Structures (CS302)', type: 'End Semester (E.S.)', exam: 'Regular', code: 'CS202' },
    { id: 104, year: '2022', subject: 'Data Structures (CS301)', type: 'End Semester (E.S.)', exam: 'Regular', code: 'CS202' },
    { id: 105, year: '2022', subject: 'Data Structures (CS302)', type: 'Mid-Term (M.T.)', exam: 'Backlog', code: 'CS202' },
    { id: 106, year: '2023', subject: 'Computer Networks (CS301)', type: 'End Semester (E.S.)', exam: 'Regular', code: 'CS301' }
];

export default function Papers() {
    return (
        <div className="container papers-page">
            <div className="papers-header">
                <div>
                    <h1 className="page-title">Previous Year Question Papers</h1>
                    <p className="page-subtitle">Access and manage academic papers for all courses and years.</p>
                </div>

                <div className="papers-filters">
                    <div className="filter-select">
                        <label>Select Year</label>
                        <select>
                            <option>All Years</option>
                            <option>2023</option>
                            <option>2022</option>
                            <option>2021</option>
                        </select>
                    </div>
                    <div className="filter-select">
                        <label>Select Subject</label>
                        <select>
                            <option>Computer Science</option>
                            <option>Mechanical</option>
                            <option>Electrical</option>
                        </select>
                    </div>

                    <div className="search-bar-modern papers-search">
                        <Search className="search-icon" size={18} />
                        <input type="text" placeholder="Search papers by code..." />
                    </div>
                </div>
            </div>

            <div className="card table-container">
                <table className="papers-table">
                    <thead>
                        <tr>
                            <th>YEAR</th>
                            <th>SUBJECT</th>
                            <th>PAPER TYPE</th>
                            <th>EXAM TYPE</th>
                            <th>CODE</th>
                            <th className="text-right">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {papersData.map(paper => (
                            <tr key={paper.id}>
                                <td>{paper.year}</td>
                                <td>
                                    <div className="subject-cell">
                                        <FileText size={16} className="text-muted" />
                                        {paper.subject}
                                    </div>
                                </td>
                                <td className="text-muted">{paper.type}</td>
                                <td className="text-muted">{paper.exam}</td>
                                <td className="text-muted">{paper.code}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-outline btn-sm">
                                            View PDF
                                        </button>
                                        <button className="btn-primary btn-sm btn-icon">
                                            <Download size={16} /> Download
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
