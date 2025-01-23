class MusicPlayer {
    constructor() {
        this.MAX_CHUNK_SIZE = 10;
    }

    updateProgress(trackElement, progress) {
        const progressContainer = trackElement.querySelector('.progress-container');
        const progressBar = progressContainer.querySelector('.progress-bar');
        const progressText = progressContainer.querySelector('.progress-text');
        
        progressContainer.style.display = 'block';
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
        
        if (progress >= 100) {
            // Hide progress bar after 1 second when complete
            setTimeout(() => {
                progressContainer.style.display = 'none';
                progressBar.style.width = '0%';
                progressText.textContent = '0%';
            }, 1000);
        }
    }

    async playTrack(tempo, musicString, trackElement) {
        if (!microBit || !microBit.connected) {
            alert('Please connect to a micro:bit device first!');
            return;
        }

        try {
            // Send tempo
            await microBit.writeUARTData(`MUSIC:${tempo}|`);
            await new Promise(resolve => setTimeout(resolve, 100));

            // Calculate total chunks for progress
            const totalChunks = Math.ceil(musicString.length / this.MAX_CHUNK_SIZE);
            let currentChunk = 0;

            // Split and send music string in chunks
            let start = 0;
            while (start < musicString.length) {
                let end = start + this.MAX_CHUNK_SIZE;
                if (end > musicString.length) {
                    end = musicString.length;
                }

                const chunk = musicString.substring(start, end);
                const isLastChunk = end === musicString.length;
                const message = isLastChunk ? `CHUNK:${chunk}|END` : `CHUNK:${chunk}`;
                
                await microBit.writeUARTData(message);
                
                // Update progress
                currentChunk++;
                const progress = (currentChunk / totalChunks) * 100;
                this.updateProgress(trackElement, progress);

                await new Promise(resolve => setTimeout(resolve, 100));
                start = end;
            }
        } catch (error) {
            console.error('Error sending music data:', error);
            alert('Error sending music data to micro:bit');
            this.updateProgress(trackElement, 0); // Reset progress on error
        }
    }
}

// Create global instance
const musicPlayer = new MusicPlayer();

// Global function to be called from HTML
window.playTrack = function(tempo, musicString) {
    const trackElement = event.target.closest('.track-result');
    musicPlayer.playTrack(tempo, musicString, trackElement);
};