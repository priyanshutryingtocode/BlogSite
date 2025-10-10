
    // Get the textarea element
    const textarea = document.getElementById('content');

    textarea.addEventListener('input', () => {
        // Temporarily reset the height to 'auto' to get the correct scrollHeight
        textarea.style.height = 'auto';
        
        // Set the height to the scrollHeight, which is the full height of the content
        textarea.style.height = textarea.scrollHeight + 'px';
    });
