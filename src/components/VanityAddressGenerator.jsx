import React, { useState, useEffect, useRef } from 'react';

const VanityAddressGenerator = () => {
  // Add custom background style
  const backgroundStyle = {
    backgroundImage: 'url("/background-image.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backgroundBlendMode: 'overlay',
    minHeight: '100vh',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1
  };

  // State for user inputs and results
  const [beginsWith, setBeginsWith] = useState('');
  const [endsWith, setEndsWith] = useState('');
  const [status, setStatus] = useState('stopped');
  const [keypairs, setKeypairs] = useState([]);
  const [pairCount, setPairCount] = useState(0);
  const [pairsPerSec, setPairsPerSec] = useState(0);
  
  // References for worker and timing
  const worker = useRef(null);
  const timeStart = useRef(0);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (worker.current) {
        stopWorker();
      }
    };
  }, []);
  
  // Validate hex input
  const isHex = (str) => {
    return /^[0-9a-fA-F]*$/.test(str);
  };
  
  // Handle input changes
  const onChangeBeginsWith = (e) => {
    const value = e.target.value;
    if (isHex(value)) {
      setBeginsWith(value.toLowerCase());
    }
  };
  
  const onChangeEndsWith = (e) => {
    const value = e.target.value;
    if (isHex(value)) {
      setEndsWith(value.toLowerCase());
    }
  };
  
  // Worker event handler
  const handleWorkerEvent = (evt) => {
    const e = evt.data;
    if (e.msg === "match") {
      setKeypairs(prev => [e.pair, ...prev]);
    }
    else if (e.msg === "countUpdate") {
      const now = performance.now();
      setPairsPerSec(1000 * e.count / (now - timeStart.current));
      timeStart.current = now;
      setPairCount(prev => prev + e.count);
    }
    else if (e.msg === "restart") {
      stopWorker();
      startWorker();
    }
  };
  
  // Start worker
  const startWorker = () => {
    if (worker.current) {
      console.warn("Worker already running");
      return;
    }
    
    setStatus('running');
    console.debug("Starting worker");
    
    worker.current = new Worker(
      new URL('../workers/vanityWorker.js', import.meta.url),
      { type: 'module' }
    );
    
    worker.current.onmessage = handleWorkerEvent;
    
    const event = { msg: 'start', beginsWith, endsWith };
    worker.current.postMessage(event);
    timeStart.current = performance.now();
  };
  
  // Stop worker
  const stopWorker = () => {
    if (!worker.current) {
      console.warn("Worker already stopped");
      return;
    }
    
    console.debug("Stopping worker");
    worker.current.terminate();
    worker.current = null;
    setStatus('stopped');
  };
  
  // Calculations
  const beginsLength = beginsWith.length;
  const endsLength = endsWith.length;
  const criteriaLength = beginsLength + endsLength;
  const combinations = Math.pow(16, criteriaLength);
  
  // Button states
  const disableSearch = status !== 'stopped' || (beginsLength === 0 && endsLength === 0);
  const disableStop = status !== 'running';
  const showInfoSection = (criteriaLength + pairCount + pairsPerSec) > 0;
  
  // Helper for short number display
  const shortNumber = (num) => {
    return num < 1000 ? String(num) : new Intl.NumberFormat('en-US', { 
      notation: 'compact', 
      maximumFractionDigits: 1 
    }).format(num);
  };
  
  // Helper for address display
  const shortAddress = (address, startsLen, endsLen) => {
    const start = address.substring(0, Math.max(4, startsLen));
    const end = address.substring(address.length - Math.max(4, endsLen));
    return `${start}...${end}`;
  };
  
  return (
    <div className="relative">
      <div style={backgroundStyle}></div>
      <div className="flex flex-col items-center gap-12 p-4 w-full max-w-lg mx-auto relative z-10">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-500 text-transparent bg-clip-text drop-shadow-lg">
        Tardi Tease Vanity Generator
      </h1>
      
      <div className="w-full">
        <p className="text-lg mb-1">Begins with:</p>
        <input 
          type="text" 
          value={beginsWith} 
          onChange={onChangeBeginsWith} 
          maxLength={64}
          className="w-full p-3 bg-white/90 text-black rounded-lg text-center backdrop-blur-sm"
        />
        
        <p className="text-lg mt-4 mb-1">Ends with:</p>
        <input 
          type="text" 
          value={endsWith} 
          onChange={onChangeEndsWith} 
          maxLength={64}
          className="w-full p-3 bg-white/90 text-black rounded-lg text-center backdrop-blur-sm"
        />
        
        <div className="flex gap-4 justify-center mt-6">
          <button 
            onClick={startWorker} 
            disabled={disableSearch}
            className="bg-pink-600 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-500 disabled:text-gray-300 hover:bg-pink-500 transition-colors"
          >
            SEARCH
          </button>
          <button 
            onClick={stopWorker} 
            disabled={disableStop}
            className="bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-500 disabled:text-gray-300 hover:bg-cyan-500 transition-colors"
          >
            STOP
          </button>
        </div>
      </div>
      
      {showInfoSection && (
        <div className="flex flex-col gap-1 w-full bg-black/50 p-4 rounded-lg backdrop-blur-sm">
          {criteriaLength > 0 && (
            <p>
              Combinations: <span className="font-mono break-all">{shortNumber(combinations)}</span>
            </p>
          )}
          
          {pairCount > 0 && (
            <p>
              Keypairs generated: <span className="font-mono">{shortNumber(pairCount)}</span>
            </p>
          )}
          
          {pairsPerSec > 0 && (
            <p>
              Keypairs per second: <span className="font-mono">{pairsPerSec.toFixed(0)}</span>
            </p>
          )}
        </div>
      )}
      
      {keypairs.length > 0 && (
        <div className="w-full bg-black/50 p-4 rounded-lg backdrop-blur-sm">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-500 text-transparent bg-clip-text mb-4 drop-shadow-lg">
            KEYPAIRS
          </h2>
          <div className="flex flex-col gap-8">
            {keypairs.map((pair, index) => (
              <div key={index} className="flex flex-col gap-1">
                <div className="text-xl font-semibold">
                  {shortAddress(pair.address, beginsLength, endsLength)}
                </div>
                <div className="text-green-400 font-mono text-sm break-all">
                  {pair.address}
                </div>
                <div className="text-yellow-400 font-mono text-xs break-all">
                  {pair.secretKey}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="w-full bg-black/50 p-4 rounded-lg backdrop-blur-sm">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-500 text-transparent bg-clip-text mb-2 drop-shadow-lg">
          ABOUT
        </h2>
        <div>
          <p>▸ Generate memorable Sui addresses like 0xbabe…, 0xcafe…, 0xbeef… etc.</p>
          <p>▸ Sui addresses can only use hexadecimal characters: 0-9 A B C D E F.</p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default VanityAddressGenerator;