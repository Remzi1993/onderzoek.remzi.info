// Import styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './main.css';

// Import JS dependencies
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { marked } from 'marked';

// Load README.md on document load
document.addEventListener('DOMContentLoaded', function() {
  // Load README.md content
  fetch('./README.md')
    .then(response => response.text())
    .then(markdown => {
      const markdownElement = document.querySelector('#markdown');
      if (markdownElement) {
        markdownElement.innerHTML = marked.parse(markdown);
      }
    })
    .catch(error => {
      console.error('Error loading README.md:', error);
      const markdownElement = document.querySelector('#markdown');
      if (markdownElement) {
        markdownElement.innerHTML = '<p>Error loading content.</p>';
      }
    });

  // Initialize sticky headers for tables with pinned-table class
  initStickyTableHeaders();
});

/**
 * Completely new implementation of sticky table headers
 */
function initStickyTableHeaders() {
  // Select all tables with the pinned-table class
  const tables = document.querySelectorAll('table.pinned-table');
  console.log(`Found ${tables.length} tables with pinned-table class`);

  if (tables.length === 0) {
    return; // No tables found
  }

  // Process each table
  tables.forEach((table, index) => {
    const tableId = `pinned-table-${index}`;
    table.setAttribute('data-table-id', tableId);

    // Find the table container and responsive wrapper
    const tableResponsive = table.closest('.table-responsive');
    const container = table.closest('.pin-container');

    if (!tableResponsive || !container) {
      console.warn('Table is missing proper parent structure (.table-responsive and .pin-container)');
      return;
    }

    // Create a sticky header container
    const stickyContainer = document.createElement('div');
    stickyContainer.className = 'sticky-header-container';
    stickyContainer.id = `sticky-container-${tableId}`;
    stickyContainer.style.cssText = `
      position: fixed;
      top: 0;
      z-index: 1000;
      background-color: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      overflow: hidden;
      display: none;
      width: ${tableResponsive.offsetWidth}px;
    `;
    container.insertBefore(stickyContainer, tableResponsive);

    // Create a sticky header table with the same classes
    const stickyTable = document.createElement('table');
    stickyTable.className = table.className;
    stickyTable.classList.add('sticky-header-table');

    // Clone the thead only
    const thead = table.querySelector('thead');
    if (!thead) {
      console.warn('Table is missing thead element');
      return;
    }

    const clonedThead = thead.cloneNode(true);
    stickyTable.appendChild(clonedThead);

    // Add to the container
    stickyContainer.appendChild(stickyTable);

    // Match initial column widths
    syncColumnWidths(table, stickyTable);

    // Set up scroll synchronization for horizontal scrolling
    let scrolling = false;
    tableResponsive.addEventListener('scroll', function() {
      if (!scrolling) {
        scrolling = true;
        stickyContainer.scrollLeft = tableResponsive.scrollLeft;
        requestAnimationFrame(() => {
          scrolling = false;
        });
      }
    });

    stickyContainer.addEventListener('scroll', function() {
      if (!scrolling) {
        scrolling = true;
        tableResponsive.scrollLeft = stickyContainer.scrollLeft;
        requestAnimationFrame(() => {
          scrolling = false;
        });
      }
    });

    // Set up scroll handler for showing/hiding the sticky header
    function handleScroll() {
      const tableRect = table.getBoundingClientRect();
      const theadRect = thead.getBoundingClientRect();

      // Determine if the header is out of view but the table is still visible
      const headerIsOutOfView = theadRect.bottom <= 0;
      const tableIsStillVisible = tableRect.bottom > 0;

      if (headerIsOutOfView && tableIsStillVisible) {
        // Show sticky header
        stickyContainer.style.display = 'block';
        stickyContainer.style.left = `${tableResponsive.getBoundingClientRect().left}px`;
        stickyContainer.style.width = `${tableResponsive.offsetWidth}px`;

        // Re-sync column widths in case they've changed
        syncColumnWidths(table, stickyTable);
      } else {
        // Hide sticky header
        stickyContainer.style.display = 'none';
      }
    }

    // Add the scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Add resize handler to update dimensions
    window.addEventListener('resize', function() {
      syncColumnWidths(table, stickyTable);

      // Update container position and width
      if (stickyContainer.style.display === 'block') {
        stickyContainer.style.left = `${tableResponsive.getBoundingClientRect().left}px`;
        stickyContainer.style.width = `${tableResponsive.offsetWidth}px`;
      }
    });

    // Run once to check initial state
    handleScroll();

    // Store references for cleanup
    table._stickyData = {
      stickyContainer,
      stickyTable,
      handleScroll,
      tableResponsive
    };
  });
}

/**
 * Synchronize column widths between original table and sticky header table
 */
function syncColumnWidths(sourceTable, targetTable) {
  // Check parameters
  if (!sourceTable || !targetTable) return;

  // Get source headers and target headers
  const sourceHeaders = sourceTable.querySelectorAll('thead th');
  const targetHeaders = targetTable.querySelectorAll('thead th');

  if (sourceHeaders.length !== targetHeaders.length) {
    console.warn('Header column count mismatch');
    return;
  }

  // Copy width from each source column to target column
  sourceHeaders.forEach((header, index) => {
    const width = window.getComputedStyle(header).width;
    targetHeaders[index].style.width = width;
    targetHeaders[index].style.minWidth = width;
  });

  // Match the overall table width
  targetTable.style.width = `${sourceTable.offsetWidth}px`;
  targetTable.style.minWidth = `${sourceTable.offsetWidth}px`;
}

// Expose the init function globally for potential debugging
window.initStickyTableHeaders = initStickyTableHeaders;