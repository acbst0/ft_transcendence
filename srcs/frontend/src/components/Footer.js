import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Footer.css';
import TermsModal from './TermsModal';
import KVKKModal from './KVKKModal';

const Footer = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    const [showTerms, setShowTerms] = useState(false);
    const [showKVKK, setShowKVKK] = useState(false);

    return (
        <>
            <footer className={`footer ${isHomePage ? 'footer-home' : ''}`}>
                <div className="container">
                    <div className="row py-2 py-md-3">
                        <div className="col-12">
                            <div className="footer-content d-flex flex-column flex-md-row align-items-center justify-content-center gap-2 gap-md-3">
                                <button
                                    onClick={() => setShowTerms(true)}
                                    className="footer-link btn btn-link p-0"
                                >
                                    Terms of Service
                                </button>
                                <span className="footer-separator d-none d-md-inline">•</span>
                                <button
                                    onClick={() => setShowKVKK(true)}
                                    className="footer-link btn btn-link p-0"
                                >
                                    KVKK
                                </button>
                                <span className="footer-separator d-none d-md-inline">•</span>
                                <span className="footer-copyright">
                                    © 2026 Planora. All rights reserved.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            <TermsModal
                isOpen={showTerms}
                onClose={() => setShowTerms(false)}
            />

            <KVKKModal
                isOpen={showKVKK}
                onClose={() => setShowKVKK(false)}
            />
        </>
    );
};

export default Footer;
