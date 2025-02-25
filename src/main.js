document.addEventListener('DOMContentLoaded', () => {
  // Select all .pinned-table elements
  const pinnedTables = document.querySelectorAll('.pinned-table');

  pinnedTables.forEach((table) => {
    setupPinnedHeader(table);
  });

  function setupPinnedHeader(table) {
    // 1) Find the .pin-container (closest parent)
    const container = table.closest('.pin-container');
    if (!container) return; // If no container, skip

    // 2) Clone the thead
    const originalThead = table.querySelector('thead');
    if (!originalThead) return;

    const clonedTable = document.createElement('table');
    clonedTable.className = table.className + ' pinned-header';
    const clonedThead = originalThead.cloneNode(true);
    clonedTable.appendChild(clonedThead);
    container.appendChild(clonedTable);

    // 3) Sync initial widths
    syncWidths();

    // 4) Listen for scroll on window, not container
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);

    // Handle wheel events on both containers for smooth bidirectional scrolling
    function setupWheelSynchronization(tableResponsive, scrollContainer) {
      // Prevent multiple event listeners
      tableResponsive.removeEventListener('wheel', handleTableWheel);
      scrollContainer.removeEventListener('wheel', handleHeaderWheel);

      // Add wheel event listeners
      tableResponsive.addEventListener('wheel', handleTableWheel);
      scrollContainer.addEventListener('wheel', handleHeaderWheel);

      function handleTableWheel(event) {
        // If the wheel event includes horizontal scrolling
        if (event.deltaX !== 0) {
          // Also update the header scroll position
          scrollContainer.scrollLeft += event.deltaX;
        }
      }

      function handleHeaderWheel(event) {
        // If the wheel event includes horizontal scrolling
        if (event.deltaX !== 0) {
          // Also update the table scroll position
          tableResponsive.scrollLeft += event.deltaX;
        }
      }

      // Store the handlers to be able to remove them later
      tableResponsive._wheelHandler = handleTableWheel;
      scrollContainer._wheelHandler = handleHeaderWheel;
    }

    // When hiding the header, remove wheel event listeners
    function removeWheelSynchronization(tableResponsive, scrollContainer) {
      if (tableResponsive && tableResponsive._wheelHandler) {
        tableResponsive.removeEventListener('wheel', tableResponsive._wheelHandler);
      }

      if (scrollContainer && scrollContainer._wheelHandler) {
        scrollContainer.removeEventListener('wheel', scrollContainer._wheelHandler);
      }
    }

    function onScroll() {
      const tableRect = table.getBoundingClientRect();
      const theadRect = originalThead.getBoundingClientRect();

      // If the original thead is scrolled out of view (its bottom is above viewport)
      const theadOutOfView = theadRect.bottom <= 0;

      // If the entire table is scrolled out of view (bottom is above viewport)
      const tableOutOfView = tableRect.bottom <= 0;

      // If table is still visible in viewport but thead is not
      if (theadOutOfView && !tableOutOfView) {
        // Get the table's parent container (table-responsive)
        const tableResponsive = table.closest('.table-responsive');

        // Calculate actual widths and positions
        const bootstrapGutterX = '1.5rem'; // Default Bootstrap gutter
        const containerPadding = `calc(${bootstrapGutterX} * 0.5)`;

        // Create outer background container if it doesn't exist
        let outerBackground = document.getElementById('pinned-header-background');
        if (!outerBackground) {
          outerBackground = document.createElement('div');
          outerBackground.id = 'pinned-header-background';
          // Base styling, specific styling will be applied below based on screen width
          outerBackground.style.cssText = 'position:fixed;top:0;left:0;right:0;width:100%;';
          document.body.appendChild(outerBackground);
        }

        // Create container wrapper if it doesn't exist
        let containerWrapper = document.getElementById('pinned-header-container-wrapper');
        if (!containerWrapper) {
          containerWrapper = document.createElement('div');
          containerWrapper.id = 'pinned-header-container-wrapper';
          // Base styling, specific styling will be applied below based on screen width
          containerWrapper.style.cssText = 'position:fixed;top:0;left:0;right:0;width:100%;z-index:999;';
          document.body.appendChild(containerWrapper);
        }

        // Create inner scrollable container if it doesn't exist
        let scrollContainer = document.getElementById('pinned-header-scroll-container');
        if (!scrollContainer) {
          scrollContainer = document.createElement('div');
          scrollContainer.id = 'pinned-header-scroll-container';
          scrollContainer.style.cssText = 'overflow-x:auto;max-width:100%;margin:0 auto;';
          containerWrapper.appendChild(scrollContainer);
        }

        // Always use the scroll container
        if (clonedTable.parentNode !== scrollContainer) {
          scrollContainer.innerHTML = '';
          scrollContainer.appendChild(clonedTable);
        }

        clonedTable.style.display = 'table';
        clonedTable.style.position = 'static';
        clonedTable.style.margin = '0 auto';

        // Match the exact width of the original table
        clonedTable.style.width = table.scrollWidth + 'px';
        clonedTable.style.minWidth = table.scrollWidth + 'px';

        // Sync scroll position of header with table container
        if (tableResponsive) {
          // Set initial scroll position to match the table container
          scrollContainer.scrollLeft = tableResponsive.scrollLeft;

          // Sync table scrolling with header scrolling (both ways)
          scrollContainer.removeEventListener('scroll', syncTableScroll);
          tableResponsive.removeEventListener('scroll', syncHeaderScroll);

          scrollContainer.addEventListener('scroll', syncTableScroll);
          tableResponsive.addEventListener('scroll', syncHeaderScroll);

          function syncTableScroll() {
            tableResponsive.scrollLeft = scrollContainer.scrollLeft;
          }

          function syncHeaderScroll() {
            scrollContainer.scrollLeft = tableResponsive.scrollLeft;
          }

          // Setup wheel event synchronization for mouse wheel scrolling
          setupWheelSynchronization(tableResponsive, scrollContainer);
        }

        // Get container styles for proper alignment
        const containerStyle = window.getComputedStyle(container);
        const tableContainerStyle = window.getComputedStyle(tableResponsive);

        // Position and style the containers based on screen size
        if (window.innerWidth >= 992) {
          // On desktop, align with table exactly
          containerWrapper.style.left = tableRect.left + 'px';
          containerWrapper.style.right = 'auto';
          containerWrapper.style.width = tableRect.width + 'px';
          containerWrapper.style.backgroundColor = '#fff';
          containerWrapper.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';

          // Keep background transparent on desktop
          outerBackground.style.backgroundColor = 'transparent';
          outerBackground.style.boxShadow = 'none';
          outerBackground.style.height = scrollContainer.scrollHeight + 'px';

          // No container or margins, and no scrollbar on desktop
          scrollContainer.style.width = '100%';
          scrollContainer.style.maxWidth = tableRect.width + 'px';
          scrollContainer.style.margin = '0';
          scrollContainer.style.padding = '0';
          scrollContainer.style.overflowX = 'hidden'; // Hide scrollbar on desktop
        } else {
          // On mobile, match the Bootstrap container
          const containerWidth = getComputedStyle(container.closest('.container')).width;

          containerWrapper.style.left = '0';
          containerWrapper.style.right = '0';
          containerWrapper.style.width = '100%';
          containerWrapper.style.backgroundColor = 'transparent';
          containerWrapper.style.boxShadow = 'none';

          // Apply background and shadow to the background layer for mobile
          outerBackground.style.backgroundColor = '#fff';
          outerBackground.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
          outerBackground.style.height = scrollContainer.scrollHeight + 'px';

          // Match the container's width and padding
          scrollContainer.style.width = containerWidth;
          scrollContainer.style.maxWidth = containerWidth;
          scrollContainer.style.margin = '0 auto';
          scrollContainer.style.paddingLeft = containerPadding;
          scrollContainer.style.paddingRight = containerPadding;
          scrollContainer.style.overflowX = 'auto'; // Enable scrollbar on mobile

          // Ensure content can be scrolled without margins causing whitespace
          clonedTable.style.marginLeft = '0';
          clonedTable.style.marginRight = '0';
        }

        outerBackground.style.display = 'block';
        containerWrapper.style.display = 'block';
        syncWidths();
        syncRowHeights();
      } else {
        // Hide header when not needed
        const outerBackground = document.getElementById('pinned-header-background');
        const containerWrapper = document.getElementById('pinned-header-container-wrapper');

        if (outerBackground) {
          outerBackground.style.display = 'none';
        }

        if (containerWrapper) {
          containerWrapper.style.display = 'none';

          // Remove scroll event listeners when hidden
          const scrollContainer = document.getElementById('pinned-header-scroll-container');
          const tableResponsive = table.closest('.table-responsive');

          if (tableResponsive && scrollContainer) {
            // Remove the event listeners properly
            tableResponsive.removeEventListener('scroll', syncHeaderScroll);
            scrollContainer.removeEventListener('scroll', syncTableScroll);

            // Also remove wheel event listeners
            removeWheelSynchronization(tableResponsive, scrollContainer);
          }
        }
      }
    }

    function onResize() {
      syncWidths();
      syncRowHeights();

      // Get current scroll container
      const scrollContainer = document.getElementById('pinned-header-scroll-container');

      // If container exists and is visible, update table scroll position
      if (scrollContainer) {
        const containerWrapper = document.getElementById('pinned-header-container-wrapper');
        if (containerWrapper && containerWrapper.style.display !== 'none') {
          const tableResponsive = table.closest('.table-responsive');
          if (tableResponsive) {
            // Ensure scroll positions are synchronized after resize
            tableResponsive.scrollLeft = scrollContainer.scrollLeft;
          }
        }
      }

      // Force scroll event to reposition if needed
      onScroll();
    }

    // 5) Sync column widths
    function syncWidths() {
      // Use scrollWidth to account for the full width of the table, including overflow
      const tableScrollWidth = table.scrollWidth;
      clonedTable.style.width = tableScrollWidth + 'px';

      // Match individual column widths
      const originalThs = originalThead.querySelectorAll('th');
      const cloneThs = clonedThead.querySelectorAll('th');

      originalThs.forEach((th, i) => {
        if (cloneThs[i]) {
          // Get computed width of the original headers
          const computedWidth = window.getComputedStyle(th).width;
          cloneThs[i].style.width = computedWidth;
          cloneThs[i].style.minWidth = computedWidth;
        }
      });
    }

    // 6) Sync row heights to match original header rows
    function syncRowHeights() {
      const originalRows = originalThead.querySelectorAll('tr');
      const clonedRows = clonedThead.querySelectorAll('tr');

      originalRows.forEach((row, rowIndex) => {
        if (clonedRows[rowIndex]) {
          // Get the computed height of the original row
          const originalHeight = row.offsetHeight;

          // Apply to cloned row - ensure sufficient height for wrapped text
          clonedRows[rowIndex].style.height = originalHeight + 'px';

          // Also match cell heights within each row
          const originalCells = row.querySelectorAll('th, td');
          const clonedCells = clonedRows[rowIndex].querySelectorAll('th, td');

          originalCells.forEach((cell, cellIndex) => {
            if (clonedCells[cellIndex]) {
              // Copy the text from the original cell to ensure same content
              clonedCells[cellIndex].innerHTML = cell.innerHTML;

              // Adjust styling for proper alignment
              clonedCells[cellIndex].style.verticalAlign = 'middle';
            }
          });
        }
      });
    }
  }
});