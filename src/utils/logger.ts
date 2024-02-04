export class Logger {
    log(message: string) {
        console.log(`(${new Date().toLocaleTimeString()}) ${message}`);
    }

    warn(message: string) {
        console.warn(`(${new Date().toLocaleTimeString()}) ${message}`);
    }

    error(message: string) {
        console.error(`(${new Date().toLocaleTimeString()}) ${message}`);
    }
}