// ==========================================
// MODUL FORMATTER & UTILITIES (FORMATTERS.JS)
// ==========================================

const Formatters = {
    /**
     * Format angka ke format mata uang/koma Indonesia (contoh: 1250000 -> "1.250.000")
     * @param {number} amount 
     * @returns {string}
     */
    number(amount) {
        if (isNaN(amount) || amount === null || amount === undefined) return '0';
        return Math.floor(amount).toLocaleString('id-ID');
    },

    /**
     * Format angka ke format ringkas (contoh: 1500 -> "1.5K", 1000000 -> "1M")
     * @param {number} amount 
     * @param {number} decimals 
     * @returns {string}
     */
    compactNumber(amount, decimals = 1) {
        if (isNaN(amount) || amount === null || amount === undefined) return '0';
        if (amount < 1000) return amount.toString();

        const units = ['', 'K', 'M', 'B', 'T'];
        const k = 1000;
        const i = Math.floor(Math.log(amount) / Math.log(k));

        return (amount / Math.pow(k, i)).toFixed(decimals) + units[i];
    },

    /**
     * Format saldo Crest dengan suffix 'Crest' atau simbol 'C'
     * @param {number} amount 
     * @param {boolean} shortFormat - Jika true, gunakan suffix 'C' (contoh: "1.5K C")
     * @returns {string}
     */
    crest(amount, shortFormat = false) {
        if (shortFormat) {
            return `${this.compactNumber(amount)} C`;
        }
        return `${this.number(amount)} Crest`;
    },

    /**
     * Format detik menjadi tampilan durasi waktu (contoh: 3665 -> "1j 1m 5d" atau "01:01:05")
     * @param {number} totalSeconds 
     * @param {boolean} digitalStyle - Jika true, mengembalikan format HH:MM:SS
     * @returns {string}
     */
    timeDuration(totalSeconds, digitalStyle = false) {
        if (isNaN(totalSeconds) || totalSeconds <= 0) {
            return digitalStyle ? '00:00:00' : '0d';
        }

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);

        if (digitalStyle) {
            const pad = (num) => String(num).padStart(2, '0');
            return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        }

        const parts = [];
        if (hours > 0) parts.push(`${hours}j`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0 || parts.length === 0) parts.push(`${seconds}d`);

        return parts.join(' ');
    },

    /**
     * Format tanggal ISO ke format Indonesia (contoh: "2026-09-30T15:00:00.000Z" -> "30 Sep 2026, 15:00")
     * @param {string|Date} dateInput 
     * @param {boolean} includeTime 
     * @returns {string}
     */
    date(dateInput, includeTime = true) {
        if (!dateInput) return '-';
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return '-';

        const options = {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        };

        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }

        return date.toLocaleDateString('id-ID', options);
    },

    /**
     * Memotong string panjang dengan akhiran '...'
     * @param {string} str 
     * @param {number} maxLength 
     * @returns {string}
     */
    truncate(str, maxLength = 30) {
        if (!str) return '';
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength) + '...';
    },

    /**
     * Format persentase (contoh: 0.75 -> "75%")
     * @param {number} value - Nilai antara 0 hingga 1 (atau 0 - 100)
     * @param {boolean} isDecimal - True jika input dalam skala 0.0 - 1.0
     * @returns {string}
     */
    percentage(value, isDecimal = true) {
        if (isNaN(value)) return '0%';
        const val = isDecimal ? value * 100 : value;
        return `${Math.round(val)}%`;
    }
};

// Expose ke window scope agar bisa digunakan langsung secara global
window.Formatters = Formatters;
