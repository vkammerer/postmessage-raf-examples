import { sendToWorker } from "../common/utils";
const SlaveWorker = require("worker-loader!../slave/slave.js");

export const slaveWorker = new SlaveWorker();
export const sendToSlave = sendToWorker(slaveWorker);
