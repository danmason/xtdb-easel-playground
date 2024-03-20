function generate_short_uuid() {
	return crypto.randomUUID().substring(0, 8);
} 

const urlParams = new URLSearchParams(window.location.search);
const canvasId = urlParams.get('canvasId') || generate_short_uuid();

async function sendDataToServer(canvasId: String, canvasData: String) {
	const data = { canvasId, canvasData };
	try {
			const response = await fetch('/api/submit-canvas', {
					method: 'POST',
					headers: {
							'Content-Type': 'application/json',
					},
					body: JSON.stringify(data),
			});
			const result = await response.json();
			console.log(result);
			if (result.success) {
					const lastEditedDiv = document.querySelector('.last-edited');
					if (lastEditedDiv !== null) {
							lastEditedDiv.textContent = 'Last Edited: ' + result.lastEdited;
					}
			} else {
					console.error('Error submitting data:', result.error);
			}
	} catch (error) {
			console.error('Failed to send data to the server:', error);
	}
}

function initializeCanvas(canvas: HTMLCanvasElement) {
	console.log('Initializing Canvas...');
	var context = canvas.getContext('2d')!;
	
	function startDrawing(e: MouseEvent) {
		drawing = true;
		draw(e);
	}

	function draw(e: MouseEvent) {
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
		sendDataToServer(canvasId, canvas.toDataURL());
	}

	var drawing = false;
	canvas.addEventListener('mousedown', startDrawing);
	canvas.addEventListener('mousemove', draw);
	canvas.addEventListener('mouseup', stopDrawing);
	// if (imageState != null) {
	// 	var image = new Image();
	// 	image.onload = function () {
	// 		context.drawImage(image, 0, 0, canvas.width, canvas.height);
	// 	};
	// 	image.src = imageState;
	// }
}

window.onload = function() {
	const canvas = document.getElementById('drawingCanvas') as HTMLCanvasElement;
	initializeCanvas(canvas);
	var newUrl = window.location.href.split('?')[0] + '?canvasId=' + canvasId;
	window.history.pushState({ path: newUrl }, '', newUrl);
};
