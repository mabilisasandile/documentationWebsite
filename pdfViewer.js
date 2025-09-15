// Set PDF.js worker path
pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// Variables
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;
let currentPdfUrl = null;

// Elements
const pdfSelector = document.getElementById('pdf-selector');
const downloadBtn = document.getElementById('download');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const currentPageEl = document.getElementById('current-page');
const totalPagesEl = document.getElementById('total-pages');
const pdfContainer = document.getElementById('pdf-container');

// Event Listeners
pdfSelector.addEventListener('change', loadPDF);
downloadBtn.addEventListener('click', downloadPDF);
zoomInBtn.addEventListener('click', () => changeScale(0.2));
zoomOutBtn.addEventListener('click', () => changeScale(-0.2));
prevBtn.addEventListener('click', onPrevPage);
nextBtn.addEventListener('click', onNextPage);

// Functions
function loadPDF() {
    const pdfPath = pdfSelector.value;
    if (!pdfPath) return;
    
    // Show loading state
    pdfContainer.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading PDF...</p>
        </div>
    `;
    
    // Load PDF using PDF.js
    pdfjsLib.getDocument(pdfPath).promise.then(pdf => {
        pdfDoc = pdf;
        currentPdfUrl = pdfPath;
        totalPagesEl.textContent = pdf.numPages;
        pageNum = 1;
        
        // Enable buttons
        downloadBtn.disabled = false;
        prevBtn.disabled = pageNum <= 1;
        nextBtn.disabled = pageNum >= pdf.numPages;
        
        // Render first page
        renderPage(pageNum);
    }).catch(error => {
        console.error('Error loading PDF:', error);
        pdfContainer.innerHTML = `
            <div class="no-pdf-message">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error Loading PDF</h3>
                <p>The file may not exist or there may be a CORS issue</p>
                <p>Check your browser console for details</p>
            </div>
        `;
    });
}

function renderPage(num) {
    pageRendering = true;
    
    pdfDoc.getPage(num).then(page => {
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        
        const renderTask = page.render(renderContext);
        
        renderTask.promise.then(() => {
            pageRendering = false;
            
            // Update page display
            currentPageEl.textContent = num;
            
            // Update button states
            prevBtn.disabled = num <= 1;
            nextBtn.disabled = num >= pdfDoc.numPages;
            
            // Clear container and append canvas
            pdfContainer.innerHTML = '';
            pdfContainer.appendChild(canvas);
        });
    });
}

function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

function onPrevPage() {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
}

function onNextPage() {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
}

function changeScale(delta) {
    scale += delta;
    queueRenderPage(pageNum);
}

function downloadPDF() {
    if (!currentPdfUrl) return;
    
    // Create a temporary link for downloading
    const downloadLink = document.createElement('a');
    downloadLink.href = currentPdfUrl;
    
    // Extract filename from path
    const filename = currentPdfUrl.split('/').pop();
    downloadLink.download = filename;
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// Initial button states
prevBtn.disabled = true;
nextBtn.disabled = true;