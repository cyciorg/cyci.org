class Snowflake {
    constructor(workerId, epoch) {
        this.workerId = workerId;
        this.sequence = 0;
        this.lastTimestamp = -1;
        this.epoch = epoch || 0;
    }

    generate() {
        let timestamp = BigInt(Date.now()) - BigInt(this.epoch);
    
        if (timestamp === this.lastTimestamp) {
            this.sequence = (this.sequence + 1n) & 4095n; // 12-bit sequence
            if (this.sequence === 0n) {
                timestamp = this.waitUntilNextMillis(timestamp);
            }
        } else {
            this.sequence = 0n;
        }
    
        this.lastTimestamp = timestamp;
    
        const id = (timestamp << 22n) | (BigInt(this.workerId) << 12n) | this.sequence;
        return id.toString();
    }

    waitUntilNextMillis(currentTimestamp) {
        let timestamp = Date.now() - this.epoch;
        while (timestamp <= currentTimestamp) {
            timestamp = Date.now() - this.epoch;
        }
        return timestamp;
    }
}

module.exports = Snowflake;
