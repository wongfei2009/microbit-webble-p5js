// Constants
const MIDI_HEADER_SIGNATURE = 0x4D546864; // 'MThd'
const MIDI_TRACK_SIGNATURE = 0x4D54726B; // 'MTrk'
const MIDI_HEADER_LENGTH = 6;
const UBIT_MIN_TIME = 1;
const UBIT_NOTES = "c#d#ef#g#a#b";
const UBIT_RESOLUTION_MAG = 8;
const DEFAULT_TEMPO = 500000;
const DEFAULT_LOW_BEAT = 4;

// MIDI Event Types
const MIDI_EVENT_TYPES = {
    NOTE_OFF: 'note off',
    NOTE_ON: 'note on',
    POLY_PRESSURE: 'polyphonic key pressure',
    CONTROL_CHANGE: 'control change',
    PROGRAM_CHANGE: 'program change',
    CHANNEL_PRESSURE: 'channel pressure',
    PITCH_BEND: 'pitch bend',
    UNKNOWN: 'unknown event'
};

class MidiParser {
    constructor() {
        this.position = 0;
        this.view = null;
    }

    readVariableLengthValue() {
        let value = 0;
        let bytesRead = 0;

        while (bytesRead < 4) {
            const byte = this.view.getUint8(this.position++);
            value = (value << 7) | (byte & 0x7F);
            bytesRead++;

            if ((byte & 0x80) === 0) {
                return value;
            }
        }

        throw new Error("Variable length value too long");
    }

    parseHeader() {
        const headerSignature = this.view.getUint32(this.position);
        if (headerSignature !== MIDI_HEADER_SIGNATURE) {
            throw new Error("Invalid MIDI file signature");
        }
        this.position += 4;

        const headerLength = this.view.getUint32(this.position);
        this.position += 4;

        if (headerLength < MIDI_HEADER_LENGTH) {
            throw new Error("Invalid MIDI header length");
        }

        const format = this.view.getUint16(this.position);
        this.position += 2;
        const numTracks = this.view.getUint16(this.position);
        this.position += 2;
        const timeDivision = this.view.getUint16(this.position);
        this.position += 2;

        return {
            format,
            numTracks,
            timeDivision
        };
    }

    parseTrack() {
        const trackStart = this.position;
        const trackSignature = this.view.getUint32(this.position);
        if (trackSignature !== MIDI_TRACK_SIGNATURE) {
            throw new Error("Invalid track signature");
        }
        this.position += 4;

        const trackLength = this.view.getUint32(this.position);
        this.position += 4;

        const events = [];
        let runningStatus = 0;

        while (this.position < trackStart + trackLength + 8) {
            const deltaTime = this.readVariableLengthValue();
            events.push(deltaTime);

            let eventType = this.view.getUint8(this.position++);

            // Handle running status
            if ((eventType & 0x80) === 0) {
                this.position--;
                eventType = runningStatus;
            } else {
                runningStatus = eventType;
            }

            // Meta event
            if (eventType === 0xFF) {
                const metaType = this.view.getUint8(this.position++);
                const length = this.readVariableLengthValue();
                const data = new Uint8Array(this.view.buffer.slice(this.position, this.position + length));
                this.position += length;

                if (metaType === 0x2F) { // End of track
                    break;
                }

                // Store meta events that we care about (tempo, etc)
                if (metaType === 0x51) { // Tempo
                    const tempo = (data[0] << 16) | (data[1] << 8) | data[2];
                    events.push(['tempo', tempo]);
                }
            }
            // MIDI events
            else {
                const command = eventType & 0xF0;
                const channel = eventType & 0x0F;

                switch (command) {
                    case 0x80: // Note Off
                        events.push([
                            MIDI_EVENT_TYPES.NOTE_OFF,
                            channel,
                            this.view.getUint8(this.position),
                            this.view.getUint8(this.position + 1)
                        ]);
                        this.position += 2;
                        break;

                    case 0x90: // Note On
                        events.push([
                            MIDI_EVENT_TYPES.NOTE_ON,
                            channel,
                            this.view.getUint8(this.position),
                            this.view.getUint8(this.position + 1)
                        ]);
                        this.position += 2;
                        break;

                    default:
                        // Skip other MIDI events based on their expected length
                        if (command === 0xC0 || command === 0xD0) {
                            this.position += 1;
                        } else {
                            this.position += 2;
                        }
                }
            }
        }

        return events;
    }

    parse(buffer) {
        this.position = 0;
        this.view = new DataView(buffer);

        const header = this.parseHeader();
        const tracks = [];

        for (let i = 0; i < header.numTracks; i++) {
            tracks.push(this.parseTrack());
        }

        return {
            header,
            tracks
        };
    }
}

function note2code(note) {
    const octave = Math.floor(note / 12) - 1;
    const index = note % 12;
    let pitchName = UBIT_NOTES[index];
    if (pitchName === '#') {
        pitchName = UBIT_NOTES[index - 1] + pitchName;
    }
    return `${pitchName}${octave}`;
}

function getNotecodeOnUbit(note, velocity, deltatime) {
    if (velocity <= 0) {
        return `r:${deltatime}`;
    }
    const code = note2code(note);
    return `${code}:${deltatime}`;
}

class MidiToUbit {
    constructor() {
        this.parser = new MidiParser();
    }

    convertTrackToUbit(track, timebase, beatdenom = DEFAULT_LOW_BEAT) {
        const queue = [];
        let deltaTime = 0;
        let result = '';
        let separator = '';
        let currentTempo = DEFAULT_TEMPO;
        let lastTempoChange = 0;
        let currentTime = 0;

        for (const element of track) {
            if (typeof element === 'number') {
                deltaTime += element;
                currentTime += element;
            } else if (Array.isArray(element)) {
                // Handle tempo meta events
                if (element[0] === 'tempo') {
                    currentTempo = element[1];
                    lastTempoChange = currentTime;
                    continue;
                }

                // Handle note events
                if (element[0] === MIDI_EVENT_TYPES.NOTE_OFF) {
                    element[0] = MIDI_EVENT_TYPES.NOTE_ON;
                    element[3] = 0;
                }

                if (element[0] === MIDI_EVENT_TYPES.NOTE_ON) {
                    if (deltaTime <= 0) {
                        queue.push(element);
                        continue;
                    }

                    let note = 0;
                    let velocity = 0;
                    while (queue.length > 0) {
                        const [event, ch, n, v] = queue.shift();
                        if (v > 0) {
                            note = n;
                            velocity = v;
                            break;
                        }
                    }

                    let delta = Math.floor((deltaTime * 4 * UBIT_RESOLUTION_MAG) / timebase);
                    if (delta <= 0) delta = UBIT_MIN_TIME;
                    
                    const code = getNotecodeOnUbit(note, velocity, delta);
                    result += separator + code;
                    deltaTime = 0;
                    separator = ',';

                    queue.length = 0;
                    queue.push(element);
                }
            }
        }

        // Process last note
        if (queue.length > 0) {
            const [event, ch, note, velocity] = queue.shift();
            let delta = Math.floor((deltaTime * 4 * UBIT_RESOLUTION_MAG) / timebase);
            if (delta <= 0) delta = UBIT_MIN_TIME;
            const code = getNotecodeOnUbit(note, velocity, delta);
            result += separator + code;
        }

        // Calculate BPM using the final tempo value
        const bpm = Math.floor(60 * 1000000 * beatdenom / 4 / currentTempo * UBIT_RESOLUTION_MAG);
        return `music.setTempo(${bpm})\nlet sound: string[] = []\nsound = nerds.stringToNoteArray("${result}")\nnerds.playNoteArray(sound, MelodyOptions.Once)\n`;
    }

    async convert(midiFile) {
        const midiData = await midiFile.arrayBuffer();
        const parsed = this.parser.parse(midiData);
        
        const results = [];
        for (let i = 0; i < parsed.tracks.length; i++) {
            const track = parsed.tracks[i];
            const converted = this.convertTrackToUbit(track, parsed.header.timeDivision);
            results.push(converted);
        }
        
        return results;
    }
}

// Export the converter
export default MidiToUbit;