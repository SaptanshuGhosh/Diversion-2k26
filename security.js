(function() {
    // 1. Disable Right-Click (Prevents "Save Image As" or "Inspect Element")
    document.addEventListener('contextmenu', event => event.preventDefault());

    // 2. Block Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Disable F12 (DevTools)
        if (e.key === 'F12') e.preventDefault();
        
        if (e.key == 'Printscreen') e.preventDefault();
        if (e.metaKey || e.ctrlKey || e.shiftKey) e.preventDefault();
        // Disable Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (Inspect)
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) e.preventDefault();
        
        // Disable Ctrl+U (View Source)
        if (e.ctrlKey && e.key === 'u') e.preventDefault();
        
        // Disable Ctrl+P (Print - which can be used to save as PDF)
        if (e.ctrlKey && e.key === 'p') e.preventDefault();

        // Disable Ctrl+S (Save Page)
        if (e.ctrlKey && e.key === 's') e.preventDefault();

        // Disable Ctrl+C / Ctrl+V (Copy/Paste)
        if (e.ctrlKey && (e.key === 'c' || e.key === 'v')) {
            e.preventDefault();
            alert("Copying content is disabled during the assessment.");
        }
        
    });

    // 3. Tab Switching/Focus Protection
    // Hides the content if the student tries to switch tabs to look up an answer
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            document.body.style.filter = "blur(20px)";
            console.warn("Tab switch detected.");
        } else {
            document.body.style.filter = "none";
        }
    });

    // 4. CSS Protection (Injecting styles via JS)
    const style = document.createElement('style');
    style.innerHTML = `
        /* Prevent text selection */
        * {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        /* Visual indicator for PrintScreen (though not 100% effective in all browsers) */
        @media print {
            body { display: none !important; }
        }
    `;
    document.head.appendChild(style);

    console.log("SmartEdu Security Shield Active.");
})();