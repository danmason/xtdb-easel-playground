function initializeCanvas() {
    console.log("Initializing Canvas...")
    var canvas = document.getElementById('drawingCanvas');
    var context = canvas.getContext('2d');

    function startDrawing(e) {
        drawing = true;
        draw(e);
    }

    function draw(e) {
        if (!drawing) return;
        context.lineWidth = 3;
        context.lineCap = 'round';
        context.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        context.stroke();
        context.beginPath();
        context.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    }

    function stopDrawing() {
        drawing = false;
        context.beginPath();
        // Send data to server whenever the line is finished drawing
        sendDataToServer();
    }

    function sendDataToServer() {
        var canvasData = canvas.toDataURL();  // Get canvas data as base64
        var data = { image: canvasData, canvasId: canvasId };

        fetch('/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.text())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });

        // Update last edited time
        updateLastEditedTime();
    }

    function updateLastEditedTime() {
        var now = new Date();
        var nowString = now.toISOString().split('.')[0]+"Z";
        var lastEditedDiv = document.querySelector('.last-edited');
        lastEditedDiv.textContent = 'Last Edited: ' + nowString;
    }

    // Setup drawing on canvas
    var drawing = false;
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    if (imageState != null) {
        var image = new Image();
        image.onload = function() {
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
        };
        image.src = imageState;
    }
}

window.onload = function() {
    initializeCanvas();
    if (canvasId) {
        var newUrl = window.location.href.split('?')[0] + '?canvasId=' + canvasId;
        window.history.pushState({ path: newUrl }, '', newUrl);
    }
};
