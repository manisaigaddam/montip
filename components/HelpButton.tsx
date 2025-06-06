import { useState } from 'react';

export default function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#5b4dcf] to-[#a280ff] rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-0 max-w-lg w-full overflow-hidden">
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">How to Use Montip</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4 text-gray-700">
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    <span className="font-bold">Create Wallet:</span> Set up your Montip wallet (one-time) to start tipping.
                  </li>
                  <li>
                    <span className="font-bold">Deposit:</span> Send tokens to your Montip wallet or use the Deposit tab.
                  </li>
                  <li>
                    <span className="font-bold">Tip:</span> Reply to any cast with <span className="font-mono bg-gray-100 px-1 rounded">!montip tip 1 mon</span> to send MON instantly.
                  </li>
                  <li>
                    <span className="font-bold">Withdraw:</span> Use the Withdraw tab to send tokens to any address.
                  </li>
                </ol>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Supported Tokens</h3>
                  <p>MON, USDC, USDT, BEAN, BMONAD, CHOG, DAK, HALLI, HEDGE, JAI, KEYS, MAD, MAD-LP, MIST, MONDA, MOON, NOM, NSTR, P1, RBSD, RED, TFAT, USDX, USDm, WBTC, WETH, WMON, WSOL, YAKI, aprMON, gMON, iceMON, mamaBTC, muBOND, sMON, shMON, stMON</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Fees</h3>
                  <ul className="list-disc pl-5 mt-2">
                    <li>Each tip: <span className="font-bold">0.008 MON</span></li>
                    <li>Each withdraw: <span className="font-bold">0.008 MON</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
