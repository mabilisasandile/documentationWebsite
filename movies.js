// Proper way to handle window.onload without overwriting existing handlers
function addLoadEvent(func) {
    const oldOnload = window.onload;
    if (typeof window.onload !== 'function') {
        window.onload = func;
    } else {
        window.onload = function () {
            if (oldOnload) {
                oldOnload();
            }
            func();
        };
    }
}

// Function to open the PDF
function openMovies() {
    // Show loading state
    document.getElementById('pdf-status').innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Opening PDF documentation...</p>
        </div>
    `;

    // Show status message
    const statusMessage = document.getElementById('status-message');
    statusMessage.style.display = 'block';
    statusMessage.textContent = 'Attempting to open the PDF documentation...';
    statusMessage.className = 'status-message';

    try {
        // Try to open the PDF
        const pdfWindow = window.open('assets/documents/Movie_Listing_App_Documentation.pdf', '_blank');

        // Check if the window was opened successfully
        if (pdfWindow) {
            statusMessage.textContent = 'PDF opened successfully in a new tab!';
            statusMessage.classList.add('success');

            // Update the viewer message
            document.getElementById('pdf-status').innerHTML = `
                <div class="no-pdf-message">
                    <i class="fas fa-check-circle"></i>
                    <h3>PDF Opened Successfully</h3>
                    <p>The documentation has been opened in a new browser tab</p>
                    <p>If you don't see the PDF, please check your pop-up blocker settings</p>
                </div>
            `;
        } else {
            // Most likely blocked by pop-up blocker
            throw new Error('Popup blocked or failed to open');
        }
    } catch (error) {
        console.error('Error opening PDF:', error);

        statusMessage.textContent = `Error: ${error.message || 'Unable to open PDF'}`;
        statusMessage.classList.add('error');

        // Show error message
        document.getElementById('pdf-status').innerHTML = `
            <div class="no-pdf-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Opening PDF</h3>
                <p>There was an error opening the PDF documentation.</p>
                <p>Possible causes:</p>
                <ul style="text-align: left; margin-top: 10px;">
                    <li>Popup blocker is preventing the PDF from opening</li>
                    <li>The PDF file may not exist at the specified path</li>
                    <li>Browser restrictions for opening local files</li>
                </ul>
                <p style="margin-top: 20px;">Please check the browser console for detailed error information.</p>
            </div>
        `;
    }
}

// Add event listener to the button
document.getElementById('open-pdf').addEventListener('click', openMovies);

// Add the load event properly
addLoadEvent(function () {
    console.log('Page loaded, attempting to open PDF...');
    // You can choose to automatically open the PDF on load or not
    // openMovies(); // Uncomment this line if you want it to open automatically
});