import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

// Constants for worker operation
const RESTART_AFTER_COUNT = 5000;
const UPDATE_AFTER_COUNT = 100;

// Event handler for messages from the main thread
self.onmessage = (evt) => {
  const e = evt.data;
  if (e.msg === "start") {
    run("0x" + e.beginsWith, e.endsWith);
  }
};

// Main worker function
const run = (beginsWith, endsWith) => {
  let count = 0;
  
  while (true) {
    count++;
    // Generate a new keypair
    const pair = new Ed25519Keypair();
    const address = pair.toSuiAddress();
    
    // Check if it matches our criteria
    if (address.startsWith(beginsWith) && address.endsWith(endsWith)) {
      const secretKey = pair.getSecretKey();
      const event = {
        msg: "match",
        pair: { address, secretKey }
      };
      postMessage(event);
    }
    
    // Periodically update stats
    if (count % UPDATE_AFTER_COUNT === 0) {
      const event = { 
        msg: "countUpdate", 
        count: UPDATE_AFTER_COUNT 
      };
      postMessage(event);
    }
    
    // Restart worker periodically to prevent memory issues
    if (count === RESTART_AFTER_COUNT) {
      console.debug("[worker] restarting");
      const event = { msg: "restart" };
      postMessage(event);
      break;
    }
  }
};