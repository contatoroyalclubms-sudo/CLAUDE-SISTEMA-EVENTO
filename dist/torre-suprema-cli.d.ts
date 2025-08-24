#!/usr/bin/env node
/**
 * 🏰 TORRE SUPREMA CLI
 * Interface de linha de comando para gerenciar a agência de agentes
 */
declare class TorreSupremaCLI {
    private running;
    start(): Promise<void>;
    private startInteractiveMode;
    private processCommand;
    private handleTaskCommand;
    private showStatus;
    private showTasks;
    private showStats;
    private showHelp;
}
export { TorreSupremaCLI };
